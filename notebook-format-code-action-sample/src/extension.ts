/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { CodeActionKind } from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
	const notebookSelector: vscode.DocumentSelector = {
		notebookType: 'jupyter-notebook',
	};

	// Notebook Format Code Action Provider
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			notebookSelector,
			new ExtractNotebookImports(),
			{
				providedCodeActionKinds: [ExtractNotebookImports.providedKind],
			}
		)
	);
}

/**
 * Notebook Format Code Action Provider
 * Takes all mentions of import "xx" or from "xx" and extracts them to a new top code cell.
 */
export class ExtractNotebookImports implements vscode.CodeActionProvider {
	static readonly providedKind = CodeActionKind.Notebook.append('format.extensionName');

	public provideCodeActions(
		document: vscode.TextDocument,
		_range: vscode.Range | vscode.Selection,
		_context: vscode.CodeActionContext,
		_token: vscode.CancellationToken
	): vscode.CodeAction[] | undefined {

		const notebookDocument = this.getNotebookDocument(document);
		if (!notebookDocument) {
			return;
		}

		const edits: (vscode.NotebookEdit | vscode.TextEdit)[] =
			this.extractImportsAndCreateCellEdits(notebookDocument);
		if (!edits) {
			return;
		}

		const fix = new vscode.CodeAction(
			'Extract cell level imports to single cell.',
			ExtractNotebookImports.providedKind
		);
		fix.edit = new vscode.WorkspaceEdit();

		for (const edit of edits) {
			if (edit instanceof vscode.NotebookEdit) {
				fix.edit.set(notebookDocument.uri, [edit]);
			} else {
				fix.edit.set(document.uri, [edit]);
			}
		}
		return [fix];
	}

	private extractImportsAndCreateCellEdits(
		notebookDocument: vscode.NotebookDocument
	): (vscode.NotebookEdit | vscode.TextEdit)[] {
		const nbEdits: (vscode.NotebookEdit | vscode.TextEdit)[] = [];
		let importStatements: string[] = [];

		notebookDocument.getCells().forEach((cell, index) => {
			if (cell.kind !== vscode.NotebookCellKind.Code) {
				return [];
			}

			let cellHasImports = false;
			let nonImportText = '';
			cell.document
				.getText()
				.split('\n')
				.forEach((line) => {
					if (line.startsWith('import') || line.startsWith('from')) {
						importStatements.push(line);
						cellHasImports = true;
					} else {
						nonImportText += line + '\n';
					}
				});

			if (cellHasImports) {
				if (nonImportText.trim()) {
					// Replace cell content without imports
					const range = new vscode.Range(0, 0, cell.document.lineCount, 0);
					nbEdits.push(new vscode.TextEdit(range, nonImportText));
				} else {
					// Cell is empty after removing imports, mark for deletion
					nbEdits.push(
						vscode.NotebookEdit.replaceCells(
							new vscode.NotebookRange(index, index + 1),
							[]
						)
					);
				}
			}
		});

		if (importStatements.length > 0) {
			// Create a new top cell with all import statements
			const newCell = new vscode.NotebookCellData(
				vscode.NotebookCellKind.Code,
				importStatements.join('\n') + '\n',
				'python'
			);
			nbEdits.push(
				vscode.NotebookEdit.insertCells(0, [newCell])
			);
		}

		return nbEdits;
	}

	private getNotebookDocument(
		document: vscode.TextDocument
	): vscode.NotebookDocument | undefined {
		for (const nb of vscode.workspace.notebookDocuments) {
			if (nb.uri.path === document.uri.path) {
				return nb;
			}
		}
		return undefined;
	}
}
