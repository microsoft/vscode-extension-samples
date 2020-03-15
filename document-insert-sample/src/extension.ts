import * as vscode from 'vscode';
import * as Chance from 'chance';

export function activate(context: vscode.ExtensionContext) {

	// random animal locations
	const types = [ 'Ocean', 'Desert', 'Grassland', 'Forest', 'Farm', 'Pet', 'Zoo' ];

	let insertRandom = vscode.commands.registerCommand('extension.insertRandom', async () => {

		await vscode.commands.executeCommand('notifications.clearAll');
		const chance = new Chance();

		const randomInt = chance.integer({ min: 0, max: 6 });
		const randomType = types[randomInt];
		const randomAnimal = chance.animal({ type: randomType }) + '\n';

		// get active text editor
		const editor = vscode.window.activeTextEditor;

		if (!editor) return;

		editor.edit((active) => {

			// Defined position of line 1
			const position = new vscode.Position(0, 0);

			// Insert randomAnimal in line 1.
			active.insert(position, randomAnimal);
		});

		// Pop animal location
		vscode.window.showInformationMessage(`Location: ${randomType}`);
	});

	let insertRandomSelection = vscode.commands.registerCommand('extension.insertRandomSelection', async () => {

		await vscode.commands.executeCommand('notifications.clearAll');
		const chance = new Chance();

		const randomInt = chance.integer({ min: 0, max: 6 });
		const randomType = types[randomInt];
		const randomAnimal = chance.animal({ type: randomType }) + '\n';

		const editor = vscode.window.activeTextEditor;

		if (!editor) return;

		editor.edit((active) => {

			// Get position of selected line
			const selection = editor.selection.anchor;

			// Insert randomAnimal in selected line.
			active.insert(selection, randomAnimal);

		});

		vscode.window.showInformationMessage(`Location: ${randomType}`);
	});

	let deleteRandom = vscode.commands.registerCommand('extension.deleteRandom', async () => {

		await vscode.commands.executeCommand('notifications.clearAll');
		const editor = vscode.window.activeTextEditor;

		if (!editor) return;

		editor.edit((active) => {

			// Defined range of line 1
			const start = new vscode.Position(0, 0);
			const end = new vscode.Position(1, 0);
			const range = new vscode.Range(start, end);

			// Delete text in line 1
			active.delete(range);
		});
	});

	let deleteSelection = vscode.commands.registerCommand('extension.deleteSelection', async () => {

		await vscode.commands.executeCommand('notifications.clearAll');
		const editor = vscode.window.activeTextEditor;

		if (!editor) return;

		editor.edit((active) => {

			// Get selected range of text
			const selection = editor.selection;

			// Delete selected text
			active.delete(selection);
		});
	});

	let deleteSelectionLine = vscode.commands.registerCommand('extension.deleteSelectionLine', async () => {

		await vscode.commands.executeCommand('notifications.clearAll');
		const editor = vscode.window.activeTextEditor;

		if (!editor) return;

		editor.edit((active) => {

			// Get line # of selection
			const startLine = editor.selection.start.line;
			const endLine = startLine + 1;

			// Define position of selected line
			const start = new vscode.Position(startLine, 0);
			const end = new vscode.Position(endLine, 0);
			const range = new vscode.Range(start, end);

			active.delete(range);
		});
	});

	context.subscriptions.push(insertRandom, insertRandomSelection, deleteRandom, deleteSelection, deleteSelectionLine);
}
