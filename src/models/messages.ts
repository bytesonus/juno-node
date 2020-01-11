import {
	ModuleRegistration,
	DeclareFunction,
	FunctionCall,
	RegisterHook,
	TriggerHook,
	ModuleRegistered,
	FunctionResponse,
	HookRegistered,
	HookTriggered,
	FunctionDeclared
} from '../utils/constants';

interface BaseMessage {
	requestId: string;
	type: string;
}

export interface RegisterModuleRequest extends BaseMessage {
	type: ModuleRegistration;
	moduleId: string;
	version: string;
	dependencies: {
		[type: string]: string;
	};
}

export interface DeclareFunctionRequest extends BaseMessage {
	type: DeclareFunction;
	function: string;
}

export interface FunctionCallRequest extends BaseMessage {
	type: FunctionCall;
	function: string;
	arguments: {
		[type: string]: any
	};
}

export interface RegisterHookRequest extends BaseMessage {
	type: RegisterHook;
	hook: string;
}

export interface TriggerHookRequest extends BaseMessage {
	type: TriggerHook;
	hook: string;
}

export interface RegisterModuleResponse extends BaseMessage {
	type: ModuleRegistered;
	test: string;
}

export interface FunctionCallResponse extends BaseMessage {
	type: FunctionResponse;
	data: any;
}

export interface ListenHookResponse extends BaseMessage {
	type: HookRegistered;
}

export interface TriggerHookResponse extends BaseMessage {
	type: HookTriggered;
	hook: string;
	data?: any;
}

export interface DeclareFunctionResponse extends BaseMessage {
	type: FunctionDeclared;
	function: string;
}

export type GothamResponse =
	RegisterModuleResponse |
	ListenHookResponse |
	TriggerHookResponse |
	DeclareFunctionResponse |
	FunctionCallResponse;
export type GothamRequest =
	RegisterModuleRequest |
	DeclareFunctionRequest |
	FunctionCallRequest |
	RegisterHookRequest |
	TriggerHookRequest;
export type GothamMessage =
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
