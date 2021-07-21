/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ExtensionContext, Uri } from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';

import { LanguageClient } from 'vscode-languageclient/browser';

// this method is called when vs code is activated
export function activate(context: ExtensionContext) {

	console.log('lsp-web-extension-sample activated!');

	const documentSelector = [{ language: 'plaintext' }];

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		documentSelector,
		synchronize: {},
		initializationOptions: {}
	};

	// Create a worker. The worker main file implements the language server.
	const serverMain = Uri.joinPath(context.extensionUri, 'server/dist/browserServerMain.js');
	const worker = new Worker(serverMain.toString());

	// create the language server client to communicate with the server running in the worker
	const client = new LanguageClient('lsp-web-extension-sample', 'LSP Web Extension Sample', clientOptions, worker);
	
	const disposable = client.start();
	context.subscriptions.push(disposable);
	
	client.onReady().then(() => {
		console.log('lsp-web-extension-sample server is ready');
	});
}
