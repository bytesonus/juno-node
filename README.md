# Juno Node

This is a library that provides you with helper methods for interfacing with the microservices framework, [juno](https://github.com/bytesonus/juno).

## How to use:

There is a lot of flexibility provided by the library, in terms of connection options and encoding protocol options. However, in order to use the library, none of that is required.

In case you are planning to implement a custom connection option, you will find an example in `src/connection/unix-socket-connection.ts`.

For all other basic needs, you can get away without worrying about any of that.

### A piece of code is worth a thousand words

```js
import JunoModule from "./src/juno-node";

async function main() {
    let module = JunoModule.default("./path/to/juno.sock");
    await module.initialize("module-name", "1.0.0");
    console.log("Initialized!");

    await module.declareFunction("printHello", (args) => {
        console.log("Hello");
        return {};
    });

    await module.callFunction("module2.printHelloWorld");
}

main()
```