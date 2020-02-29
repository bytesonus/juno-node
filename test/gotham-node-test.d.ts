import BaseConnection from "../src/connection/base-connection";
import GothamModule from "../src/gotham-node";
import { SinonSpy } from "sinon";
import { DummyGothamConnection } from "./helpers";

interface GothamTest {
	connection: BaseConnection;
}

declare module 'mocha' {
	interface Runnable {
		conn: DummyGothamConnection;
		module: GothamModule;
		sendFunc: SinonSpy;
		getLatestSent: Function
	}
}
