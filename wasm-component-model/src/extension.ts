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

	// The implementation of the log function that is called from WASM
	const service: calculator.Imports = {
		log: (msg: string) => {
			log.info(msg);
		}
	}

	// The context for the WASM module
	const wasmContext: WasmContext.Default = new WasmContext.Default();

	// Instantiate the module and create the necessary imports from the service implementation
	const instance = await WebAssembly.instantiate(module, calculator._.createImports(service, wasmContext));
	// Bind the WASM memory to the context
	wasmContext.initialize(new Memory.Default(instance.exports));

	// Bind the JavaScript Api
	const api = calculator._.bindExports(instance.exports as calculator._.Exports, wasmContext);

	context.subscriptions.push(vscode.commands.registerCommand('vscode-samples.wasm-component-model.run', () => {
		channel.show();
		channel.appendLine('Running calculator example');
		channel.appendLine(`Add ${api.calc(Types.Operation.Add({ left: 1, right: 2}))}`);
		channel.appendLine(`Sub ${api.calc(Types.Operation.Sub({ left: 10, right: 8 }))}`);
		channel.appendLine(`Mul ${api.calc(Types.Operation.Mul({ left: 3, right: 7 }))}`);
		channel.appendLine(`Div ${api.calc(Types.Operation.Div({ left: 10, right: 2 }))}`);
	}));
}