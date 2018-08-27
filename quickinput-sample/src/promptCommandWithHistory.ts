/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { Uri, window, Disposable } from 'vscode';
import { QuickPickItem } from 'vscode';
import { workspace } from 'vscode';
import * as _ from 'lodash';

/**
 * A file opener using window.createQuickPick().
 * 
 * It shows how the list of items can be dynamically updated based on
 * the user's input in the filter field.
 */
export async function promptCommand() {
	const command = await pickCommand();
	if (command) {
		window.showInformationMessage(`You picked the following command: '${command}'`)
	}
}

class HistoryItem implements QuickPickItem {

	constructor(public label: string, description: string?) {
	}
}

const commands: string[] = [
	'ls',
	'quit',
	's/toto/titi/g',
	'vsplit'
];

async function pickCommand() {
	const disposables: Disposable[] = [];
	try {
		return await new Promise<string| undefined>((resolve, reject) => {
			const input = window.createQuickPick<HistoryItem>();
			input.placeholder = 'Type a command';
			input.items = _.map(commands, cmd => new HistoryItem(cmd, 'history item'));
			disposables.push(
				input.onDidChangeValue(value => {
					if (!value) {
						input.items = _.map(commands, cmd => new HistoryItem(cmd, 'history item'))
						return;
					}
					// input.busy = true;
					input.items = [
						new HistoryItem(value, 'current input')
					].concat(
						_.map(
							_.filter(commands, cmd => cmd.includes(_.escapeRegExp(value))),
							cmd => new HistoryItem(cmd, 'history item'))
					)
				}),
				input.onDidChangeSelection(items => {
					const item = items[0];
					if (item instanceof HistoryItem) {
						resolve(item.label);
						input.hide();
					}
				}),
				input.onDidHide(() => {
					resolve(undefined);
					input.dispose();
				})
			);
			input.show();
		});
	} finally {
		disposables.forEach(d => d.dispose());
	}
}
