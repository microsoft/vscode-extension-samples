import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', async () => {
		await vscode.commands.executeCommand('extension.helloWorld');
		assert.strictEqual((globalThis as any).foo, 'bar');
	});
});
