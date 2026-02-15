import * as vscode from 'vscode';
import { getChatResourceFileSystem } from './chatResourceFileSystem';

const AGENT_PATH = 'agents/workspace-helper.agent.md';

export function createCustomAgentProvider(context: vscode.ExtensionContext): vscode.ChatCustomAgentProvider {
	const fs = getChatResourceFileSystem(context);
	const agentUri = fs.registerResource(AGENT_PATH, generateDynamicAgentContent);

	return {
		async provideCustomAgents(_context, _token): Promise<vscode.ChatResource[]> {
			return [{ uri: agentUri }];
		}
	};
}

function generateDynamicAgentContent(): string {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const folderCount = workspaceFolders?.length || 0;
	const folderNames = workspaceFolders?.map(f => f.name).join(', ') || 'none';

	return `# Workspace Helper Agent

This is a dynamically generated agent that provides workspace-specific assistance.

## Current Workspace Information

- **Workspace Folders**: ${folderCount}
- **Folder Names**: ${folderNames}
- **Generated At**: ${new Date().toISOString()}

## Instructions

I can help you with tasks specific to your current workspace. I have access to information about your workspace structure and can provide context-aware assistance.

Use me for:
- Workspace-specific queries
- Context-aware code suggestions
- Understanding your project structure
`;
}
