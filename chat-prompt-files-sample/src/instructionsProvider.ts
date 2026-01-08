import * as vscode from 'vscode';

export function createInstructionsProvider(_context: vscode.ExtensionContext): vscode.InstructionsProvider {
	return {
		async provideInstructions(_options, _token) {
			const instructions: vscode.InstructionsChatResource[] = [];

			// Dynamic instructions with current workspace info
			const dynamicContent = generateDynamicInstructions();

			instructions.push(new vscode.InstructionsChatResource({
				name: 'workspace-context',
				description: 'Dynamic workspace context and guidelines',
				body: dynamicContent,
				isEditable: false
			}));

			return instructions;
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
