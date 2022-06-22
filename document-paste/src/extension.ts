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
		_token: vscode.CancellationToken
	): Promise<vscode.DocumentPasteEdit | undefined> {
		const countDataTransferItem = dataTransfer.get(this.countMimeTypes);
		if (!countDataTransferItem) {
			return undefined;
		}

		const textDataTransferItem = dataTransfer.get('text') ?? dataTransfer.get('text/plain');
		if (!textDataTransferItem) {
			return undefined;
		}

		const count = await countDataTransferItem.asString();
		const text = await textDataTransferItem.asString();

		// Build a snippet to insert
		const snippet = new vscode.SnippetString();
		snippet.appendText(`(copy #${count}) ${text}`);

		return { insertText: snippet };
	}
}

export function activate(context: vscode.ExtensionContext) {
	// Enable our provider in plaintext files 
	const selector: vscode.DocumentSelector = { language: 'plaintext' };

	// Register our provider
	context.subscriptions.push(vscode.languages.registerDocumentPasteEditProvider(selector, new CopyCountPasteEditProvider(), {
		pasteMimeTypes: ['text/plain'],
	}));
}
