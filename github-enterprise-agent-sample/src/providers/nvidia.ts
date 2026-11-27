import * as vscode from 'vscode';
import { OpenAICompatibleChatModelProvider, OpenAICompatibleModelInfo } from './openaiCompatible';

// The NVIDIA NIM API is OpenAI-compatible: https://docs.api.nvidia.com
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

// Fallback catalog used when the live catalog cannot be fetched. These ids
// were verified against https://integrate.api.nvidia.com/v1; the live catalog
// from the API is preferred at runtime because it changes over time.
const NVIDIA_MODELS: OpenAICompatibleModelInfo[] = [
	{
		id: 'meta/llama-3.2-11b-vision-instruct',
		name: 'Llama 3.2 11B Vision (NVIDIA)',
		tooltip: 'Meta Llama 3.2 11B Vision Instruct served by NVIDIA NIM.',
		maxInputTokens: 128000,
		maxOutputTokens: 8192
	},
	{
		id: 'mistralai/mistral-nemotron',
		name: 'Mistral Nemotron (NVIDIA)',
		tooltip: 'Mistral Nemotron served by NVIDIA NIM.',
		maxInputTokens: 128000,
		maxOutputTokens: 8192
	},
	{
		id: 'nvidia/nemotron-3-super-120b-a12b',
		name: 'Nemotron 3 Super 120B (NVIDIA)',
		tooltip: 'NVIDIA Nemotron 3 Super 120B (reasoning model).',
		maxInputTokens: 128000,
		maxOutputTokens: 8192
	}
];

export class NvidiaChatModelProvider extends OpenAICompatibleChatModelProvider {
	constructor(secrets: vscode.SecretStorage) {
		super(
			'nvidia',
			'nvidia',
			NVIDIA_BASE_URL,
			NVIDIA_MODELS,
			secrets,
			'github-enterprise-agent-sample.nvidiaApiKey',
			'GitHub Enterprise Agent: Set NVIDIA API Key'
		);
	}
}
