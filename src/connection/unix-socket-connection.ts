import { Socket, createConnection } from 'net';
import BaseConnection from './base-connection';

export default class UnixSocketConnection extends BaseConnection {
	client?: Socket;
	sockPath: string;

	constructor(sockPath: string) {
		super();
		this.sockPath = sockPath;
	}

	setupConnection(): Promise<void> {
		return new Promise(resolve => {
			this.client = createConnection(this.sockPath);
			this.client.on('data', (data) => {
				const dataLines = data.toString().split(/\r?\n/);
				dataLines.map((data) => {
					if (data) {
						this.onData(Buffer.from(data))
					}
				});
			});
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
