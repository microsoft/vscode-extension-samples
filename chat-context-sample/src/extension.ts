import * as vscode from 'vscode';

const PROVIDER_ID = 'chat-context-sample.jsonLineCount';

export function activate(context: vscode.ExtensionContext) {
	console.log('Chat context sample extension is now active!');

	// Register the chat resource context provider for JSON files
	const provider: vscode.ChatResourceContextProvider = {
		provideResourceChatContext(options: { resource: vscode.Uri }, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ChatContextItem | undefined> {
			// Find the text document for this resource
			const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === options.resource.toString());
			if (!document) {
				return undefined;
			}

			const lineCount = document.lineCount;
			const fileName = options.resource.path.split('/').pop() ?? 'unknown';

			return {
				icon: new vscode.ThemeIcon('file'),
				resourceUri: options.resource,
				label: `${fileName}: ${lineCount} lines`,
				modelDescription: `The JSON file "${fileName}" has ${lineCount} lines.`,
				tooltip: new vscode.MarkdownString(`**Line count:** ${lineCount}`),
				value: `File: ${fileName}\nLine count: ${lineCount}`
			};
		},

		resolveResourceChatContext(context: vscode.ChatContextItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ChatContextItem> {
			// Context items already have values, so just return as-is
			return context;
		}
	};

	// Register with a document selector for JSON files
	const disposable = vscode.chat.registerChatResourceContextProvider(
		[{ language: 'json' }, { language: 'jsonc' }],
		PROVIDER_ID,
		provider
	);

	context.subscriptions.push(disposable);
}

export function deactivate() { }
