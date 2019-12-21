import { Protocol, Dependency, FnArgs } from "./protocol/protocol";

export class Gotham {
    moduleId: string;
    protocol: Protocol
    constructor() {
        this.protocol = new Protocol();
    }
    async initialize(moduleId: string, version: string, deps: Dependency) {
        return await this.protocol.sendRequest(
            this.protocol.initialize(moduleId, version, deps),
        );
    }

    async declareFunction(fnName: string, fn: Function) {
        return await this.protocol.sendRequest(
            this.protocol.declareFunction(fnName, fn)
        );
    }

    async functionCall(fnNmame: string, args: FnArgs) {
        return await this.protocol.sendRequest(
            this.protocol.functionCall(fnNmame, args)
        );
    }

    async registerHook(hook: string, cb: Function) {
        return await this.protocol.sendRequest(
            this.protocol.registerHook(hook, cb)
        );
    }

    async triggerHook(hook: string) {
        return await this.protocol.sendRequest(
            this.protocol.triggerHook(hook)
        );
    }
}