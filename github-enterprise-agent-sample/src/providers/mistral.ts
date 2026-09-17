import * as vscode from 'vscode';
import { OpenAICompatibleChatModelProvider, OpenAICompatibleModelInfo } from './openaiCompatible';

// The Mistral API is OpenAI-compatible: https://docs.mistral.ai/api/
const MISTRAL_BASE_URL = 'https://api.mistral.ai/v1';

const MISTRAL_MODELS: OpenAICompatibleModelInfo[] = [
	{
		id: 'mistral-large-latest',
		name: 'Mistral Large',
		tooltip: 'Mistral Large, the flagship Mistral model.',
		maxInputTokens: 128000,
		maxOutputTokens: 8192
	},
	{
		id: 'mistral-small-latest',
		name: 'Mistral Small',
		tooltip: 'Mistral Small, a fast and efficient Mistral model.',
		maxInputTokens: 128000,
		maxOutputTokens: 8192
	},
	{
		id: 'codestral-latest',
		name: 'Codestral',
		tooltip: 'Codestral, Mistral\'s coding model.',
		maxInputTokens: 256000,
		maxOutputTokens: 8192
	},
	{
		id: 'ministral-8b-latest',
		name: 'Ministral 8B',
		tooltip: 'Ministral 8B, a small edge model from Mistral.',
		maxInputTokens: 128000,
		maxOutputTokens: 8192
	}
];

export class MistralChatModelProvider extends OpenAICompatibleChatModelProvider {
	constructor(secrets: vscode.SecretStorage) {
		super(
			'mistral',
			'mistral',
			MISTRAL_BASE_URL,
			MISTRAL_MODELS,
			secrets,
			'github-enterprise-agent-sample.mistralApiKey',
			'GitHub Enterprise Agent: Set Mistral API Key'
		);
	}
}
