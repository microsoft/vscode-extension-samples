import * as vscode from 'vscode';
import { createCustomAgentProvider } from './customAgentProvider';
import { createInstructionsProvider } from './instructionsProvider';
import { createPromptFileProvider } from './promptFileProvider';

export function activate(context: vscode.ExtensionContext) {
	// Create and register all providers
	const customAgentProvider = createCustomAgentProvider(context);
	const instructionsProvider = createInstructionsProvider(context);
	const promptFileProvider = createPromptFileProvider(context);
	
	context.subscriptions.push(
		vscode.chat.registerCustomAgentProvider(customAgentProvider),
		vscode.chat.registerInstructionsProvider(instructionsProvider),
		vscode.chat.registerPromptFileProvider(promptFileProvider)
	);
	
	console.log('Chat prompt files sample extension activated with dynamic providers!');
}
