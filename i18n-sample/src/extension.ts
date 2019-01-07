/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as nls from 'vscode-nls';

// The example uses the file message format.
const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

import * as vscode from 'vscode';
import { sayByeCommand } from './command/sayBye';

export function activate(context: vscode.ExtensionContext) {
	const helloCmd = vscode.commands.registerCommand('extension.sayHello', () => {
		const message = localize('sayHello.text', 'Hello');
		vscode.window.showInformationMessage(message);
	});

	const byeCmd = vscode.commands.registerCommand(
		'extension.sayBye',
		sayByeCommand
	);

	context.subscriptions.push(helloCmd, byeCmd);
}

export function deactivate() {
}