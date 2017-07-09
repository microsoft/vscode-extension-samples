import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

export function sayByeCommand() {
  const message = localize('sayBye.text', 'Bye')
  vscode.window.showInformationMessage(message);
}
