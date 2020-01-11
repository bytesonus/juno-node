import { RequestTypes } from '../utils/constants';
import {
	RegisterHookRequest,
	TriggerHookRequest,
	DeclareFunctionRequest,
	FunctionCallRequest,
	RegisterModuleRequest,
	GothamMessage
} from '../models/messages';

export abstract class BaseProtocol {
	private moduleId = 'undefined';

	private generateRequestId() {
		return this.getModuleId() + Date.now();
	}

	public getModuleId(): string {
		return this.moduleId;
	}

	public initialize(
		moduleId: string,
		version: string,
		deps: { [type: string]: string }
	): RegisterModuleRequest {
		this.moduleId = moduleId;
		return {
			requestId: this.generateRequestId(),
			type: 'moduleRegistration',
			moduleId: moduleId,
			version: version,
			dependencies: deps
		};
	}

	public registerHook(hook: string): RegisterHookRequest {
		return {
			requestId: this.generateRequestId(),
			type: 'registerHook',
			hook
		};
	}

	public triggerHook(hook: string): TriggerHookRequest {
		return {
			requestId: this.generateRequestId(),
			type: 'triggerHook',
			hook
		};
	}

	public declareFunction(functionName: string): DeclareFunctionRequest {
		return {
			requestId: this.generateRequestId(),
			type: 'declareFunction',
			function: functionName
		};
	}

	public callFunction(
		functionName: string,
		args: { [type: string]: any }
	): FunctionCallRequest {
		return {
			requestId: this.generateRequestId(),
			type: 'functionCall',
			function: functionName,
			arguments: args
		};
	}

	public abstract encode(req: GothamMessage): Buffer;
	public abstract decode(data: Buffer): GothamMessage;
}
