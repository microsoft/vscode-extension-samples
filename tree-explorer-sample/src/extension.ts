'use strict';

import * as vscode from 'vscode';

import { DepNodeProvider } from './nodeDependencies'
import { JsonOutlineProvider } from './jsonOutline'
import { FtpTreeDataProvider, FtpNode } from './ftpExplorer'

export function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.rootPath;
	const jsonOutlineProvider = new JsonOutlineProvider(context);

	// The `providerId` here must be identical to `contributes.explorer.treeExplorerNodeProviderId` in package.json.
	vscode.window.registerTreeDataProviderForView('nodeDependencies', new DepNodeProvider(rootPath));
	vscode.window.registerTreeDataProviderForView('jsonOutline', jsonOutlineProvider);

	vscode.commands.registerCommand('extension.openPackageOnNpm', (node: vscode.TreeItem) => {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${node.label}`));
	});

	vscode.commands.registerCommand('extension.openJsonSelection', node => {
		jsonOutlineProvider.select(node);
	});

	vscode.commands.registerCommand('jsonOutline.refreshEntry', () => vscode.window.showInformationMessage('Successfully called refresh'));
	vscode.commands.registerCommand('jsonOutline.addEntry', node => vscode.window.showInformationMessage('Successfully called add entry'));
	vscode.commands.registerCommand('jsonOutline.deleteEntry', node => vscode.window.showInformationMessage('Successfully called delete entry'));

	const provider = new FtpTreeDataProvider();

	vscode.window.registerTreeDataProviderForView('ftpExplorer', provider);
	vscode.commands.registerCommand('openFtpResource', (node: FtpNode) => {
		vscode.workspace.openTextDocument(node.resource).then(document => {
			vscode.window.showTextDocument(document);
		});
	});
}
