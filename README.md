# VS Code 扩展示例

此存储库包含说明 VS Code 扩展 API 的示例代码。每个示例都是一个独立的扩展，解释了 [VS Code API](https://code.visualstudio.com/api/references/vscode-api) 或 VS Code 的 [贡献点](https://code.visualstudio.com/api/references/contribution-points) 中的一个主题。您可以阅读、玩耍或从这些示例中适应来创建自己的扩展。

您可以从每个示例中期待：
- 其功能的解释
- 演示其使用的 gif 或截图
- 如果有的话，链接到 VS Code 网站上的指南
- 使用的 VS Code API 和贡献点的列表
- 使用 ESLint 强制执行的相同风格的代码

## 先决条件

您需要在系统上安装 [node](https://nodejs.org/en/) 和 [npm](https://nodejs.org/en/) 来运行示例。建议使用 VS Code 开发本身使用的节点版本，该版本记录在 [此处](https://github.com/Microsoft/vscode/wiki/How-to-Contribute#prerequisites)

## 使用

- `git clone https://github.com/Microsoft/vscode-extension-samples`
- `code <any-sample-folder>`
- 在终端中 `npm install`，然后 `F5` 运行示例
- 或者，按照每个示例的 README 中的说明设置和运行示例

## 入门

- [Hello World 示例](helloworld-sample)：VS Code 的 Hello World 示例。请参阅 [扩展剖析](https://code.visualstudio.com/api/get-started/extension-anatomy) 文档。
- [Hello World 最小示例](helloworld-minimal-sample)：用 JavaScript 编写的 Hello World 示例的最小版本。
- [Hello World 测试示例](helloworld-test-sample)：带有扩展集成测试的 Hello World 示例。请参阅 [测试扩展](https://code.visualstudio.com/api/working-with-extensions/testing-extension) 文档。
- [Hello World Web 示例](helloworld-web-sample)：VS Code Web 的 Hello World 示例。请参阅 [Web 扩展](https://code.visualstudio.com/api/extension-guides/web-extensions) 指南。

## 示例

<!-- SAMPLES_BEGIN -->
| 示例 | VS Code 网站上的指南 | API 和贡献 |
| ------ | ----- | --- |
| [Webview 示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/webview-sample) | [/api/extension-guides/webview](https://code.visualstudio.com/api/extension-guides/webview) | [window.createWebviewPanel](https://code.visualstudio.com/api/references/vscode-api#window.createWebviewPanel)<br>[window.registerWebviewPanelSerializer](https://code.visualstudio.com/api/references/vscode-api#window.registerWebviewPanelSerializer) |
| [Webview View 示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/webview-view-sample) | N/A | [window.registerWebviewViewProvider](https://code.visualstudio.com/api/references/vscode-api#window.registerWebviewViewProvider) |
| [Webview Codicons 示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/webview-codicons-sample) | N/A |  |
| [状态栏示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/statusbar-sample) | N/A | [window.createStatusBarItem](https://code.visualstudio.com/api/references/vscode-api#window.createStatusBarItem)<br>[StatusBarItem](https://code.visualstudio.com/api/references/vscode-api#StatusBarItem) |
| [树视图示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/tree-view-sample) | [/api/extension-guides/tree-view](https://code.visualstudio.com/api/extension-guides/tree-view) | [window.createTreeView](https://code.visualstudio.com/api/references/vscode-api#window.createTreeView)<br>[window.registerTreeDataProvider](https://code.visualstudio.com/api/references/vscode-api#window.registerTreeDataProvider)<br>[TreeView](https://code.visualstudio.com/api/references/vscode-api#TreeView)<br>[TreeDataProvider](https://code.visualstudio.com/api/references/vscode-api#TreeDataProvider)<br>[contributes.views](https://code.visualstudio.com/api/references/contribution-points#contributes.views)<br>[contributes.viewsContainers](https://code.visualstudio.com/api/references/contribution-points#contributes.viewsContainers) |
| [任务提供者示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/task-provider-sample) | [/api/extension-guides/task-provider](https://code.visualstudio.com/api/extension-guides/task-provider) | [tasks.registerTaskProvider](https://code.visualstudio.com/api/references/vscode-api#tasks.registerTaskProvider)<br>[Task](https://code.visualstudio.com/api/references/vscode-api#Task)<br>[ShellExecution](https://code.visualstudio.com/api/references/vscode-api#ShellExecution)<br>[contributes.taskDefinitions](https://code.visualstudio.com/api/references/contribution-points#contributes.taskDefinitions) |
| [多根示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/basic-multi-root-sample) | N/A | [workspace.getWorkspaceFolder](https://code.visualstudio.com/api/references/vscode-api#workspace.getWorkspaceFolder)<br>[workspace.onDidChangeWorkspaceFolders](https://code.visualstudio.com/api/references/vscode-api#workspace.onDidChangeWorkspaceFolders) |
| [完成提供者示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/completions-sample) | N/A | [languages.registerCompletionItemProvider](https://code.visualstudio.com/api/references/vscode-api#languages.registerCompletionItemProvider)<br>[CompletionItem](https://code.visualstudio.com/api/references/vscode-api#CompletionItem)<br>[SnippetString](https://code.visualstudio.com/api/references/vscode-api#SnippetString) |
| [代码操作示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/code-actions-sample) | N/A | [languages.registerCodeActionsProvider](https://code.visualstudio.com/api/references/vscode-api#languages.registerCodeActionsProvider)<br>[CodeActionProvider](https://code.visualstudio.com/api/references/vscode-api#CodeActionProvider) |
| [文件系统提供者示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/fsprovider-sample) | N/A | [workspace.registerFileSystemProvider](https://code.visualstudio.com/api/references/vscode-api#workspace.registerFileSystemProvider) |
| [编辑器装饰器示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/decorator-sample) | N/A | [TextEditor.setDecorations](https://code.visualstudio.com/api/references/vscode-api#TextEditor.setDecorations)<br>[DecorationOptions](https://code.visualstudio.com/api/references/vscode-api#DecorationOptions)<br>[DecorationInstanceRenderOptions](https://code.visualstudio.com/api/references/vscode-api#DecorationInstanceRenderOptions)<br>[ThemableDecorationInstanceRenderOptions](https://code.visualstudio.com/api/references/vscode-api#ThemableDecorationInstanceRenderOptions)<br>[window.createTextEditorDecorationType](https://code.visualstudio.com/api/references/vscode-api#window.createTextEditorDecorationType)<br>[TextEditorDecorationType](https://code.visualstudio.com/api/references/vscode-api#TextEditorDecorationType)<br>[contributes.colors](https://code.visualstudio.com/api/references/contribution-points#contributes.colors) |
| [L10n 示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/l10n-sample) | N/A |  |
| [终端示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/terminal-sample) | N/A | [window.createTerminal](https://code.visualstudio.com/api/references/vscode-api#window.createTerminal)<br>[window.onDidChangeActiveTerminal](https://code.visualstudio.com/api/references/vscode-api#window.onDidChangeActiveTerminal)<br>[window.onDidCloseTerminal](https://code.visualstudio.com/api/references/vscode-api#window.onDidCloseTerminal)<br>[window.onDidOpenTerminal](https://code.visualstudio.com/api/references/vscode-api#window.onDidOpenTerminal)<br>[window.Terminal](https://code.visualstudio.com/api/references/vscode-api#window.Terminal)<br>[window.terminals](https://code.visualstudio.com/api/references/vscode-api#window.terminals) |
| [扩展终端示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/extension-terminal-sample) | N/A | [window.createTerminal](https://code.visualstudio.com/api/references/vscode-api#window.createTerminal)<br>[window.Pseudoterminal](https://code.visualstudio.com/api/references/vscode-api#window.Pseudoterminal)<br>[window.ExtensionTerminalOptions](https://code.visualstudio.com/api/references/vscode-api#window.ExtensionTerminalOptions) |
| [颜色主题示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/theme-sample) | [/api/extension-guides/color-theme](https://code.visualstudio.com/api/extension-guides/color-theme) | [contributes.themes](https://code.visualstudio.com/api/references/contribution-points#contributes.themes) |
| [产品图标主题示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/product-icon-theme-sample) | [/api/extension-guides/product-icon-theme](https://code.visualstudio.com/api/extension-guides/product-icon-theme) | [contributes.productIconThemes](https://code.visualstudio.com/api/references/contribution-points#contributes.productIconThemes) |
| [Vim 示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/vim-sample) | N/A | [commands](https://code.visualstudio.com/api/references/vscode-api#commands)<br>[StatusBarItem](https://code.visualstudio.com/api/references/vscode-api#StatusBarItem)<br>[window.createStatusBarItem](https://code.visualstudio.com/api/references/vscode-api#window.createStatusBarItem)<br>[TextEditorCursorStyle](https://code.visualstudio.com/api/references/vscode-api#TextEditorCursorStyle)<br>[window.activeTextEditor](https://code.visualstudio.com/api/references/vscode-api#window.activeTextEditor)<br>[Position](https://code.visualstudio.com/api/references/vscode-api#Position)<br>[Range](https://code.visualstudio.com/api/references/vscode-api#Range)<br>[Selection](https://code.visualstudio.com/api/references/vscode-api#Selection)<br>[TextEditor](https://code.visualstudio.com/api/references/vscode-api#TextEditor)<br>[TextEditorRevealType](https://code.visualstudio.com/api/references/vscode-api#TextEditorRevealType)<br>[TextDocument](https://code.visualstudio.com/api/references/vscode-api#TextDocument) |
| [webpack-sample](https://github.com/Microsoft/vscode-extension-samples/tree/main/webpack-sample) | [/api/working-with-extensions/bundling-extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension) |  |
| [esbuild-sample](https://github.com/Microsoft/vscode-extension-samples/tree/main/esbuild-sample) | [/api/working-with-extensions/bundling-extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension) |  |
| [源代码控制示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/source-control-sample) | [/api/extension-guides/scm-provider](https://code.visualstudio.com/api/extension-guides/scm-provider) | [workspace.workspaceFolders](https://code.visualstudio.com/api/references/vscode-api#workspace.workspaceFolders)<br>[SourceControl](https://code.visualstudio.com/api/references/vscode-api#SourceControl)<br>[SourceControlResourceGroup](https://code.visualstudio.com/api/references/vscode-api#SourceControlResourceGroup)<br>[scm.createSourceControl](https://code.visualstudio.com/api/references/vscode-api#scm.createSourceControl)<br>[TextDocumentContentProvider](https://code.visualstudio.com/api/references/vscode-api#TextDocumentContentProvider)<br>[contributes.menus](https://code.visualstudio.com/api/references/contribution-points#contributes.menus) |
| [注释 API 示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/comment-sample) | N/A |  |
| [文档编辑示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/document-editing-sample) | N/A | [commands](https://code.visualstudio.com/api/references/vscode-api#commands) |
| [自定义数据示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/custom-data-sample) | [/api/extension-guides/custom-data-extension](https://code.visualstudio.com/api/extension-guides/custom-data-extension) |  |
| [CodeLens 提供者示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/codelens-sample) | N/A | [languages.registerCodeLensProvider](https://code.visualstudio.com/api/references/vscode-api#languages.registerCodeLensProvider)<br>[CodeLensProvider](https://code.visualstudio.com/api/references/vscode-api#CodeLensProvider)<br>[CodeLens](https://code.visualstudio.com/api/references/vscode-api#CodeLens) |
| [调用层次结构示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/call-hierarchy-sample) | N/A | [languages.registerCallHierarchyProvider](https://code.visualstudio.com/api/references/vscode-api#languages.registerCallHierarchyProvider)<br>[CallHierarchyProvider](https://code.visualstudio.com/api/references/vscode-api#CallHierarchyProvider)<br>[CallHierarchyItem](https://code.visualstudio.com/api/references/vscode-api#CallHierarchyItem)<br>[CallHierarchyOutgoingCall](https://code.visualstudio.com/api/references/vscode-api#CallHierarchyOutgoingCall)<br>[CallHierarchyIncomingCall](https://code.visualstudio.com/api/references/vscode-api#CallHierarchyIncomingCall) |
| [自定义编辑器示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/custom-editor-sample) | [/api/extension-guides/custom-editors](https://code.visualstudio.com/api/extension-guides/custom-editors) | [window.registerCustomEditorProvider](https://code.visualstudio.com/api/references/vscode-api#window.registerCustomEditorProvider)<br>[CustomTextEditorProvider](https://code.visualstudio.com/api/references/vscode-api#CustomTextEditorProvider)<br>[contributes.customEditors](https://code.visualstudio.com/api/references/contribution-points#contributes.customEditors) |
| [语义标记](https://github.com/Microsoft/vscode-extension-samples/tree/main/semantic-tokens-sample) | [/api/language-extensions/semantic-highlight-guide](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide) | [languages.registerDocumentSemanticTokensProvider](https://code.visualstudio.com/api/references/vscode-api#languages.registerDocumentSemanticTokensProvider)<br>[vscode.DocumentSemanticTokensProvider](https://code.visualstudio.com/api/references/vscode-api#vscode.DocumentSemanticTokensProvider) |
| [测试提供者示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/test-provider-sample) | N/A |  |
| [入门示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/getting-started-sample) | N/A |  |
| [notebook-renderer-sample](https://github.com/Microsoft/vscode-extension-samples/tree/main/notebook-renderer-sample) | [/api/extension-guides/notebook#notebook-renderer](https://code.visualstudio.com/api/extension-guides/notebook#notebook-renderer) | [contributes.notebookRenderer](https://code.visualstudio.com/api/references/contribution-points#contributes.notebookRenderer) |
| [notebook-extend-markdown-renderer-sample](https://github.com/Microsoft/vscode-extension-samples/tree/main/notebook-extend-markdown-renderer-sample) | [/api/extension-guides/notebook#notebook-renderer](https://code.visualstudio.com/api/extension-guides/notebook#notebook-renderer) | [contributes.notebookRenderer](https://code.visualstudio.com/api/references/contribution-points#contributes.notebookRenderer) |
| [jupyter-server-provider-sample](https://github.com/Microsoft/vscode-extension-samples/tree/main/jupyter-server-provider-sample) | N/A |  |
| [聊天示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/chat-sample) | N/A |  |
| [聊天教程](https://github.com/Microsoft/vscode-extension-samples/tree/main/chat-tutorial) | N/A |  |
| [通知示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/notifications-sample) | N/A |  |
<!-- SAMPLES_END -->

### 语言服务器协议示例

<!-- LSP_SAMPLES_BEGIN -->
| 示例 | VS Code 网站上的指南 | API 和贡献 |
| ------ | ----- | --- |
| [片段示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/snippet-sample) | [/api/language-extensions/snippet-guide](https://code.visualstudio.com/api/language-extensions/snippet-guide) | [contributes.snippets](https://code.visualstudio.com/api/references/contribution-points#contributes.snippets) |
| [语言配置示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/language-configuration-sample) | [/api/language-extensions/language-configuration-guide](https://code.visualstudio.com/api/language-extensions/language-configuration-guide) | [contributes.languages](https://code.visualstudio.com/api/references/contribution-points#contributes.languages) |
| [LSP 示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/lsp-sample) | [/api/language-extensions/language-server-extension-guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide) |  |
| [LSP 日志流示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/lsp-log-streaming-sample) | N/A |  |
| [LSP 多根服务器示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/lsp-multi-server-sample) | https://github.com/Microsoft/vscode/wiki/Extension-Authoring:-Adopting-Multi-Root-Workspace-APIs#language-client--language-server |  |
| [LSP Web 扩展示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/lsp-web-extension-sample) | [/api/language-extensions/language-server-extension-guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide) |  |
| [LSP 用户输入示例](https://github.com/Microsoft/vscode-extension-samples/tree/main/lsp-user-input-sample) | N/A |  |
| [LSP 嵌入式语言服务](https://github.com/Microsoft/vscode-extension-samples/tree/main/lsp-embedded-language-service) | N/A |  |
| [LSP 嵌入式请求转发](https://github.com/Microsoft/vscode-extension-samples/tree/main/lsp-embedded-request-forwarding) | N/A |  |
| [Wasm 语言服务器](https://github.com/Microsoft/vscode-extension-samples/tree/main/wasm-language-server) | N/A |  |
<!-- LSP_SAMPLES_END -->

## 许可证

版权所有 (c) Microsoft Corporation。保留所有权利。

根据 [MIT](https://github.com/microsoft/vscode-extension-samples/blob/main/LICENSE) 许可证授权。
