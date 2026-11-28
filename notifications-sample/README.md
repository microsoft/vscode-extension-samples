# Notifications Sample

This sample showcases common notification patterns in VS Code:

- Info Notification
- Info Notification as Modal with a confirmation action
- Warning Notification
- Warning Notification with typed actions
- Error Notification
- Cancellable Progress Notification
- Multiple notifications and Do Not Disturb behavior

Read the [Notifications UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/notifications) to learn how to effectively use notifications in an extension.

## Notification patterns

### Simple notifications

The information, warning, and error commands demonstrate the three notification severity levels. Each command returns the promise created by the VS Code API so callers can observe when the notification is dismissed or an action is selected.

### Modal notification

The modal example includes a `detail` message and handles the result of its confirmation action. Modal notifications interrupt the user and should only be used when an immediate decision is required.

### Notification actions

The warning-with-actions example uses typed [`MessageItem`](https://code.visualstudio.com/api/references/vscode-api#MessageItem) objects instead of comparing button labels. Selecting **Retry** starts the progress command, while **Dismiss** is marked as the close affordance.

### Cancellable progress

The progress example reports incremental work and cooperatively observes the provided [`CancellationToken`](https://code.visualstudio.com/api/references/vscode-api#CancellationToken). Cancellation clears the pending timer, disposes its listener, and prevents any additional progress from being reported.

### Do Not Disturb

The show-all command starts every example together so you can observe how VS Code presents multiple notifications, including when Do Not Disturb mode is enabled.

## Demo

![demo](demo.gif)

## VS Code API

### `vscode` module

- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)
- [`window.showWarningMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showWarningMessage)
- [`window.showErrorMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showErrorMessage)
- [`window.withProgress`](https://code.visualstudio.com/api/references/vscode-api#window.withProgress)
- [`MessageItem`](https://code.visualstudio.com/api/references/vscode-api#MessageItem)
- [`CancellationToken`](https://code.visualstudio.com/api/references/vscode-api#CancellationToken)

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
- Notifications Sample: Show Error Notification
- Notifications Sample: Show Progress Notification
- Notifications Sample: Show All Notifications
```
