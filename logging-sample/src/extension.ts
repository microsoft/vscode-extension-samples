// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as logger from "./logger";

const loggingLevelConfigProp = 'sample_logging.loggingLevel';

/**
 * this method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext): void {
	const logPath = context.logPath;
	const logLevel = <string>vscode.workspace.getConfiguration().get(loggingLevelConfigProp);
	// The Logger must first be initialized before any logging commands may be invoked.
	logger.configure(logPath, logLevel);
	logger.warn('Congratulations, your extension <sample logging> is now active!');
	logger.warn(`Logs can be found in the <${logPath}> directory.`);

	let counter = 1;
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
		logger.trace(`Hip Hip Hurray, the <Hello World> Command was executed! counter: <${counter++}>`);
	});

	context.subscriptions.push(disposable);

	// To enable dynamic logging we must listen to VSCode configuration changes
	// on our `loggingLevelConfigProp` configuration setting.
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration(loggingLevelConfigProp)) {
			const logLevel = <string>vscode.workspace.getConfiguration().get(loggingLevelConfigProp);
			logger.configure(logPath, logLevel);
		}
	}));
}

/**
 * this method is called when your extension is deactivated
 */
export function deactivate(): void {
	logger.warn('Sad Sad Panda: <logging sample> extension was deactivated, why oh why?');
}


