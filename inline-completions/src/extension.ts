import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		'extension.inline-completion-settings',
		() => {
			vscode.window.showInformationMessage('Show settings');
		}
	);

	context.subscriptions.push(disposable);

	const allSuggestions = [
		'helloworld1',
		`if (n < 2) {
	return 1;
}
return fib(n - 1) + fib(n - 2);`,
		`if (n < 3) {
	if (n < 2) {
		return 1;
	}
	return 1;
}
return fib(n - 1) + fib(n - 2);`,
	];

	function longestSuffixPrefixLength(a: string, b: string): number {
		for (let i = Math.min(a.length, b.length); i > 0; i--) {
			if (a.substr(-i) == b.substr(0, i)) {
				return i;
			}
		}
		return 0;
	}

	interface CustomInlineCompletionItem extends vscode.InlineCompletionItem {
		trackingId: string;
	}

	const provider: vscode.InlineCompletionItemProvider<CustomInlineCompletionItem> = {
		provideInlineCompletionItems: async (document, position, context, token) => {
			const textBeforeCursor = document.getText(
				new vscode.Range(position.with(undefined, 0), position)
			);

			const suggestions = [...allSuggestions];

			if (context.triggerKind === vscode.InlineCompletionTriggerKind.Explicit) {
				suggestions.push('if (n < 1000) {\n}', 'helloworld2');
				await new Promise((r) => setTimeout(r, 1000));
			}

			const items = new Array<CustomInlineCompletionItem>();
			for (const s of suggestions) {
				const l = longestSuffixPrefixLength(textBeforeCursor, s);
				if (l > 0) {
					items.push({
						text: s,
						range: new vscode.Range(position.translate(0, -l), position),
						trackingId: 'some-id',
					});
				}
			}
			return { items };
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);

	// Be aware that the API around `getInlineCompletionItemController` will not be finalized as is!
	vscode.window.getInlineCompletionItemController(provider).onDidShowCompletionItem(e => {
		const id = e.completionItem.trackingId;
	});
}
