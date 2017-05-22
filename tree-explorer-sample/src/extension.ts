'use strict';

import * as vscode from 'vscode';

import { DepNodeProvider } from './nodeDependencies'
import { JsonOutlineProvider } from './jsonOutline'

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
}
