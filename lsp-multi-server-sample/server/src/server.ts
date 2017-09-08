/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import {
	createConnection, TextDocuments, ProposedFeatures, TextDocumentSyncKind
} from 'vscode-languageserver';

let connection = createConnection(ProposedFeatures.all);
let documents = new TextDocuments();
let rootUri: string;

documents.onDidOpen((event) => {
	connection.console.log(`[Server ${rootUri}] Document opened: ${event.document.uri}`);
})
documents.listen(connection);

connection.onInitialize((params) => {
	rootUri = params.rootUri;
	connection.console.log(`Server started for folder: ${rootUri}`);
	return {
		capabilities: {
			textDocumentSync: {
				openClose: true,
				change: TextDocumentSyncKind.None
			}
		}
	}
});
connection.listen();