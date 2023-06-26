# Cat Coding — A Webview API Sample

Demonstrates VS Code's [webview API](https://code.visualstudio.com/api/extension-guides/webview). This includes:

- Creating and showing a basic webview.
- Dynamically updating a webview's content.
- Loading local content in a webview.
- Running scripts in a webview.
- Sending message from an extension to a webview.
- Sending messages from a webview to an extension.
- Using a basic content security policy.
- Webview lifecycle and handling dispose.
- Saving and restoring state when the panel goes into the background.
- Serialization and persistence across VS Code reboots.

## Demo

![demo](demo.gif)

## VS Code API

### `vscode` module

- [`window.createWebviewPanel`](https://code.visualstudio.com/api/references/vscode-api#window.createWebviewPanel)
- [`window.registerWebviewPanelSerializer`](https://code.visualstudio.com/api/references/vscode-api#window.registerWebviewPanelSerializer)

## Running the example

- Open this example in VS Code 1.47+
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging

Run the `Cat Coding: Start cat coding session` to create the webview.

## Commands

This extension provides the following commands:

- `Cat Coding: Start cat coding session`: Creates and displays the Cat Coding webview.
- `Cat Coding: Do refactor`: Halves the count of lines of code displayed in the Cat Coding webview.

## Messages

The Cat Coding webview can send the following messages to the extension:

- `alert`: Sent when the cat introduces a bug. The message includes the text '🐛  on line ' followed by the current line count.