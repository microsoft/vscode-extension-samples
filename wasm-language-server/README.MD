# WASM Language Server Example

An example demonstrating how to implement a Language Server in WebAssembly and run it in VS Code.


## Functionality

A simple language server that has a dummy got definition method and response to a custom message.

## Pre-requisites

To run the sample the following tool chains need to be installed

- [Rust](https://www.rust-lang.org/): installation instructions can be found [here](https://www.rust-lang.org/tools/install)

## Running the Sample in the Desktop

- Run `npm install` in this folder. This installs all necessary npm modules.
- Open VS Code on this folder.
- Execute the launch config `Run Example`.

## Running the Sample in the Web

As a pre-requisite follow the instructions [here](https://code.visualstudio.com/api/extension-guides/web-extensions#test-your-web-extension-in-vscode.dev) to generate necessary certificate to side load the extension into vscode.dev or insiders.vscode.dev.

Then compile the extension for the Web by running `npm run esbuild`, start a local extension server using `npm run serve`, open vscode.dev or insiders.vscode.dev in a browser and execute the command `Install Extension from Location`. As a location use `https://localhost:5000`.