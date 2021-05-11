import * as vscode from 'vscode';
import { MathTestController } from './testController';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.test.registerTestController(new MathTestController()),

    vscode.commands.registerCommand('test-provider-sample.runTests', async tests => {
      await vscode.test.runTests({ tests: tests instanceof Array ? tests : [tests], debug: false });
      vscode.window.showInformationMessage('Test run complete');
    }),
  );
}
