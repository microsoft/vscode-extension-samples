import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');
		const testWorkspace = path.resolve(extensionDevelopmentPath, 'test-workspace');
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace],
		});
	} catch (error) {
		console.error('Failed to run tests', error);
		process.exit(1);
	}
}

void main();