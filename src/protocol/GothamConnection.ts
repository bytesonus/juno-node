import net from 'net';

type dataListenerFn = (data: any) => any;
export abstract class GothamConnection {
    dataListener: dataListenerFn;
    constructor() {
        this.setupConnection();
    }

   abstract setupConnection();
   abstract setupDataListener(dataListener: dataListenerFn);
   abstract async send(message: object): Promise<void>;
}



export class SocketConnection extends GothamConnection {
    client: net.Socket;
    sockPath: string;
    constructor(sockPath: string, dataListener: dataListenerFn) {
        super();
        this.sockPath = sockPath;
    }

    setupConnection() {
        this.client = net.createConnection(this.sockPath);
        this.client.on('connect', () => {
            console.log(`Connected to ${this.sockPath}!`);
        });
    }

    setupDataListener(dataListener: dataListenerFn) {
        this.dataListener = dataListener;
        this.client.on('data', dataListener);
    }

    async send(message: object) {
        this.client.write(JSON.stringify(message) + '\n');
    }
}
