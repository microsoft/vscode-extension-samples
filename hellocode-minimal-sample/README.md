# Hello Code Minimal Sample

This is a minimal version of the [Hello Code Sample](../hellocode-sample).

It does not use TypeScript and only includes the `vscode` devDependency needed for extension development.

## Demo

![demo](demo.gif)

## VS Code API

### `vscode` module

- [`commands.registerCommand`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#commands.registerCommand)
- [`window.showInformationMessage`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#window.showInformationMessage)

### Contribution Points

- [`contributes.commands`](https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributescommands)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View.