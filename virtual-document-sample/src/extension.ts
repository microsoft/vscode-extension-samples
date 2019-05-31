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
	}
	subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

	// register a command that opens a cowsay-document
	subscriptions.push(vscode.commands.registerCommand('cowsay.say', async () => {
		let what = await vscode.window.showInputBox({ placeHolder: 'cowsay...' });
		if (what) {
			let uri = vscode.Uri.parse('cowsay:' + what);
			let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
			await vscode.window.showTextDocument(doc, { preview: false });
		}
	}));

	// register a command that updates the current cowsay
	subscriptions.push(vscode.commands.registerCommand('cowsay.backwards', async () => {
		if (!vscode.window.activeTextEditor) {
			return; // no editor
		}
		let { document } = vscode.window.activeTextEditor;
		if (document.uri.scheme !== myScheme) {
			return; // not my scheme
		}
		// get path-components, reverse it, and create a new uri
		let say = document.uri.path;
		let newSay = say.split('').reverse().join('');
		let newUri = document.uri.with({ path: newSay });
		await vscode.window.showTextDocument(newUri, { preview: false });
	}))
}
