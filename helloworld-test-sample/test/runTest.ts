import * as path from 'path';

import { runTests } from 'vscode-test';

async function go() {
	try {
		const extensionPath = path.resolve(__dirname, '../../');
		const testRunnerPath = path.resolve(__dirname, './suite');
		const testWorkspace = path.resolve(__dirname, '../../test/suite/fixture');

		await runTests({
			// The folder containing the Extension Manifest package.json
			extensionPath,
			// The path to test runner
			testRunnerPath,
			// The workspace to open on starting up VS Code
			testWorkspace
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

go();
