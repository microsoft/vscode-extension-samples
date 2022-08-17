/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

/** To demonstrate code actions associated with Diagnostics problems, this file provides a mock diagnostics entries. */

import * as vscode from 'vscode';

/** Code that is used to associate diagnostic entries with code actions. */
export const EMOJI_MENTION = 'emoji_mention';

/** String to detect in the text document. */
const EMOJI = 'emoji';

/**
 * Analyzes the text document for problems. 
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param emojiDiagnostics diagnostic collection
 */
export function refreshDiagnostics(doc: vscode.TextDocument, emojiDiagnostics: vscode.DiagnosticCollection): void {
	const diagnostics: vscode.Diagnostic[] = [];

	for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
		const lineOfText = doc.lineAt(lineIndex);
		const regex = RegExp(EMOJI, 'g');
		const matches = lineOfText.text.matchAll(regex);
		for (const arr of matches) {
			arr.index !== undefined && diagnostics.push(
				createDiagnostic(doc, lineOfText, lineIndex, arr.index)
			);
		}
	}

	emojiDiagnostics.set(doc.uri, diagnostics);
}

function createDiagnostic(doc: vscode.TextDocument, lineOfText: vscode.TextLine, lineIndex: number, startTextIndex: number): vscode.Diagnostic {
	// find where in the line of that the 'emoji' is mentioned
	// create range that represents, where in the document the word is
	const range = new vscode.Range(
		lineIndex,
		startTextIndex,
		lineIndex,
		startTextIndex + EMOJI.length
	);
	const diagnostic = new vscode.Diagnostic(range, "When you say 'emoji', do you want to find out more?",
		vscode.DiagnosticSeverity.Information);
	diagnostic.code = EMOJI_MENTION;
	return diagnostic;
}

export function subscribeToDocumentChanges(context: vscode.ExtensionContext, emojiDiagnostics: vscode.DiagnosticCollection): void {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, emojiDiagnostics);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, emojiDiagnostics);
			}
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, emojiDiagnostics))
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => emojiDiagnostics.delete(doc.uri))
	);

}
