import * as vscode from 'vscode';
import { MathTestProvider } from './testProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.test.registerTestProvider(new MathTestProvider()),

    vscode.commands.registerCommand('test-provider-sample.runTests', async tests => {
      await vscode.test.runTests({ tests: tests instanceof Array ? tests : [tests], debug: false });
      vscode.window.showInformationMessage('Test run complete');
    }),
  );
}
