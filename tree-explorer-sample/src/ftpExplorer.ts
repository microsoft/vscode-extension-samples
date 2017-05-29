import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Event, window, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult } from 'vscode';
import * as Client from 'ftp';
import * as path from 'path';

interface IEntry {
	name: string;
	type: string;
}

export class FtpNode {
	private _resource: Uri;

	constructor(private entry: IEntry, private host: string, private _parent: string) {
		this._resource = Uri.parse(`ftp://${host}/${_parent}/${entry.name}`);
	}

	public get resource(): Uri {
		return this._resource;
	}

	public get path(): string {
		return path.join(this._parent, this.name);
	}

	public get name(): string {
		return this.entry.name;
	}

	public get isFolder(): boolean {
		return this.entry.type === 'd' || this.entry.type === 'l';
	}
}

export class FtpModel {
	private connection: Thenable<FtpNode[]>;

	constructor(private host: string, private user: string, private password: string) {
		this.connection = this.connect();
	}

	public connect(): Thenable<Client> {
		return new Promise((c, e) => {
			const client = new Client();
			client.on('ready', () => {
				c(client);
			});

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

					return c(this.sort(list.map(entry => new FtpNode(entry, this.host, '/'))));
				});
			});
		});
	}

	public getChildren(node: FtpNode): Thenable<FtpNode[]> {
		return this.connect().then(client => {
			return new Promise((c, e) => {
				client.list(node.path, (err, list) => {
					if (err) {
						return e(err);
					}

					client.end();

					return c(this.sort(list.map(entry => new FtpNode(entry, this.host, node.path))));
				});
			});
		});
	}

	private sort(nodes: FtpNode[]): FtpNode[] {
		return nodes.sort((n1, n2) => {
			if (n1.isFolder && !n2.isFolder) {
				return -1;
			}

			if (!n1.isFolder && n2.isFolder) {
				return 1;
			}

			return n1.name.localeCompare(n2.name);
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

	private model: FtpModel;

	public getTreeItem(element: FtpNode): TreeItem {
		return {
			label: element.name,
			collapsibleState: element.isFolder ? TreeItemCollapsibleState.Collapsed : void 0,
			command: element.isFolder ? void 0 : {
				command: 'openFtpResource',
				arguments: [element.resource],
				title: 'Open FTP Resource'
			},
			iconPath: {
				light: element.isFolder ? path.join(__filename, '..', '..', '..', 'resources', 'Folder_16x.svg') : path.join(__filename, '..', '..', '..', 'resources', 'Document_16x.svg'),
				dark: element.isFolder ? path.join(__filename, '..', '..', '..', 'resources', 'Folder_inverse_16x.svg') : path.join(__filename, '..', '..', '..', 'resources', 'Document_inverse_16x.svg')
			}
		};
	}

	public getChildren(element?: FtpNode): FtpNode[] | Thenable<FtpNode[]> {
		if (!element) {
			if (!this.model) {
				this.model = new FtpModel('mirror.switch.ch', 'anonymous', 'anonymous@anonymous.de');
			}

			return this.model.roots;
		}

		return this.model.getChildren(element);
	}

	public provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
		return this.model.getContent(uri);
	}
}