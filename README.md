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

| Guide | Sample | API & Contribution Points |
| ------ | ----- | --- |
| [/api/extension-guides/virtual-documents](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/virtual-documents) | [Virtual Documents](/contentprovider-sample/README.md) | [`TextDocumentContentProvider`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocumentContentProvider)|
| [/api/extension-guides/editor-decoration](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/editor-decoration) | [Editor Decoration](/decorator-sample/README.md) | [`window.createTextEditorDecorationType`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#window.createTextEditorDecorationType) |
| [/api/extension-guides/status-bar](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/status-bar) | [Status Bar](/statusbar-sample/README.md) | [`StatusBarItem`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#StatusBarItem) |
| [/api/extension-guides/color-theme](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/color-theme) | [Color Theme](/theme-sample/README.md) | [`contributes.themes`](https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributesthemes) |
| N/A | [File System Provider](/fsprovider-sample/README.md) | [`vscode.workspace.registerFileSystemProvider`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#workspace.registerFileSystemProvider) |

## :warning: Legacy Samples :warning:

Legacy samples are at [`/legacy-samples`](/legacy-samples). They are unlikely to receive any updates and might not work with the latest version of VS Code.

| Sample | Deprecated Reason |
| ------ | ----------------- |
| [Preview HTML](/legacy-samples/previewhtml-sample/README.md) | [Webview API](/webview-sample/README.md) supersedes the old HTML Preview functionality |

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](https://github.com/Microsoft/vscode-extension-samples/blob/ext-docs/LICENSE) License.