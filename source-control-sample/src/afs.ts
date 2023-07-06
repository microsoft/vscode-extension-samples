// This file promisifies necessary file system functions. 
// This should be removed when VS Code updates to Node.js ^11.14 and replaced by the native fs promises.

import * as vscode from 'vscode';
import * as fs from 'fs';

function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
	if (error) {
		reject(massageError(error));
	} else {
		resolve(result);
	}
}


function massageError(error: Error & { code?: string }): Error {
	if (error.code === 'ENOENT') {
		return vscode.FileSystemError.FileNotFound();
	}

	if (error.code === 'EISDIR') {
		return vscode.FileSystemError.FileIsADirectory();
	}

	if (error.code === 'EEXIST') {
		return vscode.FileSystemError.FileExists();
	}

	if (error.code === 'EPERM' || error.code === 'EACCES') {
		return vscode.FileSystemError.NoPermissions();
	}

	return error;
}

export function readFile(path: string): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
	});
}

export function writeFile(path: string, content: Buffer): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.writeFile(path, content, error => handleResult(resolve, reject, error, void 0));
	});
}

export function exists(path: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		fs.exists(path, exists => handleResult(resolve, reject, null, exists));
	});
}

export function readdir(path: string): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		fs.readdir(path, (error, files) => handleResult(resolve, reject, error, files));
	});
}

export function unlink(path: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.unlink(path, error => handleResult(resolve, reject, error, void 0));
	});
}