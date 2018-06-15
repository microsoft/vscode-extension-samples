/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { window, commands, ExtensionContext } from 'vscode';
import { showInputBox } from './basicInput';
import { multiStepInput } from './multiStepInput';
import { quickOpen } from './quickOpen';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand('samples.quickInput', async () => {
		const options: { [key: string]: (context: ExtensionContext) => Promise<void> } = {
			showInputBox,
			multiStepInput,
			quickOpen,
		};
		const quickPick = window.createQuickPick();
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				options[selection[0].label](context)
					.catch(console.error);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));
}
