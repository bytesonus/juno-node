import BaseConnection from "../../src/connection/base-connection";
import { DummyJunoConnection } from "../../test/helpers";
import JunoModule from "../../src/juno-node";
import { SinonSpy } from "sinon";

interface JunoTest {
	connection: BaseConnection;
}

declare module 'mocha' {
	interface Runnable {
		conn: DummyJunoConnection;
		module: JunoModule;
		sendFunc: SinonSpy;
		getLatestSent: Function
	}
}
