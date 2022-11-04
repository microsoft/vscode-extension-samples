// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';
import { sayByeCommand } from './command/sayBye';

export function activate(context: vscode.ExtensionContext) {
	
	const helloCmd = vscode.commands.registerCommand('extension.sayHello', () => {
		const message = vscode.l10n.t('Hello');
		vscode.window.showInformationMessage(message);
		console.log(context.extensionUri);
		
		// This is showing how you might pass the vscode.l10n.uri down to
		// a subprocess if you have one that your extension spawns.
		vscode.tasks.executeTask(
			new vscode.Task(
				{ type: 'shell' },
				vscode.TaskScope.Global,
				message, 
				message,
				new vscode.ShellExecution(`node ${path.join(__dirname, 'cli.js')}`, {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					env: vscode.l10n.uri ? { EXTENSION_BUNDLE_URI: vscode.l10n.uri?.toString(true) } : undefined
				})));
	});

	const byeCmd = vscode.commands.registerCommand(
		'extension.sayBye',
		sayByeCommand
	);

	context.subscriptions.push(helloCmd, byeCmd);
}

// this method is called when your extension is deactivated
export function deactivate() {}
