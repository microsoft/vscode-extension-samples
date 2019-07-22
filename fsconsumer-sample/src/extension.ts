'use strict';

import * as vscode from 'vscode';
import { posix } from 'path';
import { StringDecoder } from 'string_decoder';

export function activate(context: vscode.ExtensionContext) {

	// Sample 1 - Check if for a TypeScript file a JavaScript files exists
	// * use `uri.with` to derive a new uri without loosing things like scheme, authority, query, or fragment
	// * use `path.posix` because uris use slashes to separate paths, e.g. backslash is a valid file name character
	vscode.commands.registerCommand('fsConsume/findJS', async function () {
		if (!vscode.window.activeTextEditor ||
			posix.extname(vscode.window.activeTextEditor.document.uri.path) !== '.ts'
		) {
			return vscode.window.showInformationMessage('Open a TypeScript file first');
		}

		const tsUri = vscode.window.activeTextEditor.document.uri;
		const jsPath = posix.join(tsUri.path, '..', posix.basename(tsUri.path, '.ts') + '.js');
		const jsUri = tsUri.with({ path: jsPath });
		try {
			await vscode.workspace.fs.stat(jsUri);
			vscode.window.showInformationMessage(`${jsUri.toString(true)} file does exist`);
		} catch {
			vscode.window.showInformationMessage(`${jsUri.toString(true)} file does *not* exist`);
		}
	});

	// Sample 2 - Sum up the size of all files inside a folder (none recursive)
	vscode.commands.registerCommand('fsConsume/sumSizes', async function () {

		async function sizeOfAllFilesInFolder(folder: vscode.Uri) {
			let sum = 0;
			for (const [name, type] of await vscode.workspace.fs.readDirectory(folder)) {
				if (type === vscode.FileType.File) {
					const filePath = posix.join(folder.path, name);
					const stat = await vscode.workspace.fs.stat(folder.with({ path: filePath }));
					sum += stat.size;
				}
			}
			return sum;
		}

		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		for (const folder of vscode.workspace.workspaceFolders) {
			const total = await sizeOfAllFilesInFolder(folder.uri);
			vscode.window.showInformationMessage(`${total} bytes in ${folder.uri.toString(true)}`);
		}
	});

	// Sample 3 - Create a Uint8Array from a string and reverse
	vscode.commands.registerCommand('fsConsume/readWriteFile', async function () {

		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const writeStr = '1€ is 1.12$ is 0.9£';
		const writeData = Buffer.from(writeStr);

		const folder = vscode.workspace.workspaceFolders[0].uri;
		const fileUri = folder.with({ path: posix.join(folder.path, 'test.txt') });
		await vscode.workspace.fs.writeFile(fileUri, writeData);

		const readData = await vscode.workspace.fs.readFile(fileUri);
		const readStr = new StringDecoder().end(Buffer.from(readData));
		vscode.window.showInformationMessage(readStr);
	});

}
