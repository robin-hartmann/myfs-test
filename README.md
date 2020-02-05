# myfs-test

Functional tests for the FUSE-based file system [MyFS](https://github.com/luluhue/betriebsysteme) (private repository)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

#### Software

* [Node.js](https://nodejs.org) - JavaScript run-time environment

#### Environment Variables

* `MYFS_BIN_MKFS` - Path to the `mkfs` executable
* `MYFS_BIN_MOUNT` - Path to the `mount` executable

#### VS Code Extensions

This project is intended to be used with Visual Studio Code and the following extensions are recommended:

* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Integrates ESLint JavaScript into VS Code
* [TSLint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) - TSLint support for Visual Studio Code

## Running the Tests

⚠️ The MyFS binaries are not built automatically before running the tests. So if the sources of MyFS have changed or haven't been built at all, make sure you run the build before running the tests. Otherwise the old binaries will be tested or the tests will fail altogether. ⚠️

### With the Terminal

Run the following command in the directory containing the `package.json` file:

```node
npm test
```

### With VS Code

This project includes task definitions for Visual Studio Code. Just open the folder containing the `package.json` file in VS Code and then run the task `Run tests`.

## Debugging with VS Code

1. Set a breakpoint in a file inside the `src` folder
1. Go to `src/spec` and open the `.spec` file you want to run
1. Run the debugger (by default `F5`)

## Built With

* [AVA](https://github.com/avajs/ava) - Futuristic test runner for Node.js
* [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript that compiles to plain JavaScript
* [Tmp](https://github.com/raszi/node-tmp) - A simple temporary file and directory creator for node.js
* [umount](https://www.npmjs.com/package/umount) - Unmount a device in UNIX
* [execa](https://github.com/sindresorhus/execa) - Process execution for humans
* [pkg-dir](https://github.com/sindresorhus/pkg-dir) - Find the root directory of a Node.js project or npm package

## Authors

* **Robin Hartmann** - [robin-hartmann](https://github.com/robin-hartmann)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
