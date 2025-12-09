import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "telemetry-sample" is now active!');

	const logger = vscode.env.createTelemetryLogger({
		sendErrorData(error, data) {
			console.error(`Exception: ${error}`);
			console.error(`Data: ${JSON.stringify(data)}`);
		},
		sendEventData(eventName, data) {
			console.log(`Event: ${eventName}`);
			console.log(`Data: ${JSON.stringify(data)}`);
		},
	});

	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */

	const c1 = vscode.commands.registerCommand('extension.logEvent', () => {
		vscode.window.showInformationMessage('Logged telemetry event!');
		logger.logUsage('testEvent', { 'testProp': 'testValue' });
	});

	context.subscriptions.push(c1);

	context.subscriptions.push(vscode.commands.registerCommand('extension.logException', () => {
		vscode.window.showInformationMessage('Logged telemetry exception!');
		logger.logError(new Error('Test'), { 'testProp': 'testValue' });
		logger.logError('testerror', { 'testProp': 'testValue' });
	}));
}
