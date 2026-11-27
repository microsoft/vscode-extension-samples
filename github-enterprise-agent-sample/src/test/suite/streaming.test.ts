import * as assert from 'assert';
import * as http from 'http';
import * as net from 'net';
import * as vscode from 'vscode';
import { OpenAICompatibleChatModelProvider, OpenAICompatibleModelInfo } from '../../providers/openaiCompatible';
import { agentProtocolPrompt } from '../../providers/responses';

class MockSecretStorage implements vscode.SecretStorage {
	private readonly values = new Map<string, string>();
	private readonly emitter = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>();
	readonly onDidChange = this.emitter.event;

	async get(key: string): Promise<string | undefined> {
		return this.values.get(key);
	}

	async store(key: string, value: string): Promise<void> {
		this.values.set(key, value);
		this.emitter.fire({ key });
	}

	async delete(key: string): Promise<void> {
		this.values.delete(key);
		this.emitter.fire({ key });
	}

	async keys(): Promise<string[]> {
		return [...this.values.keys()];
	}
}

class TestChatModelProvider extends OpenAICompatibleChatModelProvider {
	constructor(baseUrl: string, secrets: vscode.SecretStorage) {
		const models: OpenAICompatibleModelInfo[] = [{
			id: 'test-model',
			name: 'Test Model',
			tooltip: 'Test model served by a local server.',
			maxInputTokens: 8192,
			maxOutputTokens: 4096
		}];
		super('test-vendor', 'test-family', baseUrl, models, secrets, 'test.apiKey', 'Set Test API Key');
	}
}

interface StartedServer {
	server: http.Server;
	baseUrl: string;
	requestBodies: string[];
	authHeaders: string[];
}

// Serves an OpenAI-compatible /chat/completions endpoint that replies with
// server-sent events, so the streaming logic is tested end to end without
// touching an external API.
function startSseServer(sseChunks: string[], status = 200, holdOpenMs = 0): Promise<StartedServer> {
	return new Promise(resolve => {
		const requestBodies: string[] = [];
		const authHeaders: string[] = [];
		const server = http.createServer((req, res) => {
			let body = '';
			req.on('data', chunk => body += chunk);
			req.on('end', () => {
				requestBodies.push(body);
				authHeaders.push(String(req.headers.authorization ?? ''));
				res.writeHead(status, { 'Content-Type': status === 200 ? 'text/event-stream' : 'application/json' });
				for (const chunk of sseChunks) {
					res.write(chunk);
				}
				if (holdOpenMs > 0) {
					setTimeout(() => res.end(), holdOpenMs);
				} else {
					res.end();
				}
			});
		});
		server.listen(0, '127.0.0.1', () => {
			const { port } = server.address() as net.AddressInfo;
			resolve({ server, baseUrl: `http://127.0.0.1:${port}/v1`, requestBodies, authHeaders });
		});
	});
}

function stopServer(server: http.Server): void {
	server.closeAllConnections();
	server.close();
}

function modelInfo(): vscode.LanguageModelChatInformation {
	return {
		id: 'test-model',
		name: 'Test Model',
		tooltip: 'Test model served by a local server.',
		family: 'test-family',
		version: '1.0.0',
		maxInputTokens: 8192,
		maxOutputTokens: 4096,
		capabilities: {
			toolCalling: false,
			imageInput: false
		}
	};
}

function requestMessage(text: string): vscode.LanguageModelChatRequestMessage {
	return {
		role: vscode.LanguageModelChatMessageRole.User,
		content: [new vscode.LanguageModelTextPart(text)],
		name: 'user'
	};
}

const NOOP_OPTIONS = {} as vscode.ProvideLanguageModelChatResponseOptions;

suite('OpenAI-compatible provider', () => {
	test('provides model information', async () => {
		const { server, baseUrl } = await startSseServer([]);
		try {
			const provider = new TestChatModelProvider(baseUrl, new MockSecretStorage());
			const models = await provider.provideLanguageModelChatInformation({ silent: true }, new vscode.CancellationTokenSource().token);
			assert.ok(models, 'no model information returned');
			assert.strictEqual(models.length, 1);
			assert.strictEqual(models[0].id, 'test-model');
			assert.strictEqual(models[0].family, 'test-family');
		} finally {
			stopServer(server);
		}
	});

	test('counts tokens as roughly one token per four characters', async () => {
		const { server, baseUrl } = await startSseServer([]);
		try {
			const provider = new TestChatModelProvider(baseUrl, new MockSecretStorage());
			assert.strictEqual(await provider.provideTokenCount(modelInfo(), 'hello world', new vscode.CancellationTokenSource().token), 3);
			assert.strictEqual(await provider.provideTokenCount(modelInfo(), requestMessage('hello world'), new vscode.CancellationTokenSource().token), 3);
		} finally {
			stopServer(server);
		}
	});

	test('rejects when no API key is configured', async () => {
		const { server, baseUrl } = await startSseServer([]);
		try {
			const provider = new TestChatModelProvider(baseUrl, new MockSecretStorage());
			await assert.rejects(
				() => provider.provideLanguageModelChatResponse(modelInfo(), [requestMessage('hi')], NOOP_OPTIONS, { report: () => { } }, new vscode.CancellationTokenSource().token),
				/No API key configured for test-vendor/
			);
		} finally {
			stopServer(server);
		}
	});

	test('streams text deltas from server-sent events', async () => {
		const { server, baseUrl, requestBodies, authHeaders } = await startSseServer([
			'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
			': keep-alive\n\n',
			'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
			'data: [DONE]\n\n'
		]);
		try {
			const secrets = new MockSecretStorage();
			const provider = new TestChatModelProvider(baseUrl, secrets);
			await secrets.store('test.apiKey', 'test-key');

			const parts: string[] = [];
			await provider.provideLanguageModelChatResponse(
				modelInfo(),
				[requestMessage('hi')],
				NOOP_OPTIONS,
				{ report: part => { if (part instanceof vscode.LanguageModelTextPart) { parts.push(part.value); } } },
				new vscode.CancellationTokenSource().token
			);

			assert.strictEqual(parts.join(''), 'Hello world');
			assert.strictEqual(requestBodies.length, 1);
			assert.strictEqual(authHeaders[0], 'Bearer test-key');
			const sent = JSON.parse(requestBodies[0]);
			assert.strictEqual(sent.model, 'test-model');
			assert.deepStrictEqual(sent.messages, [{ role: 'system', content: agentProtocolPrompt('') }, { role: 'user', content: 'hi' }]);
			assert.strictEqual(sent.stream, true);
		} finally {
			stopServer(server);
		}
	});

	test('rejects on an HTTP error response', async () => {
		const { server, baseUrl } = await startSseServer(['{"error": "boom"}'], 500);
		try {
			const secrets = new MockSecretStorage();
			const provider = new TestChatModelProvider(baseUrl, secrets);
			await secrets.store('test.apiKey', 'test-key');
			await assert.rejects(
				() => provider.provideLanguageModelChatResponse(modelInfo(), [requestMessage('hi')], NOOP_OPTIONS, { report: () => { } }, new vscode.CancellationTokenSource().token),
				/request failed: 500/
			);
		} finally {
			stopServer(server);
		}
	});

	test('cancels an in-flight request', async function () {
		this.timeout(10000);
		const { server, baseUrl } = await startSseServer(['data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'], 200, 60000);
		try {
			const secrets = new MockSecretStorage();
			const provider = new TestChatModelProvider(baseUrl, secrets);
			await secrets.store('test.apiKey', 'test-key');

			const cts = new vscode.CancellationTokenSource();
			const response = provider.provideLanguageModelChatResponse(modelInfo(), [requestMessage('hi')], NOOP_OPTIONS, { report: () => { } }, cts.token);
			// Wait for the first chunk to arrive, then cancel.
			await new Promise(resolve => setTimeout(resolve, 500));
			cts.cancel();
			await assert.rejects(() => response);
		} finally {
			stopServer(server);
		}
	});
});
