import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		'welcome-view-content-sample.hello',
		async () => {
			vscode.window.showInformationMessage('Hello world!');
		}
	);

	context.subscriptions.push(disposable);
}
