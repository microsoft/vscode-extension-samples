import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "proposed-api-sample" is now active!');

	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */

	vscode.commands.registerCommand('openBase64Variable', encoded => {
		openUntitledEditor(Buffer.from(encoded, 'base64').toString());
	});

	context.subscriptions.push(vscode.debug.registerDebugVisualizationProvider('base64Decoder', {
		provideDebugVisualization(context, token) {
			const v = new vscode.DebugVisualization('base64');
			v.iconPath = new vscode.ThemeIcon('rocket');
			v.visualization = {
				title: 'Decode base64',
				command: 'openBase64Variable',
				arguments: [context.variable.value],
			};

			return [v]
		},
	}));
}

const openUntitledEditor = async (contents: string) => {
  const untitledDoc = await vscode.workspace.openTextDocument({ content: contents });
  await vscode.window.showTextDocument(untitledDoc);
};
