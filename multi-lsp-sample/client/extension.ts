import * as path from 'path';
import { 
	workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel
} from 'vscode'; 

import { 
	LanguageClient, LanguageClientOptions, TransportKind, ProposedProtocol
} from 'vscode-languageclient';

let defaultClient: LanguageClient;
let clients: Map<string, LanguageClient> = new Map();

export function activate(_context: ExtensionContext) {


	let module = path.join(__dirname, '..', 'server', 'server.js');
	let outputChannel: OutputChannel = Window.createOutputChannel('Multi-LSP-Example');
	
	function didOpenTextDocument(document: TextDocument): void {
		// We are only interested in language mode text
		if (document.languageId !== 'plaintext' || (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled')) {
			return;
		}

		let uri = document.uri;
		// Untitled files go to a default client.
		if (uri.scheme === 'untitled' && !defaultClient) {
			let debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };
			let serverOptions = {
				run: { module, transport: TransportKind.ipc },
				debug: { module, transport: TransportKind.ipc, options: debugOptions}
			};
			let clientOptions: LanguageClientOptions = {
				documentSelector: [
					{ scheme: 'untitled', language: 'plaintext' }
				],
				synchronize: {
					configurationSection: 'multi-lsp'
				},
				diagnosticCollectionName: 'multi-lsp',
				outputChannel: outputChannel
			}
			defaultClient = new LanguageClient('multi-lsp', 'Multi-LSP', serverOptions, clientOptions);
			defaultClient.registerFeatures(ProposedProtocol(defaultClient));
			defaultClient.start();
		}
		let folder = Workspace.getWorkspaceFolder(uri);
		// Files outside a folder can't be handled. This might depend on the language
		// Single file languages like JSON might handle files outside the workspace folders.
		if (!folder) {
			return;
		}
		if (!clients.has(folder.uri.toString())) {
			let debugOptions = { execArgv: ["--nolazy", `--inspect=${6011 + clients.size}`] };
			let serverOptions = {
				run: { module, transport: TransportKind.ipc },
				debug: { module, transport: TransportKind.ipc, options: debugOptions}
			};
			let clientOptions: LanguageClientOptions = {
				documentSelector: [
					{ scheme: 'file', language: 'plaintext', pattern: `${folder.uri.fsPath}/**/*` }
				],
				synchronize: {
					configurationSection: 'multi-lsp'
				},
				diagnosticCollectionName: 'multi-lsp',
				workspaceFolder: folder,
				outputChannel: outputChannel
			}
			let client = new LanguageClient('multi-lsp', 'Multi-LSP', serverOptions, clientOptions);
			client.registerFeatures(ProposedProtocol(client));
			client.start();
			clients.set(folder.uri.toString(), client);

		}
	}

	Workspace.onDidOpenTextDocument(didOpenTextDocument);
	Workspace.textDocuments.forEach(didOpenTextDocument);
	Workspace.onDidChangeWorkspaceFolders((event) => {
		for (let folder  of event.removed) {
			let client = clients.get(folder.uri.toString());
			if (client) {
				clients.delete(folder.uri.toString());
				client.stop();
			}
		}
	});
}

export function deactivate(): Thenable<void> {
	let promises: Thenable<void>[] = [];
	if (defaultClient) {
		promises.push(defaultClient.stop());
	}
	for (let client of clients.values()) {
		promises.push(client.stop());
	}
	return Promise.all(promises).then(() => undefined);
}