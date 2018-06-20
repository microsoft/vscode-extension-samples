/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, ExtensionContext } from 'vscode';

export async function createQuickPick(context: ExtensionContext) {
	const quickPick = window.createQuickPick();
	quickPick.onDidTriggerButton(button => {
		window.showInformationMessage(`Button triggered`);
	});
	quickPick.items = ['eins', 'zwei', 'drei'].map(label => ({ label }));
	quickPick.buttons = [ window.quickInputBackButton ];
	quickPick.show();
}
