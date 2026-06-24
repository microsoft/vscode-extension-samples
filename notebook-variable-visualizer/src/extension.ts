import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// Set context that can be used in the package.json when clause
	vscode.commands.executeCommand(
		'setContext',
		'notebook-variable-visualizer.supportedTypes',
		['list', 'DataFrame', 'dict']
	);

	// display the information that we are given about the variable
	// e.g. {"source":"file:///c%3A/src/test/7/variables.ipynb","value":"[1, 2, 3]","type":"list","extensionId":"ms-toolsai.jupyter"}
	let disposable = vscode.commands.registerCommand(
		'notebook-variable-visualizer.showVariableInfo',
		(context) => {
			vscode.workspace.openTextDocument().then((document) => {
				vscode.window.showTextDocument(document).then((editor) => {
					editor.edit((editBuilder) => {
						editBuilder.insert(
							new vscode.Position(0, 0),
							JSON.stringify(context)
						);
					});
				});
			});
		}
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
