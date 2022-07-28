import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let showInfoNotification = vscode.commands.registerCommand('notifications-sample.showInfo', () => {
		vscode.window.showInformationMessage('Info Notification');
	});

	let showWarningNotification = vscode.commands.registerCommand('notifications-sample.showWarning', () => {
		vscode.window.showWarningMessage('Warning Notification');
	});

	let showErrorNotification = vscode.commands.registerCommand('notifications-sample.showError', () => {
		vscode.window.showErrorMessage('Error Notification');
	});

	context.subscriptions.push(showInfoNotification, showWarningNotification, showErrorNotification);
}

export function deactivate() {}
