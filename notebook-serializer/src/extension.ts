import * as vscode from 'vscode';
import { SampleKernel } from './controller';
import { SampleContentSerializer } from './serializer';

const NOTEBOOK_TYPE = 'test-notebook-serializer';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('notebook-serializer-sample.createJsonNotebook', async () => {
		const language = 'json';
		const defaultValue = `{ "hello_world": 123 }`;
		const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, defaultValue, language);
		const data = new vscode.NotebookData([cell]);
		data.metadata = {
			custom: {
				cells: [],
				metadata: {
					orig_nbformat: 4
				},
				nbformat: 4,
				nbformat_minor: 2
			}
		};
		const doc = await vscode.workspace.openNotebookDocument(NOTEBOOK_TYPE, data);
		await vscode.window.showNotebookDocument(doc);
	}));

	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(
			NOTEBOOK_TYPE, new SampleContentSerializer(), { transientOutputs: true }
		),
		new SampleKernel()
	);
}
