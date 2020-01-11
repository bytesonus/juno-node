import * as net from 'net';
import BaseConnection from './base-connection';

export default class SocketConnection extends BaseConnection {
	client?: net.Socket;
	sockPath: string;

	constructor(sockPath: string) {
		super();
		this.sockPath = sockPath;
	}

	setupConnection(): Promise<void> {
		return new Promise(resolve => {
			this.client = net.createConnection(this.sockPath);
			this.client.on('data', this.onData);
			this.client.on('connect', () => {
				resolve();
			});
		});
	}

	async closeConnection() {
		this.client?.destroy();
	}

	send(message: Buffer): Promise<void> {
		return new Promise(resolve => {
			this.client?.write(message, () => {
				resolve();
			});
		});
	}
}
