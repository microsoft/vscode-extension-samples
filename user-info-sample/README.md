# User Info Sample

This sample demonstrates how to access and display user and workspace information in a VS Code extension.

## Functionality

This extension shows how to:
- Get the current username and platform
- Access workspace information (name, folders)
- Get active editor information
- Display information to the user

## Demo

Run the command `User Info: Show Information` from the command palette to see user and workspace details.

## VS Code API

### `vscode` module

- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)
- [`workspace.name`](https://code.visualstudio.com/api/references/vscode-api#workspace.name)
- [`workspace.workspaceFolders`](https://code.visualstudio.com/api/references/vscode-api#workspace.workspaceFolders)
- [`window.activeTextEditor`](https://code.visualstudio.com/api/references/vscode-api#window.activeTextEditor)

### Contribution Points

- [`contributes.commands`](https://code.visualstudio.com/api/references/contribution-points#contributes.commands)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
- Open the command palette and run `User Info: Show Information`
