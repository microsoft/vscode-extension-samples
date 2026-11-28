import * as vscode from 'vscode';

type WarningAction = vscode.MessageItem & {
	id: 'retry' | 'dismiss';
};

const progressSteps: { increment: number; message: string }[] = [
		{ increment: 15, message: 'Preparing...' },
		{ increment: 25, message: 'Processing...' },
		{ increment: 35, message: 'Validating...' },
		{ increment: 25, message: 'Finishing...' }
	];

/**
 * Waits for the requested duration or resolves early when cancellation is
 * requested. The cancellation listener and timer are always cleaned up.
 */
function cancellableDelay(milliseconds: number, token: vscode.CancellationToken): Promise<boolean> {
	if (token.isCancellationRequested) {
		return Promise.resolve(false);
	}

	return new Promise(resolve => {
		let settled = false;
		const state: { cancellationListener?: vscode.Disposable } = {};

		const finish = (completed: boolean) => {
			if (settled) {
				return;
			}

			settled = true;
			clearTimeout(timeout);
			state.cancellationListener?.dispose();
			resolve(completed);
		};

		const timeout = setTimeout(() => finish(true), milliseconds);
		state.cancellationListener = token.onCancellationRequested(() => finish(false));

		// Handle cancellation requested between the initial check and listener registration.
		if (token.isCancellationRequested) {
			finish(false);
		}
	});
}

export function activate(context: vscode.ExtensionContext) {

	// Simple notifications
	const showInfoNotification = vscode.commands.registerCommand('notifications-sample.showInfo', () => {
		return vscode.window.showInformationMessage('Info Notification');
	});

	const showInfoNotificationAsModal = vscode.commands.registerCommand('notifications-sample.showInfoAsModal', async () => {
		const selection = await vscode.window.showInformationMessage(
			'Info Notification As Modal',
			{
				modal: true,
				detail: 'Modal notifications interrupt the user, so reserve them for decisions that require immediate attention.'
			},
			'Continue'
		);

		if (selection === 'Continue') {
			return vscode.window.showInformationMessage('You confirmed the modal notification.');
		}
	});

	const showWarningNotification = vscode.commands.registerCommand('notifications-sample.showWarning', () => {
		return vscode.window.showWarningMessage('Warning Notification');
	});

	const showErrorNotification = vscode.commands.registerCommand('notifications-sample.showError', () => {
		return vscode.window.showErrorMessage('Error Notification');
	});

	// Notification with actions
	const showWarningNotificationWithActions = vscode.commands.registerCommand('notifications-sample.showWarningWithActions', async () => {
		const retry: WarningAction = { title: 'Retry', id: 'retry' };
		const dismiss: WarningAction = { title: 'Dismiss', id: 'dismiss', isCloseAffordance: true };
		const selection = await vscode.window.showWarningMessage(
			'The sample operation did not complete.',
			retry,
			dismiss
		);

		if (selection?.id === 'retry') {
			return vscode.commands.executeCommand('notifications-sample.showProgress');
		}
	});

	// Progress notification that cooperatively handles cancellation
	const showProgressNotification = vscode.commands.registerCommand('notifications-sample.showProgress', async () => {
		const completed = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Running sample operation',
			cancellable: true
		}, async (progress, token) => {
			for (const step of progressSteps) {
				if (!await cancellableDelay(1000, token)) {
					return false;
				}

				progress.report(step);
			}

			return true;
		});

		if (completed) {
			return vscode.window.showInformationMessage('Sample operation completed.');
		}
	});

	// Show all notifications to show do not disturb behavior
	const showAllNotifications = vscode.commands.registerCommand('notifications-sample.showAll', () => {
		return Promise.allSettled([
			vscode.commands.executeCommand('notifications-sample.showInfo'),
			vscode.commands.executeCommand('notifications-sample.showWarning'),
			vscode.commands.executeCommand('notifications-sample.showWarningWithActions'),
			vscode.commands.executeCommand('notifications-sample.showError'),
			vscode.commands.executeCommand('notifications-sample.showProgress'),
			vscode.commands.executeCommand('notifications-sample.showInfoAsModal')
		]);
	});

	context.subscriptions.push(showInfoNotification, showInfoNotificationAsModal, showWarningNotification, showErrorNotification, showProgressNotification, showWarningNotificationWithActions, showAllNotifications);
}
