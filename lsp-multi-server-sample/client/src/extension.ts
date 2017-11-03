import * as path from 'path';
import { 
	workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri
} from 'vscode'; 

import { 
	LanguageClient, LanguageClientOptions, TransportKind
} from 'vscode-languageclient';

let defaultClient: LanguageClient;
let clients: Map<string, LanguageClient> = new Map();

let _sortedWorkspaceFolders: string[];
function sortedWorkspaceFolders(): string[] {
	if (_sortedWorkspaceFolders === void 0) {
		_sortedWorkspaceFolders = Workspace.workspaceFolders.map(folder => {
			let result = folder.uri.toString();
			if (result.charAt(result.length - 1) !== '/') {
				result = result + '/';
			}
			return result;
		}).sort(
			(a, b) => {
				return a.length - b.length;
			}
		);
	}
	return _sortedWorkspaceFolders;
}
Workspace.onDidChangeWorkspaceFolders(() => _sortedWorkspaceFolders = undefined);

function getOuterMostWorkspaceFolder(folder: WorkspaceFolder): WorkspaceFolder {
	let sorted = sortedWorkspaceFolders();
	for (let element of sorted) {
		let uri = folder.uri.toString();
		if (uri.charAt(uri.length - 1) !== '/') {
			uri = uri + '/';
		}
		if (uri.startsWith(element)) {
			return Workspace.getWorkspaceFolder(Uri.parse(element));
		}
	}
	return folder;
}

export function activate(context: ExtensionContext) {

	let module = context.asAbsolutePath(path.join('server', 'server.js'));
	let outputChannel: OutputChannel = Window.createOutputChannel('lsp-multi-server-example');
	
	function didOpenTextDocument(document: TextDocument): void {
		// We are only interested in language mode text
		if (document.languageId !== 'plaintext' || (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled')) {
			return;
		}

		let uri = document.uri;
		let folder = Workspace.getWorkspaceFolder(uri);
		// Files outside a folder go to the default client
		if (!folder && !defaultClient) {
			let debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };
			let serverOptions = {
				run: { module, transport: TransportKind.ipc },
				debug: { module, transport: TransportKind.ipc, options: debugOptions}
			};
			let syncedDocuments: Set<string> = new Set(); 
			let clientOptions: LanguageClientOptions = {
				documentSelector: [
					{ scheme: 'untitled', language: 'plaintext' },
					{ scheme: 'file', language: 'plaintext' }
				],
				diagnosticCollectionName: 'multi-lsp',
				outputChannel: outputChannel,
				initializationOptions: {
					genericServer: true
				},
				middleware: {
					didOpen: (document, next) => {
						let uri: Uri = document.uri;
						// The file is part of a know workspace folder.
						if (Workspace.getWorkspaceFolder(uri)) {
							return;
						}
						syncedDocuments.add(uri.toString());
						next(document);
					},
					didChange: (event, next) => {
						if (syncedDocuments.has(event.document.uri.toString())) {
							next(event);
						}
					},
					didSave: (document, next) => {
						if (syncedDocuments.has(document.uri.toString())) {
							next(document);
						}
					},
					didClose: (document, next) => {
						if (syncedDocuments.has(document.uri.toString())) {
							syncedDocuments.delete(document.uri.toString());
							next(document);
						}
					}
				}
			}
			defaultClient = new LanguageClient('lsp-multi-server-example', 'LSP Multi Server Example', serverOptions, clientOptions);
			defaultClient.registerProposedFeatures();
			defaultClient.start();
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
				outputChannel: outputChannel,
				middleware: {
					didOpen: (document, next) => {
						console.log(`didOpen middleware called for server serving: ${folder.uri.toString()}`);
						next(document);
					},
					didChange: (event, next) => {
						console.log(`didChange middleware called for server serving: ${folder.uri.toString()}`);
						next(event);
					},
					didSave: (document, next) => {
						console.log(`didSave middleware called for server serving: ${folder.uri.toString()}`);
						next(document);
					},
					didClose: (document, next) => {
						console.log(`didClose middleware called for server serving: ${folder.uri.toString()}`);
						next(document);
					}
				}
			}
			let client = new LanguageClient('lsp-multi-server-example', 'LSP Multi Server Example', serverOptions, clientOptions);
			client.registerProposedFeatures();
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