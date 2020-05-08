export class JunoError extends Error {
    errCode: number;
    constructor(errCode: number) {
        super(`Juno Error: ${errCode}`);
	this.errCode = errCode;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, JunoError.prototype);
    }
}

