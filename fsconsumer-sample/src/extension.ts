'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	// Sample 1 - Check if for a TypeScript file a JavaScript files exists
	// * use `uri.with` to derive a new uri without loosing things like scheme, authority, query, or fragment
	// * use `path.path` because uris use slashes to separate paths, e.g. backslash is a valid file name character
	vscode.commands.registerCommand('fsConsume/findJS', async () => {
		if (!vscode.window.activeTextEditor) {
			return vscode.window.showInformationMessage('Open a TypeScript file first');
		}

		const tsUri = vscode.window.activeTextEditor.document.uri;

		if (path.posix.extname(tsUri.path) !== '.ts') {
			return vscode.window.showInformationMessage('Open a TypeScript file first');
		}

		const jsUri = tsUri.with({ path: path.posix.join(tsUri.path, '..', path.posix.basename(tsUri.path, '.ts')) });
		try {
			await vscode.workspace.fs.stat(jsUri);
			vscode.window.showInformationMessage('JS file does exist');
		} catch {
			vscode.window.showInformationMessage('JS file does *not* exist');
		}
	});

	// Sample 2 - Sum up the size of all files inside a folder (none recursive)
	vscode.commands.registerCommand('fsConsume/sumSizes', async () => {

		const sumUpFolder = async (folder: vscode.Uri) => {
			let sum = 0;
			for (const [name, type] of await vscode.workspace.fs.readDirectory(folder)) {
				if (type === vscode.FileType.File) {
					const stat = await vscode.workspace.fs.stat(folder.with({ path: path.posix.join(folder.path, name) }));
					sum += stat.size;
				}
			}
			return sum;
		};

		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');

		} else if (vscode.workspace.workspaceFolders) {
			let sum = 0;
			for (let i = 0; i < vscode.workspace.workspaceFolders.length; i++) {
				sum += await sumUpFolder(vscode.workspace.workspaceFolders[i].uri);
			}
			return vscode.window.showInformationMessage(`Sum of file sizes is ${sum}bytes`);
		}
	});
}
