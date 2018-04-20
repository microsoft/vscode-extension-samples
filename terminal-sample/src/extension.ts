'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let NEXT_TERM_ID = 1;

	// vscode.window.createTerminal
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createTerminal', () => {
		vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createAndSend', () => {
		const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		terminal.sendText("echo 'Sent text immediately after creating'");
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createZshLoginShell', () => {
		vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`, '/bin/zsh', ['-l']);
	}));

	// Terminal.hide
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.hide', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => terminal.hide());
		}
	}));

	// Terminal.show
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.show', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => terminal.show());
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.showPreserveFocus', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => terminal.show(true));
		}
	}));

	// Terminal.sendText
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.sendText', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => terminal.sendText("echo 'Hello world!'"));
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.sendTextNoNewLine', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => terminal.sendText("echo 'Hello world!'", false));
		}
	}));

	// Terminal.dispose
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.dispose', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.dispose();
				}
			});
		}
	}));

	// Terminal.processId
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.processId', () => {
		selectTerminal().then(terminal => {
			terminal.processId.then((processId) => {
				if (processId) {
					vscode.window.showInformationMessage(`Terminal.processId: ${processId}`);
				} else {
					vscode.window.showInformationMessage('Terminal does not have a process ID');
				}
			});
		});
	}));

	// vscode.window.onDidCloseTerminal
	vscode.window.onDidCloseTerminal((terminal) => {
		vscode.window.showInformationMessage(`onDidCloseTerminal, name: ${terminal.name}`);
	});


	// vvv Proposed APIs in 1.23 below vvv


	// vscode.window.terminals
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.terminals', () => {
		selectTerminal();
	}));

	// vscode.window.onDidOpenTerminal
	if ('onDidOpenTerminal' in vscode.window) {
		(<any>vscode.window).onDidOpenTerminal((terminal: vscode.Terminal) => {
			vscode.window.showInformationMessage(`onDidOpenTerminal, name: ${terminal.name}`);
		});
	}
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.onData', () => {
		selectTerminal().then(terminal => {
			vscode.window.showInformationMessage(`onData listener attached for terminal: ${terminal.name}, check the devtools console to see events`);
			(<any>terminal).onData((data: string) => {
				console.log('onData: ' + data);
			});
		});
	}));
}

function selectTerminal(): Thenable<vscode.Terminal> {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: `name: ${t.name}`,
			terminal: t
		};
	})
	return vscode.window.showQuickPick(items).then(item => {
		return item.terminal;
	});
}

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}