import { CancellationToken, ProviderResult, TextDocumentContentProvider, Event, Uri, EventEmitter, Disposable } from "vscode";
import { toExtension, JSFIDDLE_SCHEME, Fiddle } from "./fiddleRepository";

/**
 * Provides the content of the JS Fiddle documents as fetched from the server i.e.  without the local edits.
 * This is used for the source control diff.
 */
export class JSFiddleDocumentContentProvider implements TextDocumentContentProvider, Disposable {
	private _onDidChange = new EventEmitter<Uri>();
	private fiddle: Fiddle;

	get onDidChange(): Event<Uri> {
		return this._onDidChange.event;
	}

	dispose(): void {
		this._onDidChange.dispose();
	}

	updated(newFiddle: Fiddle): void {
		this.fiddle = newFiddle;

		// let's assume all 3 documents actually changed and notify the quick-diff
		this._onDidChange.fire(Uri.parse(`${JSFIDDLE_SCHEME}:${this.fiddle.hash}.html`));
		this._onDidChange.fire(Uri.parse(`${JSFIDDLE_SCHEME}:${this.fiddle.hash}.css`));
		this._onDidChange.fire(Uri.parse(`${JSFIDDLE_SCHEME}:${this.fiddle.hash}.js`));
	}

	provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
		if (token.isCancellationRequested) return "Canceled";

		let fiddlePart = toExtension(uri);

		return this.fiddle.data[fiddlePart];
	}
}