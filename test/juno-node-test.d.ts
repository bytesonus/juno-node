import BaseConnection from "../src/connection/base-connection";
import JunoModule from "../src/juno-node";
import { SinonSpy } from "sinon";
import { DummyJunoConnection } from "./helpers";

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
