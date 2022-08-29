# Notifications Sample

This sample showcases a handful of basic configurations for notifications in VS Code:
- Info Notification
- Info Notification as Modal
- Warning Notification
- Warning Notification with Actions
- Progress Notification

Read the [Notifications UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/notifications) to learn how to effectively use notifications in an extension.

## Demo

![demo](demo.gif)

## VS Code API

### `vscode` module

- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)
- [`window.showWarningMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showWarningMessage)
- [`window.showErrorMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showErrorMessage)
- [`window.withProgress`](https://code.visualstudio.com/api/references/vscode-api#window.withProgress)

### Contribution Points

- [`contributes.commands`](https://code.visualstudio.com/api/references/contribution-points#contributes.commands)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Press F5 or Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
- Try running the commands to show the notifications:

```
- Notifications Sample: Show Info Notification
- Notifications Sample: Show Info Notification as Modal
- Notifications Sample: Show Warning Notification
- Notifications Sample: Show Warning Notification with Actions
- Notifications Sample: Show Progress Notification
```
