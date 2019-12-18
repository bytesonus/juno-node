import { constants } from "./constants";

interface Dependency {
    [type: string]: string;
}


class Protocol {
    private static generateRequestId() {
        return Date.now();
    }

    static async initialize(moduleId: string, version: string, deps: Dependency[]) {
        return {
            requestId: this.generateRequestId(),
            type: constants.requestType.moduleRegistration,
            moduleId: moduleId,
            version: version,
            dependencies: deps
        }
    }

    static async registerHook(moduleId: string, hook: string) {
        return {
            requestId: this.generateRequestId(),
            type: constants.requestType.registerHook,
            hook: `${moduleId}-${hook}`,
        }
    }
    
    static async triggerHook(hook: string) {
        return {
            requestId: this.generateRequestId(),
            type: constants.requestType.triggerHook,
            hook: hook,
        }
    }

    static async declareFunction(functionName: string, fn: Function) {
        return {
            requestId: this.generateRequestId(),
            type: constants.requestType.declareFunction
        }
    }

    static async callFunction(moduleId: string, functionName: string, ...args: Dependency[]) {
        return {
            requestId: this.generateRequestId(),
            type: constants.requestType.functionCall,
            function: `${moduleId}-${functionName}`,
            arguments: args
        }
    }
}