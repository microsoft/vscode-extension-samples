/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.registerFileSystemProvider('datei', new DateiFileSystemProvider(), {
        isCaseSensitive: process.platform === 'linux'
    });
}

class DateiFileSystemProvider implements vscode.FileSystemProvider {

    private _onDidChangeFile: vscode.EventEmitter<vscode.FileChangeEvent[]>;

    constructor() {
        this._onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    }

    get onDidChangeFile(): vscode.Event<vscode.FileChangeEvent[]> {
        return this._onDidChangeFile.event;
    }

    stat(uri: vscode.Uri, options: {}, token: vscode.CancellationToken): vscode.FileStat | Thenable<vscode.FileStat> {
        return this._stat(uri.fsPath);
    }

    async _stat(path: string): Promise<vscode.FileStat> {
        return new FileStat(await _.stat(path));
    }

    readFile(uri: vscode.Uri, options: vscode.FileOptions, token: vscode.CancellationToken): Uint8Array | Thenable<Uint8Array> {
        return _.readfile(uri.fsPath);
    }

    readDirectory(uri: vscode.Uri, options: {}, token: vscode.CancellationToken): Thenable<[string, vscode.FileStat][]> {
        return this._readDirectory(uri, token);
    }

    async _readDirectory(uri: vscode.Uri, token: vscode.CancellationToken): Promise<[string, vscode.FileStat][]> {
        const children = await _.readdir(uri.fsPath);

        const stats: [string, vscode.FileStat][] = [];
        for (let i = 0; i < children.length; i++) {
            _.checkCancellation(token);

            const child = children[i];
            const stat = await this._stat(path.join(uri.fsPath, child));
            stats.push([child, stat]);
        }

        return Promise.resolve(stats);
    }

    createDirectory(uri: vscode.Uri, options: {}, token: vscode.CancellationToken): vscode.FileStat | Thenable<vscode.FileStat> {
        return this._createDirectory(uri, token);
    }

    async _createDirectory(uri: vscode.Uri, token: vscode.CancellationToken): Promise<vscode.FileStat> {
        await _.mkdir(uri.fsPath); // TODO support cancellation

        _.checkCancellation(token);

        return this._stat(uri.fsPath);
    }

    writeFile(uri: vscode.Uri, content: Uint8Array, options: vscode.FileOptions, token: vscode.CancellationToken): void | Thenable<void> {
        return this._writeFile(uri, content, options, token);
    }

    async _writeFile(uri: vscode.Uri, content: Uint8Array, options: vscode.FileOptions, token: vscode.CancellationToken): Promise<void> {
        const exists = await _.exists(uri.fsPath);
        if (!exists) {
            _.checkCancellation(token);

            if (!options.create) {
                throw vscode.FileSystemError.FileNotFound();
            }

            await _.mkdir(path.dirname(uri.fsPath));
        } else {
            if (options.exclusive) {
                throw vscode.FileSystemError.FileExists();
            }
        }

        _.checkCancellation(token);

        return _.writefile(uri.fsPath, content as Buffer);
    }

    delete(uri: vscode.Uri, options: {}, token: vscode.CancellationToken): void | Thenable<void> {
        return _.rmrf(uri.fsPath); // TODO support cancellation
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: vscode.FileOptions, token: vscode.CancellationToken): vscode.FileStat | Thenable<vscode.FileStat> {
        return this._rename(oldUri, newUri, options, token);
    }

    async _rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: vscode.FileOptions, token: vscode.CancellationToken): Promise<vscode.FileStat> {
        const exists = await _.exists(newUri.fsPath);
        if (exists) {
            if (options.exclusive) {
                throw vscode.FileSystemError.FileExists();
            } else {
                await _.rmrf(newUri.fsPath);
            }
        }

        _.checkCancellation(token);

        const parentExists = await _.exists(path.dirname(newUri.fsPath));
        if (!parentExists && !options.create) {
            throw vscode.FileSystemError.FileNotFound();
        }

        _.checkCancellation(token);

        if (!parentExists) {
            await _.mkdir(path.dirname(newUri.fsPath));
        }

        _.checkCancellation(token);

        await _.rename(oldUri.fsPath, newUri.fsPath);

        _.checkCancellation(token);

        return this._stat(newUri.fsPath);
    }

    watch(uri: vscode.Uri, options: { recursive?: boolean | undefined; excludes?: string[] | undefined; }): vscode.Disposable {
        const watcher = fs.watch(uri.fsPath, { recursive: options.recursive }, async (event: string, filename: string | Buffer) => {
            const filepath = path.join(uri.fsPath, _.normalizeNFC(filename.toString()));

            // TODO support excludes (using minimatch library?)

            this._onDidChangeFile.fire([{
                type: event === 'change' ? vscode.FileChangeType.Changed : await _.exists(filepath) ? vscode.FileChangeType.Created : vscode.FileChangeType.Deleted,
                uri: uri.with({ path: filepath })
            } as vscode.FileChangeEvent]);
        });

        return { dispose: () => watcher.close() };
    }

    // TODO can implement a fast copy() method with node.js 8.x new fs.copy method
}

export function deactivate() { }

//#region Utilities

namespace _ {

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

        return error;
    }

    export function checkCancellation(token: vscode.CancellationToken): void {
        if (token.isCancellationRequested) {
            throw new Error('Operation cancelled');
        }
    }

    export function normalizeNFC(items: string): string;
    export function normalizeNFC(items: string[]): string[];
    export function normalizeNFC(items: string | string[]): string | string[] {
        if (process.platform !== 'darwin') {
            return items;
        }

        if (Array.isArray(items)) {
            return items.map(item => item.normalize('NFC'));
        }

        return items.normalize('NFC');
    }

    export function readdir(path: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(path, (error, children) => handleResult(resolve, reject, error, normalizeNFC(children)));
        });
    }

    export function stat(path: string): Promise<fs.Stats> {
        return new Promise<fs.Stats>((resolve, reject) => {
            fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
        });
    }

    export function readfile(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
        });
    }

    export function writefile(path: string, content: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(path, content, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(path, exists => handleResult(resolve, reject, null, exists));
        });
    }

    export function rmrf(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            rimraf(path, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function mkdir(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            mkdirp(path, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function rename(oldPath: string, newPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.rename(oldPath, newPath, error => handleResult(resolve, reject, error, void 0));
        });
    }
}

export class FileStat implements vscode.FileStat {

    constructor(private fsStat: fs.Stats) { }

    get isFile(): boolean | undefined {
        return this.fsStat.isFile();
    }

    get isDirectory(): boolean | undefined {
        return this.fsStat.isDirectory();
    }

    get isSymbolicLink(): boolean | undefined {
        return this.fsStat.isSymbolicLink();
    }

    get size(): number {
        return this.fsStat.size;
    }

    get mtime(): number {
        return this.fsStat.mtime.getTime();
    }
}

//#endregion