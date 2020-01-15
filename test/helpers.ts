import BaseConnection, { OnDataHandler } from "../src/connection/base-connection";


import sinon from "sinon";

import GothamModule from "../src/gotham-node";
import { JsonProtocol } from "../src/protocol/json-protocol";

export const sleep = (t: number) => new Promise((r) => setTimeout(r, t));

export class DummyGothamConnection extends BaseConnection {
	dataListener: OnDataHandler;
	async send(request: Buffer) {
	}

	async setupConnection() {

	}

	async closeConnection() {

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
			this.currentTest.getLatestSent =  () => {
				if (this.currentTest) {
					return this.currentTest.sendFunc.getCall(0).args[0];
				} else {
					return this.test.sendFunc.getCall(0).args[0];
				}
			}
			sinon.replace(this.currentTest.conn, 'send', this.currentTest.sendFunc);
			this.currentTest.module = new GothamModule(
				this.currentTest.conn,
				new JsonProtocol(),
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
