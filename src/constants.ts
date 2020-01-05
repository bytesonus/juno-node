export const constants = {
	requestType: {
		moduleRegistration: 'moduleRegistration',
		functionCall: 'functionCall',
		registerHook: 'registerHook',
		triggerHook: 'triggerHook',
		declareFunction: 'declareFunction',
	},
	responseType: {
		moduleRegistered: 'moduleRegistered',
		functionResponse: 'functionResponse',
		hookRegistered: 'hookRegistered',
		hookTriggered: 'hookTriggered',
		functionDeclared: 'functionDeclared'
	}
};

export default constants;
