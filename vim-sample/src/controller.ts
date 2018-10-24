/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {
	TextEditorCursorStyle,
	Position,
	Range,
	Selection,
	TextEditor,
	TextEditorRevealType,
	window
} from 'vscode';

import { Words } from './words';
import { MotionState, Motion } from './motions';
import { Mode, IController, DeleteRegister, Command, ModifierKeys } from './common';
import { Mappings } from './mappings';

export interface ITypeResult {
	hasConsumedInput: boolean;
	executeEditorCommand: Command;
}

export class Controller implements IController {

	private _currentMode: Mode;
	private _currentInput: string;
	private _motionState: MotionState;
	private _isVisual: boolean;

	public get motionState(): MotionState { return this._motionState; }
	public findMotion(input: string): Motion { return Mappings.findMotion(input); }
	public isMotionPrefix(input: string): boolean { return Mappings.isMotionPrefix(input); }

	private _deleteRegister: DeleteRegister;
	public setDeleteRegister(register: DeleteRegister): void { this._deleteRegister = register; }
	public getDeleteRegister(): DeleteRegister { return this._deleteRegister; }

	constructor() {
		this._motionState = new MotionState();
		this._deleteRegister = null;
		this.setVisual(false);
		this.setMode(Mode.NORMAL);
	}

	public setWordSeparators(wordSeparators: string): void {
		this._motionState.wordCharacterClass = Words.createWordCharacters(wordSeparators);
	}

	public ensureNormalModePosition(editor: TextEditor): void {
		if (this._currentMode !== Mode.NORMAL) {
			return;
		}
		if (this._isVisual) {
			return;
		}
		let sel = editor.selection;
		let pos = sel.active;
		let doc = editor.document;
		let lineContent = doc.lineAt(pos.line).text;
		if (lineContent.length === 0) {
			return;
		}
		let maxCharacter = lineContent.length - 1;
		if (pos.character > maxCharacter) {
			setPositionAndReveal(editor, pos.line, maxCharacter);
		}
	}

	public hasInput(): boolean {
		return this._currentInput.length > 0;
	}

	public clearInput(): void {
		this._currentInput = '';
	}

	public getMode(): Mode {
		return this._currentMode;
	}

	public setMode(newMode: Mode): void {
		if (newMode !== this._currentMode) {
			this._currentMode = newMode;
			this._motionState.cursorDesiredCharacter = -1; // uninitialized
			this._currentInput = '';
		}
	}

	public setVisual(newVisual: boolean): void {
		if (this._isVisual !== newVisual) {
			this._isVisual = newVisual;
		}
	}

	public getVisual(): boolean {
		return this._isVisual;
	}

	public getCursorStyle(): TextEditorCursorStyle {
		if (this._currentMode === Mode.NORMAL) {
			if (/^([1-9]\d*)?(r|c)/.test(this._currentInput)) {
				return TextEditorCursorStyle.Underline;
			}
			return TextEditorCursorStyle.Block;
		}
		if (this._currentMode === Mode.REPLACE) {
			return TextEditorCursorStyle.Underline;
		}
		return TextEditorCursorStyle.Line;
	}

	private _getModeLabel(): string {
		if (this._currentMode === Mode.NORMAL) {
			if (this._isVisual) {
				return '-- VISUAL --';
			}
			return '-- NORMAL --';
		}

		if (this._currentMode === Mode.REPLACE) {
			if (this._isVisual) {
				return '-- (replace) VISUAL --';
			}
			return '-- REPLACE --';
		}

		if (this._isVisual) {
			return '-- (insert) VISUAL --';
		}
		return '-- INSERT --';
	}

	public getStatusText(): string {
		let label = this._getModeLabel();
		return `VIM:> ${label}` + (this._currentInput ? ` >${this._currentInput}` : ``);
	}

	private _isInComposition = false;
	private _composingText = '';

	public compositionStart(editor: TextEditor): void {
		this._isInComposition = true;
		this._composingText = '';
	}

	public compositionEnd(editor: TextEditor): Thenable<ITypeResult> {
		this._isInComposition = false;
		let text = this._composingText;
		this._composingText = '';

		if (text.length === 0) {
			return Promise.resolve({
				hasConsumedInput: true,
				executeEditorCommand: null
			});
		}

		return this.type(editor, text, {});
	}

	public type(editor: TextEditor, text: string, modifierKeys: ModifierKeys): Thenable<ITypeResult> {
		if (this._currentMode !== Mode.NORMAL && this._currentMode !== Mode.REPLACE) {
			return Promise.resolve({
				hasConsumedInput: false,
				executeEditorCommand: null
			});
		}

		if (this._isInComposition) {
			this._composingText += text;
			return Promise.resolve({
				hasConsumedInput: true,
				executeEditorCommand: null
			});
		}

		if (this._currentMode === Mode.REPLACE) {
			let pos = editor.selection.active;
			editor.edit((builder) => {
				builder.replace(new Range(pos.line, pos.character, pos.line, pos.character + 1), text);
			}).then(() => {
				setPositionAndReveal(editor, pos.line, pos.character + 1);
			});

			return Promise.resolve({
				hasConsumedInput: true,
				executeEditorCommand: null
			});
		}
		this._currentInput += text;
		return this._interpretNormalModeInput(editor, modifierKeys);
	}

	public replacePrevChar(editor: TextEditor, text: string, replaceCharCnt: number): boolean {
		if (this._currentMode !== Mode.NORMAL && this._currentMode !== Mode.REPLACE) {
			return false;
		}

		if (this._isInComposition) {
			this._composingText = this._composingText.substr(0, this._composingText.length - replaceCharCnt) + text;
			return true;
		}

		if (this._currentMode === Mode.REPLACE) {
			let pos = editor.selection.active;
			editor.edit((builder) => {
				builder.replace(new Range(pos.line, pos.character - replaceCharCnt, pos.line, pos.character), text);
			});

			return true;
		}

		return true;
	}

	private _interpretNormalModeInput(editor: TextEditor, modifierKeys: ModifierKeys): Thenable<ITypeResult> {
		if (this._currentInput.startsWith(':')) {
			return window.showInputBox({ value: 'tabm' }).then((value) => {
				return this._findMapping(value || '', editor, modifierKeys);
			});
		}
		let result = this._findMapping(this._currentInput, editor, modifierKeys);
		return Promise.resolve(result);
	}

	private _findMapping(input: string, editor: TextEditor, modifierKeys: ModifierKeys): ITypeResult {
		let command = Mappings.findCommand(input, modifierKeys);
		if (command) {
			this._currentInput = '';
			return {
				hasConsumedInput: true,
				executeEditorCommand: command
			};
		}

		let operator = Mappings.findOperator(input, modifierKeys);
		if (operator) {
			if (this._isVisual) {
				if (operator.runVisual(this, editor)) {
					this._currentInput = '';
				}
			} else {
				// Mode.NORMAL
				if (operator.runNormal(this, editor)) {
					this._currentInput = '';
				}
			}
			return {
				hasConsumedInput: true,
				executeEditorCommand: null
			};
		}

		let motionCommand = Mappings.findMotionCommand(input, this._isVisual, modifierKeys);
		if (motionCommand) {
			this._currentInput = '';
			return {
				hasConsumedInput: true,
				executeEditorCommand: motionCommand
			};
		}

		let motion = Mappings.findMotion(input);
		if (motion) {
			let newPos = motion.run(editor.document, editor.selection.active, this._motionState);
			if (this._isVisual) {
				setSelectionAndReveal(editor, this._motionState.anchor, newPos.line, newPos.character);
			} else {
				// Mode.NORMAL
				setPositionAndReveal(editor, newPos.line, newPos.character);
			}
			this._currentInput = '';
			return {
				hasConsumedInput: true,
				executeEditorCommand: null
			};
		}

		// is it motion building
		if (this.isMotionPrefix(input)) {
			return {
				hasConsumedInput: true,
				executeEditorCommand: null
			};
		}

		// INVALID INPUT - beep!!
		this._currentInput = '';
		return {
			hasConsumedInput: true,
			executeEditorCommand: null
		};
	}
}

function setSelectionAndReveal(editor: TextEditor, anchor: Position, line: number, char: number): void {
	editor.selection = new Selection(anchor, new Position(line, char));
	revealPosition(editor, line, char);
}

function setPositionAndReveal(editor: TextEditor, line: number, char: number): void {
	editor.selection = new Selection(new Position(line, char), new Position(line, char));
	revealPosition(editor, line, char);
}

function revealPosition(editor: TextEditor, line: number, char: number): void {
	editor.revealRange(new Range(line, char, line, char), TextEditorRevealType.Default);
}
