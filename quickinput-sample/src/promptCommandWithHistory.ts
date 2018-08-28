import * as fs from 'fs';
import * as path from 'path';
import { Uri, window, Disposable } from 'vscode';
import { QuickPickItem } from 'vscode';
import { workspace } from 'vscode';
import * as _ from 'lodash';

export const historyPath = `${process.env.HOME}/.vscode-cmd-history`;

/**
 * A command prompt with history
 * 
 */
export async function promptCommand() {
	const command = await pickCommand();
	if (command) {
		window.showInformationMessage(`You picked the following command: '${command}'`)
	}
}

class CommandItem implements QuickPickItem { }
class HistoryItem extends CommandItem {
	constructor(public label: string, public description: string?) {
		super();
	}
}
class InputItem extends CommandItem {
	public description = '(current input)';
	constructor(public label: string) {
		super();
	};
}

async function pickCommand() {
	const disposables: Disposable[] = [];
	let commandsItems = [];
	let currentValue = undefined;
	let historyShouldBeUpdated = false;

	try {
		return await new Promise<string | undefined>((resolve, reject) => {
			const input = window.createQuickPick<CommandItem>();
			input.placeholder = 'Type a command';
			input.items = commandsItems;


			const updateQuickPick = value => {
				if (!value) {
					input.items = commandsItems;
					return;
				}
				input.items = [
					new InputItem(value)
				].concat(
					commandsItems
				)
				// §todo: add autocomplete suggestions
			}

			disposables.push(
				input.onDidChangeValue(value => {
					currentValue = value;
					updateQuickPick(value);
				}),
				input.onDidChangeSelection(items => {
					const item = items[0];
					if (item instanceof HistoryItem) {
						resolve(item.label);
						input.hide();
					} else if (item instanceof InputItem) {
						// record new input in history
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

			if (fs.existsSync(historyPath)) {
				fs.readFile(historyPath, (err, content) => {
					if (err) {
						console.error('Could not load file history', err);
					}
					historyShouldBeUpdated = true;
					const commands = content.toString().trimRight().split('\n').reverse();
					commandsItems = _.map(commands, (cmd, index) => new HistoryItem(cmd, `(history item ${index})`));
					updateQuickPick(currentValue);
				});
			} else {
				console.log('history file does not exist yet')
			}

		});
	} finally {
		disposables.forEach(d => d.dispose());
	}
}
