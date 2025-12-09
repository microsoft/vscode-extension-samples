import * as vscode from 'vscode';

/**
 * Provider that maintains a count of the number of times it has copied text.
 */
class CopyCountPasteEditProvider implements vscode.DocumentPasteEditProvider {

	static readonly kind = vscode.DocumentDropOrPasteEditKind.Empty.append('text', 'custom', 'count');

	static readonly countMimeType = 'application/vnd.code.copydemo-copy-count';

	private count = 0;

	/**
	 * Invoked on copy. This allows us to modify the `dataTransfer` that is later passed to {@link provideDocumentPasteEdits}.
	 */
	prepareDocumentPaste(
		_document: vscode.TextDocument,
		_ranges: readonly vscode.Range[],
		dataTransfer: vscode.DataTransfer,
		_token: vscode.CancellationToken
	) {
		// Save off metadata in a custom mimetype
		dataTransfer.set(CopyCountPasteEditProvider.countMimeType, new vscode.DataTransferItem(this.count++));
	}

	/**
	 * Invoked on paste
	 */
	async provideDocumentPasteEdits(
		_document: vscode.TextDocument,
		_ranges: readonly vscode.Range[],
		dataTransfer: vscode.DataTransfer,
		_context: vscode.DocumentPasteEditContext,
		token: vscode.CancellationToken
	): Promise<vscode.DocumentPasteEdit[] | undefined> {
		// Read our custom metadata
		const countDataTransferItem = dataTransfer.get(CopyCountPasteEditProvider.countMimeType);
		if (!countDataTransferItem) {
			return;
		}

		const count = await countDataTransferItem.asString();
		if (token.isCancellationRequested) {
			return;
		}

		// Also read the text data in the clipboard
		const textDataTransferItem = dataTransfer.get('text/plain');
		if (!textDataTransferItem) {
			return;
		}

		const text = await textDataTransferItem.asString();
		if (token.isCancellationRequested) {
			return;
		}

		// Build a snippet to insert
		const snippet = new vscode.SnippetString();
		snippet.appendText(`(copy #${count}) ${text}`);

		return [
			new vscode.DocumentPasteEdit(snippet, "Insert with copy count sample", CopyCountPasteEditProvider.kind),
		];
	}
}

export function activate(context: vscode.ExtensionContext) {
	// Enable our provider in plaintext files 
	const selector: vscode.DocumentSelector = { language: 'plaintext' };

	// Register our provider
	context.subscriptions.push(vscode.languages.registerDocumentPasteEditProvider(selector, new CopyCountPasteEditProvider(), {
		// List out all kinds of edits that our provider may return
		providedPasteEditKinds: [CopyCountPasteEditProvider.kind],

		// List out all mime types that our provider may add on copy
		copyMimeTypes: [CopyCountPasteEditProvider.countMimeType],

		// List out all mime types that our provider should be invoked for on paste
		pasteMimeTypes: ['text/plain', CopyCountPasteEditProvider.countMimeType],
	}));
}
