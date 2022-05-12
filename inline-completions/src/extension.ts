import * as vscode from 'vscode';

// Try it out in `playground.js`

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);
	let someTrackingIdCounter = 0;

	const provider: vscode.InlineCompletionItemProvider = {
		provideInlineCompletionItems: async (document, position, context, token) => {
			console.log('provideInlineCompletionItems triggered');

			const regexp = /\/\/ \[(.+),(.+)\):(.*)/;
			if (position.line <= 0) {
				return;
			}

			const lineBefore = document.lineAt(position.line - 1).text;
			const matches = lineBefore.match(regexp);
			if (matches) {
				const start = matches[1];
				const startInt = parseInt(start, 10);
				const end = matches[2];
				const endInt =
					end === '*' ? document.lineAt(position.line).text.length : parseInt(end, 10);
				const insertText = matches[3].replace(/\\n/g, '\n');

				return [
					{
						insertText,
						range: new vscode.Range(position.line, startInt, position.line, endInt),
						someTrackingId: someTrackingIdCounter++,
					},
				] as MyInlineCompletionItem[];
			}
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);

}

interface MyInlineCompletionItem extends vscode.InlineCompletionItem {
	someTrackingId: number;
}
