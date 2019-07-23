/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { posix } from 'path';

export function activate(context: vscode.ExtensionContext) {

	// Command #1 - Check if for a TypeScript-file a JavaScript-file exists
	// * shows how to derive a new uri from an existing uri
	// * shows how to check for existence of a file
	vscode.commands.registerCommand('fs/findJS', async function () {
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

	// Command #2 - Compute total size of files in a folder
	// * shows how to read a directory
	// * shows how retrieve metadata for a file
	vscode.commands.registerCommand('fs/sumSizes', async function () {

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

	// Command #3 - Write and read a file
	// * shows how to derive a new file-uri from a folder-uri
	// * shows how to convert a string into a typed array and back
	vscode.commands.registerCommand('fs/readWriteFile', async function () {

		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showInformationMessage('No folder or workspace opened');
		}

		const writeStr = '1€ is 1.12$ is 0.9£';
		const writeData = Buffer.from(writeStr, 'utf8');

		const folderUri = vscode.workspace.workspaceFolders[0].uri;
		const fileUri = folderUri.with({ path: posix.join(folderUri.path, 'test.txt') });

		await vscode.workspace.fs.writeFile(fileUri, writeData);

		const readData = await vscode.workspace.fs.readFile(fileUri);
		const readStr = Buffer.from(readData).toString('utf8');
		vscode.window.showInformationMessage(readStr);
	});

}
