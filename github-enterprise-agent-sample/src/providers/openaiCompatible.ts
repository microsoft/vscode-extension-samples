import * as vscode from 'vscode';
import { ResponsesEvent, ResponsesOrchestrator, ResponsesSession, UpstreamTurn, agentProtocolPrompt, parseUpstreamTurn } from './responses';
import { defaultSubagents } from '../agents/subagents';

export interface OpenAICompatibleModelInfo {
	id: string;
	name: string;
	tooltip: string;
	maxInputTokens: number;
	maxOutputTokens: number;
}

// Id fragments of model families that a chat completion endpoint lists but
// that are not chat models (embeddings, rerankers, guard models, ...).
const NON_CHAT_ID_FRAGMENTS = [
	'embed', 'rerank', 'retriever', 'guard', 'safety', 'topic-control',
	'deplot', 'kosmos', 'fuyu', 'diffusion', 'calibration', 'detector', 'ocr'
];

/**
 * Minimal OpenAI-compatible chat completion client shared by the NVIDIA NIM
 * and Mistral model providers. Uses plain fetch and server-sent events, so it
 * works in the desktop and the web extension host.
 */
export abstract class OpenAICompatibleChatModelProvider implements vscode.LanguageModelChatProvider {
	private static readonly LIVE_MODELS_CACHE_TTL_MS = 5 * 60 * 1000;
	private liveModelsCache: { models: OpenAICompatibleModelInfo[]; fetchedAt: number } | undefined;

	constructor(
		private readonly vendor: string,
		private readonly family: string,
		private readonly baseUrl: string,
		private readonly models: OpenAICompatibleModelInfo[],
		private readonly secrets: vscode.SecretStorage,
		private readonly secretStorageKey: string,
		private readonly apiKeyCommandTitle: string
	) { }

	async provideLanguageModelChatInformation(_options: { silent: boolean }, token: vscode.CancellationToken): Promise<vscode.LanguageModelChatInformation[]> {
		// The model catalog of an OpenAI-compatible endpoint changes over time
		// (models get retired and added), so a hardcoded list goes stale. The
		// live catalog is preferred whenever it can be fetched; the static list
		// is the fallback for offline use or endpoints that require a key for
		// discovery while none is configured yet.
		const live = await this.fetchLiveModels(token);
		const models = live.length > 0 ? live : this.models;
		return models.map(model => ({
			id: model.id,
			name: model.name,
			tooltip: model.tooltip,
			family: this.family,
			maxInputTokens: model.maxInputTokens,
			maxOutputTokens: model.maxOutputTokens,
			version: '1.0.0',
			capabilities: {
				toolCalling: false,
				imageInput: false
			}
		}));
	}

	/**
	 * Discovers the models that the endpoint currently serves. Returns an
	 * empty array when the catalog cannot be fetched, so the caller falls
	 * back to the static list.
	 */
	protected async fetchLiveModels(token: vscode.CancellationToken): Promise<OpenAICompatibleModelInfo[]> {
		const cached = this.liveModelsCache;
		if (cached && Date.now() - cached.fetchedAt < OpenAICompatibleChatModelProvider.LIVE_MODELS_CACHE_TTL_MS) {
			return cached.models;
		}

		const apiKey = await this.secrets.get(this.secretStorageKey);
		const headers: Record<string, string> = {};
		if (apiKey) {
			headers['Authorization'] = `Bearer ${apiKey}`;
		}

		try {
			const response = await fetch(`${this.baseUrl}/models`, { headers, signal: toAbortSignal(token) });
			if (!response.ok || !response.body) {
				return [];
			}
			const catalog = await response.json() as { data?: { id?: unknown }[] };
			const ids = (catalog.data ?? [])
				.map(entry => entry.id)
				.filter((id): id is string => typeof id === 'string' && !NON_CHAT_ID_FRAGMENTS.some(fragment => id.includes(fragment)));
			const models = ids.map(id => ({
				id,
				name: id,
				tooltip: `Served by ${this.vendor}.`,
				maxInputTokens: 128000,
				maxOutputTokens: 8192
			}));
			this.liveModelsCache = { models, fetchedAt: Date.now() };
			return models;
		} catch {
			return [];
		}
	}

	async provideLanguageModelChatResponse(model: vscode.LanguageModelChatInformation, messages: readonly vscode.LanguageModelChatRequestMessage[], _options: vscode.ProvideLanguageModelChatResponseOptions, progress: vscode.Progress<vscode.LanguageModelResponsePart>, token: vscode.CancellationToken): Promise<void> {
		const apiKey = await this.secrets.get(this.secretStorageKey);
		if (!apiKey) {
			throw new Error(`No API key configured for ${this.vendor}. Run the "${this.apiKeyCommandTitle}" command to set one.`);
		}

		// The inference layer: every model call runs through a responses-style
		// agent loop (session start, upstream chat/completions, subagents for
		// search/thinking/plan/tool call/test, output) instead of a bare
		// chat/completions passthrough.
		const upstream: (session: ResponsesSession, token: vscode.CancellationToken) => Promise<UpstreamTurn> = async (session, upstreamToken) => {
			const raw = await this.streamChatCompletion(model.id, session.messages, apiKey, upstreamToken);
			return parseUpstreamTurn(raw);
		};
		const orchestrator = new ResponsesOrchestrator(upstream, defaultSubagents());
		const session = orchestrator.startSession(model.id, '');
		await orchestrator.run(session, messages.map(messageText).join('\n\n'), event => mapEventToProgress(event, progress), token);
	}

	/**
	 * Streams one chat/completions call and returns the accumulated raw text.
	 */
	private async streamChatCompletion(modelId: string, messages: { role: string; content: string }[], apiKey: string, token: vscode.CancellationToken): Promise<string> {
		const response = await fetch(`${this.baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: modelId,
				messages: [{ role: 'system', content: agentProtocolPrompt('') }, ...messages],
				stream: true
			}),
			signal: toAbortSignal(token)
		});

		if (!response.ok || !response.body) {
			throw new Error(`${this.vendor} request failed: ${response.status} ${response.statusText}`);
		}

		// Stream the server-sent events and accumulate the text deltas.
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		let text = '';
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';
			for (const line of lines) {
				if (!line.startsWith('data:')) {
					continue;
				}
				const data = line.slice(5).trim();
				if (data === '[DONE]') {
					return text;
				}
				try {
					const delta = JSON.parse(data).choices?.[0]?.delta?.content;
					if (typeof delta === 'string' && delta.length > 0) {
						text += delta;
					}
				} catch {
					// ignore keep-alive comments and partial frames
				}
			}
		}
		return text;
	}

	async provideTokenCount(_model: vscode.LanguageModelChatInformation, text: string | vscode.LanguageModelChatRequestMessage, _token: vscode.CancellationToken): Promise<number> {
		const chars = typeof text === 'string' ? text.length : messageText(text).length;
		return Math.ceil(chars / 4);
	}
}

/**
 * Maps responses-style events to the VS Code language model stream, keeping
 * the agent loop visible in the chat: thinking, plan, tool calls, results,
 * and the final output text.
 */
function mapEventToProgress(event: ResponsesEvent, progress: vscode.Progress<vscode.LanguageModelResponsePart>): void {
	switch (event.type) {
		case 'response.reasoning_summary_text.delta':
			progress.report(new vscode.LanguageModelTextPart(`[thinking] ${event.delta}\n`));
			break;
		case 'response.output_item.done':
			if (event.item.type === 'reasoning' && event.item.summary.startsWith('plan: ')) {
				progress.report(new vscode.LanguageModelTextPart(`[plan] ${event.item.summary.slice('plan: '.length)}\n`));
			} else if (event.item.type === 'function_call') {
				progress.report(new vscode.LanguageModelTextPart(`[tool: ${event.item.name}]\n`));
			} else if (event.item.type === 'function_call_output') {
				progress.report(new vscode.LanguageModelTextPart(`[result] ${event.item.output.slice(0, 200)}\n`));
			}
			break;
		case 'response.output_text.delta':
			progress.report(new vscode.LanguageModelTextPart(event.delta));
			break;
		default:
			break;
	}
}

function messageText(message: string | vscode.LanguageModelChatRequestMessage): string {
	if (typeof message === 'string') {
		return message;
	}
	return message.content.map(part => part instanceof vscode.LanguageModelTextPart ? part.value : '').join('');
}

function toAbortSignal(token: vscode.CancellationToken): AbortSignal {
	const controller = new AbortController();
	if (token.isCancellationRequested) {
		controller.abort();
	} else {
		token.onCancellationRequested(() => controller.abort());
	}
	return controller.signal;
}
