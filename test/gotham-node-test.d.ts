import { GothamConnection } from "../src/GothamConnection";
import GothamModule from "../src/gotham-node";
import { SinonSpy } from "sinon";
import { DummyGothamConnection } from "./gotham-node.test";

interface GothamTest {
	connection: GothamConnection;
}

declare module 'mocha' {
	interface Runnable {
		conn: DummyGothamConnection;
		module: GothamModule;
		sendFunc: SinonSpy
	}
}
