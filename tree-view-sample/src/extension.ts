'use strict';

import * as vscode from 'vscode';

import { DepNodeProvider } from './nodeDependencies'
import { JsonOutlineProvider } from './jsonOutline'
import { FtpTreeDataProvider, FtpNode } from './ftpExplorer'

export function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.rootPath;
	const jsonOutlineProvider = new JsonOutlineProvider(context);
	const provider = new FtpTreeDataProvider();

	vscode.window.registerTreeDataProvider('nodeDependencies', new DepNodeProvider(rootPath));
	vscode.window.registerTreeDataProvider('jsonOutline', jsonOutlineProvider);
	vscode.window.registerTreeDataProvider('ftpExplorer', provider);

	vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`));
	});

	vscode.commands.registerCommand('extension.openJsonSelection', range => {
		jsonOutlineProvider.select(range);
	});
	vscode.commands.registerCommand('jsonOutline.refreshEntry', () => vscode.window.showInformationMessage('Successfully called refresh'));
	vscode.commands.registerCommand('jsonOutline.addEntry', node => vscode.window.showInformationMessage('Successfully called add entry'));
	vscode.commands.registerCommand('jsonOutline.deleteEntry', node => {
		vscode.window.showInformationMessage('Successfully called delete entry');
	});

	vscode.commands.registerCommand('openFtpResource', (node: FtpNode) => {
		vscode.workspace.openTextDocument(node.resource).then(document => {
			vscode.window.showTextDocument(document);
		});
	});
}
