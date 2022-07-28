import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	// Simple notifications
	let showInfoNotification = vscode.commands.registerCommand('notifications-sample.showInfo', () => {
		vscode.window.showInformationMessage('Info Notification');
	});

	let showInfoNotificationAsModal = vscode.commands.registerCommand('notifications-sample.showInfoAsModal', () => {
		vscode.window.showInformationMessage('Info Notification As Modal', { modal: true });
	});

	let showWarningNotification = vscode.commands.registerCommand('notifications-sample.showWarning', () => {
		vscode.window.showWarningMessage('Warning Notification');
	});

	let showErrorNotification = vscode.commands.registerCommand('notifications-sample.showError', () => {
		vscode.window.showErrorMessage('Error Notification');
	});

	// Notifcation with actions
	let showWarningNotificationWithActions = vscode.commands.registerCommand('notifications-sample.showWarningWithActions', () => {
		vscode.window.showWarningMessage('Warning Notification With Actions', 'Action 1', 'Action 2', 'Action 3').then(selection => { vscode.window.showInformationMessage(`You selected: ${selection}`, { modal: true }); });
	});

	// Progress notification with option to cancel
	let showProgressNotification = vscode.commands.registerCommand('notifications-sample.showProgress', () => {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Progress Notification",
			cancellable: true
		}, (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
			});

			progress.report({ increment: 0 });

			setTimeout(() => {
				progress.report({ increment: 10, message: "Still going..." });
			}, 1000);

			setTimeout(() => {
				progress.report({ increment: 40, message: "Still going even more..." });
			}, 2000);

			setTimeout(() => {
				progress.report({ increment: 50, message: "I am long running! - almost there..." });
			}, 3000);

			const p = new Promise<void>(resolve => {
				setTimeout(() => {
					resolve();
				}, 5000);
			});

			return p;
		});
	});

	context.subscriptions.push(showInfoNotification, showInfoNotificationAsModal, showWarningNotification, showErrorNotification, showProgressNotification, showWarningNotificationWithActions);
}
