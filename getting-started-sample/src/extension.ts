// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
	context.subscriptions.push(vscode.commands.registerCommand('getting-started-sample.runCommand', async () => {
		await new Promise(resolve => setTimeout(resolve, 1000));
		vscode.commands.executeCommand('getting-started-sample.sayHello', vscode.Uri.joinPath(context.extensionUri, 'sample-folder'));
	}));

	context.subscriptions.push(vscode.commands.registerCommand('getting-started-sample.changeSetting', async () => {
		await new Promise(resolve => setTimeout(resolve, 1000));
		vscode.workspace.getConfiguration('getting-started-sample').update('sampleSetting', true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('getting-started-sample.setContext', async () => {
		await new Promise(resolve => setTimeout(resolve, 1000));
		vscode.commands.executeCommand('setContext', 'gettingStartedContextKey', true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('getting-started-sample.sayHello', () => {
		vscode.window.showInformationMessage('Hello');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('getting-started-sample.viewSources', () => {
		return { openFolder: vscode.Uri.joinPath(context.extensionUri, 'src') }; 
	}));
}