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

## Samples

<!-- SAMPLES_BEGIN -->
| Sample | Guide on VS Code Website | API & Contribution |
| ------ | ----- | --- |
| [Multi Root Sample](basic-multi-root-sample) | N/A | [workspace.getWorkspaceFolder](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#workspace.getWorkspaceFolder)<br>[workspace.onDidChangeWorkspaceFolders](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#workspace.onDidChangeWorkspaceFolders) |
| [Webview Sample](webview-sample) | [/api/extension-guides/webview](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/webview) |  |
| [Status Bar](statusbar-sample) | [/api/extension-guides/status-bar](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/status-bar) | [StatusBarItem](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#StatusBarItem) |
| [File System Provider](fsprovider-sample) | N/A | [workspace.registerFileSystemProvider](https://vscode-ext-docs.azurewebsites.net/api/references/vscode-api#workspace.registerFileSystemProvider) |
| [completions-sample](completions-sample) | N/A |  |
| [configuration-sample](configuration-sample) | N/A |  |
| [contentprovider-sample](contentprovider-sample) | N/A |  |
| [decorator-sample](decorator-sample) | N/A |  |
| [extension-deps-sample](extension-deps-sample) | N/A |  |
| [hellocode-minimal-sample](hellocode-minimal-sample) | N/A |  |
| [hellocode-sample](hellocode-sample) | N/A |  |
| [i18n-sample](i18n-sample) | N/A |  |
| [legacy-samples](legacy-samples) | N/A |  |
| [lsp-log-streaming-sample](lsp-log-streaming-sample) | N/A |  |
| [lsp-multi-server-sample](lsp-multi-server-sample) | N/A |  |
| [lsp-sample](lsp-sample) | N/A |  |
| [multi-diagnostics-sample](multi-diagnostics-sample) | N/A |  |
| [nodefs-provider-sample](nodefs-provider-sample) | N/A |  |
| [progress-sample](progress-sample) | N/A |  |
| [quickinput-sample](quickinput-sample) | N/A |  |
| [smart-template-strings-sample](smart-template-strings-sample) | N/A |  |
| [task-provider-sample](task-provider-sample) | N/A |  |
| [terminal-sample](terminal-sample) | N/A |  |
| [theme-sample](theme-sample) | N/A |  |
| [tree-view-sample](tree-view-sample) | N/A |  |
| [vim-sample](vim-sample) | N/A |  |
| [webpack-sample](webpack-sample) | N/A |  |
<!-- SAMPLES_END -->

## :warning: Legacy Samples :warning:

Legacy samples are at [`/legacy-samples`](/legacy-samples). They are unlikely to receive any updates and might not work with the latest version of VS Code.

| Sample | Deprecated Reason |
| ------ | ----------------- |
| [Preview HTML](/legacy-samples/previewhtml-sample/README.md) | [Webview API](/webview-sample/README.md) supersedes the old HTML Preview functionality |

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](https://github.com/Microsoft/vscode-extension-samples/blob/ext-docs/LICENSE) License.