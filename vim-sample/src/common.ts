/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MotionState, Motion } from './motions';

export enum Mode {
	INSERT,
	NORMAL,
	REPLACE
}

export interface ModifierKeys {
	ctrl?: boolean;
	alt?: boolean;
	shifit?: boolean;
}

export class DeleteRegister {
	public isWholeLine: boolean;
	public content: string;

	constructor(isWholeLine: boolean, content: string) {
		this.isWholeLine = isWholeLine;
		this.content = content;
	}
}

export interface IController {
	motionState: MotionState;

	setMode(mode: Mode): void;
	setVisual(newVisual: boolean): void;
	findMotion(input: string): Motion;
	isMotionPrefix(input: string): boolean;

	setDeleteRegister(register: DeleteRegister): void;
	getDeleteRegister(): DeleteRegister;
}

export abstract class AbstractCommandDescriptor {

	public abstract createCommand(args?: any): Command;

}

export interface Command {
	commandId: string;
	args?: any[];
}
