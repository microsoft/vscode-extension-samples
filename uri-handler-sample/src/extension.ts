import * as vscode from 'vscode';

// Our implementation of a UriHandler.
class MyUriHandler implements vscode.UriHandler {
	// This function will get run when something redirects to VS Code
	// with your extension id as the authority.
	handleUri(uri: vscode.Uri): vscode.ProviderResult<void> {
		let message = "Handled a Uri!";
		if (uri.query) {
			message += ` It came with this query: ${uri.query}`;
		}
		vscode.window.showInformationMessage(message);
	}
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('uri-handler-sample.start', async () => {
		// Create our new UriHandler
		const uriHandler = new MyUriHandler();

		// And register it with VS Code. You can only register a single UriHandler for your extension.
		context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));

		// You don't have to get the Uri from the `vscode.env.asExternalUri` API but it will add a query
		// parameter (ex: "windowId%3D14") that will help VS Code decide which window to redirect to.
		// If this query parameter isn't specified, VS Code will pick the last windows that was focused.
		const uri = await vscode.env.asExternalUri(vscode.Uri.parse(`${vscode.env.uriScheme}://vscode-samples.uri-handler-sample`));
		vscode.window.showInformationMessage(`Starting to handle Uris. Open ${uri} in your browser to test.`);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
