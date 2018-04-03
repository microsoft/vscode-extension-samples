import { ExtensionContext, EventEmitter, TreeItem, Event, window, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult, TreeView } from 'vscode';
import * as vscode from 'vscode';
import * as Client from 'ftp';
import { basename, dirname, join } from 'path';
import { Socket } from 'net';
import * as JSFtp from 'jsftp';
import { TreeDataProvider } from 'vscode';

interface IEntry {
	name: string;
	type: string;
}

export interface FtpNode {

	resource: vscode.Uri;
	isDirectory: boolean;

}

export class FtpModel {

	private nodes: Map<string, FtpNode> = new Map<string, FtpNode>();

	constructor(readonly host: string, private user: string, private password: string) {
	}

	public connect(): Thenable<Client> {
		return new Promise((c, e) => {
			const client = new Client();
			client.on('ready', () => {
				c(client);
			});

			client.on('error', error => {
				e('Error while connecting: ' + error.message);
			})

			client.connect({
				host: this.host,
				username: this.user,
				password: this.password
			});
		});
	}

	public get roots(): Thenable<FtpNode[]> {
		return this.connect().then(client => {
			return new Promise((c, e) => {
				client.list((err, list) => {
					if (err) {
						return e(err);
					}

					client.end();

					return c(this.sort(list.map(entry => ({ resource: Uri.parse(`ftp://${this.host}///${entry.name}`), isDirectory: entry.type === 'd' }))));
				});
			});
		});
	}

	public getChildren(node: FtpNode): Thenable<FtpNode[]> {
		return this.connect().then(client => {
			return new Promise((c, e) => {
				client.list(node.resource.fsPath, (err, list) => {
					if (err) {
						return e(err);
					}

					client.end();

					return c(this.sort(list.map(entry => ({ resource: Uri.parse(`${node.resource.fsPath}/${entry.name}`), isDirectory: entry.type === 'd' }))));
				});
			});
		});
	}

	private sort(nodes: FtpNode[]): FtpNode[] {
		return nodes.sort((n1, n2) => {
			if (n1.isDirectory && !n2.isDirectory) {
				return -1;
			}

			if (!n1.isDirectory && n2.isDirectory) {
				return 1;
			}

			return basename(n1.resource.fsPath).localeCompare(basename(n2.resource.fsPath));
		});
	}

	public getContent(resource: Uri): Thenable<string> {
		return this.connect().then(client => {
			return new Promise((c, e) => {
				client.get(resource.path.substr(2), (err, stream) => {
					if (err) {
						return e(err);
					}

					let string = ''
					stream.on('data', function (buffer) {
						if (buffer) {
							var part = buffer.toString();
							string += part;
						}
					});

					stream.on('end', function () {
						client.end();
						c(string);
					});
				});
			});
		});
	}
}

export class FtpTreeDataProvider implements TreeDataProvider<FtpNode>, TextDocumentContentProvider {

	private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
	readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

	constructor(private readonly model: FtpModel) { }

	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}


	public getTreeItem(element: FtpNode): TreeItem {
		return {
			resourceUri: element.resource,
			collapsibleState: element.isDirectory ? TreeItemCollapsibleState.Collapsed : void 0,
			command: element.isDirectory ? void 0 : {
				command: 'ftpExplorer.openFtpResource',
				arguments: [element.resource],
				title: 'Open FTP Resource'
			}
		};
	}

	public getChildren(element?: FtpNode): FtpNode[] | Thenable<FtpNode[]> {
		return element ? this.model.getChildren(element) : this.model.roots;
	}

	public getParent(element: FtpNode): FtpNode {
		const parent = vscode.Uri.parse(dirname(element.resource.fsPath));
		return parent.fsPath !== this.model.host ? { resource: parent, isDirectory: true } : null;
	}

	public provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
		return this.model.getContent(uri).then(content => content);
	}
}

export class FtpExplorer {

	private ftpViewer: TreeView<FtpNode>;

	constructor(context: vscode.ExtensionContext) {
		const ftpModel = new FtpModel('mirror.switch.ch', 'anonymous', 'anonymous@anonymous.de');
		const treeDataProvider = new FtpTreeDataProvider(ftpModel);
		context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('ftp', treeDataProvider));

		this.ftpViewer = vscode.window.createTreeView('ftpExplorer', { treeDataProvider });

		vscode.commands.registerCommand('ftpExplorer.refresh', () => treeDataProvider.refresh());
		vscode.commands.registerCommand('ftpExplorer.openFtpResource', resource => this.openResource(resource));
		vscode.commands.registerCommand('ftpExplorer.revealResource', () => this.reveal());
	}

	private openResource(resource: vscode.Uri): void {
		vscode.window.showTextDocument(resource);
	}

	private reveal(): void {
		const node = this.getNode();
		if (node) {
			this.ftpViewer.reveal(node);
		}
	}

	private getNode(): FtpNode {
		if (vscode.window.activeTextEditor) {
			if (vscode.window.activeTextEditor.document.uri.scheme === 'ftp') {
				return { resource: vscode.window.activeTextEditor.document.uri, isDirectory: false };
			}
		}
		return null;
	}
}