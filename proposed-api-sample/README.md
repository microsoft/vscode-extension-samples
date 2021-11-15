# Proposed API Sample

This sample demonstrates usage of [Proposed API](https://code.visualstudio.com/api/advanced-topics/using-proposed-api).

The `postinstall` script uses `vscode-dts dev && vscode-dts main` to download latest version of [`vscode.d.ts`](https://github.com/microsoft/vscode/blob/main/src/vs/vscode.d.ts) and [`vscode.proposed.<proposalName>.d.ts`](https://github.com/microsoft/vscode/blob/main/src/vscode-dts) from the main branch of [microsoft/vscode](https://github.com/microsoft/vscode).

You can read more about `vscode-dts` at: https://github.com/microsoft/vscode-dts.

- ⚠️ This sample can only be used for extension development in [Insider release](https://code.visualstudio.com/insiders/). You cannot publish extensions using Proposed API.
- You need `"enabledApiProposals": ["<proposalName>"]` in `package.json`.

## VS Code API

### `vscode` module

- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)

### Contribution Points

- [`contributes.commands`](https://code.visualstudio.com/api/references/contribution-points#contributes.commands)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- A `postinstall` script would download latest version of `vscode.proposed.<proposalName>.d.ts`
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
