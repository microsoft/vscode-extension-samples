'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const writeEmitter = new vscode.EventEmitter<string>();
	context.subscriptions.push(vscode.commands.registerCommand('extensionTerminalSample.create', () => {
		let line = '';
		const pty = {
			onDidWrite: writeEmitter.event,
			open: () => writeEmitter.fire('Type and press enter to echo the text\r\n\r\n'),
			close: () => { /* noop*/ },
			handleInput: (data: string) => {
				if (data === '\r') { // Enter
					writeEmitter.fire(`\r\necho: "${colorText(line)}"\r\n\n`);
					line = '';
					return;
				}
				if (data === '\x7f') { // Backspace
					if (line.length === 0) {
						return;
					}
					line = line.substr(0, line.length - 1);
					// Move cursor backward
					writeEmitter.fire('\x1b[D');
					// Delete character
					writeEmitter.fire('\x1b[P');
					return;
				}
				line += data;
				writeEmitter.fire(data);
			}
		};
		const terminal = (<any>vscode.window).createTerminal({ name: `My Extension REPL`, pty });
		terminal.show();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('extensionTerminalSample.clear', () => {
		writeEmitter.fire('\x1b[2J\x1b[3J\x1b[;H');
	}));
}

function colorText(text: string): string {
	let output = '';
	let colorIndex = 1;
	for (let i = 0; i < text.length; i++) {
		const char = text.charAt(i);
		if (char === ' ' || char === '\r' || char === '\n') {
			output += char;
		} else {
			output += `\x1b[3${colorIndex++}m${text.charAt(i)}\x1b[0m`;
			if (colorIndex > 6) {
				colorIndex = 1;
			}
		}
	}
	return output;
}