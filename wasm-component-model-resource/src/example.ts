/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as $wcm from '@vscode/wasm-component-model';
import type { u32, own, i32 } from '@vscode/wasm-component-model';

export namespace example {
	export namespace Types {
		export enum Operation {
			add = 'add',
			sub = 'sub',
			mul = 'mul',
			div = 'div'
		}

		export namespace Machine {
			export interface Interface {
				$handle?: $wcm.ResourceHandle;
				$drop?(): void;

				execute(): u32;
			}
			export type Statics = {
			};
			export type Class = Statics & {
				new(left: u32, right: u32, operation: Operation): Interface;
			};
		}
		export type Machine = Machine.Interface;
	}
	export type Types = {
		Machine: Types.Machine.Class;
	};
	export namespace calculator {
		export type Imports = {
		};
		export type Exports = {
			types: example.Types;
		};
	}
}

export namespace example {
	export namespace Types.$ {
		export const Operation = new $wcm.EnumType<example.Types.Operation>(['add', 'sub', 'mul', 'div']);
		export const Machine = new $wcm.ResourceType<example.Types.Machine>('machine', 'vscode:example/types/machine');
		export const Machine_Handle = new $wcm.ResourceHandleType('machine');
		Machine.addDestructor('$drop', new $wcm.DestructorType('[resource-drop]machine', [['inst', Machine]]));
		Machine.addConstructor('constructor', new $wcm.ConstructorType<example.Types.Machine.Class['constructor']>('[constructor]machine', [
			['left', $wcm.u32],
			['right', $wcm.u32],
			['operation', Operation],
		], new $wcm.OwnType(Machine_Handle)));
		Machine.addMethod('execute', new $wcm.MethodType<example.Types.Machine.Interface['execute']>('[method]machine.execute', [], $wcm.u32));
	}
	export namespace Types._ {
		export const id = 'vscode:example/types' as const;
		export const witName = 'types' as const;
		export const types: Map<string, $wcm.GenericComponentModelType> = new Map<string, $wcm.GenericComponentModelType>([
			['Operation', $.Operation],
			['Machine', $.Machine]
		]);
		export const resources: Map<string, $wcm.ResourceType> = new Map<string, $wcm.ResourceType>([
			['Machine', $.Machine]
		]);
		export namespace Machine {
			export type WasmInterface = {
				'[constructor]machine': (left: i32, right: i32, operation_Operation: i32) => i32;
				'[method]machine.execute': (self: i32) => i32;
				'[resource-drop]machine': (self: i32) => void;
			};
			type ObjectModule = {
				constructor(left: u32, right: u32, operation: Operation): own<$wcm.ResourceHandle>;
				$drop(self: Machine): void;
				execute(self: Machine): u32;
			};
			class Impl extends $wcm.Resource implements example.Types.Machine.Interface {
				private readonly _om: ObjectModule;
				constructor(left: u32, right: u32, operation: Operation, om: ObjectModule) {
					super();
					this._om = om;
					this.$handle = om.constructor(left, right, operation);
				}
				public $drop(): void {
					return this._om.$drop(this);
				}
				public execute(): u32 {
					return this._om.execute(this);
				}
			}
			export function Class(wasmInterface: WasmInterface, context: $wcm.WasmContext): example.Types.Machine.Class {
				const resource = example.Types.$.Machine;
				const om: ObjectModule = $wcm.Module.createObjectModule(resource, wasmInterface, context);
				return class extends Impl {
					constructor(left: u32, right: u32, operation: Operation) {
						super(left, right, operation, om);
					}
				};
			}
		}
		export type WasmInterface = {
		} & Machine.WasmInterface;
		export function createImports(service: example.Types, context: $wcm.WasmContext): WasmInterface {
			return $wcm.Imports.create<WasmInterface>(undefined, resources, service, context);
		}
		export function filterExports(exports: object, context: $wcm.WasmContext): WasmInterface {
			return $wcm.Exports.filter<WasmInterface>(exports, undefined, resources, id, undefined, context);
		}
		export function bindExports(wasmInterface: WasmInterface, context: $wcm.WasmContext): example.Types {
			return $wcm.Exports.bind<example.Types>(undefined, [['Machine', $.Machine, Machine.Class]], wasmInterface, context);
		}
	}
	export namespace calculator.$ {
	}
	export namespace calculator._ {
		export const id = 'vscode:example/calculator' as const;
		export const witName = 'calculator' as const;
		export const Imports = {};
		export type Imports = {};
		export namespace Exports {
			export const interfaces: Map<string, $wcm.InterfaceType> = new Map<string, $wcm.InterfaceType>([
				['Types', Types._]
			]);
		}
		export type Exports = {
		};
		export function bindExports(exports: Exports, context: $wcm.WasmContext): calculator.Exports {
			const result: calculator.Exports = Object.create(null);
			result.types = example.Types._.bindExports(example.Types._.filterExports(exports, context), context);
			return result;
		}
	}
}

export namespace example._ {
	export const id = 'vscode:example' as const;
	export const witName = 'example' as const;
	export const interfaces: Map<string, $wcm.InterfaceType> = new Map<string, $wcm.InterfaceType>([
		['Types', Types._]
	]);
	export const worlds: Map<string, $wcm.WorldType> = new Map<string, $wcm.WorldType>([
		['calculator', calculator._]
	]);
}