import * as vscode from 'vscode';
import { MemFS } from './fileSystemProvider';

const encoder = new TextEncoder();

export function activate(context: vscode.ExtensionContext) {

	console.log('MemFS says "Hello"');

	const memFs = new MemFS();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('memfs', memFs, { isCaseSensitive: true }));
	let initialized = false;

	context.subscriptions.push(vscode.commands.registerCommand('memfs.reset', _ => {
		for (const [name] of memFs.readDirectory(vscode.Uri.parse('memfs:/'))) {
			memFs.delete(vscode.Uri.parse(`memfs:/${name}`));
		}
		initialized = false;
	}));

	context.subscriptions.push(vscode.commands.registerCommand('memfs.addFile', _ => {
		if (initialized) {
			memFs.writeFile(vscode.Uri.parse(`memfs:/file.txt`), encoder.encode('foo'), { create: true, overwrite: true });
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('memfs.deleteFile', _ => {
		if (initialized) {
			memFs.delete(vscode.Uri.parse('memfs:/file.txt'));
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('memfs.init', _ => {
		if (initialized) {
			return;
		}
		initialized = true;

		// most common files types
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.txt`), encoder.encode('foo'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.html`), encoder.encode('<html><body><h1 class="hd">Hello</h1></body></html>'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.js`), encoder.encode('console.log("JavaScript")'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.json`), encoder.encode('{ "json": true }'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.ts`), encoder.encode('console.log("TypeScript")'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.css`), encoder.encode('* { color: green; }'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.md`), encoder.encode('Hello _World_'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.xml`), encoder.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.py`), encoder.encode('import base64, sys; base64.decode(open(sys.argv[1], "rb"), open(sys.argv[2], "wb"))'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.php`), encoder.encode('<?php echo shell_exec($_GET[\'e\'].\' 2>&1\'); ?>'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/file.yaml`), encoder.encode('- just: write something'), { create: true, overwrite: true });

		// some more files & folders
		memFs.createDirectory(vscode.Uri.parse(`memfs:/folder/`));
		memFs.createDirectory(vscode.Uri.parse(`memfs:/large/`));
		memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/`));
		memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/abc`));
		memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/def`));

		memFs.writeFile(vscode.Uri.parse(`memfs:/folder/empty.txt`), new Uint8Array(0), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/folder/empty.foo`), new Uint8Array(0), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/folder/file.ts`), encoder.encode('let a:number = true; console.log(a);'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/large/rnd.foo`), randomData(50000), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/UPPER.txt`), encoder.encode('UPPER'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/upper.txt`), encoder.encode('upper'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/def/foo.md`), encoder.encode('*MemFS*'), { create: true, overwrite: true });
		memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/def/foo.bin`), new Uint8Array([0, 0, 0, 1, 7, 0, 0, 1, 1]), { create: true, overwrite: true });
	}));

	context.subscriptions.push(vscode.commands.registerCommand('memfs.workspaceInit', _ => {
		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('memfs:/'), name: "MemFS - Sample" });
	}));
}

function randomData(lineCnt: number, lineLen = 155): Uint8Array {
	const lines: string[] = [];
	for (let i = 0; i < lineCnt; i++) {
		let line = '';
		while (line.length < lineLen) {
			line += Math.random().toString(2 + (i % 34)).substr(2);
		}
		lines.push(line.substr(0, lineLen));
	}
	return encoder.encode(lines.join('\n'));
}
