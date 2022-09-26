/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('markdown', new Emojizer(), {
			providedCodeActionKinds: Emojizer.providedCodeActionKinds
		}));
}

/**
 * Provides code actions for converting :) to a smiley emoji.
 */
export class Emojizer implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		const notebook = vscode.window.activeNotebookEditor;
		if (!notebook) {
			return undefined;
		}

		const action = new vscode.CodeAction('Delete first cell', vscode.CodeActionKind.QuickFix);

		const edit = new vscode.WorkspaceEdit();
		edit.set(notebook.notebook.uri, [
			vscode.NotebookEdit.deleteCells(new vscode.NotebookRange(0, 1))
		]);

		action.edit = edit;

		return [action];
	}
}
