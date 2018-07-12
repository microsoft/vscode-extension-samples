/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('Text Search');

	context.subscriptions.push(vscode.commands.registerCommand('textsearch.doSearch', async () => {
		const result = await vscode.window.showInputBox();
		if (result) {
			await vscode.workspace.findTextInFiles({ pattern: result }, { }, result => {
				outputChannel.appendLine(`${result.uri.fsPath}(${result.range.start.line}, ${result.range.start.character}): ${result.preview.text}`);
			});

			outputChannel.appendLine('\n');
		}

	}));
}
