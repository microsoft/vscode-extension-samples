<h1 align="center">
VS Code Extension Samples
</h1>

This repository contains sample code illustrating the VS Code extension API. Each sample is a self-contained extension that explains one topic in [VS Code API](https://code.visualstudio.com/docs/extensionAPI/vscode-api) or VS Code's [Contribution Points](https://code.visualstudio.com/docs/extensionAPI/extension-points). You can read, play with or adapt from these samples to create your own extensions.

You can expect from each sample:
- An explanation of its functionality
- A gif or screenshot demonstrating its usage
- Link to a guide on VS Code website, if it has one
- Listing of used VS Code API and Contribution Points
- Code of the same style, enforced using TSLint and Prettier

## Special Samples

- [Hello Code Sample](hellocode-sample): The Hello World sample for VS Code.
- [Hello Code Minimal Sample](hellocode-sample): A minimal version of Hello Code Sample that doesn't use TypeScript.

## Samples

**:construction: Some links point to our work-in-progress [API Extension](https://vscode-ext-docs.azurewebsites.net/api) documentation that is not yet published :construction:**

<!-- SAMPLES_BEGIN -->
| Sample | Guide on VS Code Website | API & Contribution |
| ------ | ----- | --- |
| [Multi Root Sample](basic-multi-root-sample) | N/A | [workspace.getWorkspaceFolder](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#workspace.getWorkspaceFolder)<br>[workspace.onDidChangeWorkspaceFolders](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#workspace.onDidChangeWorkspaceFolders) |
| [Webview Sample](webview-sample) | [/api/extension-guides/webview](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/webview) | [window.createWebviewPanel](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.createWebviewPanel)<br>[window.registerWebviewPanelSerializer](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.registerWebviewPanelSerializer) |
| [Status Bar](statusbar-sample) | [/api/extension-guides/status-bar](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/status-bar) | [StatusBarItem](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#StatusBarItem) |
| [Completion Provider Sample](completions-sample) | N/A | [languages.registerCompletionItemProvider](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#languages.registerCompletionItemProvider)<br>[CompletionItem](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#CompletionItem)<br>[SnippetString](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#SnippetString) |
| [File System Provider Sample](fsprovider-sample) | N/A | [workspace.registerFileSystemProvider](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#workspace.registerFileSystemProvider) |
| [Editor Decoractor Sample](decorator-sample) | N/A | [TextEditor.setDecorations](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#TextEditor.setDecorations)<br>[DecorationOptions](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#DecorationOptions)<br>[DecorationInstanceRenderOptions](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#DecorationInstanceRenderOptions)<br>[ThemableDecorationInstanceRenderOptions](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#ThemableDecorationInstanceRenderOptions)<br>[window.createTextEditorDecorationType](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.createTextEditorDecorationType)<br>[TextEditorDecorationType](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#TextEditorDecorationType)<br>[contributes.colors](https://vscode-ext-docs.azurewebsites.net/api/references/contribution-points#contributes.colors) |
| [I18n Sample](i18n-sample) | N/A |  |
| [Task Provider Sample](task-provider-sample) | [/api/extension-guides/task-provider](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/task-provider) | [tasks.registerTaskProvider](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#tasks.registerTaskProvider)<br>[Task](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#Task)<br>[ShellExecution](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#ShellExecution)<br>[contributes.taskDefinitions](https://vscode-ext-docs.azurewebsites.net/api/references/contribution-points#contributes.taskDefinitions) |
| [Terminal Sample](terminal-sample) | N/A | [window.createTerminal](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.createTerminal)<br>[window.onDidChangeActiveTerminal](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.onDidChangeActiveTerminal)<br>[window.onDidCloseTerminal](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.onDidCloseTerminal)<br>[window.onDidOpenTerminal](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.onDidOpenTerminal)<br>[window.Terminal](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.Terminal)<br>[window.terminals](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.terminals) |
| [Tree View Sample](tree-view-sample) | [/api/extension-guides/tree-view](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/tree-view) | [window.createTreeView](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.createTreeView)<br>[window.registerTreeDataProvider](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#window.registerTreeDataProvider)<br>[TreeView](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#TreeView)<br>[TreeDataProvider](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#TreeDataProvider)<br>[contributes.views](https://vscode-ext-docs.azurewebsites.net/api/references/contribution-points#contributes.views)<br>[contributes.viewsContainers](https://vscode-ext-docs.azurewebsites.net/api/references/contribution-points#contributes.viewsContainers) |
<!-- SAMPLES_END -->

### Language Protocol Server Samples

<!-- LSP_SAMPLES_BEGIN -->
| Sample | Guide on VS Code Website | API & Contribution |
| ------ | ----- | --- |
| [LSP Sample](lsp-sample) | [/api/language-extensions/smart-editing-lsp-guide](https://vscode-ext-docs.azurewebsites.net/api/language-extensions/smart-editing-lsp-guide) |  |
| [LSP Log Streaming Sample](lsp-log-streaming-sample) | N/A |  |
| [LSP Multi Root Server Sample](lsp-multi-server-sample) | https://github.com/Microsoft/vscode/wiki/Extension-Authoring:-Adopting-Multi-Root-Workspace-APIs#language-client--language-server |  |
<!-- LSP_SAMPLES_END -->

## :warning: Legacy Samples :warning:

Legacy samples are at [`/legacy-samples`](/legacy-samples). They are unlikely to receive any updates and might not work with the latest version of VS Code.

| Sample | Deprecated Reason |
| ------ | ----------------- |
| [Preview HTML](/legacy-samples/previewhtml-sample/README.md) | [Webview API](/webview-sample/README.md) supersedes the old HTML Preview functionality |

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](https://github.com/Microsoft/vscode-extension-samples/blob/ext-docs/LICENSE) License.