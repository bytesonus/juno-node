export type ModuleRegistration = 'moduleRegistration';
export type FunctionCall = 'functionCall';
export type RegisterHook = 'registerHook';
export type TriggerHook = 'triggerHook';
export type DeclareFunction = 'declareFunction';

export type ModuleRegistered = 'moduleRegistered';
export type FunctionResponse = 'functionResponse';
export type HookRegistered = 'hookRegistered';
export type HookTriggered = 'hookTriggered';
export type FunctionDeclared = 'functionDeclared';

export const RequestTypes = {
	ModuleRegistration: 'moduleRegistration',
	FunctionCall: 'functionCall',
	RegisterHook: 'registerHook',
	TriggerHook: 'triggerHook',
	DeclareFunction: 'declareFunction'
};

export const ResponseTypes = {
	ModuleRegistered: 'moduleRegistered',
	FunctionResponse: 'functionResponse',
	HookRegistered: 'hookRegistered',
	HookTriggered: 'hookTriggered',
	FunctionDeclared: 'functionDeclared'
};
