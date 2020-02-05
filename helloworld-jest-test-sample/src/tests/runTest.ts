import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(
			__dirname,
			'../../node_modules/vscode-jest-test-runner'
		);

		// The path to a module that runs some code to configure or set up the
		// testing framework before each test.
		// See https://github.com/bmealhouse/vscode-jest-test-runner#jest_test_runner_setup
		// process.env.JEST_TEST_RUNNER_SETUP = path.resolve(
		// 	__dirname,
		// 	'./custom-vscode-jest-test-runner-setup.js'
		// );

		// Download VS Code, unzip it and run the integration test
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: ['--disable-extensions']
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
