import * as vscode from 'vscode';
import { createCustomAgentProvider } from './customAgentProvider';
import { createInstructionsProvider } from './instructionsProvider';
import { createPromptFileProvider } from './promptFileProvider';
import { createSkillProvider } from './skillProvider';

export async function activate(context: vscode.ExtensionContext) {
	// Create and register all providers
	const customAgentProvider = createCustomAgentProvider(context);
	const instructionsProvider = createInstructionsProvider(context);
	const promptFileProvider = createPromptFileProvider(context);
	const skillProvider = createSkillProvider(context);

	context.subscriptions.push(
		vscode.chat.registerCustomAgentProvider(customAgentProvider),
		vscode.chat.registerInstructionsProvider(instructionsProvider),
		vscode.chat.registerPromptFileProvider(promptFileProvider),
		vscode.chat.registerSkillProvider(skillProvider)
	);

	console.log('Chat prompt files sample extension activated with dynamic providers!');
}
