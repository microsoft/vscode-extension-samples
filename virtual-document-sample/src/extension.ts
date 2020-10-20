/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import * as cowsay from 'cowsay';

export function activate({ subscriptions }: vscode.ExtensionContext) {

	// register a content provider for the cowsay-scheme
	const myScheme = 'cowsay';
	const myProvider = new class implements vscode.TextDocumentContentProvider {

		// emitter and its event
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;

		provideTextDocumentContent(uri: vscode.Uri): string {
			// simply invoke cowsay, use uri-path as text
			return cowsay.say({ text: uri.path });
		}
	};
	subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

	// register a command that opens a cowsay-document
	subscriptions.push(vscode.commands.registerCommand('cowsay.say', async () => {
		const what = await vscode.window.showInputBox({ placeHolder: 'cowsay...' });
		if (what) {
			const uri = vscode.Uri.parse('cowsay:' + what);
			const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
			await vscode.window.showTextDocument(doc, { preview: false });
		}
	}));

	// register a command that updates the current cowsay
	subscriptions.push(vscode.commands.registerCommand('cowsay.backwards', async () => {
		if (!vscode.window.activeTextEditor) {
			return; // no editor
		}
		const { document } = vscode.window.activeTextEditor;
		if (document.uri.scheme !== myScheme) {
			return; // not my scheme
		}
		// get path-components, reverse it, and create a new uri
		const say = document.uri.path;
		const newSay = say.split('').reverse().join('');
		const newUri = document.uri.with({ path: newSay });
		await vscode.window.showTextDocument(newUri, { preview: false });
	}));
}
