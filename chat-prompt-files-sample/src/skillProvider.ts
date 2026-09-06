import * as vscode from 'vscode';
import { getChatResourceFileSystem } from './chatResourceFileSystem';

const SKILL_PATH = 'skills/workspace-analysis/SKILL.md';

export function createSkillProvider(context: vscode.ExtensionContext): vscode.ChatSkillProvider {
	const fs = getChatResourceFileSystem(context);
	const skillUri = fs.registerResource(SKILL_PATH, generateDynamicSkillContent);

	return {
		async provideSkills(_context, _token): Promise<vscode.ChatResource[]> {
			return [{ uri: skillUri }];
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
