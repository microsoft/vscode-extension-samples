import * as vscode from 'vscode';

/**
 * Provider that maintains a count of the number of times it has copied text.
 */
class CopyCountPasteEditProvider implements vscode.DocumentPasteEditProvider {

	private readonly countMimeTypes = 'application/vnd.code.copydemo-copy-count';

	private count = 0;

	prepareDocumentPaste?(
		_document: vscode.TextDocument,
		_ranges: readonly vscode.Range[],
		dataTransfer: vscode.DataTransfer,
		_token: vscode.CancellationToken
	): void | Thenable<void> {
		dataTransfer.set(this.countMimeTypes, new vscode.DataTransferItem(this.count++));
		dataTransfer.set('text/plain', new vscode.DataTransferItem(this.count++));
	}

	async provideDocumentPasteEdits(
		_document: vscode.TextDocument,
		_ranges: readonly vscode.Range[],
		dataTransfer: vscode.DataTransfer,
		token: vscode.CancellationToken
	): Promise<vscode.DocumentPasteEdit | undefined> {
		const countDataTransferItem = dataTransfer.get(this.countMimeTypes);
		if (!countDataTransferItem) {
			return;
		}

		const textDataTransferItem = dataTransfer.get('text/plain');
		if (!textDataTransferItem) {
			return;
		}

		const count = await countDataTransferItem.asString();
		if (token.isCancellationRequested) {
			return;
		}

		const text = await textDataTransferItem.asString();
		if (token.isCancellationRequested) {
			return;
		}

		// Build a snippet to insert
		const snippet = new vscode.SnippetString();
		snippet.appendText(`(copy #${count}) ${text}`);

		return new vscode.DocumentPasteEdit(snippet, "Insert with copy count sample");
	}
}

export function activate(context: vscode.ExtensionContext) {
	// Enable our provider in plaintext files 
	const selector: vscode.DocumentSelector = { language: 'plaintext' };

	// Register our provider
	context.subscriptions.push(vscode.languages.registerDocumentPasteEditProvider(selector, new CopyCountPasteEditProvider(), {
		id: 'copyCount',
		pasteMimeTypes: ['text/plain'],
	}));
}
