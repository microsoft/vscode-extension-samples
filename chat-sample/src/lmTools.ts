import * as vscode from 'vscode';

export function getToolsForRequest(command: string | undefined): readonly vscode.LanguageModelToolInformation[] {
	if (command === 'all') {
		return vscode.lm.tools;
	}
	return vscode.lm.tools.filter(tool => tool.tags.includes('chat-tools-sample'));
}

/**
 * Map registered tools to the shape expected by {@link vscode.LanguageModelChat.sendRequest}.
 * Ensures every tool has a valid JSON schema (required by some models, including Claude).
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

export function findToolByReference(
	reference: vscode.ChatLanguageModelToolReference,
	tools: readonly vscode.LanguageModelToolInformation[]
): vscode.LanguageModelToolInformation | undefined {
	return tools.find(
		t => t.name === reference.name || t.name.endsWith(`_${reference.name}`)
	);
}

export function resolveReferencedChatTools(
	reference: vscode.ChatLanguageModelToolReference,
	tools: readonly vscode.LanguageModelToolInformation[] = vscode.lm.tools
): vscode.LanguageModelChatTool[] {
	const tool = findToolByReference(reference, tools);
	return tool ? toLanguageModelChatTools([tool]) : [];
}
