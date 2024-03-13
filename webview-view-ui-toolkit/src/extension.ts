import * as vscode from "vscode";
import { WebviewViewPanelProvider } from "./panels/webviewViewUIPanel";
export function activate(context: vscode.ExtensionContext) {
  const provider = new WebviewViewPanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      WebviewViewPanelProvider.viewType,
      provider
    )
  );
}

export function deactivate() {}
