# WASM Component Model Example

An example demonstrating how to use component model resources to integrate WebAssembly code into VS Code.

## Functionality

Defines a resource that implements a calculator supporting the reverse Polish notation, similar to those used in Hewlett-Packard hand-held calculators.

## Pre-requisites

To run the sample the following tool chains need to be installed

- [Rust](https://www.rust-lang.org/): installation instructions can be found [here](https://www.rust-lang.org/tools/install)
- [wasm-tools](https://github.com/bytecodealliance/wasm-tools): releases can be found [here](https://github.com/bytecodealliance/wasm-tools/releases). You need at least version >= 1.200 to run the example.

## Running the Sample in the Desktop

- Run `npm install` in this folder. This installs all necessary npm modules.
- Open VS Code on this folder.
- Execute the launch config `Run Example`.

## Running the Sample in the Web

As a pre-requisite follow the instructions [here](https://code.visualstudio.com/api/extension-guides/web-extensions#test-your-web-extension-in-vscode.dev) to generate necessary certificate to side load the extension into vscode.dev or insiders.vscode.dev.

Then compile the extension for the Web by running `npm run esbuild`, start a local extension server using `npm run serve`, open vscode.dev or insiders.vscode.dev in a browser and execute the command `Install Extension from Location`. As a location use `https://localhost:5000`.