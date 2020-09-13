/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position, Selection, Range, TextDocument, TextEditor, TextEditorRevealType } from 'vscode';
import { Motion, Motions } from './motions';
import { Mode, IController, DeleteRegister } from './common';

export abstract class Operator {

	public abstract runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean;
	public abstract runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean;

	protected doc(ed: TextEditor): TextDocument {
		return ed.document;
	}

	protected pos(ed: TextEditor): Position {
		return ed.selection.active;
	}

	protected sel(ed: TextEditor): Selection {
		return ed.selection;
	}

	protected setPosReveal(ed: TextEditor, line: number, char: number): void {
		ed.selection = new Selection(new Position(line, char), new Position(line, char));
		ed.revealRange(ed.selection, TextEditorRevealType.Default);
	}

	protected delete(ctrl: IController, ed: TextEditor, isWholeLine: boolean, range: Range): void {
		ctrl.setDeleteRegister(new DeleteRegister(isWholeLine, ed.document.getText(range)));
		ed.edit((builder) => {
			builder.delete(range);
		});
	}
}

abstract class OperatorWithNoArgs extends Operator {
	public runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean {
		this._run(ctrl, ed);
		return true;
	}
	public runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean {
		this._run(ctrl, ed);
		return true;
	}
	protected abstract _run(ctrl: IController, ed: TextEditor): void;
}

class InsertOperator extends OperatorWithNoArgs {
	protected _run(ctrl: IController, ed: TextEditor): void {
		ctrl.setMode(Mode.INSERT);
	}
}

class AppendOperator extends OperatorWithNoArgs {
	protected _run(ctrl: IController, ed: TextEditor): void {
		const newPos = Motions.RightMotion.run(this.doc(ed), this.pos(ed), ctrl.motionState);
		this.setPosReveal(ed, newPos.line, newPos.character);
		ctrl.setMode(Mode.INSERT);
	}
}

class AppendEndOfLineOperator extends OperatorWithNoArgs {
	protected _run(ctrl: IController, ed: TextEditor): void {
		const newPos = Motions.EndOfLine.run(this.doc(ed), this.pos(ed), ctrl.motionState);
		this.setPosReveal(ed, newPos.line, newPos.character);
		ctrl.setMode(Mode.INSERT);
	}
}

class VisualOperator extends OperatorWithNoArgs {
	protected _run(ctrl: IController, ed: TextEditor): void {
		ctrl.motionState.anchor = this.pos(ed);
		ctrl.setVisual(true);
	}
}

class DeleteCharUnderCursorOperator extends Operator {
	public runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean {
		const to = Motions.NextCharacter.repeat(repeatCount > 1, repeatCount).run(this.doc(ed), this.pos(ed), ctrl.motionState);
		const from = this.pos(ed);

		this.delete(ctrl, ed, false, new Range(from.line, from.character, to.line, to.character));

		return true;
	}

	public runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean {
		const sel = this.sel(ed);
		this.delete(ctrl, ed, false, sel);
		return true;
	}
}

class DeleteLineOperator extends Operator {
	public runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean {
		const pos = this.pos(ed);
		const doc = this.doc(ed);

		let fromLine = pos.line;
		let fromCharacter = 0;

		let toLine = fromLine + repeatCount;
		let toCharacter = 0;

		if (toLine >= doc.lineCount - 1) {
			// Deleting last line
			toLine = doc.lineCount - 1;
			toCharacter = doc.lineAt(toLine).text.length;

			if (fromLine > 0) {
				fromLine = fromLine - 1;
				fromCharacter = doc.lineAt(fromLine).text.length;
			}
		}

		this.delete(ctrl, ed, true, new Range(fromLine, fromCharacter, toLine, toCharacter));

		return true;
	}

	public runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean {
		const sel = this.sel(ed);
		this.delete(ctrl, ed, false, sel);
		return true;
	}
}

abstract class OperatorWithMotion extends Operator {
	public runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean {
		const motion = ctrl.findMotion(args);
		if (!motion) {

			// is it motion building
			if (ctrl.isMotionPrefix(args)) {
				return false;
			}

			// INVALID INPUT - beep!!
			return true;
		}

		return this._runNormalMode(ctrl, ed, motion.repeat(repeatCount > 1, repeatCount));
	}

	protected abstract _runNormalMode(ctrl: IController, ed: TextEditor, motion: Motion): boolean;
}

class DeleteToOperator extends OperatorWithMotion {

	public runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean {
		if (args === 'd') {
			// dd
			return Operators.DeleteLine.runNormalMode(ctrl, ed, repeatCount, args);
		}
		return super.runNormalMode(ctrl, ed, repeatCount, args);
	}

	protected _runNormalMode(ctrl: IController, ed: TextEditor, motion: Motion): boolean {
		const to = motion.run(this.doc(ed), this.pos(ed), ctrl.motionState);
		const from = this.pos(ed);

		this.delete(ctrl, ed, false, new Range(from.line, from.character, to.line, to.character));

		return true;
	}

	public runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean {
		const sel = this.sel(ed);
		this.delete(ctrl, ed, false, sel);
		return true;
	}
}

class PutOperator extends Operator {

	public runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean {
		const register = ctrl.getDeleteRegister();
		if (!register) {
			// No delete register - beep!!
			return true;
		}

		let str = repeatString(register.content, repeatCount);

		const pos = this.pos(ed);
		if (!register.isWholeLine) {
			ed.edit((builder) => {
				builder.insert(new Position(pos.line, pos.character + 1), str);
			});
			return true;
		}

		const doc = this.doc(ed);
		let insertLine = pos.line + 1;
		let insertCharacter = 0;

		if (insertLine >= doc.lineCount) {
			// on last line
			insertLine = doc.lineCount - 1;
			insertCharacter = doc.lineAt(insertLine).text.length;
			str = '\n' + str;
		}

		ed.edit((builder) => {
			builder.insert(new Position(insertLine, insertCharacter), str);
		});

		return true;
	}

	public runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean {
		const register = ctrl.getDeleteRegister();
		if (!register) {
			// No delete register - beep!!
			return false;
		}

		const str = register.content;

		const sel = this.sel(ed);
		ed.edit((builder) => {
			builder.replace(sel, str);
		});

		return true;
	}
}

class ReplaceOperator extends Operator {

	public runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean {
		if (args.length === 0) {
			// input not ready
			return false;
		}

		const doc = this.doc(ed);
		const pos = this.pos(ed);
		const toCharacter = pos.character + repeatCount;
		if (toCharacter > doc.lineAt(pos).text.length) {
			// invalid replace (beep!)
			return true;
		}

		ed.edit((builder) => {
			builder.replace(new Range(pos.line, pos.character, pos.line, toCharacter), repeatString(args, repeatCount));
		});

		return true;
	}

	public runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean {
		if (args.length === 0) {
			// input not ready
			return false;
		}

		const doc = this.doc(ed);
		const sel = this.sel(ed);

		const srcString = doc.getText(sel);
		let dstString = '';
		for (let i = 0; i < srcString.length; i++) {
			const ch = srcString.charAt(i);
			if (ch === '\r' || ch === '\n') {
				dstString += ch;
			} else {
				dstString += args;
			}
		}

		ed.edit((builder) => {
			builder.replace(sel, dstString);
		});

		return true;
	}
}

class ReplaceModeOperator extends Operator {

	public runNormalMode(ctrl: IController, ed: TextEditor, repeatCount: number, args: string): boolean {
		ctrl.setMode(Mode.REPLACE);
		return true;
	}

	public runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean {
		this.delete(ctrl, ed, false, this.sel(ed));
		ctrl.setMode(Mode.INSERT);
		return true;
	}

}

class ChangeOperator extends OperatorWithMotion {

	protected _runNormalMode(ctrl: IController, ed: TextEditor, motion: Motion): boolean {
		const to = motion.run(this.doc(ed), this.pos(ed), ctrl.motionState);
		const from = this.pos(ed);

		this.delete(ctrl, ed, false, new Range(from.line, from.character, to.line, to.character));

		ctrl.setMode(Mode.INSERT);

		return true;
	}

	public runVisualMode(ctrl: IController, ed: TextEditor, args: string): boolean {
		const sel = this.sel(ed);

		this.delete(ctrl, ed, false, sel);

		ctrl.setMode(Mode.INSERT);

		return true;
	}
}

function repeatString(str: string, repeatCount: number): string {
	let result = '';
	for (let i = 0; i < repeatCount; i++) {
		result += str;
	}
	return result;
}

export const Operators = {
	Insert: new InsertOperator(),
	Visual: new VisualOperator(),
	Append: new AppendOperator(),
	AppendEndOfLine: new AppendEndOfLineOperator(),
	DeleteCharUnderCursor: new DeleteCharUnderCursorOperator(),
	DeleteTo: new DeleteToOperator(),
	DeleteLine: new DeleteLineOperator(),
	Put: new PutOperator(),
	Replace: new ReplaceOperator(),
	Change: new ChangeOperator(),
	ReplaceMode: new ReplaceModeOperator(),
};
