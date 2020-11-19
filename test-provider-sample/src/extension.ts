import * as vscode from 'vscode';
import { TestCodeLensProvider } from './testCodeLens';
import { MathTestProvider } from './testProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.test.registerTestProvider(new MathTestProvider()),
    vscode.languages.registerCodeLensProvider({ pattern: '**/*.*' }, new TestCodeLensProvider()),

    vscode.commands.registerCommand('test-provider-sample.runTests', async tests => {
      await vscode.test.runTests({ tests, debug: false });

      vscode.window.showInformationMessage('Test run complete');
    }),
  );
}
