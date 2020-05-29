import JSFiddle = require("jsfiddle");
import { QuickDiffProvider, Uri, CancellationToken, ProviderResult, WorkspaceFolder, workspace, window, env } from "vscode";
import * as path from 'path';

/** Represents one JSFiddle data and meta-data. */
export class Fiddle {
	constructor(public slug: string, public version: number, public data: FiddleData) { }
}

/** Represents JSFiddle HTML, JavaScript and CSS text. */
export interface FiddleData {
	html: string;
	js: string;
	css: string;
}

export function areIdentical(first: FiddleData, second: FiddleData): boolean {
	return first.html === second.html
		&& first.css === second.css
		&& first.js === second.js;
}

export const JSFIDDLE_SCHEME = 'jsfiddle';

export class FiddleRepository implements QuickDiffProvider {

	constructor(private workspaceFolder: WorkspaceFolder, private fiddleSlug: string) { }

	provideOriginalResource?(uri: Uri, token: CancellationToken): ProviderResult<Uri> {
		// converts the local file uri to jsfiddle:file.ext
		const relativePath = workspace.asRelativePath(uri.fsPath);
		return Uri.parse(`${JSFIDDLE_SCHEME}:${relativePath}`);
	}

	/**
	 * Enumerates the resources under source control.
	 */
	provideSourceControlledResources(): Uri[] {
		return [
			Uri.file(this.createLocalResourcePath('html')),
			Uri.file(this.createLocalResourcePath('js')),
			Uri.file(this.createLocalResourcePath('css'))];
	}

	/**
	 * Creates a local file path in the local workspace that corresponds to the part of the 
	 * fiddle denoted by the given extension.
	 *
	 * @param extension fiddle part, which is also used as a file extension
	 * @returns path of the locally cloned fiddle resource ending with the given extension
	 */
	createLocalResourcePath(extension: string) {
		return path.join(this.workspaceFolder.uri.fsPath, this.fiddleSlug + '.' + extension);
	}
}

const DEMO: FiddleData[] = [
	{
		html: '<div class="hi">Hi</div>',
		css: `.hi {\n	color: red;\n}`,
		js: '$(".hi").fadeOut();'
	}
];

// emulates prior versions mock-committed in previous sessions
let demoVersionOffset: number | undefined = undefined;

export async function downloadFiddle(slug: string, version: number | undefined): Promise<Fiddle> {

	if (slug === "demo") {
		// use mock fiddle
		if (demoVersionOffset === undefined && version === undefined) { version = 0; }
		if (demoVersionOffset === undefined) { demoVersionOffset = version; }
		const maxDemoVersion = DEMO.length - 1 + demoVersionOffset;
		if (version === undefined) { version = maxDemoVersion; }

		if (version >= 0 && version <= maxDemoVersion) {
			// mock all versions committed in previous sessions by the first version
			const index = Math.max(0, version - demoVersionOffset);
			const fiddleData = DEMO[index];
			return new Fiddle(slug, version, fiddleData);
		}
		else {
			throw new Error("Invalid demo fiddle version.");
		}
	}

	const id = toFiddleId(slug, version);

	return new Promise<Fiddle>((resolve, reject) => {
		JSFiddle.getFiddle(id, (err: any, fiddleData: any) => {
			// handle error
			if (err) { reject(err); }

			const fiddle = new Fiddle(slug, version, fiddleData);

			resolve(fiddle);
		});
	});
}

export async function uploadFiddle(slug: string, version: number, html: string, js: string, css: string): Promise<Fiddle | undefined> {

	if (slug === "demo") {
		// using mock fiddle
		const fiddleData: FiddleData = { html: html, js: js, css: css };
		DEMO.push(fiddleData);
		return new Fiddle(slug, version, fiddleData);
	}
	else {

		const answer = await window.showQuickPick(["Yes, open in the browser. I will paste the new Fiddle code, discard changes, refresh source control and checkout latest.", "No, I was just clicking around."],
			{ placeHolder: "JS Fiddle saving is not supported. Do you want to open the JSFiddle in the browser?" });

		if (answer && answer.toLowerCase().startsWith("yes")) {
			env.openExternal(Uri.parse(`https://jsfiddle.net/${slug}/`));
			return undefined;
		}

		if (false) {
			// this, sadly, does not work as advertised
			const data = {
				slug: slug,
				version: version,
				html: html,
				js: js,
				css: css
			};

			return new Promise<Fiddle>((resolve, reject) => {
				JSFiddle.saveFiddle(data, (err: any, fiddleData: any) => {
					// handle error
					if (err) {
						reject(err);
					}
					else {
						const fiddle = new Fiddle(slug, version, fiddleData);

						resolve(fiddle);
					}
				});
			});
		}
		else {
			return undefined;
		}
	}
}

export function toFiddleId(slug: string, version: number | undefined): string {
	if (version === undefined) {
		return slug;
	}
	else {
		return slug + '/' + version;
	}
}

/**
 * Gets extension trimming the dot character.
 * @param uri document uri
 */
export function toExtension(uri: Uri): string {
	return path.extname(uri.fsPath).substr(1);
}