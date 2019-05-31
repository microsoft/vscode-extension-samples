/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';

export default class ReferencesDocument {

	private _uri: vscode.Uri;
	private _emitter: vscode.EventEmitter<vscode.Uri>;
	private _locations: vscode.Location[];

	private _lines: string[];
	private _links: vscode.DocumentLink[];
	private _join?: Thenable<this>;

	constructor(uri: vscode.Uri, locations: vscode.Location[], emitter: vscode.EventEmitter<vscode.Uri>) {
		this._uri = uri;
		this._locations = locations;

		// The ReferencesDocument has access to the event emitter from
		// the containg provider. This allows it to signal changes
		this._emitter = emitter;

		// Start with printing a header and start resolving
		this._lines = [`Found ${this._locations.length} references`];
		this._links = [];
		this._join = this._populate();
	}

	get value() {
		return this._lines.join('\n');
	}

	get links() {
		return this._links;
	}

	join(): Thenable<this> | undefined {
		return this._join;
	}

	private _populate() {

		if (this._locations.length === 0) {
			return;
		}

		// fetch one by one, update doc asap
		return new Promise<this>(resolve => {

			let index = 0;

			let next = () => {

				// We have seen all groups
				if (index >= this._locations.length) {
					resolve(this);
					return;
				}

				// We know that this._locations is sorted by uri
				// such that we can now iterate and collect ranges
				// until the uri changes
				let loc = this._locations[index];
				let uri = loc.uri;
				let ranges = [loc.range];
				while (++index < this._locations.length) {
					loc = this._locations[index];
					if (loc.uri.toString() !== uri.toString()) {
						break;
					} else {
						ranges.push(loc.range);
					}
				}

				// We have all ranges of a resource so that it be
				// now loaded and formatted
				this._fetchAndFormatLocations(uri, ranges).then(lines => {
					this._emitter.fire(this._uri);
					next();
				});
			};
			next();
		});
	}

	private _fetchAndFormatLocations(uri: vscode.Uri, ranges: vscode.Range[]): PromiseLike<void> {

		// Fetch the document denoted by the uri and format the matches
		// with leading and trailing content form the document. Make sure
		// to not duplicate lines
		return vscode.workspace.openTextDocument(uri).then(doc => {

			this._lines.push('', uri.toString());

			for (let i = 0; i < ranges.length; i++) {
				const { start: { line } } = ranges[i];
				this._appendLeading(doc, line, ranges[i - 1]);
				this._appendMatch(doc, line, ranges[i], uri);
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

	private _appendMatch(doc: vscode.TextDocument, line: number, match: vscode.Range, target: vscode.Uri) {
		const text = doc.lineAt(line).text;
		const preamble = `  ${line + 1}: `;

		// Append line, use new length of lines-array as line number
		// for a link that point to the reference
		const len = this._lines.push(preamble + text);

		// Create a document link that will reveal the reference
		const linkRange = new vscode.Range(len - 1, preamble.length + match.start.character, len - 1, preamble.length + match.end.character);
		const linkTarget = target.with({ fragment: String(1 + match.start.line) });
		this._links.push(new vscode.DocumentLink(linkRange, linkTarget));
	}

	private _appendTrailing(doc: vscode.TextDocument, line: number, next: vscode.Range): void {
		let to = Math.min(doc.lineCount, line + 3);
		if (next && next.start.line - to <= 2) {
			return; // next is too close, _appendLeading does the work
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
