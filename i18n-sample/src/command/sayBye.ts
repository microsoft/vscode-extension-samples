import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

// This file shows how you would load the messageBundle from a separate file.

// const localize = nls.loadMessageBundle();
// becomes...
const localize: any = nls.loadMessageBundle(__filename);

export function sayByeCommand() {
  // const message = localize('sayByetext', 'Bye')
  // becomes...
  const message = localize(0, null);
  vscode.window.showInformationMessage(message);
}
