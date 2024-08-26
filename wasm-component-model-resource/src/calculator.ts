/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/ban-types */
import * as $wcm from '@vscode/wasm-component-model';
import type { u32, i32 } from '@vscode/wasm-component-model';

export namespace Types {
	export enum Operation {
		add = 'add',
		sub = 'sub',
		mul = 'mul',
		div = 'div'
	}

	export namespace Engine {
		export interface Interface extends $wcm.Resource {
			pushOperand(operand: u32): void;

			pushOperation(operation: Operation): void;

			execute(): u32;
		}
		export type Statics = {
			$new?(): Interface;
		};
		export type Class = Statics & {
			new(): Interface;
		};
	}
	export type Engine = Engine.Interface;
}
export type Types = {
	Engine: Types.Engine.Class;
};
export namespace calculator {
	export type Imports = {
	};
	export namespace Imports {
		export type Promisified = $wcm.$imports.Promisify<Imports>;
	}
	export namespace imports {
		export type Promisify<T> = $wcm.$imports.Promisify<T>;
	}
	export type Exports = {
		types: Types;
	};
	export namespace Exports {
		export type Promisified = $wcm.$exports.Promisify<Exports>;
	}
	export namespace exports {
		export type Promisify<T> = $wcm.$exports.Promisify<T>;
	}
}

export namespace Types.$ {
	export const Operation = new $wcm.EnumType<Types.Operation>(['add', 'sub', 'mul', 'div']);
	export const Engine = new $wcm.ResourceType<Types.Engine>('engine', 'vscode:example/types/engine');
	export const Engine_Handle = new $wcm.ResourceHandleType('engine');
	Engine.addDestructor('$drop', new $wcm.DestructorType('[resource-drop]engine', [['inst', Engine]]));
	Engine.addConstructor('constructor', new $wcm.ConstructorType<Types.Engine.Class['constructor']>('[constructor]engine', [], new $wcm.OwnType(Engine_Handle)));
	Engine.addMethod('pushOperand', new $wcm.MethodType<Types.Engine.Interface['pushOperand']>('[method]engine.push-operand', [
		['operand', $wcm.u32],
	], undefined));
	Engine.addMethod('pushOperation', new $wcm.MethodType<Types.Engine.Interface['pushOperation']>('[method]engine.push-operation', [
		['operation', Operation],
	], undefined));
	Engine.addMethod('execute', new $wcm.MethodType<Types.Engine.Interface['execute']>('[method]engine.execute', [], $wcm.u32));
}
export namespace Types._ {
	export const id = 'vscode:example/types' as const;
	export const witName = 'types' as const;
	export namespace Engine {
		export type WasmInterface = {
			'[constructor]engine': () => i32;
			'[method]engine.push-operand': (self: i32, operand: i32) => void;
			'[method]engine.push-operation': (self: i32, operation_Operation: i32) => void;
			'[method]engine.execute': (self: i32) => i32;
		};
		export namespace imports {
			export type WasmInterface = Engine.WasmInterface & { '[resource-drop]engine': (self: i32) => void };
		}
		export namespace exports {
			export type WasmInterface = Engine.WasmInterface & { '[dtor]engine': (self: i32) => void };
		}
	}
	export const types: Map<string, $wcm.AnyComponentModelType> = new Map<string, $wcm.AnyComponentModelType>([
		['Operation', $.Operation],
		['Engine', $.Engine]
	]);
	export const resources: Map<string, $wcm.ResourceType> = new Map<string, $wcm.ResourceType>([
		['Engine', $.Engine]
	]);
	export type WasmInterface = {
	};
	export namespace imports {
		export type WasmInterface = _.WasmInterface & Engine.imports.WasmInterface;
	}
	export namespace exports {
		export type WasmInterface = _.WasmInterface & Engine.exports.WasmInterface;
		export namespace imports {
			export type WasmInterface = {
				'[resource-new]engine': (rep: i32) => i32;
				'[resource-rep]engine': (handle: i32) => i32;
				'[resource-drop]engine': (handle: i32) => void;
			};
		}
	}
}
export namespace calculator.$ {
}
export namespace calculator._ {
	export const id = 'vscode:example/calculator' as const;
	export const witName = 'calculator' as const;
	export namespace imports {
		export function create(service: calculator.Imports, context: $wcm.WasmContext): Imports {
			return $wcm.$imports.create<Imports>(_, service, context);
		}
		export function loop(service: calculator.Imports, context: $wcm.WasmContext): calculator.Imports {
			return $wcm.$imports.loop<calculator.Imports>(_, service, context);
		}
	}
	export type Imports = {
		'[export]vscode:example/types': Types._.exports.imports.WasmInterface;
	};
	export namespace exports {
		export const interfaces: Map<string, $wcm.InterfaceType> = new Map<string, $wcm.InterfaceType>([
			['Types', Types._]
		]);
		export function bind(exports: Exports, context: $wcm.WasmContext): calculator.Exports {
			return $wcm.$exports.bind<calculator.Exports>(_, exports, context);
		}
	}
	export type Exports = {
		'vscode:example/types#[constructor]engine': () => i32;
		'vscode:example/types#[method]engine.push-operand': (self: i32, operand: i32) => void;
		'vscode:example/types#[method]engine.push-operation': (self: i32, operation_Operation: i32) => void;
		'vscode:example/types#[method]engine.execute': (self: i32) => i32;
	};
	export function bind(service: calculator.Imports, code: $wcm.Code, context?: $wcm.ComponentModelContext): Promise<calculator.Exports>;
	export function bind(service: calculator.Imports.Promisified, code: $wcm.Code, port: $wcm.RAL.ConnectionPort, context?: $wcm.ComponentModelContext): Promise<calculator.Exports.Promisified>;
	export function bind(service: calculator.Imports | calculator.Imports.Promisified, code: $wcm.Code, portOrContext?: $wcm.RAL.ConnectionPort | $wcm.ComponentModelContext, context?: $wcm.ComponentModelContext | undefined): Promise<calculator.Exports> | Promise<calculator.Exports.Promisified> {
		return $wcm.$main.bind(_, service, code, portOrContext, context);
	}
}