/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as path from 'path';
import { ExtensionContext, window as Window } from 'vscode';
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from 'vscode-languageclient/node';

export function activate(context: ExtensionContext): void {
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'sampleServer.js'));
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc, options: { cwd: process.cwd() } },
		debug: { module: serverModule, transport: TransportKind.ipc, options: { cwd: process.cwd() } }
	};

	let clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		diagnosticCollectionName: 'sample',
		revealOutputChannelOn: RevealOutputChannelOn.Never,
		progressOnInitialization: true,
		middleware: {
			executeCommand: async (command, args, next) => {
				const selected = await Window.showQuickPick(['Visual Studio', 'Visual Studio Code']);
				if (selected === undefined) {
					return next(command, args);
				}
				args = args.slice(0);
				args.push(selected);
				return next(command, args);
			}
		}
	};

	let client: LanguageClient;
	try {
		client = new LanguageClient('UI Sample', serverOptions, clientOptions);
	} catch (err) {
		Window.showErrorMessage(`The extension couldn't be started. See the output channel for details.`);
		return;
	}
	client.registerProposedFeatures();

	context.subscriptions.push(
		client.start(),
	);
}

export function deactivate() {
}
