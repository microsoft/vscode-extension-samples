import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration tests.
		// A short --user-data-dir keeps the IPC socket path under the
		// 103-character Unix socket limit, which long checkout paths exceed.
		// NVIDIA_API_KEY (when set) enables the real-API test suite.
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: ['--user-data-dir', '/tmp/vscode-test-github-enterprise-agent'],
			extensionTestsEnv: { ...process.env, NVIDIA_API_KEY: process.env.NVIDIA_API_KEY } as Record<string, string | undefined>
		});
	} catch (err) {
		console.error('Failed to run tests', err);
		process.exit(1);
	}
}

main();
