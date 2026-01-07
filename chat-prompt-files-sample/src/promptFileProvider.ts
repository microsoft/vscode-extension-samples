import * as vscode from 'vscode';

export function createPromptFileProvider(_context: vscode.ExtensionContext): vscode.PromptFileProvider {
	return {
		async providePromptFiles(_options, _token) {
			const prompts: vscode.PromptFileResource[] = [];
			
			// Dynamic prompt with time-based content
			const dynamicContent = generateDynamicPrompt();
			
			// Create an untitled document with the dynamic content
			const doc = await vscode.workspace.openTextDocument({
				content: dynamicContent,
				language: 'markdown'
			});
			
			prompts.push({
				name: 'time-aware',
				description: 'Dynamic prompt with current timestamp',
				uri: doc.uri,
				isEditable: false,
				isCacheable: false
			});
			
			return prompts;
		}
	};
}

function generateDynamicPrompt(): string {
	const now = new Date();
	const hour = now.getHours();
	const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
	const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
	
	return `# Time-Aware Assistant Prompt

Good ${greeting}! Today is ${dayOfWeek}.

## Current Session Info

- **Generated**: ${now.toLocaleString()}
- **Unix Timestamp**: ${now.getTime()}
- **ISO**: ${now.toISOString()}

## Dynamic Behavior

This prompt demonstrates dynamic content generation:

### Time-Based Suggestions

${hour < 12 ? '- Start your day with reviewing test coverage' : 
  hour < 18 ? '- Good time for implementing new features' : 
  '- Consider writing documentation or code reviews'}

### Session Context

This prompt was generated specifically for this chat session and includes:
- Current time context
- Session-specific metadata
- Dynamic suggestions based on time of day

Use this prompt to see how content can change based on external factors.
`;
}
