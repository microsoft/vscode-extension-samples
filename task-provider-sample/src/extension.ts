/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vscode from 'vscode';
import { RakeTaskProvider } from './rakeTaskProvider';
import { CustomBuildTaskProvider } from './customTaskProvider';

let rakeTaskProvider: vscode.Disposable | undefined;
let customTaskProvider: vscode.Disposable | undefined;

export function activate(_context: vscode.ExtensionContext): void {
	let workspaceRoot = vscode.workspace.rootPath;
	if (!workspaceRoot) {
		return;
	}
		
	rakeTaskProvider = vscode.tasks.registerTaskProvider(RakeTaskProvider.RakeType, new RakeTaskProvider(workspaceRoot));
	customTaskProvider = vscode.tasks.registerTaskProvider(CustomBuildTaskProvider.CustomBuildScriptType, new CustomBuildTaskProvider(workspaceRoot));
}

export function deactivate(): void {
	if (rakeTaskProvider) {
		rakeTaskProvider.dispose();
	}
	if (customTaskProvider) {
		customTaskProvider.dispose();
	}
}