import { GothamConnection } from "../src/GothamConnection";

import { dataListenerFn } from "../src/types/protocol";

import sinon from "sinon";

import GothamModule from "../src/gotham-node";

export const sleep = (t: number) => new Promise((r) => setTimeout(r, t));

export class DummyGothamConnection extends GothamConnection {
	dataListener: dataListenerFn;
	setupDataListener(fn: dataListenerFn) {
		this.dataListener = fn;
	}

	sendResponse(message: any) {
		this.dataListener(message);
	}
}

export function makeConnectionTests(name: string, tests: Function, initalizeModule: boolean = true) {
	describe(name, function () {
		beforeEach(async function () {
			this.currentTest.conn = new DummyGothamConnection();
			this.currentTest.sendFunc = sinon.fake();
			sinon.replace(this.currentTest.conn, 'send', this.currentTest.sendFunc);
			this.currentTest.module = new GothamModule(
				this.currentTest.conn
			);

			if (initalizeModule) {
				this.currentTest.module.initialize('testing-modules', '1.0.0', {});
				await sleep(0);
				const requestId = this.currentTest.sendFunc.getCall(0).args[0].requestId;
				this.currentTest.conn.sendResponse({
					requestId,
					type: 'moduleRegistered'
				});
				await sleep(0);
				this.currentTest.sendFunc.resetHistory();
			}
		});

		tests();

		afterEach(function() {
			this.currentTest.module.close();
		});
	});
}
