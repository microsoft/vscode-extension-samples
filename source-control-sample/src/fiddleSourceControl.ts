import * as vscode from 'vscode';
import { FiddleRepository, toExtension, downloadFiddle, areIdentical, uploadFiddle, Fiddle } from './fiddleRepository';
import * as path from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';

export class FiddleSourceControl implements vscode.Disposable {
	jsFiddleScm: vscode.SourceControl;
	changedResources: vscode.SourceControlResourceGroup;
	fiddleRepository: FiddleRepository;
	latestFiddleVersion: number = Number.POSITIVE_INFINITY; // until actual value is established
	private _onRepositoryChange = new vscode.EventEmitter<Fiddle>();

	constructor(context: vscode.ExtensionContext, private workspaceFolder: vscode.WorkspaceFolder, private documents: vscode.TextDocument[], public fiddle: Fiddle) {
		this.jsFiddleScm = vscode.scm.createSourceControl('jsfiddle', 'JSFiddle #' + fiddle.hash, workspaceFolder.uri);
		this.changedResources = this.jsFiddleScm.createResourceGroup('workingTree', 'Changes');
		this.fiddleRepository = new FiddleRepository(workspaceFolder, fiddle.hash);
		this.jsFiddleScm.quickDiffProvider = this.fiddleRepository;
		this.refreshStatusBar();

		context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => this.updateChangedGroup(e)));
		context.subscriptions.push(this.jsFiddleScm);
		context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.refresh", () => this.refresh()));
		context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.discard", () => this.resetFilesToCheckedOutVersion()));
		context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.commit", () => this.commitAll()));
		context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.checkout", newVersion => this.tryCheckout(newVersion)));

		if (Number.isNaN(this.fiddle.version)) {
			this.establishVersion();
		} else {
			this.refresh();
		}
	}

	static async fromFiddle(id: string, context: vscode.ExtensionContext, workspaceFolder: vscode.WorkspaceFolder): Promise<FiddleSourceControl> {
		let idFragments = id.split('/');
		let fiddleHash = idFragments[0];
		let fiddleVersion = idFragments.length > 1 ? parseInt(id.split('/')[1]) : undefined;

		let fiddle = await downloadFiddle(fiddleHash, fiddleVersion);

		let workspacePath = workspaceFolder.uri.fsPath;

		let documents = [
			await createDocument(fiddle.data.html, path.join(workspacePath, fiddleHash + '.html'), vscode.ViewColumn.One),
			await createDocument(fiddle.data.js, path.join(workspacePath, fiddleHash + '.js'), vscode.ViewColumn.Two),
			await createDocument(fiddle.data.css, path.join(workspacePath, fiddleHash + '.css'), vscode.ViewColumn.Three)
		];

		return new FiddleSourceControl(context, workspaceFolder, documents, fiddle);
	}

	private refreshStatusBar() {
		this.jsFiddleScm.statusBarCommands = [
			{
				"command": "extension.source-control.checkout",
				"title": `↕ ${this.fiddle.hash} #${this.fiddle.version} / ${this.latestFiddleVersion}`,
				"tooltip": "Checkout another version of this fiddle.",
			}
		];
	}

	async commitAll(): Promise<void> {
		if (this.fiddle.version < this.latestFiddleVersion) {
			vscode.window.showErrorMessage("Checkout the latest fiddle version before committing your chanes.");
		}
		else {
			let answer = await vscode.window.showQuickPick(["Yes, upload the changes to JS Fiddle.", "No, I was just clicking around."], 
				{ placeHolder: "Are you sure you want to commit?" });

			if (answer && answer.toLowerCase().startsWith("yes")) {
				let html = this.documents.find(doc => path.extname(doc.fileName) == ".html").getText();
				let js = this.documents.find(doc => path.extname(doc.fileName) == ".js").getText();
				let css = this.documents.find(doc => path.extname(doc.fileName) == ".css").getText();

				// here we assume nobody updated the Fiddle on the server since we refreshed the list of versions
				let newFiddle = await uploadFiddle(this.fiddle.hash, this.fiddle.version + 1, html, js, css);
				this.setFiddle(newFiddle);
			}
		}
	}

	/**
	 * Throws away all local changes and resets all files to the checked out version of the repository.
	 */
	resetFilesToCheckedOutVersion(): void {
		this.resetFile('html');
		this.resetFile('css');
		this.resetFile('js');
	}

	private resetFile(extension: string) {
		let filePath = path.join(this.workspaceFolder.uri.fsPath, this.fiddle.hash + '.' + extension);
		writeFileSync(filePath, this.fiddle.data[extension]);
	}

	async tryCheckout(newVersion: number | undefined): Promise<void> {
		if (!Number.isFinite(this.latestFiddleVersion)) return void 0;

		if (newVersion === undefined) {
			let allVersions = [...Array(this.latestFiddleVersion).keys()]
				.map(n => n + 1)
				.map(ver => new VersionQuickPickItem(ver, ver == this.fiddle.version));
			let newVersionPick = await vscode.window.showQuickPick(allVersions, { canPickMany: false, placeHolder: 'Select a version...' });
			if (newVersionPick) {
				newVersion = newVersionPick.version;
			}
			else {
				return void 0;
			}
		}

		if (this.changedResources.resourceStates.length) {
			let changedResourcesCount = this.changedResources.resourceStates.length;
			vscode.window.showErrorMessage(`There is one or more changed resources. Discard or commit your local changes before checking out another version.`);
		}
		else {
			try {
				let newFiddle = await downloadFiddle(this.fiddle.hash, newVersion);
				this.setFiddle(newFiddle);
			} catch (ex) {
				vscode.window.showErrorMessage(ex);
			}
		}
	}

	private setFiddle(newFiddle: Fiddle) {
		if (newFiddle.version > this.latestFiddleVersion) this.latestFiddleVersion = newFiddle.version;
		this.fiddle = newFiddle;
		this.resetFilesToCheckedOutVersion(); // overwrite local file content
		this._onRepositoryChange.fire(this.fiddle);
		this.refreshStatusBar();
	}

	/**
	 * Refresh is used when the information on the server may have changed.
	 * For example another user updates the Fiddle online.
	 */
	async refresh(): Promise<void> {
		let latestVersion = this.fiddle.version;
		while (true) {
			try {
				latestVersion++;
				let latestFiddle = await downloadFiddle(this.fiddle.hash, latestVersion);
			} catch (ex) {
				// typically the ex.statusCode == 404, when there is no further version
				break;
			}
		}

		this.latestFiddleVersion = latestVersion - 1;
		this.refreshStatusBar();
	}

	/**
	 * Determines which version was checked out and finds the index of the latest version.
	 */
	async establishVersion(): Promise<void> {
		let latestVersion = 0;
		let currentFiddle: Fiddle = undefined;
		while (true) {
			try {
				latestVersion++;
				let latestFiddle = await downloadFiddle(this.fiddle.hash, latestVersion);
				if (areIdentical(this.fiddle.data, latestFiddle.data)) {
					currentFiddle = latestFiddle;
				}
			} catch (ex) {
				// typically the ex.statusCode == 404, when there is no further version
				break;
			}
		}

		this.latestFiddleVersion = latestVersion - 1;

		// now we know the version of the current fiddle, let's set it
		this.setFiddle(currentFiddle);
	}


	get onRepositoryChange(): vscode.Event<Fiddle> {
		return this._onRepositoryChange.event;
	}

	updateChangedGroup(e: vscode.TextDocumentChangeEvent): any {
		this.changedResources.resourceStates = this.documents
			.filter(doc => this.isDirty(doc))
			.map(doc => this.toSourceControlResourceState(doc));
	}

	isDirty(doc: vscode.TextDocument): boolean {
		let originalText = this.fiddle.data[toExtension(doc.uri)];
		return originalText.replace('\r', '') != doc.getText().replace('\r', '');
	}

	toSourceControlResourceState(doc: vscode.TextDocument): vscode.SourceControlResourceState {

		let repositoryUri = this.fiddleRepository.provideOriginalResource(doc.uri, null);

		const fiddlePart = toExtension(doc.uri).toUpperCase();
		return {
			resourceUri: doc.uri,
			command: {
				title: "Show changes",
				command: "vscode.diff",
				arguments: [repositoryUri, doc.uri, `JSFiddle#${this.fiddle.hash} ${fiddlePart} ↔ Local changes`],
				tooltip: "Diff your changes"
			}
		};
	}

	dispose() {
		this._onRepositoryChange.dispose();
	}
}

class VersionQuickPickItem implements vscode.QuickPickItem {
	label: string;
	description?: string;
	detail?: string;
	alwaysShow?: boolean;

	constructor(public version: number, public picked: boolean) {
		this.label = this.version.toString();
		this.alwaysShow = picked;

		if (picked) {
			this.description = "Currently checked out.";
		}
	}
}


async function createDocument(content: string, fileName: string, column: vscode.ViewColumn): Promise<vscode.TextDocument> {
	if (existsSync(fileName)) {
		unlinkSync(fileName);
	}
	let fileUri = vscode.Uri.file(fileName).with({scheme: 'untitled'});
	let doc = await vscode.workspace.openTextDocument(fileUri);

	let edit = new vscode.WorkspaceEdit();
	edit.insert(doc.uri, new vscode.Position(0, 0), content);
	await vscode.workspace.applyEdit(edit);
	await doc.save();

	// now that the document is saved, let's get the document through the 'file' schema, not 'untitled'
	doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fileName));

	await vscode.window.showTextDocument(doc, { viewColumn: column});
	return doc;
}
