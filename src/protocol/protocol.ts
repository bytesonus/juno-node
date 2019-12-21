import { constants } from "../constants";
import { ConnectOpts } from 'net';
import { ConnectionOptions } from 'tls';

export interface Dependency {
    [type: string]: string;
}

export interface FnArgs {
    [type: string]: any;
}

interface FnMappings {
    [type: string]: Function;
}

interface HookMappings {
    [type: string]: Function[]
}

interface ProtocolMessage {
    requestId: string;
    type: string;
}

interface RegisterModuleRequest extends ProtocolMessage {
    type: 'moduleRegistration';
    moduleId: string;
    version: string;
    dependencies: Dependency;
}

interface RegisterModuleResponse extends ProtocolMessage {
    type: 'moduleRegistered';
}

interface FunctionCallRequest extends ProtocolMessage {
    type: 'functionCall';
    function: string;
    arguments: FnArgs;
}

interface FunctionCallResponse extends ProtocolMessage {
    type: 'functionResponse';
    data: FnArgs;
}

interface RegisterHookRequest extends ProtocolMessage {
    type: 'registerHook';
    hook: string;
}

interface ListenHookResponse extends ProtocolMessage {
    type: 'hookRegistered';
}

interface TriggerHookRequest extends ProtocolMessage {
    type: 'triggerHook';
    hook: string;
}

interface TriggerHookResponse extends ProtocolMessage {
    type: 'hookTriggered';
    hook: string;
}

interface CallHookResponse extends ProtocolMessage {
    type: 'hookTriggered';
    hook: string;
}

interface DeclareFunctionRequest extends ProtocolMessage {
    type: 'declareFunction';
    function: string;
}

interface DeclareFunctionResponse extends ProtocolMessage {
    type: 'functionDeclared';
    function: string;
}

export class Protocol {
    private moduleId: string;
    private functions: FnMappings;
    private hookListeners: HookMappings;
    private requests: FnMappings;

    private connection: GothamConnection;

    async sendRequest(obj: any) {
        await this.connection.send(obj);
        return new Promise((resolve, reject) => {
            this.requests[obj.requestId] = (res) => {
                if (res) {
                    resolve(res);
                } else {
                    reject(res);
                }
            }
        });
    }

    private generateRequestId() {
        return this.moduleId + Date.now();
    }

    initialize(moduleId: string, version: string, deps: Dependency): RegisterModuleRequest {
        this.moduleId = moduleId;
        return {
            requestId: this.generateRequestId(),
            type: 'moduleRegistration',
            moduleId: moduleId,
            version: version,
            dependencies: deps
        }
    }

    registerHook(hook: string, cb: Function): RegisterHookRequest {
        if (this.hookListeners[hook]) {
            this.hookListeners[hook] = [cb];
        } else {
            this.hookListeners[hook].push(cb);
        }
        return {
            requestId: this.generateRequestId(),
            type: 'registerHook',
            hook: `${this.moduleId}-${hook}`,
        }
    }
    
    triggerHook(hook: string): TriggerHookRequest {
        return {
            requestId: this.generateRequestId(),
            type: 'triggerHook',
            hook: hook,
        }
    }

    declareFunction(functionName: string, fn: Function): DeclareFunctionRequest {
        this.functions[functionName] = fn;
        return {
            requestId: this.generateRequestId(),
            type: 'declareFunction',
            function: functionName,
        }
    }

    callFunction(functionName: string, args: FnArgs): FunctionCallRequest {
        return {
            requestId: this.generateRequestId(),
            type: 'functionCall',
            function: `${this.moduleId}.${functionName}`,
            arguments: args
        }
    }

    hookCall(hook: string) {
        if (this.hookListeners[hook]) {
            for (const fn of this.hookListeners[hook]) {
                fn();
            }
        }
    }

    functionCall(functionName: string, args: FnArgs) {
        if (this.functions[functionName]) {
            this.functions[functionName](args);
        }
    }

    async parseResponse(obj: ProtocolMessage) {
        let res;
        if (obj.type === constants.responseType.moduleRegistered) {
            res = true;
        } else if (obj.type === constants.requestType.functionCall) {
            res = await this.parseFunctionCall(obj as FunctionCallRequest);
        } else if (obj.type === constants.responseType.functionDeclared) {
            res = true;
        } else if (obj.type === constants.responseType.hookRegistered) {
            res = true;
        } else if (obj.type === constants.responseType.hookTriggered) {
            res = await this.parseHookTriggered(obj as TriggerHookRequest);
        } else {
            res = false;
        }
        
        // Call the callback proviced while sending the request
        if (this.requests[obj.requestId]) {
            this.requests[obj.requestId](res);
            delete this.requests[obj.requestId];
        }
    }

    async parseFunctionCall(obj: FunctionCallRequest) {
        if (this.functions[obj.function]) {
            let res = this.functions[obj.function]();
            if (res instanceof Promise) {
                res = await res;
            }
            this.sendRequest({
                requestId: obj.requestId,
                type: 'functionResponse',
                data: res
            });
        }
    }

    async parseHookTriggered(obj: TriggerHookRequest) {
        if (this.hookListeners[obj.hook]) {
            for (const listener of this.hookListeners[obj.hook]) {
                listener();
            }
        }
    }
}