/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { workspace } from 'vscode';

class File {

    type: vscode.FileType2;
    mtime: number;
    size: number;
    name: string;

    constructor(name: string) {
        this.type = vscode.FileType2.File;
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
    }
}

class Directory {

    type: vscode.FileType2;
    mtime: number;
    size: number;
    name: string;
    entries: Map<string, Entry>;

    constructor(name: string) {
        this.type = vscode.FileType2.Directory;
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
        this.entries = new Map();
    }
}

type Entry = File | Directory;

export class MemFS implements vscode.FileSystemProvider2 {

    _version: 9 = 9;

    private _root = new Directory('');
    private _data = new WeakMap<Entry, Uint8Array>();
    private _emitter = new vscode.EventEmitter<vscode.FileChange2[]>();

    readonly onDidChangeFile: vscode.Event<vscode.FileChange2[]> = this._emitter.event;

    watch(resource: vscode.Uri, opts): vscode.Disposable {
        // ignore, fires for all changes...
        return new vscode.Disposable(() => { });
    }

    stat(uri: vscode.Uri): vscode.FileStat2 {
        return this._lookup(uri);
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileStat2][] {
        const entry = this._lookupDir(uri);
        let result: [string, vscode.FileStat2][] = [];
        for (const [name, child] of entry.entries) {
            result.push([name, child]);
        }
        return result;
    }

    readFile(uri: vscode.Uri): Uint8Array {
        const entry = this._lookup(uri);
        return this._data.get(entry) || new Uint8Array(0);
    }

    writeFile(uri: vscode.Uri, content: Uint8Array): void {
        let basename = path.posix.basename(uri.path);
        let parent = this._lookupContainer(uri);
        let entry = parent.entries.get(basename);
        if (!entry) {
            entry = new File(basename);
            parent.entries.set(basename, entry);
            this._fireSoon({ type: vscode.FileChangeType2.Created, uri });
        }
        entry.mtime = Date.now();
        entry.size = content.byteLength;
        this._data.set(entry, content);
        this._fireSoon({ type: vscode.FileChangeType2.Changed, uri });
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri): vscode.FileStat2 {
        let entry = this._lookup(oldUri);
        let oldParent = this._lookupContainer(oldUri);

        let newParent = this._lookupContainer(newUri);
        let newName = path.posix.basename(newUri.path);

        oldParent.entries.delete(entry.name);
        entry.name = newName;
        newParent.entries.set(newName, entry);

        this._fireSoon(
            { type: vscode.FileChangeType2.Deleted, uri: oldUri },
            { type: vscode.FileChangeType2.Created, uri: newUri }
        );
        return entry;
    }

    delete(uri: vscode.Uri): void {
        let dirname = uri.with({ path: path.posix.dirname(uri.path) });
        let basename = path.posix.basename(uri.path);
        let parent = this._lookupDir(dirname);
        if (!parent.entries.has(basename)) {
            throw vscode.FileSystemError.EntryNotFound();
        }
        parent.entries.delete(basename);
        parent.mtime = Date.now();
        parent.size -= 1;
        this._fireSoon({ type: vscode.FileChangeType2.Changed, uri: dirname }, { uri, type: vscode.FileChangeType2.Deleted });
    }

    createDirectory(uri: vscode.Uri): vscode.FileStat2 {
        let basename = path.posix.basename(uri.path);
        let dirname = uri.with({ path: path.posix.dirname(uri.path) });
        let parent = this._lookupDir(dirname);

        let entry = new Directory(basename);
        parent.entries.set(entry.name, entry);
        parent.mtime = Date.now();
        parent.size += 1;
        this._fireSoon({ type: vscode.FileChangeType2.Changed, uri: dirname }, { type: vscode.FileChangeType2.Created, uri });
        return entry;
    }

    // --- lookup

    private _lookup(uri: vscode.Uri): Entry {
        let parts = uri.path.split('/');
        let entry: Entry = this._root;
        for (const part of parts) {
            if (!part) {
                continue;
            }
            let child: Entry;
            if (entry instanceof Directory) {
                child = entry.entries.get(part);
            }
            if (!child) {
                throw vscode.FileSystemError.EntryNotFound();
            }
            entry = child;
        }
        return entry;
    }

    private _lookupDir(uri: vscode.Uri): Directory {
        let entry = this._lookup(uri);
        if (!(entry instanceof Directory)) {
            throw vscode.FileSystemError.EntryNotADirectory();
        }
        return entry;
    }

    private _lookupContainer(uri: vscode.Uri): Directory {
        const dirname = uri.with({ path: path.posix.dirname(uri.path) });
        return this._lookupDir(dirname);
    }

    // --- events

    private _bufferedEvents: vscode.FileChange2[] = [];
    private _fireSoonHandle: NodeJS.Timer;

    private _fireSoon(...events: vscode.FileChange2[]): void {
        this._bufferedEvents.push(...events);
        clearTimeout(this._fireSoonHandle);
        this._fireSoonHandle = setTimeout(() => {
            this._emitter.fire(this._bufferedEvents);
            this._bufferedEvents.length = 0;
        }, 25);
    }
}
