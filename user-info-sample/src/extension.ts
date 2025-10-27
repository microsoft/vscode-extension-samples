// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as os from 'os';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('User Info Sample extension is now active!');

	// Register command to show user and workspace information
	const disposable = vscode.commands.registerCommand('userInfo.showInfo', () => {
		// Gather user and workspace information
		const workspaceName = vscode.workspace.name || 'No workspace opened';
		const workspaceFolders = vscode.workspace.workspaceFolders?.length || 0;
		const activeEditor = vscode.window.activeTextEditor;
		const activeFile = activeEditor?.document.fileName || 'No file opened';
		const userName = os.userInfo().username;
		const platform = os.platform();
		
		// Create information message
		const info = [
			`Username: ${userName}`,
			`Platform: ${platform}`,
			`Workspace: ${workspaceName}`,
			`Workspace Folders: ${workspaceFolders}`,
			`Active File: ${activeFile}`
		].join('\n');

		// Display the information
		vscode.window.showInformationMessage('User Info', { modal: true, detail: info });
	});

	context.subscriptions.push(disposable);
}
