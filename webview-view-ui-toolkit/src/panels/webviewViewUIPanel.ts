import * as vscode from "vscode";

import { getUri } from "../utils/getUri";
import { getNonce } from "../utils/getNonce";

export class WebviewViewPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "webview-view-ui-toolkit.entry";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    this._setWebviewMessageListener(this._view.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const webviewUri = getUri(webview, this._extensionUri, [
      "out",
      "webviewLogic.js",
    ]);
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}';">
          <title>RC Extension</title>
        </head>
        <body>
          <h1>Welcome ! Here you will explore a webview-view extension along with UI toolkit and activity bar</h1>
					<vscode-button id="howdy">Click Me</vscode-button>
					<script type="module" nonce="${nonce}" src="${webviewUri}"></script>
        </body>
      </html>
    `;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage((message: any) => {
      const command = message.command;
      const text = message.text;

      switch (command) {
        case "hello":
          vscode.window.showInformationMessage(text);
          return;
      }
    });
  }
}
