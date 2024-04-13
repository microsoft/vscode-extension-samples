/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { ExtensionContext, Uri, window, workspace, commands } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, RequestType } from 'vscode-languageclient/node';
import { Wasm, ProcessOptions } from '@vscode/wasm-wasi';
import { createStdioOptions, startServer } from '@vscode/wasm-wasi-lsp';

let client: LanguageClient;
const channel = window.createOutputChannel('LSP WASM Server');

export async function activate(context: ExtensionContext) {
	const wasm: Wasm = await Wasm.load();

	const serverOptions: ServerOptions = async () => {
		const options: ProcessOptions = {
			stdio: createStdioOptions(),
			mountPoints: [
				{ kind: 'workspaceFolder' },
			]
		};
		const filename = Uri.joinPath(context.extensionUri, 'server', 'target', 'wasm32-wasi-preview1-threads', 'release', 'server.wasm');
		const bits = await workspace.fs.readFile(filename);
		const module = await WebAssembly.compile(bits);
		const process = await wasm.createProcess('lsp-server', module, { initial: 160, maximum: 160, shared: true }, options);

		const decoder = new TextDecoder('utf-8');
		process.stderr!.onData((data) => {
			channel.append(decoder.decode(data));
		});

		return startServer(process);
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [ { language: 'bat' } ],
		outputChannel: channel,
		diagnosticCollectionName: 'markers',
	};

	client = new LanguageClient('lspClient', 'LSP Client', serverOptions, clientOptions);
	try {
		await client.start();
	} catch (error) {
		client.error(`Start failed`, error, 'force');
	}

	type AddParams = { left: number; right: number };
	const AddRequest = new RequestType<AddParams, number, void>('wasm-language-server/add');
	context.subscriptions.push(commands.registerCommand('vscode-samples.wasm-language-server.add', async () => {
		const result = await client.sendRequest(AddRequest, { left: 3, right: 4 });
		window.showInformationMessage(`3 + 4 = ${result}`);
	}));
}

export function deactivate() {
	return client.stop();
}