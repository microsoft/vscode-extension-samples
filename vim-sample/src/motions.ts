/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {Position, TextDocument} from 'vscode';
import {Words, WordCharacters} from './words';
import {Command, AbstractCommandDescriptor} from './common';

export class MotionState {

	public anchor: Position;
	public cursorDesiredCharacter: number;
	public wordCharacterClass: WordCharacters;

	constructor() {
		this.cursorDesiredCharacter = -1;
		this.wordCharacterClass = null;
		this.anchor = null;
	}

}

export abstract class Motion {
	public abstract run(doc: TextDocument, pos: Position, state: MotionState): Position;

	public repeat(hasRepeatCount:boolean, count: number): Motion {
		if (!hasRepeatCount) {
			return this;
		}
		return new RepeatingMotion(this, count);
	}
}

class RepeatingMotion extends Motion {

	private _actual: Motion;
	private _repeatCount: number;

	constructor(actual: Motion, repeatCount: number) {
		super();
		this._actual = actual;
		this._repeatCount = repeatCount;
	}

	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		for (var cnt = 0; cnt < this._repeatCount; cnt++) {
			pos = this._actual.run(doc, pos, state);
		}
		return pos;
	}
}

class NextCharacterMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		if (pos.character === doc.lineAt(pos.line).text.length) {
			// on last character
			return ((pos.line + 1 < doc.lineCount) ? new Position(pos.line + 1, 0) : pos);
		}

		return new Position(pos.line, pos.character + 1);
	}
}

class LeftMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		let line = pos.line;

		if (pos.character > 0) {
			state.cursorDesiredCharacter = pos.character - 1;
			return new Position(line, state.cursorDesiredCharacter);
		}

		return pos;
	}
}

class DownMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		let line = pos.line;

		state.cursorDesiredCharacter = (state.cursorDesiredCharacter === -1 ? pos.character : state.cursorDesiredCharacter);

		if (line < doc.lineCount - 1) {
			line++;
			return new Position(line, Math.min(state.cursorDesiredCharacter, doc.lineAt(line).text.length));
		}

		return pos;
	}
}

class UpMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		let line = pos.line;

		state.cursorDesiredCharacter = (state.cursorDesiredCharacter === -1 ? pos.character : state.cursorDesiredCharacter);

		if (line > 0) {
			line--;
			return new Position(line, Math.min(state.cursorDesiredCharacter, doc.lineAt(line).text.length));
		}

		return pos;
	}
}

class RightMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		let line = pos.line;
		let maxCharacter = doc.lineAt(line).text.length;

		if (pos.character < maxCharacter) {
			state.cursorDesiredCharacter = pos.character + 1;
			return new Position(line, state.cursorDesiredCharacter);
		}

		return pos;
	}
}

class EndOfLineMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		return new Position(pos.line, doc.lineAt(pos.line).text.length);
	}
}

class StartOfLineMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		return new Position(pos.line, 0);
	}
}

class NextWordStartMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		let lineContent = doc.lineAt(pos.line).text;

		if (pos.character >= lineContent.length - 1) {
			// cursor at end of line
			return ((pos.line + 1 < doc.lineCount) ? new Position(pos.line + 1, 0) : pos);
		}

		let nextWord = Words.findNextWord(doc, pos, state.wordCharacterClass);

		if (!nextWord) {
			// return end of the line
			return Motions.EndOfLine.run(doc, pos, state);
		}

		if (nextWord.start <= pos.character && pos.character < nextWord.end) {
			// Sitting on a word
			let nextNextWord = Words.findNextWord(doc, new Position(pos.line, nextWord.end), state.wordCharacterClass);
			if (nextNextWord) {
				// return start of the next next word
				return new Position(pos.line, nextNextWord.start);
			} else {
				// return end of line
				return Motions.EndOfLine.run(doc, pos, state);
			}
		} else {
			// return start of the next word
			return new Position(pos.line, nextWord.start);
		}
	}
}

class NextWordEndMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		let lineContent = doc.lineAt(pos.line).text;

		if (pos.character >= lineContent.length - 1) {
			// no content on this line or cursor at end of line
			return ((pos.line + 1 < doc.lineCount) ? new Position(pos.line + 1, 0) : pos);
		}

		let nextWord = Words.findNextWord(doc, pos, state.wordCharacterClass);

		if (!nextWord) {
			// return end of the line
			return Motions.EndOfLine.run(doc, pos, state);
		}

		// return start of the next word
		return new Position(pos.line, nextWord.end);
	}
}

class GoToLineUndefinedMotion extends Motion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		// does not do anything
		return pos;
	}

	public repeat(hasRepeatCount:boolean, count: number): Motion {
		if (!hasRepeatCount) {
			return Motions.GoToLastLine;
		}
		return new GoToLineDefinedMotion(count);
	}
}

abstract class GoToLineMotion extends Motion {

	protected firstNonWhitespaceChar(doc: TextDocument, line:number): number {
		let lineContent = doc.lineAt(line).text;
		let character = 0;
		while (character < lineContent.length) {
			let ch = lineContent.charAt(character);
			if (ch !== ' ' && ch !== '\t') {
				break;
			}
			character++;
		}
		return character;
	}

}

class GoToFirstLineMotion extends GoToLineMotion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		return new Position(0, this.firstNonWhitespaceChar(doc, 0));
	}
}

class GoToLastLineMotion extends GoToLineMotion {
	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		let lastLine = doc.lineCount - 1;
		return new Position(lastLine, this.firstNonWhitespaceChar(doc, lastLine));
	}
}

class GoToLineDefinedMotion extends GoToLineMotion {
	private _lineNumber:number;

	constructor(lineNumber:number) {
		super();
		this._lineNumber = lineNumber;
	}

	public run(doc: TextDocument, pos: Position, state: MotionState): Position {
		let line = Math.min(doc.lineCount - 1, Math.max(0, this._lineNumber - 1));
		return new Position(line, this.firstNonWhitespaceChar(doc, line));
	}
}

class CursorMoveCommand extends AbstractCommandDescriptor {

	constructor(private to: string, private by?: string) {
		super();
	}

	public createCommand(args?: any): Command {
		let cursorMoveArgs: any = {
			to: this.to,
			by: this.by,
			value: args.repeat || 1,
			select: !!args.isVisual
		}
		return {
			commandId: 'cursorMove',
			args: cursorMoveArgs
		};
	}
}

class MoveActiveEditorCommandByPosition extends AbstractCommandDescriptor {

	constructor() {
		super();
	}

	public createCommand(args?: any): Command {
		let moveActiveEditorArgs: any = {
			to: args.repeat === void 0 ? 'last' : 'position',
			value: args.repeat !== void 0 ? args.repeat + 1 : undefined
		}
		return {
			commandId: 'moveActiveEditor',
			args: moveActiveEditorArgs
		};
	}
}

class MoveActiveEditorCommand extends AbstractCommandDescriptor {

	constructor(private to: string) {
		super();
	}

	public createCommand(args?: any): Command {
		let moveActiveEditorArgs: any = {
			to: this.to,
			value: args.repeat ? args.repeat : 1
		}
		return {
			commandId: 'moveActiveEditor',
			args: moveActiveEditorArgs
		};
	}
}

export const Motions = {
	RightMotion: new RightMotion(),

	NextCharacter: new NextCharacterMotion(),

	Left: new CursorMoveCommand('left'),
	Right: new CursorMoveCommand('right'),
	Down: new DownMotion(),
	Up: new UpMotion(),

	EndOfLine: new EndOfLineMotion(),
	StartOfLine: new StartOfLineMotion(),
	NextWordStart: new NextWordStartMotion(),
	NextWordEnd: new NextWordEndMotion(),
	GoToLine: new GoToLineUndefinedMotion(),
	GoToFirstLine: new GoToFirstLineMotion(),
	GoToLastLine: new GoToLastLineMotion(),

	ScrollLeft: new CursorMoveCommand('left'),
	ScrollRight: new CursorMoveCommand('right'),
	ScrollLeftByHalfLine: new CursorMoveCommand('left', 'halfLine'),
	ScrollRightByHalfLine: new CursorMoveCommand('right', 'halfLine'),

	WrappedLineUp: new CursorMoveCommand('up', 'wrappedLine'),
	WrappedLineDown: new CursorMoveCommand('down', 'wrappedLine'),

	WrappedLineStart: new CursorMoveCommand('wrappedLineStart'),
	WrappedLineFirstNonWhiteSpaceCharacter: new CursorMoveCommand('wrappedLineFirstNonWhitespaceCharacter'),
	WrappedLineColumnCenter: new CursorMoveCommand('wrappedLineColumnCenter'),
	WrappedLineEnd: new CursorMoveCommand('wrappedLineEnd'),
	WrappedLineLastNonWhiteSpaceCharacter: new CursorMoveCommand('wrappedLineLastNonWhitespaceCharacter'),

	ViewPortTop: new CursorMoveCommand('viewPortTop'),
	ViewPortBottom: new CursorMoveCommand('viewPortBottom'),
	ViewPortCenter: new CursorMoveCommand('viewPortCenter'),

	MoveActiveEditor: new MoveActiveEditorCommandByPosition(),
	MoveActiveEditorLeft: new MoveActiveEditorCommand('left'),
	MoveActiveEditorRight: new MoveActiveEditorCommand('right'),
	MoveActiveEditorFirst: new MoveActiveEditorCommand('first'),
	MoveActiveEditorLast: new MoveActiveEditorCommand('last'),
	MoveActiveEditorCenter: new MoveActiveEditorCommand('center')
};
