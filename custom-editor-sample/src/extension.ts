import * as vscode from 'vscode';
import { CatScratchEditorProvider } from './catScratchEditor';
import { PawDrawEditorProvider } from './pawDrawEditor';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(CatScratchEditorProvider.register(context));

	if (+vscode.version.match(/1\.(\d+)/)![1] >= 45) {
		context.subscriptions.push(PawDrawEditorProvider.register(context));
	}
}
