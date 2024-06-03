/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { add } from './math';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "esbuild-sample" is now active!');

	const disposable = vscode.commands.registerCommand('esbuild-sample.hello-esbuild', () => {
		vscode.window.showInformationMessage(`41 + 1 = ${add(41, 1)}`);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
