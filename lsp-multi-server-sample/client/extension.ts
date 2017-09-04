import * as path from 'path';
import { 
	workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder
} from 'vscode'; 

import { 
	LanguageClient, LanguageClientOptions, TransportKind, ProposedProtocol
} from 'vscode-languageclient';

let defaultClient: LanguageClient;
let clients: Map<string, LanguageClient> = new Map();

function getOuterMostWorkspaceFolder(folder: WorkspaceFolder): WorkspaceFolder {
	let result = folder;
	let candidate: WorkspaceFolder;
	while((candidate = Workspace.getWorkspaceFolder(folder.uri)) !== void 0) {
		result = candidate;
	}
	return result;
}

export function activate(_context: ExtensionContext) {

	let module = path.join(__dirname, '..', 'server', 'server.js');
	let outputChannel: OutputChannel = Window.createOutputChannel('lsp-multi-server-example');
	
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
				diagnosticCollectionName: 'multi-lsp',
				outputChannel: outputChannel
			}
			defaultClient = new LanguageClient('lsp-multi-server-example', 'LSP Multi Server Example', serverOptions, clientOptions);
			defaultClient.registerFeatures(ProposedProtocol(defaultClient));
			defaultClient.start();
			return;
		}
		let folder = Workspace.getWorkspaceFolder(uri);
		// Files outside a folder can't be handled. This might depend on the language
		// Single file languages like JSON might handle files outside the workspace folders.
		if (!folder) {
			return;
		}
		// If we have nested workspace folders we only start a server on the outer most workspace folder.
		folder = getOuterMostWorkspaceFolder(folder);
		
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
				diagnosticCollectionName: 'lsp-multi-server-example',
				workspaceFolder: folder,
				outputChannel: outputChannel
			}
			let client = new LanguageClient('lsp-multi-server-example', 'LSP Multi Server Example', serverOptions, clientOptions);
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