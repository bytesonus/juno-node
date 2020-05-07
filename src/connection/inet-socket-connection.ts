import { Socket, createConnection } from 'net';
import BaseConnection from './base-connection';

export default class InetSocketConnection extends BaseConnection {
	client?: Socket;
	host: string;
	port: number;

	constructor(host: string, port: number) {
		super();
		this.host = host;
		this.port = port;
	}

	setupConnection(): Promise<void> {
		return new Promise(resolve => {
			this.client = createConnection(this.port, this.host);
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
