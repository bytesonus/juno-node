export type OnDataHandler = (response: Buffer) => void;

export default abstract class BaseConnection {
	private onDataHandler?: OnDataHandler;

	public async abstract setupConnection(): Promise<void>;
	public async abstract closeConnection(): Promise<void>;
	public async abstract send(request: Buffer): Promise<void>;

	public setOnDataListener(onDataHandler: OnDataHandler) {
		this.onDataHandler = onDataHandler;
	}

	protected onData(data: Buffer) {
		if (this.onDataHandler) {
			this.onDataHandler(data);
		}
	}
}
