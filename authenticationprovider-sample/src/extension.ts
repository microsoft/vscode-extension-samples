// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import 'isomorphic-fetch';
import * as vscode from 'vscode';
import { AzureDevOpsAuthenticationProvider } from './authProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vscode-authenticationprovider-sample" is now active!');

	// Register our authentication provider. NOTE: this will register the provider globally which means that
	// any other extension can use this provider via the `getSession` API.
	// NOTE: when implementing an auth provider, don't forget to register an activation event for that provider
	// in your package.json file: "onAuthenticationRequest:AzureDevOpsPAT"
	context.subscriptions.push(vscode.authentication.registerAuthenticationProvider(
		AzureDevOpsAuthenticationProvider.id,
		'Azure Repos',
		new AzureDevOpsAuthenticationProvider(context.secrets),
	));

	let disposable = vscode.commands.registerCommand('vscode-authenticationprovider-sample.login', async () => {
		// Get our PAT session.
		const session = await vscode.authentication.getSession(AzureDevOpsAuthenticationProvider.id, [], { createIfNone: true });

		try {
			// Make a request to the Azure DevOps API. Keep in mind that this particular API only works with PAT's with
			// 'all organizations' access.
			const req = await fetch('https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=6.0', {
				headers: {
					authorization: `Basic ${Buffer.from(`:${session.accessToken}`).toString('base64')}`,
					'content-type': 'application/json',
				},
			});
			if (!req.ok) {
				throw new Error(req.statusText);
			}
			const res = await req.json() as { displayName: string };
			vscode.window.showInformationMessage(`Hello ${res.displayName}`);
		} catch (e: any) {
			if (e.message === 'Unauthorized') {
				vscode.window.showErrorMessage('Failed to get profile. You need to use a PAT that has access to all organizations. Please sign out and try again.');
			}
			throw e;
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
