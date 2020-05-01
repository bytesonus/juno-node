import BaseConnection, { OnDataHandler } from "../src/connection/base-connection";


import sinon from "sinon";

import JunoModule from "../src/juno-node";
import { JsonProtocol } from "../src/protocol/json-protocol";

export const sleep = (t: number) => new Promise((r) => setTimeout(r, t));

export class DummyJunoConnection extends BaseConnection {
	dataListener: OnDataHandler;
	async send(request: Buffer) {
	}

	async setupConnection() {

	}

	async closeConnection() {

	}

	sendResponse(message: object) {
		this.onData(
			Buffer.from(JSON.stringify(message))
		);
	}
}

export function makeConnectionTests(name: string, tests: Function, initalizeModule: boolean = true) {
	describe(name, function () {
		beforeEach(async function () {
			this.currentTest.conn = new DummyJunoConnection();
			this.currentTest.sendFunc = sinon.fake();
			this.currentTest.getLatestSent =  () => {
				if (this.currentTest) {
					return JSON.parse(this.currentTest.sendFunc.getCall(0).args[0].toString());
				} else {
					return JSON.parse(this.test.sendFunc.getCall(0).args[0].toString());
				}
			}
			sinon.replace(this.currentTest.conn, 'send', this.currentTest.sendFunc);
			this.currentTest.module = new JunoModule(
				this.currentTest.conn,
				new JsonProtocol(),
			);

			if (initalizeModule) {
				this.currentTest.module.initialize('testing-modules', '1.0.0', {});
				await sleep(0);
				const requestId = this.currentTest.sendFunc.getCall(0).args[0].requestId;
				this.currentTest.conn.sendResponse({
					requestId,
					type: 2,
				});
				this.currentTest.conn.sendResponse({
					requestId: '123',
					hook: "juno.activated",
					type: 8
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
