import * as vscode from 'vscode';

export function createCustomAgentProvider(_context: vscode.ExtensionContext): vscode.CustomAgentProvider {
	return {
		async provideCustomAgents(_options, _token) {
			const agents: vscode.CustomAgentResource[] = [];
			
			// Dynamic agent with generated content
			const dynamicContent = generateDynamicAgentContent();
			
			// Create an untitled document with the dynamic content
			const doc = await vscode.workspace.openTextDocument({
				content: dynamicContent,
				language: 'markdown'
			});
			
			agents.push({
				name: 'workspace-helper',
				description: 'Dynamic agent with workspace statistics',
				uri: doc.uri,
				isEditable: false,
				isCacheable: false // Don't cache because content is dynamic
			});
			
			return agents;
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
