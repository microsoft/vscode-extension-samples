# Proposed API Sample

This sample demonstrates usage of [Proposed API](https://code.visualstudio.com/api/advanced-topics/using-proposed-api).

- This sample can only be used for extension development in [Insider release](https://code.visualstudio.com/insiders/). You cannot publish extensions using Proposed API.
- You need `"enableProposedApi": true` in `package.json`.

## VS Code API

### `vscode` module

- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)

### Contribution Points

- [`contributes.commands`](https://code.visualstudio.com/api/references/contribution-points#contributes.commands)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- A `postinstall` script would download latest version of `vscode.proposed.d.ts`
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
