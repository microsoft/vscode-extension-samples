/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import * as vscode from 'vscode';

export default class ReferencesDocument {

    private _uri: vscode.Uri;
    private _emitter: vscode.EventEmitter<vscode.Uri>;
    private _locations: vscode.Location[];

    private _lines: string[];
    private _ranges: vscode.Range[];
    private _join: Thenable<this>;

    constructor(emitter: vscode.EventEmitter<vscode.Uri>, uri: vscode.Uri, locations: vscode.Location[]) {
        this._emitter = emitter;
        this._uri = uri;
        this._locations = locations;

        // print header
        this._lines = [`Found ${this._locations.length} references`];
        this._ranges = [];
        this._join = this._populate();
    }

    get value() {
        return this._lines.join('\n');
    }

    get ranges() {
        return this._ranges;
    }

    join(): Thenable<this> {
        return this._join;
    }

    private _populate() {

        let locations = this._locations;
        if (locations.length === 0) {
            return;
        }

        // group locations by files
        let map = new Map<string, vscode.Range[]>();
        locations.forEach(location => {
            let ranges = map.get(location.uri.toString());
            if (ranges) {
                ranges.push(location.range);
            } else {
                map.set(location.uri.toString(), [location.range]);
            }
        });

        // fetch one by one, update doc asap
        return new Promise<this>(resolve => {

            let iter = map.entries();
            let next = () => {
                let entry = iter.next();
                if (entry.done) {
                    resolve(this);
                    return;
                }

                let [uri, ranges] = entry.value;
                this._fetchAndFormatLocation(vscode.Uri.parse(uri), ranges).then(lines => {
                    this._emitter.fire(this._uri);
                    next();
                });
            }
            next();
        });
    }

    private _fetchAndFormatLocation(uri: vscode.Uri, ranges: vscode.Range[]): PromiseLike<void> {

        return vscode.workspace.openTextDocument(uri).then(doc => {

            this._lines.push('', uri.toString());

            for (let i = 0; i < ranges.length; i++) {
                const {start: {line}} = ranges[i];
                this._appendLeading(doc, line, ranges[i - 1]);
                this._appendMatch(doc, line, ranges[i]);
                this._appendTrailing(doc, line, ranges[i + 1]);
            }

        }, err => {
            this._lines.push('', `Failed to load '${uri.toString()}'\n\n${String(err)}`, '');
        });
    }

    private _appendLeading(doc: vscode.TextDocument, line: number, previous: vscode.Range): void {
        let from = Math.max(0, line - 3, previous && previous.end.line || 0);
        while (++from < line) {
            const text = doc.lineAt(from).text;
            this._lines.push(`  ${from + 1}` + (text && `  ${text}`));
        }
    }

    private _appendMatch(doc: vscode.TextDocument, line:number, match: vscode.Range) {
        let text = doc.lineAt(line).text;
        let preamble = `  ${line + 1}: `;
        this._ranges.push(new vscode.Range(
            this._lines.length, preamble.length + match.start.character,
            this._lines.length, preamble.length + match.end.character)
        );
        this._lines.push(preamble + text);
    }

    private _appendTrailing(doc: vscode.TextDocument, line: number, next: vscode.Range): void {
        let to = Math.min(doc.lineCount, line + 3);
        if (next && next.start.line - to <= 2) {
            // next is too close
            return;
        }
        while (++line < to) {
            const text = doc.lineAt(line).text;
            this._lines.push(`  ${line + 1}` + (text && `  ${text}`));
        }
        if (next) {
            this._lines.push(`  ...`);
        }
    }
}