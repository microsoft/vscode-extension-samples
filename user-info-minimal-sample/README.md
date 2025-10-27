# User Info Minimal Sample

This is a minimal version of the [User Info Sample](../user-info-sample).

It does not use TypeScript and only includes the `vscode` devDependency needed for extension development.

## Functionality

This extension shows how to:
- Get the current username and platform
- Access workspace information (name, folders)
- Get active editor information
- Display information to the user

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
- Run the `Run Extension` target in the Debug View.
- Open the command palette and run `User Info: Show Information`
