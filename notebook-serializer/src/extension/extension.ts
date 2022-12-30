// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SampleKernel } from './controller';

import { SampleContentSerializer } from './provider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(
			'test-notebook-renderer', new SampleContentSerializer(), { transientOutputs: true }
		),
		new SampleKernel()
	);
}
