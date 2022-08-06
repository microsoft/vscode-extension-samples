import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);

	const provider: vscode.InlineCompletionItemProvider = {
		provideInlineCompletionItems: async (document, position, context, token) => {
			console.log('provideInlineCompletionItems triggered');

			const regexp = /\/\/ \[(.+),(.+)\):(.*)/;
			if (position.line <= 0) {
				return;
			}

			const lineText = document.lineAt(position.line).text;
			if (lineText.startsWith('foo')) {
				return [
					new vscode.InlineCompletionItem('bar'),
					new vscode.InlineCompletionItem('baz'),
				];
			}
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
}

interface MyInlineCompletionItem extends vscode.InlineCompletionItem {
	someTrackingId: number;
}
