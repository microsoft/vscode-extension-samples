/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';

export default class ReferencesDocument {

	private readonly _uri: vscode.Uri;
	private readonly _emitter: vscode.EventEmitter<vscode.Uri>;
	private readonly _locations: vscode.Location[];

	private readonly _lines: string[];
	private readonly _links: vscode.DocumentLink[];

	constructor(uri: vscode.Uri, locations: vscode.Location[], emitter: vscode.EventEmitter<vscode.Uri>) {
		this._uri = uri;
		this._locations = locations;

		// The ReferencesDocument has access to the event emitter from
		// the containing provider. This allows it to signal changes
		this._emitter = emitter;

		// Start with printing a header and start resolving
		this._lines = [`Found ${this._locations.length} references`];
		this._links = [];
		this._populate();
	}

	get value() {
		return this._lines.join('\n');
	}

	get links() {
		return this._links;
	}

	private async _populate() {

		// group all locations by files containing them
		const groups: vscode.Location[][] = [];
		let group: vscode.Location[] = [];
		for (const loc of this._locations) {
			if (group.length === 0 || group[0].uri.toString() !== loc.uri.toString()) {
				group = [];
				groups.push(group);
			}
			group.push(loc);
		}

		//
		for (const group of groups) {
			const uri = group[0].uri;
			const ranges = group.map(loc => loc.range);
			await this._fetchAndFormatLocations(uri, ranges);
			this._emitter.fire(this._uri);
		}
	}

	private async _fetchAndFormatLocations(uri: vscode.Uri, ranges: vscode.Range[]): Promise<void> {
		// Fetch the document denoted by the uri and format the matches
		// with leading and trailing content form the document. Make sure
		// to not duplicate lines
		try {
			const doc = await vscode.workspace.openTextDocument(uri);
			this._lines.push('', uri.toString());
			for (let i = 0; i < ranges.length; i++) {
				const { start: { line } } = ranges[i];
				this._appendLeading(doc, line, ranges[i - 1]);
				this._appendMatch(doc, line, ranges[i], uri);
				this._appendTrailing(doc, line, ranges[i + 1]);
			}
		} catch (err) {
			this._lines.push('', `Failed to load '${uri.toString()}'\n\n${String(err)}`, '');
		}
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
		const to = Math.min(doc.lineCount, line + 3);
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
