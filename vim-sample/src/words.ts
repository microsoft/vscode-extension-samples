/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position, TextDocument } from 'vscode';

export enum CharacterClass {
	REGULAR = 0,
	WORD_SEPARATOR = 1,
	WHITESPACE = 2
}

export enum WordType {
	NONE = 0,
	SEPARATOR = 1,
	REGULAR = 2
}

export type WordCharacters = CharacterClass[];

export interface IWord {
	start: number;
	end: number;
	wordType: WordType;
}

export class Words {

	public static createWordCharacters(wordSeparators: string): WordCharacters {
		const result: CharacterClass[] = [];

		// Make array fast for ASCII text
		for (let chCode = 0; chCode < 256; chCode++) {
			result[chCode] = CharacterClass.REGULAR;
		}

		for (let i = 0, len = wordSeparators.length; i < len; i++) {
			result[wordSeparators.charCodeAt(i)] = CharacterClass.WORD_SEPARATOR;
		}

		result[' '.charCodeAt(0)] = CharacterClass.WHITESPACE;
		result['\t'.charCodeAt(0)] = CharacterClass.WHITESPACE;

		return result;
	}

	public static findNextWord(doc: TextDocument, pos: Position, wordCharacterClass: WordCharacters): IWord | null {

		const lineContent = doc.lineAt(pos.line).text;
		let wordType = WordType.NONE;
		const len = lineContent.length;

		for (let chIndex = pos.character; chIndex < len; chIndex++) {
			const chCode = lineContent.charCodeAt(chIndex);
			const chClass = (wordCharacterClass[chCode] || CharacterClass.REGULAR);

			if (chClass === CharacterClass.REGULAR) {
				if (wordType === WordType.SEPARATOR) {
					return this._createWord(lineContent, wordType, this._findStartOfWord(lineContent, wordCharacterClass, wordType, chIndex - 1), chIndex);
				}
				wordType = WordType.REGULAR;
			} else if (chClass === CharacterClass.WORD_SEPARATOR) {
				if (wordType === WordType.REGULAR) {
					return this._createWord(lineContent, wordType, this._findStartOfWord(lineContent, wordCharacterClass, wordType, chIndex - 1), chIndex);
				}
				wordType = WordType.SEPARATOR;
			} else if (chClass === CharacterClass.WHITESPACE) {
				if (wordType !== WordType.NONE) {
					return this._createWord(lineContent, wordType, this._findStartOfWord(lineContent, wordCharacterClass, wordType, chIndex - 1), chIndex);
				}
			}
		}

		if (wordType !== WordType.NONE) {
			return this._createWord(lineContent, wordType, this._findStartOfWord(lineContent, wordCharacterClass, wordType, len - 1), len);
		}

		return null;
	}

	private static _findStartOfWord(lineContent: string, wordCharacterClass: WordCharacters, wordType: WordType, startIndex: number): number {
		for (let chIndex = startIndex; chIndex >= 0; chIndex--) {
			const chCode = lineContent.charCodeAt(chIndex);
			const chClass = (wordCharacterClass[chCode] || CharacterClass.REGULAR);

			if (chClass === CharacterClass.WHITESPACE) {
				return chIndex + 1;
			}
			if (wordType === WordType.REGULAR && chClass === CharacterClass.WORD_SEPARATOR) {
				return chIndex + 1;
			}
			if (wordType === WordType.SEPARATOR && chClass === CharacterClass.REGULAR) {
				return chIndex + 1;
			}
		}
		return 0;
	}

	private static _createWord(lineContent: string, wordType: WordType, start: number, end: number): IWord {
		// console.log('WORD ==> ' + start + ' => ' + end + ':::: <<<' + lineContent.substring(start, end) + '>>>');
		return { start: start, end: end, wordType: wordType };
	}
}
