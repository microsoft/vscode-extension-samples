import * as vscode from 'vscode';

export function createSkillProvider(_context: vscode.ExtensionContext): vscode.SkillProvider {
	return {
		label: 'Dynamic Workspace Skills Provider',
		async provideSkills(_options, _token) {
			const skills: vscode.SkillChatResource[] = [];

			// Dynamic skill with generated content
			const dynamicContent = generateDynamicSkillContent();

			skills.push(new vscode.SkillChatResource({
				id: 'workspace-analysis',
				content: dynamicContent
			}));

			return skills;
		}
	};
}

function generateDynamicSkillContent(): string {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const folderCount = workspaceFolders?.length || 0;
	const folderNames = workspaceFolders?.map(f => f.name).join(', ') || 'none';

	return `---
name: workspace-analysis
description: A skill for analyzing and understanding the current workspace.
---
# Workspace Analysis Skill

This skill provides capabilities for analyzing and understanding the current workspace.

## Skill Information

- **Workspace Folders**: ${folderCount}
- **Folder Names**: ${folderNames}
- **Generated At**: ${new Date().toISOString()}

## Capabilities

This skill enables the following capabilities:

### Code Analysis
- Analyze code structure and patterns
- Identify potential improvements
- Detect code smells and anti-patterns

### Workspace Navigation
- Find relevant files based on context
- Navigate between related components
- Understand project organization

### Documentation Generation
- Generate documentation for code
- Create README files
- Document APIs and interfaces

## Usage

When this skill is active, the assistant can:

1. Analyze the structure of your codebase
2. Provide insights about code organization
3. Suggest improvements based on best practices
4. Help navigate complex project structures

## Notes

This skill is dynamically generated and reflects the current state of your workspace.
`;
}
