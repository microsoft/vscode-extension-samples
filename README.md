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

| Sample | Guide on VS Code Website | API & Contribution |
| ------ | ----- | --- |
| [Virtual Documents](/contentprovider-sample/README.md) | [/api/extension-guides/virtual-documents](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/virtual-documents) | [`TextDocumentContentProvider`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocumentContentProvider)|
| [Editor Decoration](/decorator-sample/README.md) | [/api/extension-guides/editor-decoration](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/editor-decoration) | [`window.createTextEditorDecorationType`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#window.createTextEditorDecorationType) |
| [Status Bar](/statusbar-sample/README.md) | [/api/extension-guides/status-bar](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/status-bar) | [`StatusBarItem`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#StatusBarItem) |
| [Color Theme](/theme-sample/README.md) | [/api/extension-guides/color-theme](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/color-theme) | [`contributes.themes`](https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributesthemes) |
| [File System Provider](/fsprovider-sample/README.md) | N/A | [`vscode.workspace.registerFileSystemProvider`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#workspace.registerFileSystemProvider) |
| [Extension Dependencies 1](/extension-deps-sample/test-extension-pack-1) [Extension Dependencies 2](/extension-deps-sample/test-extension-pack-2) [Extension Dependencies 3](/extension-deps-sample/test-extension-pack-3) | N/A | [extensionPack]() |

## :warning: Legacy Samples :warning:

Legacy samples are at [`/legacy-samples`](/legacy-samples). They are unlikely to receive any updates and might not work with the latest version of VS Code.

| Sample | Deprecated Reason |
| ------ | ----------------- |
| [Preview HTML](/legacy-samples/previewhtml-sample/README.md) | [Webview API](/webview-sample/README.md) supersedes the old HTML Preview functionality |

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](https://github.com/Microsoft/vscode-extension-samples/blob/ext-docs/LICENSE) License.