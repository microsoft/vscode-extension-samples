import * as assert from 'assert';
import * as vscode from 'vscode';
import { resolveReferencedChatTools, toLanguageModelChatTools } from '../../lmTools';
import { FindFilesTool } from '../../tools';

const SAMPLE_TOOLS: vscode.LanguageModelToolInformation[] = [
	{
		name: 'chat-tools-sample_findFiles',
		description: 'Search for files in the current workspace',
		inputSchema: {
			type: 'object',
			properties: {
				pattern: { type: 'string' },
			},
			required: ['pattern'],
		},
		tags: ['files', 'search', 'chat-tools-sample'],
	},
	{
		name: 'chat-tools-sample_tabCount',
		description: 'The number of active tabs in a tab group',
		inputSchema: { type: 'object', properties: {} },
		tags: ['editors', 'chat-tools-sample'],
	},
];

suite('chat-sample', () => {
	test('extension is installed', () => {
		const ext = vscode.extensions.getExtension('vscode-samples.chat-sample');
		assert.ok(ext);
	});

	test('toLanguageModelChatTools provides inputSchema for every tool', () => {
		const tools = toLanguageModelChatTools(SAMPLE_TOOLS);
		assert.strictEqual(tools.length, 2);
		for (const tool of tools) {
			assert.ok(tool.inputSchema && typeof tool.inputSchema === 'object');
			assert.ok(tool.description.length > 0);
		}
	});

	test('resolveReferencedChatTools resolves toolReferenceName findFiles', () => {
		const resolved = resolveReferencedChatTools({ name: 'findFiles' }, SAMPLE_TOOLS);
		assert.strictEqual(resolved.length, 1);
		assert.strictEqual(resolved[0].name, 'chat-tools-sample_findFiles');
	});

	test('FindFilesTool finds package.json in workspace', async function () {
		this.timeout(15_000);
		const tool = new FindFilesTool();
		const result = await tool.invoke(
			{ input: { pattern: '**/package.json' }, toolInvocationToken: undefined },
			new vscode.CancellationTokenSource().token
		);
		const text = result.content
			.filter((p): p is vscode.LanguageModelTextPart => p instanceof vscode.LanguageModelTextPart)
			.map(p => p.value)
			.join('');
		assert.match(text, /Found \d+ files matching/);
		assert.match(text, /package\.json/);
	});
});
