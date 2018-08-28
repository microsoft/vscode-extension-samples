import * as path from 'path';
import { Uri, window, Disposable } from 'vscode';
import { QuickPickItem } from 'vscode';
import { workspace } from 'vscode';
import * as _ from 'lodash';

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
	const commands: string[] = [
		'ls',
		'quit',
		's/toto/titi/g',
		'vsplit'
	];
	const commandsItems = _.map(commands, (cmd, index) => new HistoryItem(cmd, `(history item ${index})`));
	try {
		return await new Promise<string | undefined>((resolve, reject) => {
			const input = window.createQuickPick<CommandItem>();
			input.placeholder = 'Type a command';
			input.items = commandsItems;
			disposables.push(
				input.onDidChangeValue(value => {
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
