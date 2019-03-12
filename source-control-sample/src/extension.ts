// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { JSFIDDLE_SCHEME } from './fiddleRepository';
import { FiddleSourceControl } from './fiddleSourceControl';
import { JSFiddleDocumentContentProvider } from './fiddleDocumentContentProvider';
import * as path from 'path';
import { unlinkSync, readdirSync } from 'fs';

const SOURCE_CONTROL_OPEN_COMMAND = 'extension.source-control.open';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "source-control-sample" is now active!');

	let fiddleId = context.globalState.get(FIDDLE_ID_TO_OPEN);
	if (fiddleId) {
		// new workspace folder was open and the extension needs to continue opening the fiddle files into it
		vscode.commands.executeCommand(SOURCE_CONTROL_OPEN_COMMAND, fiddleId);
		context.globalState.update(FIDDLE_ID_TO_OPEN, undefined);
	}

	const jsFiddleDocumentContentProvider = new JSFiddleDocumentContentProvider();
	let fiddleSourceControl: FiddleSourceControl = null;

	let disposable = vscode.commands.registerCommand(SOURCE_CONTROL_OPEN_COMMAND, async (id?: string) => {

		if (fiddleSourceControl) vscode.window.showErrorMessage("Another Fiddle was already open in this workspace. Open a new workspace first.");

		if (!id) {
			id = await vscode.window.showInputBox({ prompt: 'Paste JSFiddle ID and optionally version', placeHolder: 'hash or hash/version, e.g. u8B29/1', value: 'u8B29/1' });
		}

		try {

			let workspaceFolder = await clearWorkspaceFolder(await getWorkspaceFolder(context, id));
			if (!workspaceFolder) return; // canceled by user

			// show the file explorer with the three new files
			vscode.commands.executeCommand("workbench.view.explorer");

			// register source control
			let fiddleSourceControl = await FiddleSourceControl.fromFiddle(id, context, workspaceFolder);

			// update the fiddle document content provider with the latest content
			jsFiddleDocumentContentProvider.updated(fiddleSourceControl.fiddle);

			// every time the repository is updated with new fiddle version, notify the content provider
			fiddleSourceControl.onRepositoryChange(fiddle => jsFiddleDocumentContentProvider.updated(fiddle));

			context.subscriptions.push(fiddleSourceControl);
		}
		catch (ex) {
			vscode.window.showErrorMessage(ex);
			console.log(ex);
		}
	});

	vscode.workspace.registerTextDocumentContentProvider(JSFIDDLE_SCHEME, jsFiddleDocumentContentProvider);

	context.subscriptions.push(disposable);
}

const FIDDLE_ID_TO_OPEN = "fiddleIdToOpen";

async function getWorkspaceFolder(context: vscode.ExtensionContext, fiddleId: String): Promise<vscode.WorkspaceFolder> {
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1) {
		return await vscode.window.showWorkspaceFolderPick({ placeHolder: 'Pick workspace folder to create files in.' });
	}
	else if (!vscode.workspace.workspaceFolders) {
		let folderUris = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false, openLabel: 'Select folder' });
		if (!folderUris) {
			return null;
		}
		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: folderUris[0] });
		context.globalState.update(FIDDLE_ID_TO_OPEN, fiddleId);
		return null; // the extension will get reloaded in the context of the newly open workspace
	}
	else {
		return vscode.workspace.workspaceFolders[0];
	}
}

async function clearWorkspaceFolder(workspaceFolder: vscode.WorkspaceFolder): Promise<vscode.WorkspaceFolder> {

	if (!workspaceFolder) return null;

	// check if the workspace is empty, or clear it
	let existingWorkspaceFiles = readdirSync(workspaceFolder.uri.fsPath);
	if (existingWorkspaceFiles.length > 0) {
		let answer = await vscode.window.showQuickPick(["Yes", "No"],
			{ placeHolder: `Remove ${existingWorkspaceFiles.length} file(s) from the workspace before cloning the remote repository?` });
		if (answer === undefined) return null;

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
