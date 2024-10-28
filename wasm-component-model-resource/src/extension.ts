/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vscode from 'vscode';
import { WasmContext, Memory } from '@vscode/wasm-component-model';

import { calculator, Types } from './calculator';

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
	const instance = await WebAssembly.instantiate(module, calculator._.imports.create({}, wasmContext));
	// Bind the WASM memory to the context
	wasmContext.initialize(new Memory.Default(instance.exports));

	// Bind the JavaScript Api
	const api = calculator._.exports.bind(instance.exports as calculator._.Exports, wasmContext);

context.subscriptions.push(vscode.commands.registerCommand('vscode-samples.wasm-component-model.run', () => {
	channel.show();
	channel.appendLine('Running calculator example');

	// Create a new calculator engine
	const calculator = new api.types.Engine();

	// Push some operands and operations
	calculator.pushOperand(10);
	calculator.pushOperand(20);
	calculator.pushOperation(Types.Operation.add);
	calculator.pushOperand(2);
	calculator.pushOperation(Types.Operation.mul);

	// Calculate the result
	const result = calculator.execute();
	channel.appendLine(`Result: ${result}`);
}));
}