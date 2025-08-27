import * as vscode from 'vscode';
import { SampleChatModelProvider } from './provider';

export function activate(_: vscode.ExtensionContext) {
	vscode.lm.registerLanguageModelChatProvider('sample', new SampleChatModelProvider());
}

export function deactivate() { }
