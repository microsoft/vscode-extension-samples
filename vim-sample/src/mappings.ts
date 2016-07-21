/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {TextEditor} from 'vscode';
import {Motion, Motions, MotionCommand} from './motions';
import {Operator, Operators} from './operators';
import {IController, Command} from './common';


const CHAR_TO_MOTION: { [char: string]: Motion; } = {};
function defineMotion(char: string, motion: Motion): void {
	CHAR_TO_MOTION[char] = motion;
};

const CHAR_TO_MOTION_COMMAND: { [char: string]: MotionCommand; } = {};
function defineMotionCommand(char: string, motionCommand: MotionCommand): void {
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

// Scroll motions
defineMotionCommand('zh', Motions.ScrollLeft);
defineMotionCommand('zl', Motions.ScrollRight);
defineMotionCommand('zH', Motions.ScrollLeftByHalfLine);
defineMotionCommand('zL', Motions.ScrollRightByHalfLine);

// Up-down motions
defineMotion('j', Motions.Down);
defineMotion('k', Motions.Up);
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
		let motionCommand = CHAR_TO_MOTION_COMMAND[parsed.input.substr(0, 1)];
		if (!motionCommand) {
			motionCommand = CHAR_TO_MOTION_COMMAND[parsed.input.substr(0, 2)];
		}
		if (!motionCommand) {
			motionCommand = CHAR_TO_MOTION_COMMAND[parsed.input.substr(1, 2)];
		}
		if (!motionCommand) {
			motionCommand = CHAR_TO_MOTION_COMMAND[parsed.input.substr(1, 3)];
		}
		return motionCommand ? motionCommand.command({ isVisual: isVisual, repeat: parsed.repeatCount }) : null;
	}

	public static findOperator(input: string): IFoundOperator {
		let parsed = _parseNumberAndString(input);
		let operator = CHAR_TO_OPERATOR[parsed.input.substr(0, 1)];
		if (!operator) {
			return null;
		}
		let operatorArgs = parsed.input.substr(1);
		return {
			runNormal: (controller: IController, editor:TextEditor) => {
				return operator.runNormalMode(controller, editor, parsed.repeatCount, operatorArgs);
			},
			runVisual: (controller: IController, editor:TextEditor) => {
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

function _parseNumberAndString(input: string): INumberAndString {
	let repeatCountMatch = input.match(/^([1-9]\d*)/);
	if (repeatCountMatch) {
		return {
			hasRepeatCount: true,
			repeatCount: parseInt(repeatCountMatch[0], 10),
			input: input.substr(repeatCountMatch[0].length)
		};
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
