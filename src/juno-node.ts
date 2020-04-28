import * as net from 'net';
import { BaseProtocol } from './protocol/base-protocol';
import BaseConnection from './connection/base-connection';
import { JsonProtocol } from './protocol/json-protocol';
import { ResponseTypes, RequestTypes } from './utils/constants';
import {
	FunctionCallRequest,
	FunctionCallResponse,
	TriggerHookRequest,
	JunoMessage
} from './models/messages';
import UnixSocketConnection from './connection/unix-socket-connection';
import InetSocketConnection from './connection/inet-socket-connection';

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
		if (net.isIP(socketPath.split(':')[0])) {
			const [ host, port ] = socketPath.split(':');
			return this.fromInetSocket(host, Number(port));
		} else {
			return this.fromUnixSocket(socketPath);
		}
	}

	public static fromUnixSocket(path: string) {
		// Return Error if invoked from windows
		if (process.platform == 'win32') {
			throw new Error('Unix sockets are not supported on windows');
		}
		return new JunoModule(new UnixSocketConnection(path), new JsonProtocol());
	}

	public static fromInetSocket(host: string, port: number) {
		return new JunoModule(new InetSocketConnection(host, port), new JsonProtocol());
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

	public async triggerHook(hook: string) {
		return this.sendRequest(
			this.protocol.triggerHook(hook)
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
			this.requests[request.requestId] = (response: any) => {
				if (response) {
					resolve(response);
				} else {
					reject(response);
				}
			};
		});
	}

	private async onDataHandler(data: Buffer) {
		const response = this.protocol.decode(data);
		let value;
		switch (response.type) {
			case ResponseTypes.ModuleRegistered: {
				value = true;
				break;
			}
			case ResponseTypes.FunctionResponse: {
				value = await (response as FunctionCallResponse).data;
				break;
			}
			case ResponseTypes.FunctionDeclared: {
				value = true;
				break;
			}
			case ResponseTypes.HookRegistered: {
				value = true;
				break;
			}
			case ResponseTypes.HookTriggered: {
				value = await this.executeHookTriggered(response as TriggerHookRequest);
				break;
			}

			case RequestTypes.FunctionCall: {
				this.executeFunctionCall(response as FunctionCallRequest);
				break;
			}

			default: {
				value = false;
				break;
			}
		}

		if (this.requests[response.requestId]) {
			this.requests[response.requestId](value);
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
			return true;
		} else {
			// Function wasn't found in the module.
			return false;
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
					listener();
				}
			}
			return true;
		} else {
			// This moddule triggered the hook.
			return true;
		}
	}
}
