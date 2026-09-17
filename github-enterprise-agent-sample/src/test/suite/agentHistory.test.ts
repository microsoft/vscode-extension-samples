import * as assert from 'assert';
import * as vscode from 'vscode';
import { historyToMessages } from '../../agent';

function requestTurn(prompt: string): vscode.ChatRequestTurn {
	return { prompt } as unknown as vscode.ChatRequestTurn;
}

function responseTurn(markdown: string): vscode.ChatResponseTurn {
	return {
		response: [new vscode.ChatResponseMarkdownPart(new vscode.MarkdownString(markdown))]
	} as unknown as vscode.ChatResponseTurn;
}

suite('Agent conversation history', () => {
	test('rebuilds request and response turns as model messages', () => {
		const context = {
			history: [
				requestTurn('list my orgs'),
				responseTurn('- **acme** — Acme Corp'),
				requestTurn('and their repos?')
			]
		} as unknown as vscode.ChatContext;

		const messages = historyToMessages(context);
		assert.strictEqual(messages.length, 3);
		assert.strictEqual(messages[0].role, vscode.LanguageModelChatMessageRole.User);
		assert.strictEqual(messages[0].content.map(part => part instanceof vscode.LanguageModelTextPart ? part.value : '').join(''), 'list my orgs');
		assert.strictEqual(messages[1].role, vscode.LanguageModelChatMessageRole.Assistant);
		assert.strictEqual(messages[1].content.map(part => part instanceof vscode.LanguageModelTextPart ? part.value : '').join(''), '- **acme** — Acme Corp');
		assert.strictEqual(messages[2].role, vscode.LanguageModelChatMessageRole.User);
	});

	test('skips response turns with no markdown content', () => {
		const context = {
			history: [
				responseTurn(''),
				requestTurn('hello')
			]
		} as unknown as vscode.ChatContext;

		const messages = historyToMessages(context);
		assert.strictEqual(messages.length, 1);
		assert.strictEqual(messages[0].role, vscode.LanguageModelChatMessageRole.User);
	});

	test('returns no messages for an empty history', () => {
		const messages = historyToMessages({ history: [] } as unknown as vscode.ChatContext);
		assert.strictEqual(messages.length, 0);
	});
});
