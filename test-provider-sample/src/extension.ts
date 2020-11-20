import * as vscode from 'vscode';
import { TestCodeLensProvider } from './testCodeLens';
import { MathTestProvider } from './testProvider';
import { TestTreeDataProvider } from './testTreeView';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.test.registerTestProvider(new MathTestProvider()),

    // Sample code lens implementation:
    vscode.languages.registerCodeLensProvider({ pattern: '**/*.*' }, new TestCodeLensProvider()),

    // Sample tree view:
    vscode.window.createTreeView('sampleTestExplorerView', {
      treeDataProvider: new TestTreeDataProvider(),
      showCollapseAll: true,
    }),

    vscode.commands.registerCommand('test-provider-sample.runTests', async tests => {
      await vscode.test.runTests({ tests: tests instanceof Array ? tests : [tests], debug: false });
      vscode.window.showInformationMessage('Test run complete');
    }),
  );
}
