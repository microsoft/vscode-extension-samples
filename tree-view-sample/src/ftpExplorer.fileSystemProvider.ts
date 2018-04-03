import { ExtensionContext, TreeDataProvider, EventEmitter, TreeItem, Event, window, TreeItemCollapsibleState, Uri, commands, workspace, TextDocumentContentProvider, CancellationToken, ProviderResult, TreeView } from 'vscode';
import * as vscode from 'vscode';
import * as Client from 'ftp';
import { basename, dirname, join } from 'path';
import { Socket } from 'net';
import * as JSFtp from 'jsftp';

class FtpFileSystemProvider implements vscode.FileSystemProvider {

	readonly root: vscode.Uri;

	private readonly _user: string;
	private readonly _pass: string;
	private _connection: JSFtp;
	private _pending: { resolve: Function, reject: Function, func: keyof JSFtp, args: any[] }[] = [];

	constructor(
		root: vscode.Uri,
		user: string,
		pass: string
	) {
		this.root = root;
		this._user = user;
		this._pass = pass;
	}

	private _withConnection<T>(func: keyof JSFtp, ...args: any[]): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this._pending.push({ resolve, reject, func, args });
			this._nextRequest();
		});
	}

	private _nextRequest(): void {
		if (this._pending.length === 0) {
			return;
		}

		if (this._connection === void 0) {
			// ensure connection first
			const candidate = new JSFtp({
				host: this.root.authority
			});
			candidate.keepAlive(1000 * 5);
			candidate.auth(this._user, this._pass, (err) => {
				this._connection = err ? null : candidate;
				this._nextRequest();
			});

			return;
		}

		if (this._connection === null) {
			// permanently failed
			const request = this._pending.shift();
			request.reject(new Error('no connection'))

		} else {
			// connected
			const { func, args, resolve, reject } = this._pending.shift();
			(<Function>this._connection[func]).apply(this._connection, args.concat([function (err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			}]));
		}

		this._nextRequest();
	}

	dispose(): void {
		this._withConnection('raw', 'QUIT');
	}

	utimes(resource: vscode.Uri, mtime: number): Promise<vscode.FileStat> {
		return this._withConnection('raw', 'NOOP')
			.then(() => this.stat(resource));
	}

	stat(resource: vscode.Uri): Promise<vscode.FileStat> {
		const { path } = resource;
		if (path === '/' || path === '') {
			// root directory
			return Promise.resolve(<vscode.FileStat>{
				type: vscode.FileType.Dir,
				id: null,
				mtime: 0,
				size: 0
			});
		}

		const name = basename(path);
		const dir = dirname(path);
		return this._withConnection<JSFtp.Entry[]>('ls', dir).then(entries => {
			for (const entry of entries) {
				if (entry.name === name) {
					return {
						id: null,
						mtime: entry.time,
						size: entry.size,
						type: entry.type
					};
				}
			}
			return Promise.reject<vscode.FileStat>(new Error(`ENOENT, ${resource.toString(true)}`));
		}, err => {
			return Promise.reject<vscode.FileStat>(new Error(`ENOENT, ${resource.toString(true)}`));
		});
	}

	readdir(dir: vscode.Uri): Promise<[vscode.Uri, vscode.FileStat][]> {
		return this._withConnection<JSFtp.Entry[]>('ls', dir.path).then(entries => {
			const result: [vscode.Uri, vscode.FileStat][] = [];
			for (let entry of entries) {
				const resource = dir.with({ path: join(dir.path, entry.name) });
				const stat: vscode.FileStat = {
					id: resource.toString(),
					mtime: entry.time,
					size: entry.size,
					type: entry.type
				}
				result.push([resource, stat]);
			}
			return result;
		});
	}

	read(resource: vscode.Uri, offset: number = 0, len: number, progress: vscode.Progress<Uint8Array>): Promise<number> {

		return this._withConnection<void>('raw', 'REST', [offset]).then(() => {

			return this._withConnection<Socket>('get', resource.path)

		}).then(socket => {

			let bytesRead = 0;

			return new Promise<number>((resolve, reject) => {
				socket.on('data', buffer => {
					progress.report(buffer);
					bytesRead += buffer.length;
					if (len > 0 && bytesRead > len) {
						socket.destroy();
					}
				});
				socket.on('close', hadErr => {
					if (hadErr) {
						reject(hadErr);
					} else {
						resolve(bytesRead);
					}
				});
				socket.resume();
			});
		});
	}

	write(resource: vscode.Uri, content: Uint8Array): Promise<void> {
		return this._withConnection('put', content, resource.path);
	}

	rmdir(resource: vscode.Uri): Promise<void> {
		return this._withConnection('raw', 'RMD', [resource.path]);
	}

	mkdir(resource: vscode.Uri): Promise<vscode.FileStat> {
		return this._withConnection('raw', 'MKD', [resource.path])
			.then(() => this.stat(resource));
	}

	unlink(resource: vscode.Uri): Promise<void> {
		return this._withConnection('raw', 'DELE', [resource.path]);
	}

	move(resource: vscode.Uri, target: vscode.Uri): Promise<vscode.FileStat> {
		return this._withConnection<void>('raw', 'RNFR', [resource.path]).then(() => {
			return this._withConnection<void>('raw', 'RNTO', [target.path]);
		}).then(() => {
			return this.stat(target);
		});
	}
}

export interface FtpNode {

	resource: vscode.Uri;
	isDirectory: boolean;

}



export class FtpTreeDataProvider implements TreeDataProvider<FtpNode> {

	private _onDidChange: vscode.EventEmitter<FtpNode> = new vscode.EventEmitter<FtpNode>();
	readonly onDidChangeTreeData = this._onDidChange.event;

	constructor(private readonly fileSystemProvider: FtpFileSystemProvider) { }

	refresh() {
		this._onDidChange.fire();
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
		return this.fileSystemProvider.readdir(element ? element.resource : this.fileSystemProvider.root)
			.then((result: [vscode.Uri, vscode.FileStat][]) => this.sort(result.map(r => ({ resource: r[0], isDirectory: r[1].type !== vscode.FileType.File }))));
	}

	public getParent(element: FtpNode): FtpNode {
		const parent = vscode.Uri.parse(dirname(element.resource.fsPath));
		return parent.fsPath !== this.fileSystemProvider.root.fsPath ? { resource: parent, isDirectory: true } : null;
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
}


export class FtpExplorer {

	private ftpViewer: TreeView<FtpNode>;

	constructor(context: vscode.ExtensionContext) {
		const fileProvider = new FtpFileSystemProvider(vscode.Uri.parse('ftp://mirror.switch.ch/'), 'anonymous', 'anonymous@anonymous.de')
		const treeDataProvider = new FtpTreeDataProvider(fileProvider);
		context.subscriptions.push(vscode.workspace.registerFileSystemProvider('ftp', fileProvider));

		this.ftpViewer = vscode.window.createTreeView('ftpExplorer', { treeDataProvider });

		vscode.commands.registerCommand('ftpExplorer.refresh', () => treeDataProvider.refresh());
		vscode.commands.registerCommand('ftpExplorer.openFtpResource', resource => this.openResource(resource));
		vscode.commands.registerCommand('ftpExplorer.revealResource', () => this.reveal());
	}

	private openResource(resource: vscode.Uri): void {
		vscode.workspace.openTextDocument(resource).then(document => vscode.window.showTextDocument(document));
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
		return { resource: vscode.Uri.parse('ftp://mirror.switch.ch/doc/standard/README.txt'), isDirectory: false };
	}
}