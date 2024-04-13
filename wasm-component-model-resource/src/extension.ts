/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vscode from 'vscode';
import { WasmContext, Memory } from '@vscode/wasm-component-model';

import { example } from './example';
import calculator = example.calculator;
import Types = example.Types;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
	// The channel for printing the result.
	const channel = vscode.window.createOutputChannel('Calculator');
	context.subscriptions.push(channel);

	// The channel for printing the log.
	const log = vscode.window.createOutputChannel('Calculator - Log', { log: true });
	context.subscriptions.push(log);

	// Load the Wasm module
	const filename = vscode.Uri.joinPath(context.extensionUri, 'target', 'wasm32-unknown-unknown', 'debug', 'calculator.wasm');
	const bits = await vscode.workspace.fs.readFile(filename);
	const module = await WebAssembly.compile(bits);

	// The context for the WASM module
	const wasmContext: WasmContext.Default = new WasmContext.Default();

	// Instantiate the module and create the necessary imports from the service implementation
	const instance = await WebAssembly.instantiate(module, {
		'[export]vscode:example/types' : {
			'[resource-drop]machine': (...args: any[]) => {
				console.log(args);
			},
			'[resource-new]machine': (...args: any[]) => {
				console.log(args);
				return args[0];
			}
		}
	});
	// Bind the WASM memory to the context
	wasmContext.initialize(new Memory.Default(instance.exports));

	// Bind the JavaScript Api
	const api = calculator._.bindExports(instance.exports as calculator._.Exports, wasmContext);

	context.subscriptions.push(vscode.commands.registerCommand('vscode-samples.wasm-component-model.run', () => {
		channel.show();
		channel.appendLine('Running calculator example');
		const add = new api.types.Machine(1, 2, Types.Operation.add);
		channel.appendLine(`Add ${add.execute()}`);
		const sub = new api.types.Machine(10, 8, Types.Operation.sub);
		channel.appendLine(`Sub ${sub.execute()}`);
		const mul = new api.types.Machine(3, 7, Types.Operation.mul);
		channel.appendLine(`Mul ${mul.execute()}`);
		const div = new api.types.Machine(10, 2, Types.Operation.div);
		channel.appendLine(`Div ${div.execute()}`);
		// add.$drop!();
		// sub.$drop!();
		// mul.$drop!();
		// div.$drop!();
	}));
}