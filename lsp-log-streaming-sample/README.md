# LSP Example for Log Streaming

This is a repository adapted from [lsp-sample](https://github.com/Microsoft/vscode-extension-samples/tree/main/lsp-sample) to demonstrate

- Usage of the JSON output
- Streaming the JSON into [LSP Inspector](https://github.com/Microsoft/language-server-protocol-inspector)

## Demo

![demo](demo.gif)

## Synopsis

- With `vscode-languageclient@5.1.0-next.9`, you can specify a JSON log output format with `[langId].trace.server` as follows:
  ```jsonc
  "languageServerExample.trace.server": {
    "format": "json", // or "text"
    "verbosity": "verbose" // or "off" | "messages"
  }
  ```
- A [webview](https://github.com/Microsoft/language-server-protocol-inspector/tree/master/lsp-inspector-webview) build of the LSP Inspector can be downloaded here: https://marketplace.visualstudio.com/items?itemName=octref.lsp-inspector-webview
- When using the Webview LSP Inspector, it will open a WebSocket Server taking incoming connection that sends logs following [this format](https://github.com/Microsoft/language-server-protocol-inspector#log-format).
- You can stream the JSON log of any Language Server using `vscode-languageclient` to the LSP Inspector, and it will show a live view of the LSP connection.

## Running the Sample

- Install the [LSP Inspector Webview](https://marketplace.visualstudio.com/items?itemName=octref.lsp-inspector-webview) extension
- Compile and Run this Extension
  - `npm install`
  - `npm run compile`
  - F5 to run the extension
- Add the following setting:
  ```json
  "languageServerExample.trace.server": {
    "format": "json",
    "verbosity": "verbose"
  },
  ```
- Open a txt file so this Language Server gets activated
- Run command "LSP Inspector: Start LSP Inspector"
- Run command "Start Stream Logs into languageServerExample.port"
- As you are typing, doing auto-completion, many messages should show up in the inspector, such as
  - `textDocument/didChange`
  - `textDocument/completion`
  - `textDocument/publishDiagnostics`
