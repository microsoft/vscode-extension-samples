/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('Text Search');
	context.subscriptions.push(outputChannel);

	context.subscriptions.push(vscode.commands.registerCommand('textsearch.doSearch', async () => {
		const result = await vscode.window.showInputBox();
		if (result) {
			outputChannel.show();

			let count = 0;
			await vscode.workspace.findTextInFiles({ pattern: result }, { }, result => {
				count++;
				const before = result.preview.text.substring(0, result.preview.match.start.character)
				const match = result.preview.text.substring(result.preview.match.start.character, result.preview.match.end.character);
				const after = result.preview.text.substring(result.preview.match.end.character);
				const annotatedMatchText = `${before}👉${match}👈${after}`;

				outputChannel.appendLine(`${result.uri.fsPath}(${result.range.start.line}, ${result.range.start.character}): ${annotatedMatchText}`);
			});

			outputChannel.appendLine(`Found ${count} results`);
		}
	}));
}
