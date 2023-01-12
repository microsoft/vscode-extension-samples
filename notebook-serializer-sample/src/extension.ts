import * as vscode from 'vscode';
import { SampleContentSerializer } from './serializer';

const NOTEBOOK_TYPE = 'liveshare-jupyter-notebook';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(
			NOTEBOOK_TYPE, new SampleContentSerializer(), { transientOutputs: true }, {
			displayName: 'Liveshare test',
			filenamePattern: ['*.ipynb'],
			exclusive: true
		}
		)
	);
}
