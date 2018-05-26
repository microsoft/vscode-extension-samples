/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import { MemFS } from './fileSystemProvider';

function joinPath(resource: vscode.Uri, pathFragment: string): vscode.Uri {
	const joinedPath = path.join(resource.path || '/', pathFragment);
	return resource.with({
		path: joinedPath
	});
}

function escapeRegExpCharacters(value: string): string {
	return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\[\]\(\)\#]/g, '\\$&');
}

export class SearchMemFS implements vscode.SearchProvider {
    constructor(private memfs: MemFS) { }

    provideTextSearchResults(query: vscode.TextSearchQuery, options: vscode.TextSearchOptions, progress: vscode.Progress<vscode.TextSearchResult>, token: vscode.CancellationToken): Promise<void> {
        const flags = query.isCaseSensitive ? 'g' : 'ig';
        let regexText = query.isRegExp ? query.pattern : escapeRegExpCharacters(query.pattern);
        if (query.isWordMatch) {
            regexText = `\\b${regexText}\\b`;
        }
        
        const searchRegex = new RegExp(regexText, flags);
        this._textSearchDir(options.folder, '', searchRegex, options, progress);

        return Promise.resolve();
    }

    private _textSearchDir(baseFolder: vscode.Uri, relativeDir: string, pattern: RegExp, options: vscode.TextSearchOptions, progress: vscode.Progress<vscode.TextSearchResult>): void {
        this.memfs.readDirectory(joinPath(baseFolder, relativeDir))
            .forEach(([name, type]) => {
                const relativeResult = path.join(relativeDir, name);
                if (type === vscode.FileType.Directory) {
                    this._textSearchDir(baseFolder, relativeResult, pattern, options, progress);
                } else if (type === vscode.FileType.File) {
                    this._textSearchFile(baseFolder, relativeResult, pattern, options, progress);
                }
            });
    }

    private _textSearchFile(baseFolder: vscode.Uri, relativePath: string, pattern: RegExp, options: vscode.TextSearchOptions, progress: vscode.Progress<vscode.TextSearchResult>): void {
        const fileUri = joinPath(baseFolder, relativePath);
        const fileContents = new Buffer(this.memfs.readFile(fileUri))
            .toString(options.encoding || 'utf8');

        fileContents
            .split(/\r?\n/)
            .forEach((line, i) => {
                let result: RegExpExecArray|null;
                while (result = pattern.exec(line)) {
                    const range = new vscode.Range(i, result.index, i, result.index + result[0].length);

                    progress.report({
                        path: relativePath,
                        range,

                        // options.previewOptions will describe parameters for this
                        preview: {
                            text: line,
                            match: new vscode.Range(0, range.start.character, 0, range.end.character)
                        }
                    });
                }
            });
    }

    provideFileSearchResults(options: vscode.SearchOptions, progress: vscode.Progress<string>, token: vscode.CancellationToken): Promise<void> {
        this._fileSearchDir(options.folder, '', progress);
        return Promise.resolve();
    }

    private _fileSearchDir(folder: vscode.Uri, relativePath: string, progress: vscode.Progress<string>): void {
        this.memfs.readDirectory(joinPath(folder, relativePath))
            .forEach(([name, type]) => {
                const relativeResult = path.join(relativePath, name);
                if (type === vscode.FileType.Directory) {
                    this._fileSearchDir(folder, relativeResult, progress);
                } else if (type === vscode.FileType.File) {
                    progress.report(relativeResult);
                }
        });
    }
}
