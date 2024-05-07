/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/* eslint-disable @typescript-eslint/ban-types */
import * as $wcm from '@vscode/wasm-component-model';
import type { u32, own, i32 } from '@vscode/wasm-component-model';

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
	export type Exports = {
		types: Types;
	};
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
		type ObjectModule = {
			'constructor'(): own<$wcm.ResourceHandle>;
			pushOperand(self: Engine, operand: u32): void;
			pushOperation(self: Engine, operation: Operation): void;
			execute(self: Engine): u32;
		};
		export namespace imports {
			export type WasmInterface = Engine.WasmInterface & { '[resource-drop]engine': (self: i32) => void };
		}
		export namespace exports {
			export type WasmInterface = Engine.WasmInterface & { '[dtor]engine': (self: i32) => void };
			class Impl extends $wcm.Resource.Default implements Types.Engine.Interface {
				private readonly _rep: $wcm.ResourceRepresentation;
				private readonly _om: ObjectModule;
				constructor(om: ObjectModule);
				constructor(handleTag: symbol, handle: $wcm.ResourceHandle, rm: $wcm.ResourceManager, om: ObjectModule);
				constructor(...args: any[]);
				constructor(...args: any[]) {
					if (args[0] === $wcm.ResourceManager.handleTag) {
						const handle = args[1] as $wcm.ResourceHandle;
						super(handle);
						this._rep = (args[2] as $wcm.ResourceManager).getRepresentation(handle);
						this._om = args[3] as ObjectModule;
					} else {
						const rm = args[0] as $wcm.ResourceManager;
						const om = args[1] as ObjectModule;
						super(om.constructor());
						this._rep = rm.getRepresentation(this.$handle());
						this._om = om;
					}
				}
				public $rep(): $wcm.ResourceRepresentation { return this._rep; }
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
			export function Class(wasmInterface: WasmInterface, context: $wcm.WasmContext): Types.Engine.Class {
				const resource = Types.$.Engine;
				const rm: $wcm.ResourceManager = context.resources.ensure('vscode:example/types/engine');
				const om: ObjectModule = $wcm.Module.createObjectModule(resource, wasmInterface, context);
				return class extends Impl {
					constructor();
					constructor(handleTag: symbol, handle: $wcm.ResourceHandle);
					constructor(...args: any[]) {
						super(...args, rm, om);
						rm.registerProxy(this);
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
	export type Imports = {
		'[export]vscode:example/types': Types._.exports.imports.WasmInterface;
	};
	export namespace imports {
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