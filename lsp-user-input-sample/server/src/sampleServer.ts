/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	CodeAction, CodeActionKind, Command, createConnection, Diagnostic, DiagnosticSeverity, Position, Range, TextDocumentEdit,
	TextDocuments, TextDocumentSyncKind, TextEdit
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

const connection = createConnection();
connection.console.info(`Sample server running in node ${process.version}`);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
documents.listen(connection);

connection.onInitialize(() => {
	return {
		capabilities: {
			codeActionProvider: true,
			textDocumentSync: {
				openClose: true,
				change: TextDocumentSyncKind.Incremental
			},
			executeCommandProvider: {
				commands: ['sample.fixMe']
			}
		}
	};
});

function validate(document: TextDocument): void {
	connection.sendDiagnostics({
		uri: document.uri,
		version: document.version,
		diagnostics: [
			Diagnostic.create(Range.create(0,0,0, 10), 'Something is wrong here', DiagnosticSeverity.Warning)
		]
	});
}

documents.onDidOpen((event) => {
	validate(event.document);
});

documents.onDidChangeContent((event) => {
	validate(event.document);
});

connection.onCodeAction((params) => {
	const textDocument = documents.get(params.textDocument.uri);
	if (textDocument === undefined) {
		return undefined;
	}
	const title = 'With User Input';
	return [CodeAction.create(title, Command.create(title, 'sample.fixMe', textDocument.uri), CodeActionKind.QuickFix)];
});

connection.onExecuteCommand(async (params) => {
	if (params.command !== 'sample.fixMe' || params.arguments ===  undefined) {
		return;
	}

	const textDocument = documents.get(params.arguments[0]);
	if (textDocument === undefined) {
		return;
	}
	const newText = typeof params.arguments[1] === 'string' ? params.arguments[1] : 'Eclipse';
	connection.workspace.applyEdit({
		documentChanges: [
			TextDocumentEdit.create({ uri: textDocument.uri, version: textDocument.version }, [
				TextEdit.insert(Position.create(0, 0), newText)
			])
		]
	});
});

connection.listen();
