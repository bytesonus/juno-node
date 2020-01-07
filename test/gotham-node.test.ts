import sinonChai from 'sinon-chai';
import chai, { expect, assert } from 'chai';
import chaiExclude from 'chai-exclude';
import chaiAsPromised from 'chai-as-promised';
import { sleep, makeConnectionTests } from './helpers';
import sinon from 'sinon';

chai.use(chaiExclude);
chai.use(sinonChai);
chai.use(chaiAsPromised);

makeConnectionTests('Initalize Tests', function () {
	it('initalize request constructed correctly', async function () {
		this.test.module.initialize('test-module', '1.0.0');
		await sleep(0);
		const message = this.test.getLatestSent();
		expect(message).excluding('requestId').to.deep.equal({
			type: 'moduleRegistration',
			moduleId: 'test-module',
			version: '1.0.0',
			dependencies: {}
		});
	});

	it('initialize with deps constructed correctly', async function () {
		this.test.module.initialize('test-module', '1.0.0', {
			'test-module2': '1.0.1',
			'test-module3': '1.0.2'
		});
		await sleep(0);
		const message = this.test.getLatestSent();
		expect(message).excluding('requestId').to.deep.equal({
			type: 'moduleRegistration',
			moduleId: 'test-module',
			version: '1.0.0',
			dependencies: {
				'test-module2': '1.0.1',
				'test-module3': '1.0.2'
			}
		});
	});

	it('Does not allow to send other request without initializing', async function () {
		await expect(
			this.test.module.declareFunction('test', () => { })
		).to.be.rejectedWith(Error);
		await expect(
			this.test.module.functionCall('test', {})
		).to.be.rejectedWith(Error);
		await expect(
			this.test.module.registerHook('test', () => { })
		).to.be.rejectedWith(Error);
		await expect(
			this.test.module.triggerHook('test')
		).to.be.rejectedWith(Error);
	});

	it('Initialize resolves correctly/Cannot initalize twice', async function () {
		const p = this.test.module.initialize('test-module1', '1.0.0', {});
		await sleep(0);
		const requestId = this.test.getLatestSent().requestId;
		this.test.conn.sendResponse({
			requestId,
			type: 'moduleRegistered'
		});
		expect(p).to.eventually.equal(true);
		return await expect(
			this.test.module.initialize('test-module2', '1.0.0', {})
		).to.be.rejectedWith(Error);
	});
}, false);

makeConnectionTests('Test if requests constructed correctly', function () {
	it('declareFunction', async function () {
		this.test.module.declareFunction('test_fn', () => { });
		const message = this.test.getLatestSent();
		expect(message).excluding('requestId').to.deep.equal({
			function: "test_fn",
			type: "declareFunction"
		});
	});


	it('functionCall with empty args', async function () {
		this.test.module.functionCall('module.test_fn');
		const message = this.test.getLatestSent();
		expect(message).excluding('requestId').to.deep.equal({
			function: "module.test_fn",
			type: "functionCall",
			arguments: {}
		});
	});

	it('functionCall with args', async function () {
		this.test.module.functionCall('module.test_fn', {
			a: 1,
			b: 2
		});
		const message = this.test.getLatestSent();
		expect(message).excluding('requestId').to.deep.equal({
			function: "module.test_fn",
			type: "functionCall",
			arguments: {
				a: 1,
				b: 2
			}
		});
	});

	it('registerHook', async function () {
		this.test.module.registerHook('test_hook', () => { });
		const message = this.test.getLatestSent();
		expect(message).excluding('requestId').to.deep.equal({
			hook: "test_hook",
			type: "registerHook",
		});
	});

	it('triggerHook', async function () {
		this.test.module.triggerHook('test_hook');
		const message = this.test.getLatestSent();
		expect(message).excluding('requestId').to.deep.equal({
			type: "triggerHook",
			hook: 'test_hook'
		});
	});
});


makeConnectionTests('Test if responses from gotham parsed correctly', async function () {
	it('declareFunction', async function () {
		const p = this.test.module.declareFunction('test_fn', () => {});
		const requestId = this.test.getLatestSent().requestId;
		await sleep(0);
		this.test.conn.sendResponse({
			requestId,
			type: 'functionDeclared',
			function: 'test_fn'
		});
		return expect(p).to.eventually.equal(true);
	});
	it('hookRegistered', async function () {
		const p = this.test.module.registerHook('test_hook', () => {});
		await sleep(0);
		const requestId = this.test.getLatestSent().requestId;
		this.test.conn.sendResponse({
			requestId,
			type: 'hookRegistered',
		});

		return expect(p).to.eventually.equal(true);
	});

	it('hookTriggered', async function() {
		const fn = sinon.fake();
		const p = this.test.module.registerHook('test_hook', fn);
		await sleep(0);
		this.test.conn.sendResponse({
			requestId: '12345',
			type: 'hookTriggered',
			hook: 'test_hook'
		});
		// await sleep(0);
		assert(fn.calledOnce);
	});

	it('functionCall', async function() {
		const fn = sinon.fake();
		const p = this.test.module.declareFunction('test_fn', fn);
		await sleep(0);

		this.test.conn.sendResponse({
			requestId: '12345',
			type: 'functionCall',
			function: 'test_fn'
		});

		assert(fn.calledOnce);

		this.test.conn.sendResponse({
			requestId: '12345',
			type: 'functionCall',
			function: 'test_fn',
			arguments: {a : 1, b: 2}
		});

		expect(fn.getCall(1).args[0]).to.deep.equal({a : 1, b: 2});
	});

	it('functionResponse', async function() {
		const p = this.test.module.functionCall('module.test_fn');
		await sleep(0);
		const requestId = this.test.getLatestSent().requestId;

		this.test.conn.sendResponse({
			requestId,
			type: 'functionResponse',
			data: {
				a:1,
				b: 2
			}
		});

		return expect(p).to.eventually.deep.equal({
			a:1,
			b:2
		});
	});
});
