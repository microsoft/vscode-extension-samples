import * as vscode from 'vscode';
import { Range } from 'vscode';

/**
 * VARIATION 1: Pattern-Based Inline Completion Provider
 * This provider demonstrates advanced features including:
 * - Custom syntax for triggering completions via comments
 * - Snippet support
 * - Bracket pair completion
 * - Proposed API features (handleDidShowCompletionItem, handleDidPartiallyAcceptCompletionItem)
 * - Commands attached to completions
 */
const patternBasedProvider: vscode.InlineCompletionItemProvider = {
	async provideInlineCompletionItems(document, position, _context, _token) {
		console.log('[Pattern Provider] provideInlineCompletionItems triggered');
		const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;
		if (position.line <= 0) {
			return;
		}

		const result: vscode.InlineCompletionList = {
			items: [],
			commands: [],
		};

		let offset = 1;
		while (offset > 0) {
			if (position.line - offset < 0) {
				break;
			}

			const lineBefore = document.lineAt(position.line - offset).text;
			const matches = lineBefore.match(regexp);
			if (!matches) {
				break;
			}
			offset++;

			const start = matches[1];
			const startInt = parseInt(start, 10);
			const end = matches[2];
			const endInt =
				end === '*'
					? document.lineAt(position.line).text.length
					: parseInt(end, 10);
			const flags = matches[3];
			const completeBracketPairs = flags.includes('b');
			const isSnippet = flags.includes('s');
			const text = matches[4].replace(/\\n/g, '\n');

			result.items.push({
				insertText: isSnippet ? new vscode.SnippetString(text) : text,
				range: new Range(position.line, startInt, position.line, endInt),
				completeBracketPairs,
			});
		}

		if (result.items.length > 0) {
			result.commands!.push({
				command: 'demo-ext.command1',
				title: 'My Inline Completion Demo Command',
				arguments: [1, 2],
			});
		}
		return result;
	},

	handleDidShowCompletionItem(_completionItem: vscode.InlineCompletionItem): void {
		console.log('[Pattern Provider] handleDidShowCompletionItem');
	},

	/**
	 * Is called when an inline completion item was accepted partially.
	 * @param acceptedLength The length of the substring of the inline completion that was accepted already.
	 */
	handleDidPartiallyAcceptCompletionItem(
		_completionItem: vscode.InlineCompletionItem,
		_info: vscode.PartialAcceptInfo | number
	): void {
		console.log('[Pattern Provider] handleDidPartiallyAcceptCompletionItem');
	},
};

/**
 * VARIATION 2: Simple Context-Aware Inline Completion Provider
 * This provider demonstrates basic inline completion features:
 * - Context-aware completions based on current line content
 * - Simple pattern matching for common code constructs
 * - No proposed API usage (more stable, production-ready)
 */
const simpleProvider: vscode.InlineCompletionItemProvider = {
	async provideInlineCompletionItems(document, position, _context, _token) {
		console.log('[Simple Provider] provideInlineCompletionItems triggered');
		
		const linePrefix = document.lineAt(position).text.substring(0, position.character);
		const items: vscode.InlineCompletionItem[] = [];

		// Example 1: Complete console.log statements
		if (linePrefix.trim() === 'console.') {
			items.push({
				insertText: 'log()',
				range: new Range(position, position)
			});
		}

		// Example 2: Complete function declarations
		if (linePrefix.trim() === 'function ') {
			items.push({
				insertText: 'myFunction() {\n\t\n}',
				range: new Range(position, position)
			});
		}

		// Example 3: Complete if statements
		if (linePrefix.trim() === 'if ') {
			items.push({
				insertText: '(condition) {\n\t\n}',
				range: new Range(position, position)
			});
		}

		// Example 4: Complete for loops
		if (linePrefix.trim() === 'for ') {
			items.push({
				insertText: '(let i = 0; i < length; i++) {\n\t\n}',
				range: new Range(position, position)
			});
		}

		return items.length > 0 ? { items } : undefined;
	}
};

export function activate(_context: vscode.ExtensionContext) {
	console.log('inline-completions demo started with TWO variations');
	
	// Register command used by the pattern-based provider
	_context.subscriptions.push(
		vscode.commands.registerCommand('demo-ext.command1', async (...args) => {
			vscode.window.showInformationMessage('command1: ' + JSON.stringify(args));
		})
	);

	// Track the current provider and its state
	let currentProvider: 'pattern' | 'simple' = 'pattern';
	let providerDisposable: vscode.Disposable;

	const switchProvider = () => {
		// Dispose the current provider
		if (providerDisposable) {
			providerDisposable.dispose();
		}

		if (currentProvider === 'pattern') {
			currentProvider = 'simple';
			providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, simpleProvider);
			vscode.window.showInformationMessage('Switched to Simple Provider');
		} else {
			currentProvider = 'pattern';
			providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, patternBasedProvider);
			vscode.window.showInformationMessage('Switched to Pattern-Based Provider');
		}
	};

	_context.subscriptions.push(
		vscode.commands.registerCommand('extension.switch-inline-completion-provider', switchProvider)
	);

	// Register the pattern-based provider by default
	providerDisposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, patternBasedProvider);
	
	// Add a disposable that will clean up the current provider when the extension is deactivated
	_context.subscriptions.push(
		vscode.Disposable.from({
			dispose: () => {
				if (providerDisposable) {
					providerDisposable.dispose();
				}
			}
		})
	);
}
