import {
	RegisterHookRequest,
	TriggerHookRequest,
	DeclareFunctionRequest,
	FunctionCallRequest,
	RegisterModuleRequest,
	JunoMessage
} from '../models/messages';
import { RequestTypes } from '../utils/constants';

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
			type: RequestTypes.ModuleRegistration,
			moduleId: moduleId,
			version: version,
			dependencies: deps
		};
	}

	public registerHook(hook: string): RegisterHookRequest {
		return {
			requestId: this.generateRequestId(),
			type: RequestTypes.RegisterHook,
			hook
		};
	}

	public triggerHook(hook: string): TriggerHookRequest {
		return {
			requestId: this.generateRequestId(),
			type: RequestTypes.TriggerHook,
			hook
		};
	}

	public declareFunction(functionName: string): DeclareFunctionRequest {
		return {
			requestId: this.generateRequestId(),
			type: RequestTypes.DeclareFunction,
			function: functionName
		};
	}

	public callFunction(
		functionName: string,
		args: { [type: string]: any }
	): FunctionCallRequest {
		return {
			requestId: this.generateRequestId(),
			type: RequestTypes.FunctionCall,
			function: functionName,
			arguments: args
		};
	}

	public abstract encode(req: JunoMessage): Buffer;
	public abstract decode(data: Buffer): JunoMessage;
}
