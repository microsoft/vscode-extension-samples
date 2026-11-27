import * as assert from 'assert';
import * as vscode from 'vscode';
import { GitHubService } from '../../ghes';
import { createAgentHandler } from '../../agent';

const EXTENSION_ID = 'vscode-samples.github-enterprise-agent-sample';

const COMMANDS = [
	'github-enterprise-agent-sample.openAgentChat',
	'github-enterprise-agent-sample.whoami',
	'github-enterprise-agent-sample.listOrgRepos',
	'github-enterprise-agent-sample.setNvidiaApiKey',
	'github-enterprise-agent-sample.setMistralApiKey'
];

suite('Extension', () => {
	suiteSetup(async function () {
		this.timeout(60000);
		const extension = vscode.extensions.getExtension(EXTENSION_ID);
		assert.ok(extension, `extension ${EXTENSION_ID} not found`);
		await extension.activate();
	});

	test('activates', () => {
		assert.strictEqual(vscode.extensions.getExtension(EXTENSION_ID)?.isActive, true);
	});

	test('registers all commands', async () => {
		const registered = await vscode.commands.getCommands(true);
		for (const command of COMMANDS) {
			assert.ok(registered.includes(command), `command not registered: ${command}`);
		}
	});

	test('registers the chat participant and model providers', async function () {
		this.timeout(20000);
		// The selectChatModels queries below resolve through the providers that
		// the extension registered during activation, so they prove that both
		// the chat participant wiring and the model providers are live.
		const nvidia = await vscode.lm.selectChatModels({ vendor: 'nvidia' });
		const mistral = await vscode.lm.selectChatModels({ vendor: 'mistral' });
		assert.ok(nvidia.length > 0, 'no NVIDIA models resolved');
		assert.ok(mistral.length > 0, 'no Mistral models resolved');
	});

	test('provides the NVIDIA models', async function () {
		this.timeout(20000);
		// The provider discovers the live catalog from the NVIDIA API, so the
		// retired model must be gone and a verified-live model must be present.
		const models = await vscode.lm.selectChatModels({ vendor: 'nvidia' });
		const ids = models.map(model => model.id);
		assert.ok(ids.includes('meta/llama-3.2-11b-vision-instruct'), `live model not provided (got ${ids.join(', ')})`);
		assert.ok(!ids.includes('meta/llama-3.3-70b-instruct'), 'retired model is still provided');
		assert.ok(models.every(model => model.vendor === 'nvidia'), `unexpected vendor: ${models.map(model => model.vendor).join(', ')}`);
	});

	test('provides the Mistral models', async function () {
		this.timeout(20000);
		const models = await vscode.lm.selectChatModels({ vendor: 'mistral' });
		const ids = models.map(model => model.id);
		for (const expected of ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest', 'ministral-8b-latest']) {
			assert.ok(ids.includes(expected), `model not provided: ${expected} (got ${ids.join(', ')})`);
		}
		assert.ok(models.every(model => model.vendor === 'mistral'), `unexpected vendor: ${models.map(model => model.vendor).join(', ')}`);
	});

	test('counts tokens through the language model API', async function () {
		this.timeout(20000);
		const models = await vscode.lm.selectChatModels({ vendor: 'mistral' });
		assert.ok(models.length > 0, 'no Mistral model available');
		assert.strictEqual(await models[0].countTokens('hello world'), 3);
	});
});

suite('GitHubService', () => {
	// The service only reads from the context, so a minimal object is enough.
	const context = {} as unknown as vscode.ExtensionContext;

	test('defaults to github.com', () => {
		const service = new GitHubService(context);
		assert.strictEqual(service.host, 'https://github.com');
		assert.strictEqual(service.providerId, 'github');
		assert.strictEqual(service.apiBaseUrl, undefined);
	});

	test('uses the github.enterprise provider for a GitHub Enterprise Server host', async function () {
		this.timeout(20000);
		const config = vscode.workspace.getConfiguration('githubEnterpriseAgent');
		await config.update('host', 'https://ghe.example.com/', vscode.ConfigurationTarget.Global);
		try {
			const service = new GitHubService(context);
			assert.strictEqual(service.host, 'https://ghe.example.com');
			assert.strictEqual(service.providerId, 'github.enterprise');
			assert.strictEqual(service.apiBaseUrl, 'https://ghe.example.com/api/v3');
		} finally {
			await config.update('host', undefined, vscode.ConfigurationTarget.Global);
		}
	});

	test('returns no octokit when not signed in', async function () {
		this.timeout(20000);
		const service = new GitHubService(context);
		assert.strictEqual(await service.getOctokit(false), undefined);
	});
});

suite('Agent handler', () => {
	const github = new GitHubService({} as unknown as vscode.ExtensionContext);

	function mockStream(): { stream: vscode.ChatResponseStream; markdown: string[] } {
		const markdown: string[] = [];
		const stream = {
			progress: () => { },
			markdown: (value: string | vscode.MarkdownString) => { markdown.push(typeof value === 'string' ? value : value.value); }
		} as unknown as vscode.ChatResponseStream;
		return { stream, markdown };
	}

	function mockModel(responseText: string): vscode.LanguageModelChat {
		const response = { text: (async function* () { yield responseText; })() } as unknown as vscode.LanguageModelChatResponse;
		return {
			id: 'mock-model',
			vendor: 'mock',
			family: 'mock-family',
			version: '1.0.0',
			name: 'Mock Model',
			sendRequest: async () => response,
			countTokens: async () => 1
		} as unknown as vscode.LanguageModelChat;
	}

	test('streams the model response for free-form chat', async () => {
		const handler = createAgentHandler(github);
		const { stream, markdown } = mockStream();
		const request = { prompt: 'hello', command: undefined, model: mockModel('Hello from the mock model') } as unknown as vscode.ChatRequest;
		const result = await handler(request, {} as unknown as vscode.ChatContext, stream, new vscode.CancellationTokenSource().token);
		const metadata = result?.metadata as { command: string } | undefined;
		assert.strictEqual(markdown.join(''), 'Hello from the mock model');
		assert.strictEqual(metadata?.command, '');
	});

	test('reports a helpful error for /orgs on a GitHub Enterprise host without the auth provider', async function () {
		this.timeout(20000);
		const config = vscode.workspace.getConfiguration('githubEnterpriseAgent');
		await config.update('host', 'https://ghe.example.com', vscode.ConfigurationTarget.Global);
		try {
			const handler = createAgentHandler(github);
			const { stream } = mockStream();
			const request = { prompt: '', command: 'orgs' } as unknown as vscode.ChatRequest;
			await assert.rejects(
				async () => { await handler(request, {} as unknown as vscode.ChatContext, stream, new vscode.CancellationTokenSource().token); },
				/No GitHub Enterprise authentication provider found/
			);
		} finally {
			await config.update('host', undefined, vscode.ConfigurationTarget.Global);
		}
	});
});
