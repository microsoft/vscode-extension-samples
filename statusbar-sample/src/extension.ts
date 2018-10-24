/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import { ExtensionContext, StatusBarAlignment, window, StatusBarItem, Selection, workspace, TextEditor, commands } from 'vscode';

export function activate(context: ExtensionContext) {
	const status = window.createStatusBarItem(StatusBarAlignment.Right, 100);
	status.command = 'extension.selectedLines';
	context.subscriptions.push(status);

	context.subscriptions.push(window.onDidChangeActiveTextEditor(e => updateStatus(status)));
	context.subscriptions.push(window.onDidChangeTextEditorSelection(e => updateStatus(status)));
	context.subscriptions.push(window.onDidChangeTextEditorViewColumn(e => updateStatus(status)));
	context.subscriptions.push(workspace.onDidOpenTextDocument(e => updateStatus(status)));
	context.subscriptions.push(workspace.onDidCloseTextDocument(e => updateStatus(status)));

	context.subscriptions.push(commands.registerCommand('extension.selectedLines', () => {
		window.showInformationMessage(getSelectedLines());
	}));

	updateStatus(status);
}

function updateStatus(status: StatusBarItem): void {
	let text = getSelectedLines();
	if (text) {
		status.text = '$(megaphone) ' + text;
	}

	if (text) {
		status.show();
	} else {
		status.hide();
	}
}

function getSelectedLines(): string {
	const editor = window.activeTextEditor;
	let text: string;

	if (editor) {
		let lines = 0;
		editor.selections.forEach(selection => {
			lines += (selection.end.line - selection.start.line + 1);
		});

		if (lines > 0) {
			text = `${lines} line(s) selected`;
		}
	}

	return text;
}
