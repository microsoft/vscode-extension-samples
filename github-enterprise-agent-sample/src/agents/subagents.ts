import * as vscode from 'vscode';
import { exec } from 'child_process';
import { Subagent } from '../providers/responses';

/** Searches the workspace for files matching a glob pattern. */
export class SearchSubagent implements Subagent {
	readonly name = 'search';

	async run(args: Record<string, unknown>, token: vscode.CancellationToken): Promise<string> {
		const include = typeof args.include === 'string' && args.include.length > 0 ? args.include : '**/*';
		const files = await vscode.workspace.findFiles(include, '**/node_modules/**', 20, token);
		if (files.length === 0) {
			return `no files match ${include}`;
		}
		return files.map(file => vscode.workspace.asRelativePath(file)).join('\n');
	}
}

const TEST_TIMEOUT_MS = 60_000;

/** Runs a shell command and reports its output, for the test step of the loop. */
export class TestSubagent implements Subagent {
	readonly name = 'test';

	run(args: Record<string, unknown>, _token: vscode.CancellationToken): Promise<string> {
		const command = typeof args.command === 'string' ? args.command : '';
		if (!command.trim()) {
			return Promise.resolve('no command given');
		}
		return new Promise(resolve => {
			exec(command, { timeout: TEST_TIMEOUT_MS, cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
				const parts = [
					stdout ? `stdout:\n${stdout.slice(0, 2000)}` : '',
					stderr ? `stderr:\n${stderr.slice(0, 1000)}` : '',
					error ? `exit: ${error.message.slice(0, 200)}` : 'exit: 0'
				].filter(Boolean);
				resolve(parts.join('\n') || '(no output)');
			});
		});
	}
}

export function defaultSubagents(): Map<string, Subagent> {
	return new Map<string, Subagent>([
		['search', new SearchSubagent()],
		['test', new TestSubagent()]
	]);
}