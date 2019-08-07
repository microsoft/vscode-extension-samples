/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import * as vscode from 'vscode';

export class RakeTaskProvider implements vscode.TaskProvider {
	static RakeType: string = 'rake';
	private rakePromise: Thenable<vscode.Task[]> | undefined = undefined;

	constructor(workspaceRoot: string) {
		let pattern = path.join(workspaceRoot, 'Rakefile');
		let fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
		fileWatcher.onDidChange(() => this.rakePromise = undefined);
		fileWatcher.onDidCreate(() => this.rakePromise = undefined);
		fileWatcher.onDidDelete(() => this.rakePromise = undefined);
	}

	public provideTasks(): Thenable<vscode.Task[]> | undefined {
		if (!this.rakePromise) {
			this.rakePromise = getRakeTasks();
		}
		return this.rakePromise;
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		const task = _task.definition.task;
		// A Rake task consists of a task and an optional file as specified in RakeTaskDefinition
		// Make sure that this looks like a Rake task by checking that there is a task.
		if (task) {
			// resolveTask requires that the same definition object be used.
			const definition: RakeTaskDefinition = <any>_task.definition;
			return new vscode.Task(definition, definition.task, 'rake', new vscode.ShellExecution(`rake ${definition.task}`));
		}
		return undefined;
	}
}

function exists(file: string): Promise<boolean> {
	return new Promise<boolean>((resolve, _reject) => {
		fs.exists(file, (value) => {
			resolve(value);
		});
	});
}

function exec(command: string, options: cp.ExecOptions): Promise<{ stdout: string; stderr: string }> {
	return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
		cp.exec(command, options, (error, stdout, stderr) => {
			if (error) {
				reject({ error, stdout, stderr });
			}
			resolve({ stdout, stderr });
		});
	});
}

let _channel: vscode.OutputChannel;
function getOutputChannel(): vscode.OutputChannel {
	if (!_channel) {
		_channel = vscode.window.createOutputChannel('Rake Auto Detection');
	}
	return _channel;
}

interface RakeTaskDefinition extends vscode.TaskDefinition {
	/**
	 * The task name
	 */
	task: string;

	/**
	 * The rake file containing the task
	 */
	file?: string;
}

const buildNames: string[] = ['build', 'compile', 'watch'];
function isBuildTask(name: string): boolean {
	for (let buildName of buildNames) {
		if (name.indexOf(buildName) !== -1) {
			return true;
		}
	}
	return false;
}

const testNames: string[] = ['test'];
function isTestTask(name: string): boolean {
	for (let testName of testNames) {
		if (name.indexOf(testName) !== -1) {
			return true;
		}
	}
	return false;
}

async function getRakeTasks(): Promise<vscode.Task[]> {
	let workspaceRoot = vscode.workspace.rootPath;
	let emptyTasks: vscode.Task[] = [];
	if (!workspaceRoot) {
		return emptyTasks;
	}
	let rakeFile = path.join(workspaceRoot, 'Rakefile');
	if (!await exists(rakeFile)) {
		return emptyTasks;
	}

	let commandLine = 'rake -AT -f Rakefile';
	try {
		let { stdout, stderr } = await exec(commandLine, { cwd: workspaceRoot });
		if (stderr && stderr.length > 0) {
			getOutputChannel().appendLine(stderr);
			getOutputChannel().show(true);
		}
		let result: vscode.Task[] = [];
		if (stdout) {
			let lines = stdout.split(/\r{0,1}\n/);
			for (let line of lines) {
				if (line.length === 0) {
					continue;
				}
				let regExp = /rake\s(.*)#/;
				let matches = regExp.exec(line);
				if (matches && matches.length === 2) {
					let taskName = matches[1].trim();
					let kind: RakeTaskDefinition = {
						type: 'rake',
						task: taskName
					};
					let task = new vscode.Task(kind, taskName, 'rake', new vscode.ShellExecution(`rake ${taskName}`));
					result.push(task);
					let lowerCaseLine = line.toLowerCase();
					if (isBuildTask(lowerCaseLine)) {
						task.group = vscode.TaskGroup.Build;
					} else if (isTestTask(lowerCaseLine)) {
						task.group = vscode.TaskGroup.Test;
					}
				}
			}
		}
		return result;
	} catch (err) {
		let channel = getOutputChannel();
		if (err.stderr) {
			channel.appendLine(err.stderr);
		}
		if (err.stdout) {
			channel.appendLine(err.stdout);
		}
		channel.appendLine('Auto detecting rake tasts failed.');
		channel.show(true);
		return emptyTasks;
	}
}
