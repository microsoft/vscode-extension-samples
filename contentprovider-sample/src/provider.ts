/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import ReferencesDocument from './referencesDocument';

export default class Provider implements vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider {

	static scheme = 'references';

	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _documents = new Map<string, ReferencesDocument>();
	private _editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
	private _subscriptions: vscode.Disposable;

	constructor() {

		// Listen to the `closeTextDocument`-event which means we must
		// clear the corresponding model object - `ReferencesDocument`
		this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => this._documents.delete(doc.uri.toString()));
	}

	dispose() {
		this._subscriptions.dispose();
		this._documents.clear();
		this._editorDecoration.dispose();
		this._onDidChange.dispose();
	}

	// Expose an event to signal changes of _virtual_ documents
	// to the editor
	get onDidChange() {
		return this._onDidChange.event;
	}

	// Provider method that takes an uri of the `references`-scheme and
	// resolves its content by (1) running the reference search command
	// and (2) formatting the results
	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

		// already loaded?
		const document = this._documents.get(uri.toString());
		if (document) {
			return document.value;
		}

		// Decode target-uri and target-position from the provided uri and execute the
		// `reference provider` command (https://code.visualstudio.com/api/references/commands).
		// From the result create a references document which is in charge of loading,
		// printing, and formatting references
		const [target, pos] = decodeLocation(uri);
		return vscode.commands.executeCommand<vscode.Location[]>('vscode.executeReferenceProvider', target, pos).then(locations => {
			locations = locations || [];

			// sort by locations and shuffle to begin from target resource
			let idx = 0;
			locations.sort(Provider._compareLocations).find((loc, i) => loc.uri.toString() === target.toString() && !!(idx = i) && true);
			locations.push(...locations.splice(0, idx));

			// create document and return its early state
			const document = new ReferencesDocument(uri, locations, this._onDidChange);
			this._documents.set(uri.toString(), document);
			return document.value;
		});
	}

	private static _compareLocations(a: vscode.Location, b: vscode.Location): number {
		if (a.uri.toString() < b.uri.toString()) {
			return -1;
		} else if (a.uri.toString() > b.uri.toString()) {
			return 1;
		} else {
			return a.range.start.compareTo(b.range.start);
		}
	}

	provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] | undefined {
		// While building the virtual document we have already created the links.
		// Those are composed from the range inside the document and a target uri
		// to which they point
		const doc = this._documents.get(document.uri.toString());
		if (doc) {
			return doc.links;
		}
	}
}

let seq = 0;

export function encodeLocation(uri: vscode.Uri, pos: vscode.Position): vscode.Uri {
	const query = JSON.stringify([uri.toString(), pos.line, pos.character]);
	return vscode.Uri.parse(`${Provider.scheme}:References.locations?${query}#${seq++}`);
}

export function decodeLocation(uri: vscode.Uri): [vscode.Uri, vscode.Position] {
	const [target, line, character] = <[string, number, number]>JSON.parse(uri.query);
	return [vscode.Uri.parse(target), new vscode.Position(line, character)];
}
