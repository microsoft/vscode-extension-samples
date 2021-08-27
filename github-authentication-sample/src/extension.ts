// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Credentials } from './credentials';


export async function activate(context: vscode.ExtensionContext) {
	const credentials = new Credentials();
	await credentials.initialize(context);
	
	const disposable = vscode.commands.registerCommand('extension.getGitHubUser', async () => {
		/**
		 * Octokit (https://github.com/octokit/rest.js#readme) is a library for making REST API
		 * calls to GitHub. It provides convenient typings that can be helpful for using the API.
		 * 
		 * Documentation on GitHub's REST API can be found here: https://docs.github.com/en/rest
		 */
		const octokit = await credentials.getOctokit();
		const userInfo = await octokit.users.getAuthenticated();

		vscode.window.showInformationMessage(`Logged into GitHub as ${userInfo.data.login}`);
	});

	context.subscriptions.push(disposable);
}
