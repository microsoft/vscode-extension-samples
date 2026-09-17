import * as assert from 'assert';
import * as vscode from 'vscode';
import { NvidiaChatModelProvider } from '../../providers/nvidia';

const EXTENSION_ID = 'vscode-samples.github-enterprise-agent-sample';
// The key is read from the environment and never stored in the repository.
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
// A model verified to be served and invokable by https://integrate.api.nvidia.com/v1.
const LIVE_MODEL_ID = 'meta/llama-3.2-11b-vision-instruct';
// A model the NVIDIA API has retired, used to verify that API errors surface.
const RETIRED_MODEL_ID = 'meta/llama-3.3-70b-instruct';

function secretStorageWith(key: string): vscode.SecretStorage {
	const storage = new Map<string, string>([['github-enterprise-agent-sample.nvidiaApiKey', key]]);
	return {
		get: async (k: string) => storage.get(k),
		store: async (k: string, value: string) => { storage.set(k, value); },
		delete: async (k: string) => { storage.delete(k); },
		onDidChange: () => new vscode.Disposable(() => { }),
		keys: () => Array.from(storage.keys())
	} as unknown as vscode.SecretStorage;
}

suite('Real NVIDIA API', function () {
	// Runs against the real https://integrate.api.nvidia.com/v1 endpoint and
	// is skipped unless NVIDIA_API_KEY is set.
	if (!NVIDIA_API_KEY) {
		test('skipped: set NVIDIA_API_KEY to run against the real endpoint', () => { });
		return;
	}

	this.timeout(120000);

	let models: vscode.LanguageModelChat[];

	suiteSetup(async function () {
		const extension = vscode.extensions.getExtension(EXTENSION_ID);
		assert.ok(extension, `extension ${EXTENSION_ID} not found`);
		await extension.activate();
		// Store the key in the extension's real secret storage via the
		// extension's own command, so the full VS Code language model API path
		// (selectChatModels -> sendRequest) runs against the real endpoint
		// through the provider the extension registered.
		await vscode.commands.executeCommand('github-enterprise-agent-sample.setNvidiaApiKey', NVIDIA_API_KEY);
		models = await vscode.lm.selectChatModels({ vendor: 'nvidia' });
		assert.ok(models.length > 0, 'no models discovered from the live API');
	});

	test('discovers the live model catalog from the API', () => {
		const ids = models.map(model => model.id);
		assert.ok(
			ids.includes(LIVE_MODEL_ID),
			`the live catalog does not contain ${LIVE_MODEL_ID}; got: ${ids.join(', ')}`
		);
		assert.ok(!ids.includes(RETIRED_MODEL_ID), 'retired model is still in the live catalog');
	});

	test('streams a real completion end to end', async () => {
		const model = models.find(m => m.id === LIVE_MODEL_ID);
		assert.ok(model, `model ${LIVE_MODEL_ID} not found`);
		const response = await model.sendRequest(
			[vscode.LanguageModelChatMessage.User('Reply with exactly: HELLO_FROM_NVIDIA. Do not use any tools; reply with plain text only.')],
			{},
			new vscode.CancellationTokenSource().token
		);
		let text = '';
		for await (const fragment of response.text) {
			text += fragment;
		}
		assert.ok(text.includes('HELLO_FROM_NVIDIA'), `unexpected streamed text: ${JSON.stringify(text)}`);
	});

	test('surfaces API errors for retired models', async () => {
		const provider = new NvidiaChatModelProvider(secretStorageWith(NVIDIA_API_KEY));
		const modelInfo = {
			id: RETIRED_MODEL_ID,
			name: RETIRED_MODEL_ID,
			family: 'nvidia',
			version: '1.0.0',
			maxInputTokens: 128000,
			maxOutputTokens: 8192
		} as vscode.LanguageModelChatInformation;
		const parts: vscode.LanguageModelTextPart[] = [];
		await assert.rejects(
			() => provider.provideLanguageModelChatResponse(
				modelInfo,
				[vscode.LanguageModelChatMessage.User('hello')],
				{} as vscode.ProvideLanguageModelChatResponseOptions,
				{ report: (part: vscode.LanguageModelTextPart) => { parts.push(part); } },
				new vscode.CancellationTokenSource().token
			),
			/request failed/
		);
		assert.strictEqual(parts.length, 0, 'no parts should be reported for a failed request');
	});
});