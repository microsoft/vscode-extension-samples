import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "tabs-api-sample" is now active!');

	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */

	// Whenever a tab is opened close it
	let timeout: NodeJS.Timeout | undefined = undefined;
	const disposable = vscode.window.tabGroups.onDidChangeTabs(tabs => {
		if (timeout) {
			timeout.refresh();
		} else {
			timeout = setTimeout(async () => {
				try {
					await vscode.window.tabGroups.close(vscode.window.tabGroups.groups.map(group => group.tabs).flat(1));
					vscode.window.showErrorMessage('Productivity is not allowed on fridays.', {modal: true});
				} catch {
					// No op
				}
				timeout = undefined;
			}, 700);
		}
	});

	context.subscriptions.push(disposable);
}
