/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';
import ReferencesDocument from './referencesDocument';

export default class ContentProvider implements vscode.TextDocumentContentProvider {

    static scheme = 'references';

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private _documents = new Map<string, ReferencesDocument>();
    private _editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
    private _subscriptions: vscode.Disposable;

    constructor() {

        // Listen to the following events:
        // * closeTextDocument - which means we must clear the corresponding model object - `ReferencesDocument`
        // * changeActiveEditor - do decorate with references information
        this._subscriptions = vscode.Disposable.from(
            vscode.workspace.onDidCloseTextDocument(doc => this._documents.delete(doc.uri.toString())),
            vscode.window.onDidChangeActiveTextEditor(this._decorateEditor, this)
        );
    }

    dispose() {
        this._subscriptions.dispose();
        this._documents.clear();
        this._editorDecoration.dispose();
        this._onDidChange.dispose();
    }

    /**
     * Expose an event to signal changes of _virtual_ documents
     * to the editor
     */
    get onDidChange() {
        return this._onDidChange.event;
    }

    /**
     * Provider method that takes an uri of the `references`-scheme and
     * resolves its content by (1) running the reference search command
     * and (2) formatting the results
     */
    provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {

        // already loaded?
        let document = this._documents.get(uri.toString());
        if (document) {
            return document.value;
        }

        // Decode target-uri and target-position from the provided uri and execute the
        // `reference provider` command (http://code.visualstudio.com/docs/extensionAPI/vscode-api-commands).
        // From the result create a references document which is in charge of loading,
        // printing, and formatting references
        const [target, pos] = decodeLocation(uri);
        return vscode.commands.executeCommand<vscode.Location[]>('vscode.executeReferenceProvider', target, pos).then(locations => {

            let document = new ReferencesDocument(this._onDidChange, uri, locations);
            this._documents.set(uri.toString(), document);
            return document.value;
        });
    }

    private _decorateEditor(editor: vscode.TextEditor) {
        // When an editor opens, check if it shows a `location` document
        // and decorate the actual references
        if (!editor || !vscode.languages.match('locations', editor.document)) {
            return;
        }
        let doc = this._documents.get(editor.document.uri.toString());
        if (doc) {
            doc.join().then(() => editor.setDecorations(this._editorDecoration, doc.ranges));
        }
    }
}

let seq = 0;

export function encodeLocation(uri: vscode.Uri, pos: vscode.Position): vscode.Uri {
    const query = JSON.stringify([uri.toString(), pos.line, pos.character]);
    return vscode.Uri.parse(`${ContentProvider.scheme}:References.locations?${query}#${seq++}`);
}

export function decodeLocation(uri: vscode.Uri): [vscode.Uri, vscode.Position] {
    let [target, line, character] = <[string, number, number]>JSON.parse(uri.query);
    return [vscode.Uri.parse(target), new vscode.Position(line, character)];
}