import { dirname } from 'path';
import * as vscode from 'vscode';

const terminalProfileName = 'Tracking Editor';


export function activate(context: vscode.ExtensionContext) {
	const trackedTerminals: Set<vscode.Terminal> = new Set();

	context.subscriptions.push(
		vscode.window.registerTerminalProfileProvider('shell-integration-sample.track-editor-directory', {
			provideTerminalProfile(token) {
				return {
					options: {
						name: terminalProfileName
					}
				};
			}
		}),
		vscode.window.onDidChangeTerminalShellIntegration(e => {
			if (e.terminal.name === terminalProfileName && !trackedTerminals.has(e.terminal)) {
				trackedTerminals.add(e.terminal);
			}
		}),
		vscode.workspace.onDidOpenTextDocument(e => {
			if (e.uri.scheme !== 'file') {
				return;
			}
			const targetUri = vscode.Uri.file(dirname(e.fileName));
			for (const terminal of trackedTerminals) {
				const cwd = terminal.shellIntegration?.cwd;
				if (cwd && cwd.toString() !== targetUri.toString()) {
					terminal.shellIntegration.executeCommand('cd', [targetUri.fsPath]);
				}
			}
		})
	);
}
