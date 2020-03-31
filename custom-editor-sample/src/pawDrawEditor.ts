import * as crypto from 'crypto';
import * as path from 'path';
import * as vscode from 'vscode';
import { getNonce } from './util';

/**
 * Define the type of edits used in paw draw files.
 */
interface PawDrawEdit {
	readonly color: string;
	readonly stroke: ReadonlyArray<[number, number]>;
}

/**
 * Define our document type.
 */
class PawDrawDocument extends vscode.CustomDocument<PawDrawEdit> {
	constructor(
		uri: vscode.Uri,
		public readonly initialContent: Uint8Array,
	) {
		super(PawDrawEditorProvider.viewType, uri);
	}
}

/**
 * Provider for paw draw editors.
 * 
 * Paw draw editors are used for `.pawDraw` files, which are just `.png` files with a different file extension.
 * 
 * This provider demonstrates:
 * 
 * - How to implement a custom editor for binary files.
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Communication between VS Code and the custom editor.
 * - Using CustomDocuments to store information that is shared between multiple custom editors.
 * - Implementing save, undo, redo, and revert.
 * - Backing up a custom editor.
 */
export class PawDrawEditorProvider implements vscode.CustomEditorProvider<PawDrawEdit>, vscode.CustomEditorEditingDelegate<PawDrawEdit> {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		return vscode.window.registerCustomEditorProvider(
			PawDrawEditorProvider.viewType,
			new PawDrawEditorProvider(context),
			{
				// For this demo extension, we enable `retainContextWhenHidden` which keeps the 
				// webview alive even when it is not visible. You should avoid using this setting
				// unless is absolutely required as it does have memory overhead.
				webviewOptions: {
					retainContextWhenHidden: true,
				}
			});
	}

	public static readonly viewType = 'catEdit.pawDraw';

	/**
	 * Map from resource to webview panels.
	 */
	private readonly _allWebviews = new Map<string, Set<vscode.WebviewPanel>>();

	private readonly backupFolder = 'pawDraw';

	constructor(
		private readonly _context: vscode.ExtensionContext
	) { }

	// By setting an `editingDelegate`, we enable editing for our custom editor.
	public readonly editingDelegate = this;

	async openCustomDocument(
		uri: vscode.Uri,
		_token: vscode.CancellationToken
	): Promise<vscode.CustomDocument<PawDrawEdit>> {
		// Check for backup first
		const backupResource = this.getBackupResource(uri);

		// If we have a backup, read that. Otherwise read the resource from the workspace
		let dataFile = uri;
		if (backupResource && await exists(backupResource)) {
			dataFile = backupResource;
		}

		const fileData = await vscode.workspace.fs.readFile(dataFile);
		return new PawDrawDocument(uri, fileData);
	}

	async resolveCustomEditor(
		document: PawDrawDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		const resourceKey = document.uri.toString();

		const webviews = this._allWebviews.get(resourceKey) || new Set();
		webviews.add(webviewPanel);
		this._allWebviews.set(resourceKey, webviews);

		webviewPanel.onDidDispose(() => {
			const webviews = this._allWebviews.get(resourceKey);
			if (!webviews) {
				return;
			}

			webviews.delete(webviewPanel);
			if (!webviews.size) {
				this._allWebviews.delete(resourceKey);
			}
		});

		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		webviewPanel.webview.onDidReceiveMessage(e => this.onMessage(document, e));

		// Wait for the webview to be properly ready before we init
		webviewPanel.webview.onDidReceiveMessage(e => {
			if (e.type === 'ready') {
				this.postMessage(webviewPanel, 'init', {
					value: document.initialContent
				});
			}
		});
	}

	/**
	 * Get the static HTML used for in our editor's webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.file(
			path.join(this._context.extensionPath, 'media', 'pawDraw.js')
		));
		const styleUri = webview.asWebviewUri(vscode.Uri.file(
			path.join(this._context.extensionPath, 'media', 'pawDraw.css')
		));

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleUri}" rel="stylesheet" />

				<title>Paw Draw</title>
			</head>
			<body>
				<div class="drawing-canvas"></div>

				<div class="drawing-controls">
					<button data-color="black" class="black active" title="Black"></button>
					<button data-color="white" class="white" title="White"></button>
					<button data-color="red" class="red" title="Red"></button>
					<button data-color="green" class="green" title="Green"></button>
					<button data-color="blue" class="blue" title="Blue"></button>
				</div>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	// #region CustomEditorEditingDelegate

	private readonly _onDidEdit = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<PawDrawEdit>>();
	public readonly onDidEdit = this._onDidEdit.event;

	async save(document: PawDrawDocument, _cancellation: vscode.CancellationToken): Promise<void> {
		await this.saveAs(document, document.uri);
		this.deleteBackup(document);
	}

	async saveAs(document: PawDrawDocument, targetResource: vscode.Uri): Promise<void> {
		const webviews = this._allWebviews.get(document.uri.toString());
		if (!webviews || !webviews.size) {
			throw new Error('Could not find webview to save for');
		}
		const [panel] = webviews.values();
		const response = await this.postMessageWithResponse<{ data: number[] }>(panel, 'getFileData', {});
		const fileData = new Uint8Array(response.data);
		vscode.workspace.fs.writeFile(targetResource, fileData);
	}

	async applyEdits(document: PawDrawDocument, _edits: readonly PawDrawEdit[]): Promise<void> {
		this.updateWebviews(document);
	}

	async undoEdits(document: PawDrawDocument, _edits: readonly PawDrawEdit[]): Promise<void> {
		this.updateWebviews(document);
	}

	async revert(document: PawDrawDocument, _edits: vscode.CustomDocumentRevert<PawDrawEdit>): Promise<void> {
		this.updateWebviews(document);
		this.deleteBackup(document);
	}

	async backup(document: PawDrawDocument, _cancellation: vscode.CancellationToken): Promise<void> {
		if (!this._context.storagePath) {
			return;
		}

		const dir = path.join(this._context.storagePath, this.backupFolder);
		await vscode.workspace.fs.createDirectory(vscode.Uri.file(dir));

		const backupResource = this.getBackupResource(document.uri);
		if (backupResource) {
			await this.saveAs(document, backupResource);
		}
	}

	private getBackupResource(uri: vscode.Uri): vscode.Uri | undefined {
		if (!this._context.storagePath) {
			return undefined;
		}
		const dir = path.join(this._context.storagePath, this.backupFolder);
		const fileName = crypto.createHash('sha256').update(uri.toString(), 'utf8').digest('hex');

		return vscode.Uri.file(path.join(dir, fileName));
	}

	private async deleteBackup(document: PawDrawDocument) {
		const backupResource = this.getBackupResource(document.uri);
		if (!backupResource) {
			return;
		}

		try {
			await vscode.workspace.fs.delete(backupResource);
		} catch {
			// noop
		}
	}

	// #endregion

	public updateWebviews(document: PawDrawDocument) {
		for (const webviewPanel of this._allWebviews.get(document.uri.toString()) || []) {
			this.postMessage(webviewPanel, 'update', {
				edits: document.appliedEdits,
			});
		}
	}

	private _requestId = 1;
	private readonly _callbacks = new Map<number, (response: any) => void>();

	private postMessageWithResponse<R = unknown>(panel: vscode.WebviewPanel, type: string, body: any): Promise<R> {
		const requestId = this._requestId++;
		const p = new Promise<R>(resolve => this._callbacks.set(requestId, resolve));
		panel.webview.postMessage({ type, requestId, body });
		return p;
	}

	private postMessage(panel: vscode.WebviewPanel, type: string, body: any): void {
		panel.webview.postMessage({ type, body });
	}

	private onMessage(document: PawDrawDocument, message: any) {
		switch (message.type) {
			case 'stroke':
				// Tell VS Code that an edit has ocurred
				this._onDidEdit.fire({
					document,
					label: "Stroke",
					edit: {
						color: message.color,
						stroke: message.stroke,
					},
				});

				// Make sure other webviews also know about this
				this.updateWebviews(document);
				return;

			case 'response':
				const callback = this._callbacks.get(message.requestId);
				if (callback) {
					callback(message.body);
				}
				return;
		}
	}
}

async function exists(backupResource: vscode.Uri): Promise<boolean> {
	try {
		await vscode.workspace.fs.stat(backupResource);
		return true;
	} catch {
		return false;
	}
}

