/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import { ExtensionContext, window, commands, ProgressLocation, CancellationToken, Progress } from 'vscode';
import { spawn, spawnSync } from 'child_process';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand('extension.askMode', () => {
		return window.showQuickPick(['sync', 'async'], { placeHolder: 'Pick mode...' });
	}));
	context.subscriptions.push(commands.registerCommand('extension.startTask', async () => {
		let mode = await commands.executeCommand('extension.askMode');
		window.withProgress({
			location: ProgressLocation.Notification,
			title: "I am long running",
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
			});

			switch (mode) {
				case undefined:
					return; // canceled by the user
				case 'sync':
					return spawnSomethingSync(token);
				case 'async':
				default:
					return spawnSomethingAsync(progress, token);
			}
		});
	}));
}

/**
 * Synchronous approach
 * @param _token cancellation token (unused in the sync approach)
 */
function spawnSomethingSync(_token: CancellationToken): Promise<void> {
	return new Promise(resolve => {
		console.log('Started...');
		let child = spawnSync('cmd', ['/c', 'dir', '/S'], { cwd: 'c:\\', encoding: 'utf8' });
		console.log(`stdout: ${child.stdout.slice(0, 1000)}`); // otherwise it is too big for the console
		resolve();
	});
}

/**
 * Asynchronous approach
 * @param token cancellation token (triggered by the cancel button on the UI)
 */
function spawnSomethingAsync(progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		if (token.isCancellationRequested) {
			return;
		}

		var progressUpdate = 'Starting up...';
		const interval = setInterval(() => progress.report({ message: progressUpdate }), 500);

		let childProcess = spawn('cmd', ['/c', 'dir', '/S'], { cwd: 'C:\\Users\\jdolejsi\\AppData\\' })
			.on("close", (code, signal) => {
				console.log(`Closed: ${code} ${signal}`);
				if (childProcess.killed) { console.log('KILLED'); }
				resolve();
				clearInterval(interval);
			})
			.on("error", err => {
				reject(err);
			});

		childProcess.stdout
			.on("data", (chunk: string | Buffer) => {
				console.log(`stdout: ${chunk}`);
				progressUpdate = chunk.toString('utf8', 0, 50).replace(/[\r\n]/g, '');
			});

		token.onCancellationRequested(_ => childProcess.kill());
	});
}