# Chat Prompt Files Sample

Demonstrates the proposed Chat Prompt Files API to register providers for custom agents, instructions, and prompt files with dynamic content.

## Features

Three provider types, each with dynamic content generation:

- **Custom Agent** ([customAgentProvider.ts](src/customAgentProvider.ts)) - Workspace statistics with folder names and counts
- **Instructions** ([instructionsProvider.ts](src/instructionsProvider.ts)) - Active editor context including current file and language
- **Prompt Files** ([promptFileProvider.ts](src/promptFileProvider.ts)) - Time-based greetings and contextual suggestions

Static files are contributed via `package.json`. Providers demonstrate dynamic content using data URIs.

## Running the Sample

1. `npm install` to install dependencies
2. `npm run watch` to compile
3. `F5` to launch with the extension
4. Open the chat panel to see the contributed prompts

## API Reference

- `vscode.chat.registerCustomAgentProvider()`
- `vscode.chat.registerInstructionsProvider()`
- `vscode.chat.registerPromptFileProvider()`
