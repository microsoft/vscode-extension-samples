/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as $wcm from '@vscode/wasm-component-model';
import type { u32, i32 } from '@vscode/wasm-component-model';

export namespace example {
	export namespace Types {
		export type Operands = {
			left: u32;
			right: u32;
		};

		export namespace Operation {
			export const add = 'add' as const;
			export type Add = { readonly tag: typeof add; readonly value: Operands } & _common;
			export function Add(value: Operands): Add {
				return new VariantImpl(add, value) as Add;
			}

			export const sub = 'sub' as const;
			export type Sub = { readonly tag: typeof sub; readonly value: Operands } & _common;
			export function Sub(value: Operands): Sub {
				return new VariantImpl(sub, value) as Sub;
			}

			export const mul = 'mul' as const;
			export type Mul = { readonly tag: typeof mul; readonly value: Operands } & _common;
			export function Mul(value: Operands): Mul {
				return new VariantImpl(mul, value) as Mul;
			}

			export const div = 'div' as const;
			export type Div = { readonly tag: typeof div; readonly value: Operands } & _common;
			export function Div(value: Operands): Div {
				return new VariantImpl(div, value) as Div;
			}

			export type _tt = typeof add | typeof sub | typeof mul | typeof div;
			export type _vt = Operands | Operands | Operands | Operands;
			type _common = Omit<VariantImpl, 'tag' | 'value'>;
			export function _ctor(t: _tt, v: _vt): Operation {
				return new VariantImpl(t, v) as Operation;
			}
			class VariantImpl {
				private readonly _tag: _tt;
				private readonly _value: _vt;
				constructor(t: _tt, value: _vt) {
					this._tag = t;
					this._value = value;
				}
				get tag(): _tt {
					return this._tag;
				}
				get value(): _vt {
					return this._value;
				}
				isAdd(): this is Add {
					return this._tag === Operation.add;
				}
				isSub(): this is Sub {
					return this._tag === Operation.sub;
				}
				isMul(): this is Mul {
					return this._tag === Operation.mul;
				}
				isDiv(): this is Div {
					return this._tag === Operation.div;
				}
			}
		}
		export type Operation = Operation.Add | Operation.Sub | Operation.Mul | Operation.Div;
	}
	export type Types = {
	};
	export namespace calculator {
		export type Operation = Types.Operation;
		export type Imports = {
			log: (msg: string) => void;
		};
		export type Exports = {
			calc: (o: Operation) => u32;
		};
	}
}

export namespace example {
	export namespace Types.$ {
		export const Operands = new $wcm.RecordType<example.Types.Operands>([
			['left', $wcm.u32],
			['right', $wcm.u32],
		]);
		export const Operation = new $wcm.VariantType<example.Types.Operation, example.Types.Operation._tt, example.Types.Operation._vt>([['add', Operands], ['sub', Operands], ['mul', Operands], ['div', Operands]], example.Types.Operation._ctor);
	}
	export namespace Types._ {
		export const id = 'vscode:example/types' as const;
		export const witName = 'types' as const;
		export const types: Map<string, $wcm.GenericComponentModelType> = new Map<string, $wcm.GenericComponentModelType>([
			['Operands', $.Operands],
			['Operation', $.Operation]
		]);
	}
	export namespace calculator.$ {
		export const Operation = Types.$.Operation;
		export namespace Imports {
			export const log = new $wcm.FunctionType<calculator.Imports['log']>('log',[
				['msg', $wcm.wstring],
			], undefined);
		}
		export namespace Exports {
			export const calc = new $wcm.FunctionType<calculator.Exports['calc']>('calc',[
				['o', Operation],
			], $wcm.u32);
		}
	}
	export namespace calculator._ {
		export const id = 'vscode:example/calculator' as const;
		export const witName = 'calculator' as const;
		export type $Root = {
			'log': (msg_ptr: i32, msg_len: i32) => void;
		}
		export namespace Imports {
			export const functions: Map<string, $wcm.FunctionType> = new Map([
				['log', $.Imports.log]
			]);
			export const interfaces: Map<string, $wcm.InterfaceType> = new Map<string, $wcm.InterfaceType>([
				['Types', Types._]
			]);
		}
		export type Imports = {
			'$root': $Root;
		};
		export namespace Exports {
			export const functions: Map<string, $wcm.FunctionType> = new Map([
				['calc', $.Exports.calc]
			]);
		}
		export type Exports = {
			'calc': (o_Operation_case: i32, o_Operation_0: i32, o_Operation_1: i32) => i32;
		};
		export function createImports(service: calculator.Imports, context: $wcm.WasmContext): Imports {
			const result: Imports = Object.create(null);
			result['$root'] = $wcm.Imports.create<$Root>(Imports.functions, undefined, service, context);
			return result;
		}
		export function bindExports(exports: Exports, context: $wcm.WasmContext): calculator.Exports {
			const result: calculator.Exports = Object.create(null);
			Object.assign(result, $wcm.Exports.bind(Exports.functions, undefined, exports, context));
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