import sinonChai from 'sinon-chai';
import chai, { expect, assert } from 'chai';
import chaiExclude from 'chai-exclude';
import chaiAsPromised from 'chai-as-promised';
import { sleep, makeConnectionTests } from './helpers';

chai.use(chaiExclude);
chai.use(sinonChai);
chai.use(chaiAsPromised);

makeConnectionTests('Initalize Tests', function () {
	it('initalize request constructed correctly', async function () {
		this.test.module.initialize('test-module', '1.0.0', {});
		await sleep(0);
		assert(this.test.sendFunc.calledOnce);
		const message = this.test.sendFunc.getCall(0).args[0];
		expect(message).excluding('requestId').to.deep.equal({
			type: 'moduleRegistration',
			moduleId: 'test-module',
			version: '1.0.0',
			dependencies: {}
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
}, false);

makeConnectionTests('Test if requests constructed correctly', function () {
	it('declareFunction', async function () {
		this.test.module.declareFunction('test_fn', () => { });
		await sleep(0);
		const message = this.test.sendFunc.getCall(0).args[0];
		expect(message).excluding('requestId').to.deep.equal({
				function: "test_fn",
				type: "declareFunction"
		});
	});


	it('functionCall with empty args', async function() {
		this.test.module.functionCall('module.test_fn');
		await sleep(0);
		const message = this.test.sendFunc.getCall(0).args[0];
		expect(message).excluding('requestId').to.deep.equal({
				function: "module.test_fn",
				type: "functionCall",
				arguments: {}
		});
	});

	it('functionCall with args', async function() {
		this.test.module.functionCall('module.test_fn', {
			a: 1,
			b: 2
		});
		await sleep(0);
		const message = this.test.sendFunc.getCall(0).args[0];
		expect(message).excluding('requestId').to.deep.equal({
			function: "module.test_fn",
			type: "functionCall",
			arguments: {
				a: 1,
				b: 2
			}
		});
	});
});
