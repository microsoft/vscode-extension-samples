/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {TextEditor} from 'vscode';
import {Motion, Motions} from './motions';
import {Operator, Operators} from './operators';
import {IController, Command, AbstractCommandDescriptor} from './common';


const CHAR_TO_MOTION: { [char: string]: Motion; } = {};
function defineMotion(char: string, motion: Motion): void {
	CHAR_TO_MOTION[char] = motion;
};

const CHAR_TO_MOTION_COMMAND: { [char: string]: AbstractCommandDescriptor; } = {};
function defineMotionCommand(char: string, motionCommand: AbstractCommandDescriptor): void {
	CHAR_TO_MOTION_COMMAND[char] = motionCommand;
};

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

// Scroll motions
defineMotionCommand('zh', Motions.ScrollLeft);
defineMotionCommand('zl', Motions.ScrollRight);
defineMotionCommand('zH', Motions.ScrollLeftByHalfLine);
defineMotionCommand('zL', Motions.ScrollRightByHalfLine);

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

const CHAR_TO_OPERATOR: { [char: string]: Operator; } = {};
function defineOperator(char: string, operator: Operator): void {
	CHAR_TO_OPERATOR[char] = operator;
};
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

const CHAR_TO_COMMAND: { [char: string]: Command; } = {};
function defineCommand(char: string, commandId: string, args?: any): void {
	CHAR_TO_COMMAND[char] = {commandId : commandId, args: args};
};
defineCommand('u', 'undo');
defineCommand('U', 'undo');

export interface IFoundOperator {
	runNormal(controller: IController, editor:TextEditor): boolean;
	runVisual(controller: IController, editor:TextEditor): boolean;
}

export class Mappings {

	public static findMotion(input: string): Motion {
		let parsed = _parseNumberAndString(input);
		let motion = CHAR_TO_MOTION[parsed.input.substr(0, 1)];
		if (!motion) {
			motion = CHAR_TO_MOTION[parsed.input.substr(0, 2)];
			if (!motion) {
				return null;
			}
		}
		return motion.repeat(parsed.hasRepeatCount, parsed.repeatCount);
	}

	public static findMotionCommand(input: string, isVisual: boolean = false): Command {
		let parsed = _parseNumberAndString(input);
		let command = Mappings.findMotionCommandFromNumberAndString(parsed, isVisual);
		if (!command) {
			parsed = _parseNumberAndString(input, false);
			command= Mappings.findMotionCommandFromNumberAndString(parsed, isVisual);
		}
		return command;
	}

	private static findMotionCommandFromNumberAndString(numberAndString: INumberAndString, isVisual: boolean): Command {
		let motionCommand = CHAR_TO_MOTION_COMMAND[numberAndString.input.substr(0, 1)];
		if (!motionCommand) {
			motionCommand = CHAR_TO_MOTION_COMMAND[numberAndString.input.substr(0, 2)];
		}
		if (!motionCommand) {
			motionCommand = CHAR_TO_MOTION_COMMAND[numberAndString.input.substr(1, 2)];
		}
		if (!motionCommand) {
			motionCommand = CHAR_TO_MOTION_COMMAND[numberAndString.input.substr(1, 3)];
		}
		if (!motionCommand) {
			motionCommand = CHAR_TO_MOTION_COMMAND[numberAndString.input];
		}
		return motionCommand ? motionCommand.createCommand({ isVisual: isVisual, repeat: numberAndString.hasRepeatCount ? numberAndString.repeatCount : undefined}) : null;
	}

	public static findOperator(input: string): IFoundOperator {
		let parsed = _parseNumberAndString(input);
		let operator = CHAR_TO_OPERATOR[parsed.input.substr(0, 1)];
		if (!operator) {
			return null;
		}
		let operatorArgs = parsed.input.substr(1);
		return {
			runNormal: (controller: IController, editor: TextEditor) => {
				return operator.runNormalMode(controller, editor, parsed.repeatCount, operatorArgs);
			},
			runVisual: (controller: IController, editor: TextEditor) => {
				return operator.runVisualMode(controller, editor, operatorArgs);
			}
		};
	}

	public static findCommand(input: string): Command {
		return CHAR_TO_COMMAND[input] || null;
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

function _parseNumberAndString(input: string, numberAtBeginning: boolean = true): INumberAndString {
	if (numberAtBeginning) {
		let repeatCountMatch = input.match(/^([1-9]\d*)/);
		if (repeatCountMatch) {
			return {
				hasRepeatCount: true,
				repeatCount: parseInt(repeatCountMatch[0], 10),
				input: input.substr(repeatCountMatch[0].length)
			};
		}
	} else {
		let repeatCountMatch = input.match(/(\d+)$/);
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
	}
}

interface INumberAndString {
	hasRepeatCount: boolean;
	repeatCount: number;
	input: string;
}
