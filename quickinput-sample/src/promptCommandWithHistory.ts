import { window, Disposable, Memento } from 'vscode';
import { QuickPickItem } from 'vscode';

export const historyPath = `${process.env.HOME}/.vscode-cmd-history`;

const HISTORY_KEY = 'HISTORY_KEY';

/**
 * A command prompt with history
 * 
 */
export const getPromptCommand = (memo: Memento) => {
	const pickCommand = getPickCommand(memo);
	// §TODO: cache promptCommand!
	return async function promptCommand() {
		const command = await pickCommand();
		if (command) {
			window.showInformationMessage(`You picked the following command: '${command}'`)
		}
	}
}

abstract class CommandItem implements QuickPickItem {
	public label: string;
	public description?: string;
	public abstract type: string;
	constructor(label: string, description?: string) {
		this.label = label;
		this.description = description;
	}
}
class HistoryItem extends CommandItem {
	public type: string;
	constructor(label: string, description?: string) {
		super(label, description);
		this.type = 'history'
	}
}
class InputItem extends CommandItem {
	public type: string;
	constructor(public label: string) {
		super(label, '(current input)');
		this.type = 'input';
	};
}

const getPickCommand = (memo: Memento) => async function pickCommand() {
	const disposables: Disposable[] = [];
	try {
		return await new Promise<string | undefined>((resolve, reject) => {
			const input = window.createQuickPick<CommandItem>();
			input.placeholder = 'Type a command';
			input.items = [];

			const updateQuickPick = (value?: string): void => {
				if (value === input.value) return;
				if (!value) {
					if (input.items[0] && input.items[0].type === 'input')
					input.items = input.items.slice(1);
					return;
				}
				if (input.items[0] && input.items[0].type === 'input') {
					input.items = [new InputItem(value)].concat(input.items.slice(1));
				} else {
					input.items = [new InputItem(value)].concat(input.items);
				}
				// §todo: add autocomplete suggestions
			}

			disposables.push(
				input.onDidChangeValue(updateQuickPick),
				input.onDidChangeSelection((items: CommandItem[]) => {
					const item = items[0];
					if (item instanceof HistoryItem) {
						resolve(item.label);
						input.hide();
						// do not record new input in history
						// §todo : maybe reorder
					} else if (item instanceof InputItem) {
						resolve(item.label);
						input.hide();
						// record new input in history
						if (!item.label.startsWith(' ')) {
							const currentHistory: string[] = memo.get(HISTORY_KEY, []);
							currentHistory.unshift(item.label);
							memo.update(HISTORY_KEY, currentHistory);
						}
					}
				}),
				input.onDidHide(() => {
					resolve(undefined);
					input.dispose();
				})
			);
			input.show();
			const historyItems: HistoryItem[] = memo.get(HISTORY_KEY, []).map(
				(cmd: string, index: number) => new HistoryItem(cmd, `(history item ${index})`)
			);
			input.items = input.items.concat(historyItems)
		});
	} finally {
		disposables.forEach(d => d.dispose());
	}
}
