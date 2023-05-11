import * as path from 'path';
import * as vscode from 'vscode';

const uriListMime = 'text/uri-list';

/**
 * Provider that reverses dropped text.
 * 
 * Note this does not apply to text that is drag and dropped with-in the current editor,
 * only for text dropped from external apps. 
 */
class ReverseTextOnDropProvider implements vscode.DocumentDropEditProvider {
	async provideDocumentDropEdits(
		_document: vscode.TextDocument,
		position: vscode.Position,
		dataTransfer: vscode.DataTransfer,
		token: vscode.CancellationToken
	): Promise<vscode.DocumentDropEdit | undefined> {
		// Check the data transfer to see if we have some kind of text data
		const dataTransferItem = dataTransfer.get('text/plain');
		if (!dataTransferItem) {
			return undefined;
		}

		const text = await dataTransferItem.asString();
		if (token.isCancellationRequested) {
			return undefined;
		}

		// Build a snippet to insert
		const snippet = new vscode.SnippetString();
		// Adding the reversed text
		snippet.appendText([...text].reverse().join(''));

		return new vscode.DocumentDropEdit(snippet);
	}
}

/**
 * Provider that inserts a numbered list of the names of dropped files.
 * 
 * Try dropping one or more files from:
 * 
 * - VS Code's explorer
 * - The operating system
 * - The open editors view 
 */
class FileNameListOnDropProvider implements vscode.DocumentDropEditProvider {
	async provideDocumentDropEdits(
		_document: vscode.TextDocument,
		_position: vscode.Position,
		dataTransfer: vscode.DataTransfer,
		token: vscode.CancellationToken
	): Promise<vscode.DocumentDropEdit | undefined> {
		// Check the data transfer to see if we have dropped a list of uris
		const dataTransferItem = dataTransfer.get(uriListMime);
		if (!dataTransferItem) {
			return undefined;
		}

		// 'text/uri-list' contains a list of uris separated by new lines.
		// Parse this to an array of uris.
		const urlList = await dataTransferItem.asString();
		if (token.isCancellationRequested) {
			return undefined;
		}

		const uris: vscode.Uri[] = [];
		for (const resource of urlList.split('\n')) {
			try {
				uris.push(vscode.Uri.parse(resource));
			} catch {
				// noop
			}
		}

		if (!uris.length) {
			return undefined;
		}

		// Build a snippet to insert
		const snippet = new vscode.SnippetString();
		uris.forEach((uri, index) => {
			const name = path.basename(uri.path);
			snippet.appendText(`${index + 1}. ${name}`);
			snippet.appendTabstop();

			if (index <= uris.length - 1 && uris.length > 1) {
				snippet.appendText('\n');
			}
		});

		return new vscode.DocumentDropEdit(snippet);
	}
}


export function activate(context: vscode.ExtensionContext) {
	// Enable our providers in plaintext files 
	const selector: vscode.DocumentSelector = { language: 'plaintext' };

	// Register our providers
	context.subscriptions.push(vscode.languages.registerDocumentDropEditProvider(selector, new ReverseTextOnDropProvider()));
	context.subscriptions.push(vscode.languages.registerDocumentDropEditProvider(selector, new FileNameListOnDropProvider()));
}
