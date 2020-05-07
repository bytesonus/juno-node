interface BaseMessage {
	requestId: string;
	type: number;
}

export interface RegisterModuleRequest extends BaseMessage {
	moduleId: string;
	version: string;
	dependencies: {
		[type: string]: string;
	};
}

export interface DeclareFunctionRequest extends BaseMessage {
	function: string;
}

export interface FunctionCallRequest extends BaseMessage {
	function: string;
	arguments: {
		[type: string]: any
	};
}

export interface RegisterHookRequest extends BaseMessage {
	hook: string;
}

export interface TriggerHookRequest extends BaseMessage {
	hook: string;
	data: {
		[type: string]: any
	};
}

export interface RegisterModuleResponse extends BaseMessage {
	test: string;
}

export interface FunctionCallResponse extends BaseMessage {
	data: any;
}

export interface ListenHookResponse extends BaseMessage {
}

export interface TriggerHookResponse extends BaseMessage {
	hook: string;
}

export interface DeclareFunctionResponse extends BaseMessage {
	function: string;
}

export type JunoResponse =
	RegisterModuleResponse |
	ListenHookResponse |
	TriggerHookResponse |
	DeclareFunctionResponse |
	FunctionCallResponse;
export type JunoRequest =
	RegisterModuleRequest |
	DeclareFunctionRequest |
	FunctionCallRequest |
	RegisterHookRequest |
	TriggerHookRequest;
export type JunoMessage =
	RegisterModuleResponse |
	ListenHookResponse |
	TriggerHookResponse |
	DeclareFunctionResponse |
	FunctionCallResponse |
	RegisterModuleRequest |
	DeclareFunctionRequest |
	FunctionCallRequest |
	RegisterHookRequest |
	TriggerHookRequest;
