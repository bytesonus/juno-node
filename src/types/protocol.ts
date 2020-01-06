export type dataListenerFn = (data: any) => any;

export interface Dependency {
	[type: string]: string;
}

export interface FnArgs {
	[type: string]: any;
}

export interface FnMappings {
	[type: string]: Function;
}

export interface HookMappings {
	[type: string]: Function[]
}

export interface ProtocolMessage {
	requestId: string;
	type: string;
}

export interface RegisterModuleRequest extends ProtocolMessage {
	type: 'moduleRegistration';
	moduleId: string;
	version: string;
	dependencies: Dependency;
}

export interface RegisterModuleResponse extends ProtocolMessage {
	type: 'moduleRegistered';
}

export interface FunctionCallRequest extends ProtocolMessage {
	type: 'functionCall';
	function: string;
	arguments: FnArgs;
}

export interface FunctionCallResponse extends ProtocolMessage {
	type: 'functionResponse';
	data: FnArgs;
}

export interface RegisterHookRequest extends ProtocolMessage {
	type: 'registerHook';
	hook: string;
}

export interface ListenHookResponse extends ProtocolMessage {
	type: 'hookRegistered';
}

export interface TriggerHookRequest extends ProtocolMessage {
	type: 'triggerHook';
	hook: string;
}

export interface TriggerHookResponse extends ProtocolMessage {
	type: 'hookTriggered';
	hook: string;
}

export interface CallHookResponse extends ProtocolMessage {
	type: 'hookTriggered';
	hook: string;
}

export interface DeclareFunctionRequest extends ProtocolMessage {
	type: 'declareFunction';
	function: string;
}

export interface FunctionResponseRequest extends ProtocolMessage {
	type: 'functionResponse';
	data: any;
}

export interface DeclareFunctionResponse extends ProtocolMessage {
	type: 'functionDeclared';
	function: string;
}

export type GothamRequest = RegisterModuleRequest | FunctionCallRequest | RegisterHookRequest | DeclareFunctionRequest | TriggerHookRequest | FunctionResponseRequest;
export type GothamResponse = RegisterModuleResponse | ListenHookResponse | TriggerHookResponse | CallHookResponse | DeclareFunctionResponse | FunctionCallResponse | FunctionCallRequest | TriggerHookRequest;
