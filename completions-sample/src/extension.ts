/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	// The most simple completion item provider which 
	// * registers for text files (`'plaintext'`), and
	// * only return the 'Hello World' completion
	vscode.languages.registerCompletionItemProvider('plaintext', {
		provideCompletionItems() {
			return [new vscode.CompletionItem('Hello World')];
		}
	});
}
