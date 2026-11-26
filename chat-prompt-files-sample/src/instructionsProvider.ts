import * as vscode from 'vscode';
import { getChatResourceFileSystem } from './chatResourceFileSystem';

const INSTRUCTIONS_PATH = 'instructions/workspace-context.instructions.md';

export function createInstructionsProvider(context: vscode.ExtensionContext): vscode.ChatInstructionsProvider {
	const fs = getChatResourceFileSystem(context);
	const instructionsUri = fs.registerResource(INSTRUCTIONS_PATH, generateDynamicInstructions);

	return {
		async provideInstructions(_context, _token): Promise<vscode.ChatResource[]> {
			return [{ uri: instructionsUri }];
		}
	};
}

function generateDynamicInstructions(): string {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const activeEditor = vscode.window.activeTextEditor;
	const currentFile = activeEditor?.document.fileName || 'none';
	const languageId = activeEditor?.document.languageId || 'none';

	return `# Workspace Context Instructions

These instructions are dynamically generated based on your current workspace state.

## Current Context

- **Active File**: ${currentFile}
- **Language**: ${languageId}
- **Workspace Folders**: ${workspaceFolders?.length || 0}
- **Timestamp**: ${new Date().toLocaleString()}

## Guidelines

When working with this workspace:

1. Consider the current file context when providing suggestions
2. Use language-specific best practices for ${languageId}
3. Reference workspace structure when relevant
4. Keep code examples consistent with the project style

## Dynamic Behavior

These instructions update based on:
- Current active file
- Workspace configuration
- Time of day
- Available workspace folders
`;
}
