import JSFiddle = require("jsfiddle");
import { QuickDiffProvider, Uri, CancellationToken, ProviderResult, WorkspaceFolder, workspace, TextDocument } from "vscode";
import * as path from 'path';

export class Fiddle {
	constructor(public hash: string, public version: number, public data: FiddleData) { }
}

export interface FiddleData {
	html: string;
	js: string;
	css: string;
}

export function areIdentical(first: FiddleData, second: FiddleData): boolean {
	return first.html == second.html
		&& first.css == second.css
		&& first.js == second.js;
}

export const JSFIDDLE_SCHEME = 'jsfiddle';

export class FiddleRepository implements QuickDiffProvider {

	constructor(private workspaceFolder: WorkspaceFolder, private fiddleHash: string) { }

	provideOriginalResource?(uri: Uri, token: CancellationToken): ProviderResult<Uri> {
		// converts the local file uri to jsfiddle:file.ext
		let relativePath = workspace.asRelativePath(uri.fsPath);
		return Uri.parse(`${JSFIDDLE_SCHEME}:${relativePath}`);
	}
}

export async function downloadFiddle(hash: string, version: number | undefined): Promise<Fiddle> {

	if (hash === "demo") {
		let maxDemoVersion = 1;
		if (version === undefined) version = maxDemoVersion;

		if (version <= maxDemoVersion) {
			let fiddleData: FiddleData = {
				html: '<div class="hi">Hi</div>',
				css: `.hi {\n	color: red;\n}`,
				js: '$(".hi").fadeOut();'
			};
			return new Fiddle(hash, version, fiddleData);
		}
		else {
			throw "Invalid demo fiddle version.";
		}
	}

	let id = toFiddleId(hash, version);

	return new Promise<Fiddle>((resolve, reject) => {
		JSFiddle.getFiddle(id, (err: any, fiddleData: any) => {
			// handle error
			if (err) reject(err);

			let fiddle = new Fiddle(hash, version, fiddleData);

			resolve(fiddle);
		});
	});
}

export async function uploadFiddle(hash: string, version: number, html: string, js: string, css: string): Promise<Fiddle> {

	if (hash === "demo") {
		return new Fiddle(hash, version, { html: html, js: js, css: css });
	}

	let data = {
		slug: hash,
		version: version,
		html: html,
		js: js,
		css: css
	};

	return new Promise<Fiddle>((resolve, reject) => {
		JSFiddle.saveFiddle(data, (err: any, fiddleData: any) => {
			// handle error
			if (err) reject(err);

			let fiddle = new Fiddle(hash, version, fiddleData);

			resolve(fiddle);
		});
	});
}

function toFiddleId(hash: string, version: number | undefined): string {
	if (version === undefined) {
		return hash;
	}
	else {
		return hash + '/' + version;
	}
}

/**
 * Gets extension trimming the dot character.
 * @param uri document uri
 */
export function toExtension(uri: Uri): string {
	return path.extname(uri.fsPath).substr(1);
}