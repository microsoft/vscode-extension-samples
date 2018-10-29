//@ts-check

/**
 * @typedef {Object} Sample
 * @property {string} description - A readable name for the sample
 * @property {string} path - Path to the sample's root
 * @property {string | null} guide - Link to the guide on https://code.visualstudio.com
 * @property {string[]} apis - Listing of VS Code API that is being illustrated. For example, "TextDocumentContentProvider"
 * @property {string[]} contributions - Listing of Contribution Points that are being used. For example,
 */

/** @type {Sample[]} */
const samples = [{
		description: 'Multi Root Sample',
		path: 'basic-multi-root-sample',
		guide: null,
		apis: ['workspace.getWorkspaceFolder', 'workspace.onDidChangeWorkspaceFolders'],
		contributions: []
	},
	{
		description: 'Webview Sample',
		path: 'webview-sample',
		guide: '/api/extension-guides/webview',
		apis: ['window.createWebviewPanel', 'window.registerWebviewPanelSerializer'],
		contributions: []
	},
	{
		description: 'Status Bar',
		path: 'statusbar-sample',
		guide: '/api/extension-guides/status-bar',
		apis: ['StatusBarItem'],
		contributions: []
	},
	{
		description: 'completions-sample',
		path: 'completions-sample',
		guide: null,
		apis: ['languages.registerCompletionItemProvider', 'CompletionItem', 'SnippetString'],
		contributions: []
	},
	{
		description: 'File System Provider Sample',
		path: 'fsprovider-sample',
		guide: null,
		apis: ['workspace.registerFileSystemProvider'],
		contributions: []
	},
	// { description: 'configuration-sample', path: 'configuration-sample', guide: null, apis: [], contributions: [] },
	// { description: 'contentprovider-sample', path: 'contentprovider-sample', guide: null, apis: [], contributions: [] },
	{
		description: 'decorator-sample',
		path: 'decorator-sample',
		guide: null,
		apis: ['TextEditor.setDecorations', 'DecorationOptions', 'DecorationInstanceRenderOptions', 'ThemableDecorationInstanceRenderOptions', 'window.createTextEditorDecorationType', 'TextEditorDecorationType'],
		contributions: [ 'colors']
	},
	// { description: 'extension-deps-sample', path: 'extension-deps-sample', guide: null, apis: [], contributions: [] },
	// { description: 'hellocode-minimal-sample', path: 'hellocode-minimal-sample', guide: null, apis: [], contributions: [] },
	// { description: 'hellocode-sample', path: 'hellocode-sample', guide: null, apis: [], contributions: [] },
	{
		description: 'I18n Sample',
		path: 'i18n-sample',
		guide: null,
		apis: [],
		contributions: []
	},
	// { description: 'legacy-samples', path: 'legacy-samples', guide: null, apis: [], contributions: [] },
	// { description: 'multi-diagnostics-sample', path: 'multi-diagnostics-sample', guide: null, apis: [], contributions: [] },
	// { description: 'nodefs-provider-sample', path: 'nodefs-provider-sample', guide: null, apis: [], contributions: [] },
	// { description: 'progress-sample', path: 'progress-sample', guide: null, apis: [], contributions: [] },
	// { description: 'quickinput-sample', path: 'quickinput-sample', guide: null, apis: [], contributions: [] },
	// { description: 'smart-template-strings-sample', path: 'smart-template-strings-sample', guide: null, apis: [], contributions: [] },
	{
		description: 'Contribute Tasks via an Extension',
		path: 'task-provider-sample',
		guide: '/api/extension-guides/api-tasks',
		apis: ['tasks.registerTaskProvider', 'Task', 'ShellExecution'],
		contributions: ['taskDefinitions']
	},
	{
		description: 'terminal-sample',
		path: 'terminal-sample',
		guide: null,
		apis: ['window.createTerminal', 'window.onDidChangeActiveTerminal', 'window.onDidCloseTerminal', 'window.onDidOpenTerminal', 'window.Terminal', 'window.terminals'],
		contributions: []
	},
	// { description: 'theme-sample', path: 'theme-sample', guide: null, apis: [], contributions: [] },
	{
		description: 'tree-view-sample',
		path: 'tree-view-sample',
		guide: '/api/extension-guides/tree-view',
		apis: ['window.createTreeView', 'window.registerTreeDataProvider', 'TreeView', 'TreeDataProvider'],
		contributions: ['views', 'viewsContainers']
	},
	// { description: 'vim-sample', path: 'vim-sample', guide: null, apis: [], contributions: [] },
	// { description: 'webpack-sample', path: 'webpack-sample', guide: null, apis: [], contributions: [] },
];

/** @type {Sample[]} */
const lspSamples = [
	{
		description: 'LSP Sample',
		path: 'lsp-sample',
		guide: '/api/language-extensions/smart-editing-lsp-guide',
		apis: [],
		contributions: []
	},
	{
		description: 'LSP Log Streaming Sample',
		path: 'lsp-log-streaming-sample',
		guide: null,
		apis: [],
		contributions: []
	},
	{
		description: 'LSP Multi Root Server Sample',
		path: 'lsp-multi-server-sample',
		guide: 'https://github.com/Microsoft/vscode/wiki/Extension-Authoring:-Adopting-Multi-Root-Workspace-APIs#language-client--language-server',
		apis: [],
		contributions: []
	},
]

module.exports = {
	samples,
	lspSamples
}
