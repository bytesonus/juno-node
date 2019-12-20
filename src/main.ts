import { Protocol, Dependency } from "./protocol/protocol";

class Gotham {
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
}