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
        this._locations = locations.sort(ReferencesDocument._compareLocations);

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
                const range = ranges[i];
                const {start: {line}} = range;

                let prev = ranges[i - 1];
                this._appendContext(doc, line, prev ? Math.min(2, line - prev.start.line) : 2, false);

                this._appendMatch(doc, range);

                let next = ranges[i + 1];
                this._appendContext(doc, line + 1, next ? Math.min(2, next.start.line - line) : 2, true);

                if (next) {
                    this._lines.push('  ...');
                }
            }

        }, err => {
            this._lines.push('', `Failed to load '${uri.toString()}'\n\n${String(err)}`, '');
        });
    }

    private _appendContext(doc: vscode.TextDocument, line: number, offset: number, down: boolean) {
        let from = down ? line : line - offset;
        let to = down ? line + offset : line;
        while (from < to) {
            if (from >= 0 && from < doc.lineCount) {
                const text = doc.lineAt(from).text;
                this._lines.push(`  ${from + 1}` + (text && `  ${text}`));
            }
            from++;
        }
    }

    private _appendMatch(doc: vscode.TextDocument, range: vscode.Range) {
        let line = range.start.line;
        let text = doc.lineAt(line).text;
        let preamble = `  ${line + 1}: `;

        this._ranges.push(new vscode.Range(this._lines.length, preamble.length + range.start.character, this._lines.length, preamble.length + range.end.character));
        this._lines.push(preamble + text);
    }

    private static _compareLocations(a: vscode.Location, b: vscode.Location): number {
        if (a.uri.toString() < b.uri.toString()) {
            return -1;
        } else if (a.uri.toString() > b.uri.toString()) {
            return 1;
        } else {
            return a.range.start.compareTo(b.range.start)
        }
    }
}