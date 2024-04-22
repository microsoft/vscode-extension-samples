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

		export namespace Engine {
			export interface Interface extends $wcm.JInterface {
				pushOperand(operand: u32): void;

				pushOperation(operation: Operation): void;

				execute(): u32;
			}
			export type Statics = {
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
			foo: () => u32;
		};
		export type Exports = {
			types: example.Types;
		};
	}
}

export namespace example {
	export namespace Types.$ {
		export const Operation = new $wcm.EnumType<example.Types.Operation>(['add', 'sub', 'mul', 'div']);
		export const Engine = new $wcm.ResourceType<example.Types.Engine>('engine', 'vscode:example/types/engine');
		export const Engine_Handle = new $wcm.ResourceHandleType('engine');
		Engine.addDestructor('$drop', new $wcm.DestructorType('[resource-drop]engine', [['inst', Engine]]));
		Engine.addConstructor('constructor', new $wcm.ConstructorType<example.Types.Engine.Class['constructor']>('[constructor]engine', [], new $wcm.OwnType(Engine_Handle)));
		Engine.addMethod('pushOperand', new $wcm.MethodType<example.Types.Engine.Interface['pushOperand']>('[method]engine.push-operand', [
			['operand', $wcm.u32],
		], undefined));
		Engine.addMethod('pushOperation', new $wcm.MethodType<example.Types.Engine.Interface['pushOperation']>('[method]engine.push-operation', [
			['operation', Operation],
		], undefined));
		Engine.addMethod('execute', new $wcm.MethodType<example.Types.Engine.Interface['execute']>('[method]engine.execute', [], $wcm.u32));
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
			export type ObjectModule = {
				constructor(): own<$wcm.ResourceHandle>;
				pushOperand(self: Engine, operand: u32): void;
				pushOperation(self: Engine, operation: Operation): void;
				execute(self: Engine): u32;
			};
			export namespace imports {
				export type WasmInterface = Engine.WasmInterface & { '[resource-drop]engine': (self: i32) => void };
			}
			export namespace exports {
				export type WasmInterface = Engine.WasmInterface & { '[dtor]engine': (self: i32) => void };
				class Impl extends $wcm.Resource implements example.Types.Engine.Interface {
					private readonly _om: ObjectModule;
					constructor(om: ObjectModule);
					constructor(handleTag: Symbol, handle: $wcm.ResourceHandle, om: ObjectModule);
					constructor(...args: any[]);
					constructor(...args: any[]) {
						if (args[0] === $wcm.ResourceManager.handleTag) {
							super(args[1] as $wcm.ResourceHandle);
							this._om = args[2] as ObjectModule;
						} else {
							const om = args[0] as ObjectModule;
							super(om.constructor());
							this._om = om;
						}
					}
					public pushOperand(operand: u32): void {
						return this._om.pushOperand(this, operand);
					}
					public pushOperation(operation: Operation): void {
						return this._om.pushOperation(this, operation);
					}
					public execute(): u32 {
						return this._om.execute(this);
					}
				}
				export function Class(wasmInterface: WasmInterface, context: $wcm.WasmContext): example.Types.Engine.Class {
					const resource = example.Types.$.Engine;
					const om: ObjectModule = $wcm.Module.createObjectModule(resource, wasmInterface, context);
					const rm: $wcm.ResourceManager = context.resources.ensure('vscode:example/types/engine');
					return class extends Impl {
						constructor();
						constructor(handleTag: Symbol, handle: $wcm.ResourceHandle);
						constructor(...args: any[]) {
							super(...args, om);
							// rm.registerProxy(this);
						}
					};
				}
			}
		}
		export const types: Map<string, $wcm.GenericComponentModelType> = new Map<string, $wcm.GenericComponentModelType>([
			['Operation', $.Operation],
			['Engine', $.Engine]
		]);
		export const resources: Map<string, { resource: $wcm.ResourceType; factory: $wcm.ClassFactory<any>}> = new Map<string, { resource: $wcm.ResourceType; factory: $wcm.ClassFactory<any>}>([
			['Engine', { resource: $.Engine, factory: Engine.exports.Class }]
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
					'[resource-drop]engine': (handle: i32) => i32;
				};
			}
		}
	}
	export namespace calculator.$ {
		export namespace Imports {
			export const foo = new $wcm.FunctionType<calculator.Imports['foo']>('foo', [], $wcm.u32);
		}
	}
	export namespace calculator._ {
		export const id = 'vscode:example/calculator' as const;
		export const witName = 'calculator' as const;
		export type $Root = {
			'foo': () => i32;
		};
		export type Imports = {
			'[export]vscode:example/types': example.Types._.exports.imports.WasmInterface;
		};
		export namespace imports {
			export const functions: Map<string, $wcm.FunctionType> = new Map([
				['foo', $.Imports.foo]
			]);
			export function create(service: calculator.Imports, context: $wcm.WasmContext): Imports {
				return $wcm.Imports.create<Imports>(_, service, context);
			}
			export function loop(service: calculator.Imports, context: $wcm.WasmContext): calculator.Imports {
				return $wcm.Imports.loop(_, service, context);
			}
		}
		export type Exports = {
			'vscode:example/types#[constructor]engine': () => i32;
			'vscode:example/types#[method]engine.push-operand': (self: i32, operand: i32) => void;
			'vscode:example/types#[method]engine.push-operation': (self: i32, operation_Operation: i32) => void;
			'vscode:example/types#[method]engine.execute': (self: i32) => i32;
		};
		export namespace exports {
			export const interfaces: Map<string, $wcm.InterfaceType> = new Map<string, $wcm.InterfaceType>([
				['Types', Types._]
			]);
			export function bind(exports: Exports, context: $wcm.WasmContext): calculator.Exports {
				return $wcm.Exports.bind<calculator.Exports>(_, exports, context);
			}
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