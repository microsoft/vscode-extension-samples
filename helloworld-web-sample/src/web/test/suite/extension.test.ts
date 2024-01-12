import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { myGlobal } from '../../extension';
// import * as myExtension from '../../extension';

suite('Web Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual((globalThis as any).myOtherGlobal, 'C'); // This is successful
		assert.strictEqual(myGlobal, 'B'); // This fails when running unit tests in a Web context, but not in Node.js
		
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
