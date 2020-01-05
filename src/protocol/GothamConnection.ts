import * as net from 'net';

type dataListenerFn = (data: any) => any;
export abstract class GothamConnection {
	dataListener: dataListenerFn = (data) => { };
	abstract async setupConnection(): Promise<any>;
	abstract async closeConnection(): Promise<any>;
	abstract setupDataListener(dataListener: dataListenerFn): any;
	abstract async send(message: object): Promise<void>;
}



export class SocketConnection extends GothamConnection {
	client!: net.Socket;
	sockPath: string;
	constructor(sockPath: string) {
		super();
		this.sockPath = sockPath;
	}

	async setupConnection() {
		return new Promise((resolve, reject) => {
			this.client = net.createConnection(this.sockPath);
			this.client.on('connect', () => {
				// console.log(`Connected to ${this.sockPath}!`);
				resolve();
			});
		});
	}

	async closeConnection() {
		this.client.destroy();
	}

	setupDataListener(dataListener: dataListenerFn) {
		this.dataListener = (data: Buffer) => {
			const parsed = JSON.parse(data.toString('utf-8'));
			// console.log("Socket Received Data:");
			// console.log(parsed);
			dataListener(parsed);
		};
		this.client.on('data', this.dataListener);
	}

	async send(message: object) {
		// console.log("Socker Sending data:");
		// console.log(message);
		this.client.write(JSON.stringify(message) + '\n');
	}
}
