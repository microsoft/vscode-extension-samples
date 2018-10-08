<h1 align="center">
VS Code Extension Samples
</h1>

This repository contains sample code illustrating the VS Code extension API. Each sample is a self-contained extension that explains one topic.

| Sample | Guide on VS Code Website | API |
| ------ | ----- | --- |
| [Virtual Documents](/contentprovider-sample/README.md) | [/api/extension-guides/virtual-documents](/api/extension-guides/virtual-documents) | [`TextDocumentContentProvider`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocumentContentProvider) |
| [Editor Decoration](/decorator-sample/README.md) | [/api/extension-guides/editor-decoration](/api/extension-guides/editor-decoration) | [`window.createTextEditorDecorationType`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#window.createTextEditorDecorationType) |
| [Status Bar](/status-bar) | [/api/extension-guides/status-bar](/api/extension-guides/status-bar) | [`StatusBarItem`](https://code.visualstudio.com/docs/extensionAPI/vscode-api#StatusBarItem) |

- [Virtual Documents](/contentprovider-sample/README.md)
- [Editor Decoration](/decorator-sample/README.md)
- [Status Bar](/statusbar-sample/README.md)
- [Theme](/theme-sample)
- [Integrated Terminal](/terminal-sample/README.md)
- [Vim](/vim-sample/README.md)
- [Tree views](/tree-view-sample/README.md)
- [Webview](/webview-sample/README.md)

# ➡️ Getting Started

You can get started locally by following these steps:

- **Step #1**: `git clone https://github.com/Microsoft/vscode-extension-samples vscode-extension-samples`
- **Step #2**: `cd vscode-extension-samples`
- **Step #3**: `npm install`
- **Step #4**: Open [VSCode](https://code.visualstudio.com/) and start a sample from the debug viewlet.
