/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	createConnection, TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	ProposedFeatures, InitializeParams,
} from 'vscode-languageserver';

// create a connection for the server. The connection uses Node's IPC as a transport
let connection = createConnection(ProposedFeatures.all);

// create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability = false;

connection.onInitialize((params: InitializeParams) => {
	function hasClientCapability(...keys: string[]) {
		let c = <any>params.capabilities;
		for (let i = 0; c && i < keys.length; i++) {
			c = c[keys[i]];
		}
		return !!c;
	}
	// does the client support the `workspace/configuration` request? 
	// if not, we will fall back using global settings
	hasConfigurationCapability = hasClientCapability('workspace', 'configuration');
	return {
		capabilities: {
			textDocumentSync: documents.syncKind
		}
	}
});

// the example settings
interface MultiRootExampleSettings {
	maxNumberOfProblems: number;
}

// the global settings, used when the `workspace/configuration` request is not supported by the client
let globalSettings: MultiRootExampleSettings = { maxNumberOfProblems: 1000 };

// cache the settings of all open documents
let documentSettings: Map<string, Thenable<MultiRootExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	globalSettings = <MultiRootExampleSettings>(change.settings.lspMultiRootSample || {});

	// reset all document settings
	documentSettings.clear();

	// revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<MultiRootExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({ scopeUri: resource });
		documentSettings.set(resource, result);
	}
	return result;
}

// only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// the content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// in this simple example we get the settings for every validate run.
	let settings = await getDocumentSettings(textDocument.uri);

	// the validator creates diagnostics for all uppercase words length 2 and more
	let text = textDocument.getText();
	let pattern = /\b[A-Z]{2,}\b/g; 
	let m: RegExpExecArray;

	let problems = 0;
	let diagnostics: Diagnostic[] = [];
	while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		diagnostics.push({
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `${m[0].length} is all uppercase.`,
			source: 'ex'
		});
	}

	// send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// listen on the connection
connection.listen();