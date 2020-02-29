export type ModuleRegistration = 1;
export type FunctionCall = 3;
export type RegisterHook = 5;
export type TriggerHook = 7;
export type DeclareFunction = 9;

export type ModuleRegistered = 2;
export type FunctionResponse = 4;
export type HookRegistered = 6;
export type HookTriggered = 8;
export type FunctionDeclared = 10;

export const RequestTypes = {
	ModuleRegistration: 1,
	FunctionCall: 3,
	RegisterHook: 5,
	TriggerHook: 7,
	DeclareFunction: 9
};

export const ResponseTypes = {
	ModuleRegistered: 2,
	FunctionResponse: 4,
	HookRegistered: 6,
	HookTriggered: 8,
	FunctionDeclared: 10
};
