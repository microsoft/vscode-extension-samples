import * as vscode from 'vscode';
import { FiddleRepository, toExtension, downloadFiddle, areIdentical, uploadFiddle, Fiddle, toFiddleId } from './fiddleRepository';
import * as path from 'path';
import * as afs from './afs';
import { FiddleConfiguration, parseFiddleId } from './fiddleConfiguration';
import { UTF8 } from './util';

export const CONFIGURATION_FILE = '.jsfiddle';

export class FiddleSourceControl implements vscode.Disposable {
	private jsFiddleScm: vscode.SourceControl;
	private changedResources: vscode.SourceControlResourceGroup;
	private fiddleRepository: FiddleRepository;
	private latestFiddleVersion: number = Number.POSITIVE_INFINITY; // until actual value is established
	private _onRepositoryChange = new vscode.EventEmitter<Fiddle>();
	private timeout?: NodeJS.Timer;
	private fiddle!: Fiddle;

	constructor(context: vscode.ExtensionContext, private readonly workspaceFolder: vscode.WorkspaceFolder, fiddle: Fiddle, download: boolean) {
		this.jsFiddleScm = vscode.scm.createSourceControl('jsfiddle', 'JSFiddle #' + fiddle.slug, workspaceFolder.uri);
		this.changedResources = this.jsFiddleScm.createResourceGroup('workingTree', 'Changes');
		this.fiddleRepository = new FiddleRepository(workspaceFolder, fiddle.slug);
		this.jsFiddleScm.quickDiffProvider = this.fiddleRepository;
		this.jsFiddleScm.inputBox.placeholder = 'Message is ignored by JS Fiddle :-]';

		const fileSystemWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspaceFolder, "*.*"));
		fileSystemWatcher.onDidChange(uri => this.onResourceChange(uri), context.subscriptions);
		fileSystemWatcher.onDidCreate(uri => this.onResourceChange(uri), context.subscriptions);
		fileSystemWatcher.onDidDelete(uri => this.onResourceChange(uri), context.subscriptions);

		context.subscriptions.push(this.jsFiddleScm);
		context.subscriptions.push(fileSystemWatcher);

		// clone fiddle to the local workspace
		this.setFiddle(fiddle, download);

		if (this.fiddle.version === undefined || Number.isNaN(this.fiddle.version)) {
			this.establishVersion();
		} else {
			this.refresh();
		}
	}

	static async fromFiddleId(id: string, context: vscode.ExtensionContext, workspaceFolder: vscode.WorkspaceFolder, overwrite: boolean): Promise<FiddleSourceControl> {
		const fiddleConfiguration = parseFiddleId(id);

		return await FiddleSourceControl.fromConfiguration(fiddleConfiguration, workspaceFolder, context, overwrite);
	}

	static async fromConfiguration(configuration: FiddleConfiguration, workspaceFolder: vscode.WorkspaceFolder, context: vscode.ExtensionContext, overwrite: boolean): Promise<FiddleSourceControl> {
		return await FiddleSourceControl.fromFiddle(configuration.slug, configuration.version, workspaceFolder, context, overwrite);
	}

	private static async fromFiddle(fiddleSlug: string, fiddleVersion: number, workspaceFolder: vscode.WorkspaceFolder, context: vscode.ExtensionContext, overwrite: boolean): Promise<FiddleSourceControl> {
		const fiddle = await downloadFiddle(fiddleSlug, fiddleVersion);
		const workspacePath = workspaceFolder.uri.fsPath;
		return new FiddleSourceControl(context, workspaceFolder, fiddle, overwrite);
	}

	private refreshStatusBar() {
		this.jsFiddleScm.statusBarCommands = [
			{
				"command": "extension.source-control.checkout",
				"arguments": [this],
				"title": `↕ ${this.fiddle.slug} #${this.fiddle.version} / ${this.latestFiddleVersion}`,
				"tooltip": "Checkout another version of this fiddle.",
			}
		];
	}

	async commitAll(): Promise<void> {
		if (!this.changedResources.resourceStates.length) {
			vscode.window.showErrorMessage("There is nothing to commit.");
		}
		else if (this.fiddle.version < this.latestFiddleVersion) {
			vscode.window.showErrorMessage("Checkout the latest fiddle version before committing your changes.");
		}
		else {
			const html = await this.getLocalResourceText('html');
			const js = await this.getLocalResourceText('js');
			const css = await this.getLocalResourceText('css');

			// here we assume nobody updated the Fiddle on the server since we refreshed the list of versions
			try {
				const newFiddle = await uploadFiddle(this.fiddle.slug, this.fiddle.version + 1, html, js, css);
				if (!newFiddle) { return; }
				this.setFiddle(newFiddle, false);
				this.jsFiddleScm.inputBox.value = '';
			} catch (ex) {
				vscode.window.showErrorMessage("Cannot commit changes to JS Fiddle. " + ex.message);
			}
		}
	}

	private async getLocalResourceText(extension: string) {
		const document = await vscode.workspace.openTextDocument(this.fiddleRepository.createLocalResourcePath(extension));
		return document.getText();
	}

	/**
	 * Throws away all local changes and resets all files to the checked out version of the repository.
	 */
	resetFilesToCheckedOutVersion(): void {
		this.resetFile('html');
		this.resetFile('css');
		this.resetFile('js');
	}

	/** Resets the given local file content to the checked-out version. */
	private async resetFile(extension: string): Promise<void> {
		const filePath = this.fiddleRepository.createLocalResourcePath(extension);
		await afs.writeFile(filePath, this.fiddle.data[extension]);
	}

	async tryCheckout(newVersion: number | undefined): Promise<void> {
		if (!Number.isFinite(this.latestFiddleVersion)) { return; }

		if (newVersion === undefined) {
			const allVersions = [...Array(this.latestFiddleVersion + 1).keys()]
				.map(ver => new VersionQuickPickItem(ver, ver === this.fiddle.version));
			const newVersionPick = await vscode.window.showQuickPick(allVersions, { canPickMany: false, placeHolder: 'Select a version...' });
			if (newVersionPick) {
				newVersion = newVersionPick.version;
			}
			else {
				return;
			}
		}

		if (newVersion === this.fiddle.version) { return; } // the same version was selected

		if (this.changedResources.resourceStates.length) {
			const changedResourcesCount = this.changedResources.resourceStates.length;
			vscode.window.showErrorMessage(`There is one or more changed resources. Discard or commit your local changes before checking out another version.`);
		}
		else {
			try {
				const newFiddle = await downloadFiddle(this.fiddle.slug, newVersion);
				this.setFiddle(newFiddle, true);
			} catch (ex) {
				vscode.window.showErrorMessage(ex);
			}
		}
	}

	private setFiddle(newFiddle: Fiddle, overwrite: boolean) {
		if (newFiddle.version > this.latestFiddleVersion) { this.latestFiddleVersion = newFiddle.version; }
		this.fiddle = newFiddle;
		if (overwrite) { this.resetFilesToCheckedOutVersion(); } // overwrite local file content
		this._onRepositoryChange.fire(this.fiddle);
		this.refreshStatusBar();

		this.saveCurrentConfiguration();
	}

	getFiddle(): Fiddle {
		return this.fiddle;
	}

	getWorkspaceFolder(): vscode.WorkspaceFolder {
		return this.workspaceFolder;
	}

	getSourceControl(): vscode.SourceControl {
		return this.jsFiddleScm;
	}

	getRepository(): FiddleRepository {
		return this.fiddleRepository;
	}

	/** save configuration for later VS Code sessions */
	private saveCurrentConfiguration(): void {
		const fiddleConfiguration: FiddleConfiguration = {
			slug: this.fiddle.slug,
			version: this.fiddle.version,
			downloaded: true
		};

		FiddleSourceControl.saveConfiguration(this.workspaceFolder.uri, fiddleConfiguration);
	}

	static saveConfiguration(workspaceFolderUri: vscode.Uri, fiddleConfiguration: FiddleConfiguration): void {
		const fiddleConfigurationString = JSON.stringify(fiddleConfiguration);
		afs.writeFile(path.join(workspaceFolderUri.fsPath, CONFIGURATION_FILE), Buffer.from(fiddleConfigurationString, UTF8));
	}

	get onRepositoryChange(): vscode.Event<Fiddle> {
		return this._onRepositoryChange.event;
	}

	onResourceChange(_uri: vscode.Uri): void {
		if (this.timeout) { clearTimeout(this.timeout); }
		this.timeout = setTimeout(() => this.tryUpdateChangedGroup(), 500);
	}

	async tryUpdateChangedGroup(): Promise<void> {
		try {
			await this.updateChangedGroup();
		}
		catch (ex) {
			vscode.window.showErrorMessage(ex);
		}
	}

	/** This is where the source control determines, which documents were updated, removed, and theoretically added. */
	async updateChangedGroup(): Promise<void> {
		// for simplicity we ignore which document was changed in this event and scan all of them
		const changedResources: vscode.SourceControlResourceState[] = [];

		const uris = this.fiddleRepository.provideSourceControlledResources();

		for (const uri of uris) {
			let isDirty: boolean;
			let wasDeleted: boolean;

			const pathExists = await afs.exists(uri.fsPath);

			if (pathExists) {
				const document = await vscode.workspace.openTextDocument(uri);
				isDirty = this.isDirty(document);
				wasDeleted = false;
			}
			else {
				isDirty = true;
				wasDeleted = true;
			}

			if (isDirty) {
				const resourceState = this.toSourceControlResourceState(uri, wasDeleted);
				changedResources.push(resourceState);
			}
		}

		this.changedResources.resourceStates = changedResources;

		// the number of modified resources needs to be assigned to the SourceControl.count filed to let VS Code show the number.
		this.jsFiddleScm.count = this.changedResources.resourceStates.length;
	}

	/** Determines whether the resource is different, regardless of line endings. */
	isDirty(doc: vscode.TextDocument): boolean {
		const originalText = this.fiddle.data[toExtension(doc.uri)];
		return originalText.replace('\r', '') !== doc.getText().replace('\r', '');
	}

	toSourceControlResourceState(docUri: vscode.Uri, deleted: boolean): vscode.SourceControlResourceState {

		const repositoryUri = this.fiddleRepository.provideOriginalResource(docUri, null);

		const fiddlePart = toExtension(docUri).toUpperCase();

		const command: vscode.Command = !deleted
			? {
				title: "Show changes",
				command: "vscode.diff",
				arguments: [repositoryUri, docUri, `JSFiddle#${this.fiddle.slug} ${fiddlePart} ↔ Local changes`],
				tooltip: "Diff your changes"
			}
			: null;

		const resourceState: vscode.SourceControlResourceState = {
			resourceUri: docUri,
			command: command,
			decorations: {
				strikeThrough: deleted,
				tooltip: 'File was locally deleted.'
			}
		};

		return resourceState;
	}

	/**
	 * Refresh is used when the information on the server may have changed.
	 * For example another user updates the Fiddle online.
	 */
	async refresh(): Promise<void> {
		let latestVersion = this.fiddle.version || 0;
		while (true) {
			try {
				const latestFiddle = await downloadFiddle(this.fiddle.slug, latestVersion);
				this.latestFiddleVersion = latestVersion;
				latestVersion++;
			} catch (ex) {
				// typically the ex.statusCode == 404, when there is no further version
				break;
			}
		}

		this.refreshStatusBar();
	}

	/**
	 * Determines which version was checked out and finds the index of the latest version.
	 *
	 * When a fiddle is open by the hash code, the latest version is downloaded,
	 * but extension does not know what version it is.
	 */
	async establishVersion(): Promise<void> {
		let version = 0;
		let latestVersion = Number.NaN;
		let currentFiddle: Fiddle | undefined = undefined;
		while (true) {
			try {
				const latestFiddle = await downloadFiddle(this.fiddle.slug, version);
				latestVersion = version;
				version++;
				if (areIdentical(this.fiddle.data, latestFiddle.data)) {
					currentFiddle = latestFiddle;
				}
			} catch (ex) {
				// typically the ex.statusCode == 404, when there is no further version
				break;
			}
		}

		this.latestFiddleVersion = latestVersion;

		// now we know the version of the current fiddle, let's set it
		if (currentFiddle) {
			this.setFiddle(currentFiddle, false);
		}
	}

	/** Opens the fiddle in the default browser. */
	openInBrowser() {
		const url = "https://jsfiddle.net/" + toFiddleId(this.fiddle.slug, this.fiddle.version);
		vscode.env.openExternal(vscode.Uri.parse(url));
	}

	dispose() {
		this._onRepositoryChange.dispose();
		this.jsFiddleScm.dispose();
	}
}

class VersionQuickPickItem implements vscode.QuickPickItem {

	constructor(public readonly version: number, public readonly picked: boolean) {
	}

	get label(): string {
		return `Version ${this.version}`;
	}

	get description(): string {
		return this.picked ? '(currently checked-out)' : '';
	}

	get alwaysShow(): boolean {
		return this.picked;
	}
}
