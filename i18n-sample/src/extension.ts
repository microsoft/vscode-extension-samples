// This file shows a few things:
// 0. How you *must* configure nls.config before your nls.loadMessageBundles
//    (that could happen implicitly during import statements)
// 1. How to use the process.env.VSCODE_NLS_CONFIG to determine the current
//    locale.
// 2. How the .ts file needs to be transformed to use vscode-nls.
//
// For step 2, there is a `processFile` function in
// https://github.com/Microsoft/vscode-nls-dev/blob/master/src/lib.ts#L642 that
// can do this for you but you have to hook it into your build pipeline
// See https://github.com/Microsoft/vscode/blob/master/build/gulpfile.extensions.js#L67

import * as nls from 'vscode-nls';
// const localize = nls.config(process.env.VSCODE_NLS_CONFIG)();
// becomes...
const localize: any = nls.config(process.env.VSCODE_NLS_CONFIG)(__filename);

import * as vscode from 'vscode';
import { sayByeCommand } from './command/sayBye';

export function activate(context: vscode.ExtensionContext) {
  const helloCmd = vscode.commands.registerCommand('extension.sayHello', () => {
    // localize('sayHello.text', 'Hello')
    // becomes...
    const message = localize(0, null);
    vscode.window.showInformationMessage(message);
  });

  const byeCmd = vscode.commands.registerCommand(
    'extension.sayBye',
    sayByeCommand
  );

  context.subscriptions.push(helloCmd, byeCmd);
}

export function deactivate() {}
