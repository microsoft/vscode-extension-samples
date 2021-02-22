# Virtual Document Sample

This is a sample extension that shows how to add virtual documents to the editor.

![cowsay](https://github.com/Microsoft/vscode-extension-samples/blob/main/virtual-document-sample/cowsay.gif)


## VS Code API

### `vscode` module

- [`workspace.registerTextDocumentContentProvider`](https://code.visualstudio.com/api/references/vscode-api#workspace.registerTextDocumentContentProvider)
- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInputBox`](https://code.visualstudio.com/api/references/vscode-api#window.showInputBox)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Launch Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
