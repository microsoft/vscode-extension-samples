// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { JSFIDDLE_SCHEME } from './fiddleRepository';
import { FiddleSourceControl, CONFIGURATION_FILE } from './fiddleSourceControl';
import { JSFiddleDocumentContentProvider } from './fiddleDocumentContentProvider';
import * as path from 'path';
import * as afs from './afs';
import { FiddleConfiguration, parseFiddleId } from './fiddleConfiguration';
import { firstIndex, UTF8 } from './util';

const SOURCE_CONTROL_OPEN_COMMAND = 'extension.source-control.open';
let jsFiddleDocumentContentProvider: JSFiddleDocumentContentProvider;
const fiddleSourceControlRegister = new Map<vscode.Uri, FiddleSourceControl>();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "source-control-sample" is now active!');

	jsFiddleDocumentContentProvider = new JSFiddleDocumentContentProvider();

	try {
		await initializeFromConfigurationFile(context);
	}
	catch (err) {
		console.log('Failed to initialize a Fiddle workspace.');
		vscode.window.showErrorMessage(err);
	}

	const openCommand = vscode.commands.registerCommand(SOURCE_CONTROL_OPEN_COMMAND,
		(fiddleId?: string, workspaceUri?: vscode.Uri) => {
			tryOpenFiddle(context, fiddleId, workspaceUri);
		});
	context.subscriptions.push(openCommand);

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(JSFIDDLE_SCHEME, jsFiddleDocumentContentProvider));

	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.refresh",
		async (sourceControlPane: vscode.SourceControl) => {
			const sourceControl = await pickSourceControl(sourceControlPane);
			if (sourceControl) { sourceControl.refresh(); }
		}));
	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.discard",
		async (sourceControlPane: vscode.SourceControl) => {
			const sourceControl = await pickSourceControl(sourceControlPane);
			if (sourceControl) { sourceControl.resetFilesToCheckedOutVersion(); }
		}));
	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.commit",
		async (sourceControlPane: vscode.SourceControl) => {
			const sourceControl = await pickSourceControl(sourceControlPane);
			if (sourceControl) { sourceControl.commitAll(); }
		}));
	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.checkout",
		async (sourceControl: FiddleSourceControl, newVersion?: number) => {
			sourceControl = sourceControl || await pickSourceControl(null);
			if (sourceControl) { sourceControl.tryCheckout(newVersion); }
		}));
	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.browse",
		async (sourceControlPane: vscode.SourceControl) => {
			const sourceControl = await pickSourceControl(sourceControlPane);
			if (sourceControl) { sourceControl.openInBrowser(); }
		}));


	context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(e => {
		try {
			// initialize new source control for manually added workspace folders
			e.added.forEach(wf => {
				initializeFolderFromConfigurationFile(wf, context);
			});
		} catch (ex) {
			vscode.window.showErrorMessage(ex.message);
		} finally {
			// dispose source control for removed workspace folders
			e.removed.forEach(wf => {
				unregisterFiddleSourceControl(wf.uri);
			});
		}
	}));
}

async function pickSourceControl(sourceControlPane: vscode.SourceControl): Promise<FiddleSourceControl | undefined> {
	if (sourceControlPane) {
		return fiddleSourceControlRegister.get(sourceControlPane.rootUri);
	}

	// todo: when/if the SourceControl exposes a 'selected' property, use that instead

	if (fiddleSourceControlRegister.size === 0) { return undefined; }
	else if (fiddleSourceControlRegister.size === 1) { return [...fiddleSourceControlRegister.values()][0]; }
	else {

		const picks = [...fiddleSourceControlRegister.values()].map(fsc => new RepositoryPick(fsc));

		if (vscode.window.activeTextEditor) {
			const activeWorkspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
			const activeSourceControl = activeWorkspaceFolder && fiddleSourceControlRegister.get(activeWorkspaceFolder.uri);
			const activeIndex = firstIndex(picks, pick => pick.fiddleSourceControl === activeSourceControl);

			// if there is an active editor, move its folder to be the first in the pick list
			if (activeIndex > -1) {
				picks.unshift(...picks.splice(activeIndex, 1));
			}
		}

		const pick = await vscode.window.showQuickPick(picks, { placeHolder: 'Select repository' });
		return pick && pick.fiddleSourceControl;
	}
}

async function tryOpenFiddle(context: vscode.ExtensionContext, fiddleId?: string, workspaceUri?: vscode.Uri): Promise<void> {
	try {
		await openFiddle(context, fiddleId, workspaceUri);
	}
	catch (ex) {
		vscode.window.showErrorMessage(ex);
		console.log(ex);
	}
}

async function openFiddle(context: vscode.ExtensionContext, fiddleId?: string, workspaceUri?: vscode.Uri) {
	if (workspaceUri && fiddleSourceControlRegister.has(workspaceUri)) { vscode.window.showErrorMessage("Another Fiddle was already open in this workspace. Open a new workspace first."); }

	if (!fiddleId) {
		fiddleId = (await vscode.window.showInputBox({ prompt: 'Paste JSFiddle ID and optionally version', placeHolder: 'slug or slug/version, e.g. u8B29/1', value: 'demo' })) || '';
	}

	const workspaceFolder =
		workspaceUri ?
			vscode.workspace.getWorkspaceFolder(workspaceUri) :
			await selectWorkspaceFolder(context, fiddleId);

	if (! await clearWorkspaceFolder(workspaceFolder.uri)) { return; }

	// show the file explorer with the three new files
	vscode.commands.executeCommand("workbench.view.explorer");

	// register source control
	const fiddleSourceControl = await FiddleSourceControl.fromFiddleId(fiddleId, context, workspaceFolder, true);

	registerFiddleSourceControl(fiddleSourceControl, context);
	showFiddleInEditor(fiddleSourceControl);
}

async function showFiddleInEditor(fiddleSourceControl: FiddleSourceControl): Promise<void> {
	// open the 3 fiddle parts in 3 view columns
	await openDocumentInColumn(fiddleSourceControl.getRepository().createLocalResourcePath('html'), vscode.ViewColumn.One);
	await openDocumentInColumn(fiddleSourceControl.getRepository().createLocalResourcePath('js'), vscode.ViewColumn.Two);
	await openDocumentInColumn(fiddleSourceControl.getRepository().createLocalResourcePath('css'), vscode.ViewColumn.Three);
}

function registerFiddleSourceControl(fiddleSourceControl: FiddleSourceControl, context: vscode.ExtensionContext) {
	// update the fiddle document content provider with the latest content
	jsFiddleDocumentContentProvider.updated(fiddleSourceControl.getFiddle());

	// every time the repository is updated with new fiddle version, notify the content provider
	fiddleSourceControl.onRepositoryChange(fiddle => jsFiddleDocumentContentProvider.updated(fiddle));

	if (fiddleSourceControlRegister.has(fiddleSourceControl.getWorkspaceFolder().uri)) {
		// the folder was already under source control
		const previousSourceControl = fiddleSourceControlRegister.get(fiddleSourceControl.getWorkspaceFolder().uri)!;
		previousSourceControl.dispose();
	}

	fiddleSourceControlRegister.set(fiddleSourceControl.getWorkspaceFolder().uri, fiddleSourceControl);

	context.subscriptions.push(fiddleSourceControl);
}

function unregisterFiddleSourceControl(folderUri: vscode.Uri): void {
	if (fiddleSourceControlRegister.has(folderUri)) {
		const previousSourceControl = fiddleSourceControlRegister.get(folderUri)!;
		previousSourceControl.dispose();

		fiddleSourceControlRegister.delete(folderUri);
	}
}

/**
 * When the extension starts up, it must visit all workspace folders to see if any of them are fiddles.
 * @param context extension context
 */
async function initializeFromConfigurationFile(context: vscode.ExtensionContext): Promise<void> {
	if (!vscode.workspace.workspaceFolders) { return; }

	const folderPromises = vscode.workspace.workspaceFolders.map(async (folder) => await initializeFolderFromConfigurationFile(folder, context));
	await Promise.all(folderPromises);
}

async function initializeFolderFromConfigurationFile(folder: vscode.WorkspaceFolder, context: vscode.ExtensionContext): Promise<void> {
	const configurationPath = path.join(folder.uri.fsPath, CONFIGURATION_FILE);

	const configFileExists = await afs.exists(configurationPath);

	if (configFileExists) {
		const data = await afs.readFile(configurationPath);
		const fiddleConfiguration = <FiddleConfiguration>JSON.parse(data.toString(UTF8));
		const fiddleSourceControl = await FiddleSourceControl.fromConfiguration(fiddleConfiguration, folder, context, !fiddleConfiguration.downloaded);
		registerFiddleSourceControl(fiddleSourceControl, context);
		if (!fiddleConfiguration.downloaded) {
			// the fiddle was not downloaded before the extension restart, so let's show it now
			showFiddleInEditor(fiddleSourceControl);
		}
	}
}

async function selectWorkspaceFolder(context: vscode.ExtensionContext, fiddleId: string): Promise<vscode.WorkspaceFolder | undefined> {
	let selectedFolder: vscode.WorkspaceFolder | undefined;
	let workspaceFolderUri: vscode.Uri | undefined;
	let workspaceFolderIndex: number | undefined;
	let folderOpeningMode: FolderOpeningMode;

	const folderPicks: WorkspaceFolderPick[] = [newFolderPick];

	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		folderPicks.push(newWorkspaceFolderPick);

		for (const wf of vscode.workspace.workspaceFolders) {
			const content = await afs.readdir(wf.uri.fsPath);
			folderPicks.push(new ExistingWorkspaceFolderPick(wf, content));
		}
	}

	const selectedFolderPick: WorkspaceFolderPick =
		folderPicks.length === 1 ?
			folderPicks[0] :
			await vscode.window.showQuickPick(folderPicks, {
				canPickMany: false, ignoreFocusOut: true, placeHolder: 'Pick workspace folder to create files in.'
			});

	if (!selectedFolderPick) { return null; }

	if (selectedFolderPick instanceof ExistingWorkspaceFolderPick) {
		selectedFolder = selectedFolderPick.workspaceFolder;
		workspaceFolderIndex = selectedFolder.index;
		workspaceFolderUri = selectedFolder.uri;
	}

	// eslint-disable-next-line prefer-const
	folderOpeningMode = selectedFolderPick.folderOpeningMode;

	if (!workspaceFolderUri && !selectedFolder) {
		const folderUris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false, openLabel: 'Select folder' });
		if (!folderUris) {
			return null;
		}

		workspaceFolderUri = folderUris[0];
		// was such workspace folder already open?
		workspaceFolderIndex = vscode.workspace.workspaceFolders && firstIndex(vscode.workspace.workspaceFolders, (folder1: any) => folder1.uri.toString() === workspaceFolderUri!.toString());
	}

	if (! await clearWorkspaceFolder(workspaceFolderUri)) { return null; }

	const fiddleConfiguration = parseFiddleId(fiddleId);

	// save folder configuration
	FiddleSourceControl.saveConfiguration(workspaceFolderUri, fiddleConfiguration);

	if (folderOpeningMode === FolderOpeningMode.AddToWorkspace || folderOpeningMode === undefined) {
		const workSpacesToReplace = typeof workspaceFolderIndex === 'number' && workspaceFolderIndex > -1 ? 1 : 0;
		if (workspaceFolderIndex === undefined || workspaceFolderIndex < 0) { workspaceFolderIndex = 0; }

		// replace or insert the workspace
		if (workspaceFolderUri) {
			vscode.workspace.updateWorkspaceFolders(workspaceFolderIndex, workSpacesToReplace, { uri: workspaceFolderUri });
		}
	}
	else if (folderOpeningMode === FolderOpeningMode.OpenFolder) {
		vscode.commands.executeCommand("vscode.openFolder", workspaceFolderUri);
	}

	return selectedFolder;
}

async function clearWorkspaceFolder(workspaceFolderUri: vscode.Uri): Promise<boolean> {

	if (!workspaceFolderUri) { return undefined; }

	// check if the workspace is empty, or clear it
	const existingWorkspaceFiles: string[] = await afs.readdir(workspaceFolderUri.fsPath);
	if (existingWorkspaceFiles.length > 0) {
		const answer = await vscode.window.showQuickPick(["Yes", "No"],
			{ placeHolder: `Remove ${existingWorkspaceFiles.length} file(s) from the folder ${workspaceFolderUri.fsPath} before cloning the remote repository?` });
		if (!answer) { return false; }

		if (answer === "Yes") {
			existingWorkspaceFiles
				.forEach(async filename =>
					await afs.unlink(path.join(workspaceFolderUri.fsPath, filename)));
		}
	}

	return true;
}

class RepositoryPick implements vscode.QuickPickItem {

	constructor(public readonly fiddleSourceControl: FiddleSourceControl) { }

	get label(): string {
		return this.fiddleSourceControl.getSourceControl().label;
	}
}

async function openDocumentInColumn(fileName: string, column: vscode.ViewColumn): Promise<void> {
	const uri = vscode.Uri.file(fileName);

	// assuming the file was saved, let's open it in a view column
	const doc = await vscode.workspace.openTextDocument(uri);

	await vscode.window.showTextDocument(doc, { viewColumn: column });
}

abstract class WorkspaceFolderPick implements vscode.QuickPickItem {
	abstract get label(): string;
	constructor(public folderOpeningMode: FolderOpeningMode) { }
}

class ExistingWorkspaceFolderPick extends WorkspaceFolderPick {

	constructor(public readonly workspaceFolder: vscode.WorkspaceFolder, private content: string[]) {
		super(FolderOpeningMode.AddToWorkspace);
	}

	get label(): string {
		return this.workspaceFolder.name;
	}

	get description(): string {
		return this.workspaceFolder.uri.fsPath;
	}

	get detail(): string {
		return this.content.length ? `${this.content.length} files/directories may need to be removed..` : null;
	}
}

class NewWorkspaceFolderPick extends WorkspaceFolderPick {
	constructor(public label: string, folderOpeningMode: FolderOpeningMode) {
		super(folderOpeningMode);
	}
}

enum FolderOpeningMode { AddToWorkspace, OpenFolder }

const newWorkspaceFolderPick = new NewWorkspaceFolderPick("Select/create a local folder to add to this workspace...", FolderOpeningMode.AddToWorkspace);
const newFolderPick = new NewWorkspaceFolderPick("Select/create a local folder...", FolderOpeningMode.OpenFolder);
