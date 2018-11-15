/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import * as cowsay from 'cowsay';

export function activate({ subscriptions }: vscode.ExtensionContext) {

	// register a content provider for the cowsay-scheme
	const myScheme = 'cowsay';
	const myProvider = new class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			// simply invoke cowsay, use uri-path as text
			return cowsay.say({ text: uri.path });
		}
	}
	subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

	// register a command that opens a cowsay-document
	subscriptions.push(vscode.commands.registerCommand('cowsay.say', async () => {
		let what = await vscode.window.showInputBox({ placeHolder: 'cowsay...' });
		if (what) {
			let uri = vscode.Uri.parse('cowsay:' + what);
			let doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc, { preview: false });
		}
	}));
}
