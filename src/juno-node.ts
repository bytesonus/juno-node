import { isIP } from 'net';
import { promises as fsPromises } from 'fs';
import { BaseProtocol } from './protocol/base-protocol';
import BaseConnection from './connection/base-connection';
import { JsonProtocol } from './protocol/json-protocol';
import { ResponseTypes, RequestTypes, ErrorTypes } from './utils/constants';
import {
	FunctionCallRequest,
	FunctionCallResponse,
	TriggerHookRequest,
	JunoMessage
} from './models/messages';
import UnixSocketConnection from './connection/unix-socket-connection';
import InetSocketConnection from './connection/inet-socket-connection';
import {JunoError} from './models/errors';

export default class JunoModule {

	private protocol: BaseProtocol;
	private moduleId?: string;
	private connection: BaseConnection;
	private requests: { [type: string]: Function } = {};
	private functions: { [type: string]: Function } = {};
	private hookListeners: { [type: string]: Function[] } = {};
	private messagBuffer?: Buffer;
	private registered = false;

	constructor(connection: BaseConnection, protocol: BaseProtocol) {
		this.protocol = protocol;
		this.connection = connection;
		// this.connection.setOnDataListener(this.onDataHandler);
	}

	public static async default(socketPath: string) {
		const [ host, port ] = socketPath.split(':');

		if (isIP(host) && !isNaN(Number(port))) {
			return this.fromInetSocket(host, Number(port));
		}
		if ( (await fsPromises.lstat(socketPath)).isSocket() ) {
			return this.fromUnixSocket(socketPath);
		}

		throw new Error('Invalid socket object. Only unix domain sockets and Inet sockets are allowed');

	}

	public static async fromUnixSocket(path: string) {
		// Return Error if invoked from windows
		if (process.platform == 'win32') {
			throw new Error('Unix sockets are not supported on windows');
		}
		if ( (await fsPromises.lstat(path)).isSocket() ) {
			return new JunoModule(new UnixSocketConnection(path), new JsonProtocol());
		}

		throw new Error('Invalid unix socket path');
	}

	public static async fromInetSocket(host: string, port: number) {
		if (isIP(host) && !isNaN(Number(port))) {
			return new JunoModule(new InetSocketConnection(host, port), new JsonProtocol());
		}

		throw new Error('Invalid Inet socket address. Use the format `{host}:{port}`')
	}

	public async initialize(
		moduleId: string,
		version: string,
		deps: { [type: string]: string } = {}
	) {
		this.moduleId = moduleId;
		// Setup Connection only when initialize called?
		await this.connection.setupConnection();
		this.connection.setOnDataListener((data) => {
			this.onDataHandler(data);
		});
		return this.sendRequest(
			this.protocol.initialize(
				moduleId,
				version,
				deps
			)
		);
	}

	public async declareFunction(fnName: string, fn: Function) {
		this.functions[fnName] = fn;
		return this.sendRequest(
			this.protocol.declareFunction(fnName)
		);
	}

	public async callFunction(fnName: string, args: any = {}) {
		return this.sendRequest(
			this.protocol.callFunction(fnName, args)
		);
	}

	public async registerHook(hook: string, cb: Function) {
		if (this.hookListeners[hook]) {
			this.hookListeners[hook].push(cb);
		} else {
			this.hookListeners[hook] = [
				cb
			];
		}
		return this.sendRequest(
			this.protocol.registerHook(hook)
		);
	}

	public async triggerHook(hook: string, data: any = {}) {
		return this.sendRequest(
			this.protocol.triggerHook(hook, data)
		);
	}

	public async close() {
		return this.connection.closeConnection();
	}

	private async sendRequest(request: JunoMessage) {
		if (request.type === RequestTypes.ModuleRegistration && this.registered) {
			throw new Error('Module already registered');
		}

		const encoded = this.protocol.encode(request);
		if (this.registered || request.type === RequestTypes.ModuleRegistration) {
			await this.connection.send(
				encoded
			);
		} else {
			if (this.messagBuffer) {
				this.messagBuffer = Buffer.concat([this.messagBuffer, encoded]);
			} else {
				this.messagBuffer = encoded;
			}
		}

		return new Promise((resolve, reject) => {
			this.requests[request.requestId] = (err: boolean | Error, response: any) => {
				if (err) {
					reject(err);
				} else {
					resolve(response);
				}
			};
		});
	}

	private async onDataHandler(data: Buffer) {
		const response = this.protocol.decode(data);
		let value: any = true;
		let err: boolean | Error = false;
		switch (response.type) {
			case ResponseTypes.ModuleRegistered: {
				err = false;
				break;
			}
			case ResponseTypes.FunctionResponse: {
				err = false;
				value = (response as FunctionCallResponse).data;
				break;
			}
			case ResponseTypes.FunctionDeclared: {
				err = false;
				break;
			}
			case ResponseTypes.HookRegistered: {
				err = false;
				break;
			}
			case ResponseTypes.HookTriggered: {
				try {
					await this.executeHookTriggered(response as TriggerHookRequest);
					err = false;
				} catch (e) {
					err = e;
				}
				break;
			}

			case RequestTypes.FunctionCall: {
				try {
					await this.executeFunctionCall(response as FunctionCallRequest);
				} catch (e) {
					err = e;
				}
				break;
			}

			default: {
				err = TypeError(`Error message/Invalid message received from juno:
						${JSON.stringify(response)}`);
			}
		}

		if (err instanceof JunoError) {
			this.sendRequest({
				requestId: response.requestId,
				type: ResponseTypes.Error,
				error: err.errCode,
			});
		}
		
		if (this.requests[response.requestId]) {
			this.requests[response.requestId](err, value);
			delete this.requests[response.requestId];
		}
	}

	private async executeFunctionCall(request: FunctionCallRequest) {
		if (this.functions[request.function]) {
			let res = this.functions[request.function](request.arguments || {});
			if (res instanceof Promise) {
				res = await res;
			}
			this.sendRequest({
				requestId: request.requestId,
				type: ResponseTypes.FunctionResponse,
				data: res || {}
			});
		} else {
			// Function wasn't found in the module.
			throw new JunoError(ErrorTypes.UnkownFunction);
		}
	}

	private async executeHookTriggered(request: TriggerHookRequest) {
		if (request.hook) {
			// Hook triggered by another module.
			if (request.hook === `juno.activated`) {
				this.registered = true;
				if (this.messagBuffer) {
					this.connection.send(this.messagBuffer);
				}
			} else if (this.hookListeners[request.hook]) {
				for (const listener of this.hookListeners[request.hook]) {
					listener(request.data || {});
				}
			}
		}	
	}
}
