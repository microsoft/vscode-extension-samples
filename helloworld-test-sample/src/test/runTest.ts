import * as path from 'path';

import { runTests } from 'vscode-test';

async function go() {
	try {
		const extensionPath = path.resolve(__dirname, '../../');
		const testRunnerPath = path.resolve(__dirname, './suite');

		await runTests({
			// The folder containing the Extension Manifest package.json
			extensionPath,
			// The path to test runner
			testRunnerPath
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

go();
