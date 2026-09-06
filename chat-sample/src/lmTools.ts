import * as vscode from 'vscode';

/**
 * Map registered tools to the shape expected by {@link vscode.LanguageModelChat.sendRequest}.
 * Ensures every tool carries a valid JSON schema object for `inputSchema` — some models (e.g.
 * Claude) reject tool definitions where `inputSchema` is `undefined`.
 */
export function toLanguageModelChatTools(
	tools: readonly vscode.LanguageModelToolInformation[]
): vscode.LanguageModelChatTool[] {
	return tools.map(tool => ({
		name: tool.name,
		description: tool.description,
		inputSchema: tool.inputSchema ?? { type: 'object', properties: {} },
	}));
}

export function getToolsForRequest(
	command: string | undefined
): readonly vscode.LanguageModelToolInformation[] {
	return command === 'all'
		? vscode.lm.tools
		: vscode.lm.tools.filter(tool => tool.tags.includes('chat-tools-sample'));
}
