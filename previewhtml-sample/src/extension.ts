/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let previewUri = vscode.Uri.parse('css-preview://authority/css-preview');

	class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
		private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

		public provideTextDocumentContent(uri: vscode.Uri): string {
			return this.createCssSnippet();
		}

		get onDidChange(): vscode.Event<vscode.Uri> {
			return this._onDidChange.event;
		}

		public update(uri: vscode.Uri) {
			this._onDidChange.fire(uri);
		}

		private createCssSnippet() {
			let editor = vscode.window.activeTextEditor;
			if (!(editor.document.languageId === 'css')) {
				return this.errorSnippet("Active editor doesn't show a CSS document - no properties to preview.")
			}
			return this.extractSnippet();
		}

		private extractSnippet(): string {
			let editor = vscode.window.activeTextEditor;
			let text = editor.document.getText();
			let selStart = editor.document.offsetAt(editor.selection.anchor);
			let propStart = text.lastIndexOf('{', selStart);
			let propEnd = text.indexOf('}', selStart);

			if (propStart === -1 || propEnd === -1) {
				return this.errorSnippet("Cannot determine the rule's properties.");
			} else {
				return this.snippet(editor.document, propStart, propEnd);
			}
		}

		private errorSnippet(error: string): string {
			return `
				<body>
					${error}
				</body>`;
		}

		private snippet(document: vscode.TextDocument, propStart: number, propEnd: number): string {
			const properties = document.getText().slice(propStart + 1, propEnd);
			return `<style>
					#el {
						${properties}
					}
				</style>
				<body>
					<div>Preview of the <a href="${encodeURI('command:extension.revealCssRule?' + JSON.stringify([document.uri, propStart, propEnd]))}">CSS properties</a></div>
					<hr>
					<div id="el">Lorem ipsum dolor sit amet, mi et mauris nec ac luctus lorem, proin leo nulla integer metus vestibulum lobortis, eget</div>
				</body>`;
		}
	}

	let provider = new TextDocumentContentProvider();
	let registration = vscode.workspace.registerTextDocumentContentProvider('css-preview', provider);

	vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		if (e.document === vscode.window.activeTextEditor.document) {
			provider.update(previewUri);
		}
	});

	vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
		if (e.textEditor === vscode.window.activeTextEditor) {
			provider.update(previewUri);
		}
	})

	let disposable = vscode.commands.registerCommand('extension.showCssPropertyPreview', () => {
		return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'CSS Property Preview').then((success) => {
		}, (reason) => {
			vscode.window.showErrorMessage(reason);
		});
	});

	let highlight = vscode.window.createTextEditorDecorationType({ backgroundColor: 'rgba(200,200,200,.35)' });

	vscode.commands.registerCommand('extension.revealCssRule', (uri: vscode.Uri, propStart: number, propEnd: number) => {

		for (let editor of vscode.window.visibleTextEditors) {
			if (editor.document.uri.toString() === uri.toString()) {
				let start = editor.document.positionAt(propStart);
				let end = editor.document.positionAt(propEnd + 1);

				editor.setDecorations(highlight, [new vscode.Range(start, end)]);
				setTimeout(() => editor.setDecorations(highlight, []), 1500);
			}
		}
	});

	context.subscriptions.push(disposable, registration);
}
