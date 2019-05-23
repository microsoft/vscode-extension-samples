// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { JSFIDDLE_SCHEME } from './fiddleRepository';
import { FiddleSourceControl, CONFIGURATION_FILE } from './fiddleSourceControl';
import { JSFiddleDocumentContentProvider } from './fiddleDocumentContentProvider';
import * as path from 'path';
import { unlinkSync, readdirSync, existsSync, exists, readFile } from 'fs';
import { FiddleConfiguration, parseFiddleId } from './fiddleConfiguration';
import { firstIndex } from './util';

const SOURCE_CONTROL_OPEN_COMMAND = 'extension.source-control.open';
var jsFiddleDocumentContentProvider: JSFiddleDocumentContentProvider;
var fiddleSourceControlRegister = new Map<vscode.Uri, FiddleSourceControl>();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "source-control-sample" is now active!');

	jsFiddleDocumentContentProvider = new JSFiddleDocumentContentProvider();

	initializeFromConfigurationFile(context);

	let openCommand = vscode.commands.registerCommand(SOURCE_CONTROL_OPEN_COMMAND,
		(fiddleId?: string, workspaceUri?: vscode.Uri) => {
			tryOpenFiddle(context, fiddleId, workspaceUri);
		});
	context.subscriptions.push(openCommand);

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(JSFIDDLE_SCHEME, jsFiddleDocumentContentProvider));

	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.refresh",
		async (sourceControlPane: vscode.SourceControl) => {
			let sourceControl = await pickSourceControl(sourceControlPane);
			if (sourceControl) { sourceControl.refresh(); }
		}));
	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.discard",
		async (sourceControlPane: vscode.SourceControl) => {
			let sourceControl = await pickSourceControl(sourceControlPane);
			if (sourceControl) { sourceControl.resetFilesToCheckedOutVersion(); }
		}));
	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.commit",
		async (sourceControlPane: vscode.SourceControl) => {
			let sourceControl = await pickSourceControl(sourceControlPane);
			if (sourceControl) { sourceControl.commitAll(); }
		}));
	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.checkout",
		async (sourceControl: FiddleSourceControl, newVersion?: number) => {
			sourceControl = sourceControl || await pickSourceControl(null);
			if (sourceControl) { sourceControl.tryCheckout(newVersion); }
		}));
	context.subscriptions.push(vscode.commands.registerCommand("extension.source-control.browse",
		async (sourceControlPane: vscode.SourceControl) => {
			let sourceControl = await pickSourceControl(sourceControlPane);
			if (sourceControl) { sourceControl.openInBrowser(); }
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

		let picks = [...fiddleSourceControlRegister.values()].map(fsc => new RepositoryPick(fsc));

		if (vscode.window.activeTextEditor) {
			let activeWorkspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
			let activeSourceControl = activeWorkspaceFolder && fiddleSourceControlRegister.get(activeWorkspaceFolder.uri);
			let activeIndex = firstIndex(picks, pick => pick.fiddleSourceControl === activeSourceControl);

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

	let workspaceFolder =
		workspaceUri ?
			vscode.workspace.getWorkspaceFolder(workspaceUri) :
			await selectWorkspaceFolder(context, fiddleId);

	workspaceFolder = await clearWorkspaceFolder(workspaceFolder);
	if (!workspaceFolder) { return; } // canceled by user

	// show the file explorer with the three new files
	vscode.commands.executeCommand("workbench.view.explorer");

	// register source control
	let fiddleSourceControl = await FiddleSourceControl.fromFiddleId(fiddleId, context, workspaceFolder, true);

	registerFiddleSourceControl(fiddleSourceControl, context);

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

/**
 * When the extension starts up, it must visit all workspace folders to see if any of them are fiddles.
 * @param context extension context
 */
function initializeFromConfigurationFile(context: vscode.ExtensionContext): void {
	if (!vscode.workspace.workspaceFolders) { return; }

	vscode.workspace.workspaceFolders.forEach(folder => {
		const configurationPath = path.join(folder.uri.fsPath, CONFIGURATION_FILE);
		exists(configurationPath, configFileExists => {
			if (configFileExists) {
				readFile(configurationPath, { flag: 'r' }, async (err, data) => {
					if (err) { vscode.window.showErrorMessage(err.message); }
					try {
						let fiddleSourceControl = await FiddleSourceControl.fromConfiguration(<FiddleConfiguration>JSON.parse(data.toString("utf-8")), folder, context, false);
						registerFiddleSourceControl(fiddleSourceControl, context);
					} catch (ex) {
						vscode.window.showErrorMessage(ex);
					}
				});
			}
		});
	});
}

async function selectWorkspaceFolder(context: vscode.ExtensionContext, fiddleId: string): Promise<vscode.WorkspaceFolder | undefined> {
	var selectedFolder: vscode.WorkspaceFolder | undefined;
	var workspaceFolderUri: vscode.Uri | undefined;
	var workspaceFolderIndex: number | undefined;

	const fiddleConfiguration = parseFiddleId(fiddleId);

	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1) {
		selectedFolder = await vscode.window.showWorkspaceFolderPick({ placeHolder: 'Pick workspace folder to create files in.' });
		if (!selectedFolder) { return undefined; }

		workspaceFolderIndex = selectedFolder.index;
		workspaceFolderUri = selectedFolder.uri;
	}
	else if (!vscode.workspace.workspaceFolders) {
		let folderUris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false, openLabel: 'Select folder' });
		if (!folderUris) {
			return undefined;
		}

		workspaceFolderUri = folderUris[0];
		// was such workspace folder already open?
		workspaceFolderIndex = vscode.workspace.workspaceFolders && firstIndex(vscode.workspace.workspaceFolders, (folder1: any) => folder1.uri.toString() === workspaceFolderUri!.toString());

		// save folder configuration
		FiddleSourceControl.saveConfiguration(workspaceFolderUri, fiddleConfiguration);

		selectedFolder = undefined; // the extension will get reloaded in the context of the newly open workspace
	}
	else {
		selectedFolder = vscode.workspace.workspaceFolders[0];
	}

	let workSpacesToReplace = typeof workspaceFolderIndex === 'number' && workspaceFolderIndex > -1 ? 1 : 0;
	if (workspaceFolderIndex === undefined || workspaceFolderIndex < 0) { workspaceFolderIndex = 0; }

	// replace or insert the workspace
	if (workspaceFolderUri) {
		vscode.workspace.updateWorkspaceFolders(workspaceFolderIndex, workSpacesToReplace, { uri: workspaceFolderUri });
	}

	return selectedFolder;
}

async function clearWorkspaceFolder(workspaceFolder?: vscode.WorkspaceFolder): Promise<vscode.WorkspaceFolder | undefined> {

	if (!workspaceFolder) { return undefined; }

	// check if the workspace is empty, or clear it
	let existingWorkspaceFiles = readdirSync(workspaceFolder.uri.fsPath);
	if (existingWorkspaceFiles.length > 0) {
		let answer = await vscode.window.showQuickPick(["Yes", "No"],
			{ placeHolder: `Remove ${existingWorkspaceFiles.length} file(s) from the workspace before cloning the remote repository?` });
		if (answer === undefined) { return undefined; }

		if (answer === "Yes") {
			existingWorkspaceFiles
				.map(filename =>
					unlinkSync(path.join(workspaceFolder.uri.fsPath, filename)));
		}
	}

	return workspaceFolder;
}

// this method is called when your extension is deactivated
export function deactivate() { }

class RepositoryPick implements vscode.QuickPickItem {

	constructor(public readonly fiddleSourceControl: FiddleSourceControl) { }

	get label(): string {
		return this.fiddleSourceControl.getSourceControl().label;
	}
}

async function openDocumentInColumn(fileName: string, column: vscode.ViewColumn): Promise<void> {
	let uri = vscode.Uri.file(fileName);

	// assuming the file was saved, let's open it in a view column
	let doc = await vscode.workspace.openTextDocument(uri);

	await vscode.window.showTextDocument(doc, { viewColumn: column });
}