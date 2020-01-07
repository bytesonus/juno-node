import { GothamConnection } from "../src/GothamConnection";
import GothamModule from "../src/gotham-node";
import { SinonSpy } from "sinon";
import { DummyGothamConnection } from "./helpers";

interface GothamTest {
	connection: GothamConnection;
}

declare module 'mocha' {
	interface Runnable {
		conn: DummyGothamConnection;
		module: GothamModule;
		sendFunc: SinonSpy;
		getLatestSent: Function
	}
}
