import * as vscode from 'vscode';
import { CatScratchEditorProvider } from './catScratchEditor';
import { PawDrawEditorProvider } from './pawDrawEditor';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(CatScratchEditorProvider.register(context));
	context.subscriptions.push(PawDrawEditorProvider.register(context));
	context.subscriptions.push(vscode.commands.registerCommand('catCustoms.catScratch.new', () => {
		vscode.workspace.openTextDocument({ language: 'catScratch', content: '' })
		.then(doc => {
			vscode.commands.executeCommand("vscode.openWith", doc.uri, "catCustoms.catScratch");
		});
	}));
}
