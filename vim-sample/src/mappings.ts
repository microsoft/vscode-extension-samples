/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TextEditor } from 'vscode';
import { Motion, Motions } from './motions';
import { Operator, Operators } from './operators';
import { IController, Command, AbstractCommandDescriptor, ModifierKeys } from './common';

const CHAR_TO_BINDING: { [char: string]: any; } = {};
function defineBinding(char: string, value: any, modifierKeys: ModifierKeys): void {
	const key = modifierKeys.ctrl ? 'CTRL + ' + char : char;
	CHAR_TO_BINDING[key] = value;
}
function getBinding(char: string, modifierKeys: ModifierKeys): any {
	const key = modifierKeys.ctrl ? 'CTRL + ' + char : char;
	return CHAR_TO_BINDING[key];
}

function defineOperator(char: string, operator: Operator, modifierKeys: ModifierKeys = {}): void {
	defineBinding(char + '__operator__', operator, modifierKeys);
}
function getOperator(char: string, modifierKeys: ModifierKeys = {}): Operator {
	return getBinding(char + '__operator__', modifierKeys);
}

function defineCommand(char: string, commandId: string, modifierKeys: ModifierKeys = {}): void {
	defineBinding(char + '__command__', { commandId: commandId }, modifierKeys);
}
function getCommand(char: string, modifierKeys: ModifierKeys = {}): Command {
	return getBinding(char + '__command__', modifierKeys);
}

function defineMotion(char: string, motion: Motion, modifierKeys: ModifierKeys = {}): void {
	defineBinding(char + '__motion__', motion, modifierKeys);
}
function getMotion(char: string, modifierKeys: ModifierKeys = {}): Motion {
	return getBinding(char + '__motion__', modifierKeys);
}

function defineMotionCommand(char: string, motionCommand: AbstractCommandDescriptor, modifierKeys: ModifierKeys = {}): void {
	defineBinding(char + '__motioncommand__', motionCommand, modifierKeys);
}
function getMotionCommand(char: string, modifierKeys: ModifierKeys = {}): AbstractCommandDescriptor {
	return getBinding(char + '__motioncommand__', modifierKeys);
}

// Operators
defineOperator('x', Operators.DeleteCharUnderCursor);
defineOperator('i', Operators.Insert);
defineOperator('a', Operators.Append);
defineOperator('A', Operators.AppendEndOfLine);
defineOperator('d', Operators.DeleteTo);
defineOperator('p', Operators.Put);
defineOperator('r', Operators.Replace);
defineOperator('R', Operators.ReplaceMode);
defineOperator('c', Operators.Change);
defineOperator('v', Operators.Visual);

// Commands
defineCommand('u', 'undo');
defineCommand('U', 'undo');

// Left-right motions
defineMotionCommand('h', Motions.Left);
defineMotionCommand('l', Motions.Right);
defineMotion('0', Motions.StartOfLine);
defineMotion('$', Motions.EndOfLine);
defineMotionCommand('g0', Motions.WrappedLineStart);
defineMotionCommand('g^', Motions.WrappedLineFirstNonWhiteSpaceCharacter);
defineMotionCommand('gm', Motions.WrappedLineColumnCenter);
defineMotionCommand('g$', Motions.WrappedLineEnd);
defineMotionCommand('g_', Motions.WrappedLineLastNonWhiteSpaceCharacter);

// Cursor scroll motions
defineMotionCommand('zh', Motions.CursorScrollLeft);
defineMotionCommand('zl', Motions.CursorScrollRight);
defineMotionCommand('zH', Motions.CursorScrollLeftByHalfLine);
defineMotionCommand('zL', Motions.CursorScrollRightByHalfLine);

// Up-down motions
defineMotionCommand('j', Motions.Down);
defineMotionCommand('k', Motions.Up);
defineMotionCommand('gj', Motions.WrappedLineDown);
defineMotionCommand('gk', Motions.WrappedLineUp);
defineMotion('G', Motions.GoToLine);
defineMotion('gg', Motions.GoToFirstLine);

defineMotionCommand('H', Motions.ViewPortTop);
defineMotionCommand('M', Motions.ViewPortCenter);
defineMotionCommand('L', Motions.ViewPortBottom);

// Word motions
defineMotion('w', Motions.NextWordStart);
defineMotion('e', Motions.NextWordEnd);

// Tab motions
defineMotionCommand('tabm', Motions.MoveActiveEditor);
defineMotionCommand('tabm<', Motions.MoveActiveEditorLeft);
defineMotionCommand('tabm>', Motions.MoveActiveEditorRight);
defineMotionCommand('tabm<<', Motions.MoveActiveEditorFirst);
defineMotionCommand('tabm>>', Motions.MoveActiveEditorLast);
defineMotionCommand('tabm.', Motions.MoveActiveEditorCenter);

// Scroll motions
defineMotionCommand('e', Motions.ScrollDownByLine, { ctrl: true });
defineMotionCommand('d', Motions.ScrollDownByHalfPage, { ctrl: true });
defineMotionCommand('f', Motions.ScrollDownByPage, { ctrl: true });
defineMotionCommand('y', Motions.ScrollUpByLine, { ctrl: true });
defineMotionCommand('u', Motions.ScrollUpByHalfPage, { ctrl: true });
defineMotionCommand('b', Motions.ScrollUpByPage, { ctrl: true });

defineMotionCommand('zt', Motions.RevealCurrentLineAtTop);
defineMotionCommand('zz', Motions.RevealCurrentLineAtCenter);
defineMotionCommand('zb', Motions.RevealCurrentLineAtBottom);

// Folding
defineMotionCommand('zc', Motions.FoldUnder);
defineMotionCommand('zo', Motions.UnfoldUnder);


export interface IFoundOperator {
	runNormal(controller: IController, editor: TextEditor): boolean;
	runVisual(controller: IController, editor: TextEditor): boolean;
}

export class Mappings {

	public static findMotion(input: string): Motion {
		const parsed = _parseNumberAndString(input);
		let motion = getMotion(parsed.input.substr(0, 1));
		if (!motion) {
			motion = getMotion(parsed.input.substr(0, 2));
			if (!motion) {
				return null;
			}
		}
		return motion.repeat(parsed.hasRepeatCount, parsed.repeatCount);
	}

	public static findMotionCommand(input: string, isVisual: boolean, modifierKeys: ModifierKeys): Command {
		let parsed = _parseNumberAndString(input);
		let command = Mappings.findMotionCommandFromNumberAndString(parsed, isVisual, modifierKeys);
		if (!command) {
			parsed = _parseNumberAndString(input, false);
			command = Mappings.findMotionCommandFromNumberAndString(parsed, isVisual, modifierKeys);
		}
		return command;
	}

	private static findMotionCommandFromNumberAndString(numberAndString: INumberAndString, isVisual: boolean, modifierKeys: ModifierKeys): Command {
		let motionCommand = getMotionCommand(numberAndString.input.substr(0, 1), modifierKeys);
		if (!motionCommand) {
			motionCommand = getMotionCommand(numberAndString.input.substr(0, 2), modifierKeys);
		}
		if (!motionCommand) {
			motionCommand = getMotionCommand(numberAndString.input.substr(1, 2), modifierKeys);
		}
		if (!motionCommand) {
			motionCommand = getMotionCommand(numberAndString.input.substr(1, 3), modifierKeys);
		}
		if (!motionCommand) {
			motionCommand = getMotionCommand(numberAndString.input, modifierKeys);
		}
		return motionCommand ? motionCommand.createCommand({ isVisual: isVisual, repeat: numberAndString.hasRepeatCount ? numberAndString.repeatCount : undefined }) : null;
	}

	public static findOperator(input: string, modifierKeys: ModifierKeys): IFoundOperator {
		const parsed = _parseNumberAndString(input);
		const operator = getOperator(parsed.input.substr(0, 1), modifierKeys);
		if (!operator) {
			return null;
		}
		const operatorArgs = parsed.input.substr(1);
		return {
			runNormal: (controller: IController, editor: TextEditor) => {
				return operator.runNormalMode(controller, editor, parsed.repeatCount, operatorArgs);
			},
			runVisual: (controller: IController, editor: TextEditor) => {
				return operator.runVisualMode(controller, editor, operatorArgs);
			}
		};
	}

	public static findCommand(input: string, modifierKeys: ModifierKeys): Command {
		return getCommand(input, modifierKeys) || null;
	}

	public static isMotionPrefix(input: string): boolean {
		if (input.length === 0) {
			return true;
		}
		if (input === 'g' || input === 'v' || input === 'z') {
			return true;
		}
		return /^[1-9]\d*v?g?z?$/.test(input);
	}
}

function _parseNumberAndString(input: string, numberAtBeginning = true): INumberAndString {
	if (numberAtBeginning) {
		const repeatCountMatch = input.match(/^([1-9]\d*)/);
		if (repeatCountMatch) {
			return {
				hasRepeatCount: true,
				repeatCount: parseInt(repeatCountMatch[0], 10),
				input: input.substr(repeatCountMatch[0].length)
			};
		}
	} else {
		const repeatCountMatch = input.match(/(\d+)$/);
		if (repeatCountMatch) {
			return {
				hasRepeatCount: true,
				repeatCount: parseInt(repeatCountMatch[1], 10),
				input: input.substr(0, input.length - repeatCountMatch[1].length)
			};
		}
	}
	return {
		hasRepeatCount: false,
		repeatCount: 1,
		input: input
	};
}

interface INumberAndString {
	hasRepeatCount: boolean;
	repeatCount: number;
	input: string;
}
