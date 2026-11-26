// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import VerilogHoverProvider from './verilog-hover-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, hover-provider-sample extension is active!');

	const hoverProvider = new VerilogHoverProvider();
	vscode.languages.registerHoverProvider('verilog', hoverProvider);
	vscode.languages.registerHoverProvider('systemverilog', hoverProvider);
}
