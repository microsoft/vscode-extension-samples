/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	createConnection, TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity, 
	InitializeResult, DidChangeConfigurationNotification, ProposedProtocol, ConfigurationItem
} from 'vscode-languageserver';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection = createConnection(ProposedProtocol);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

connection.onInitialize((_params): InitializeResult => {
	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind
		}
	}
});

// The example settings
interface MultiRootExampleSettings {
	maxNumberOfProblems: number;
}

let settings: Map<string, Thenable<MultiRootExampleSettings>> = new Map();

function getConfiguration(resource: string): Thenable<MultiRootExampleSettings> {
	let result = settings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({ section: '', scopeUri: resource });
		settings.set(resource, result);
	}
	return result;
}

connection.onInitialized(() => {
	// Register to configuration change events.
	connection.client.register(DidChangeConfigurationNotification.type);
});


connection.onNotification(DidChangeConfigurationNotification.type, () => {
	let toRequest: ConfigurationItem[] = [];
	for (let resource of settings.keys()) {
		toRequest.push({ section: '', scopeUri: resource});
	}
	settings.clear();
	// Reread all cached configuration
	connection.workspace.getConfiguration(toRequest).then((values: MultiRootExampleSettings[]) => {
		let toRevalidate: string[] = [];
		for (let i = 0; i < values.length; i++) {
			let resource = toRequest[i].scopeUri;
			let value = values[i];
			// If the value got already added to the settings cache then a change has
			// occurred before the configuration request got return. Ignore the value
			// in this case.
			if (value && !settings.has(resource)) {
				settings.set(resource, Promise.resolve(value));
				toRevalidate.push(resource);
			}
		}
		for (let resource of toRevalidate) {
			validateTextDocument(documents.get(resource));
		}
	});
});


// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
	validateTextDocument(change.document);
});


function validateTextDocument(textDocument: TextDocument): void {
	// In this simple example we get the settings for every validate run.
	getConfiguration(textDocument.uri).then((settings: MultiRootExampleSettings) => {
		let diagnostics: Diagnostic[] = [];
		let lines = textDocument.getText().split(/\r?\n/g);
		let problems = 0;
		for (var i = 0; i < lines.length && problems < settings.maxNumberOfProblems; i++) {
			let line = lines[i];
			let index = line.indexOf('typescript');
			if (index >= 0) {
				problems++;
				diagnostics.push({
					severity: DiagnosticSeverity.Warning,
					range: {
						start: { line: i, character: index},
						end: { line: i, character: index + 10 }
					},
					message: `${line.substr(index, 10)} should be spelled TypeScript`,
					source: 'ex'
				});
			}
		}
		// Send the computed diagnostics to VSCode.
		connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
	});
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();