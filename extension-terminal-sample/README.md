# extension-terminal-sample

This extension shows how to leverage the extension terminal API proposed in v1.37 that enables an extension to handle a terminal's input and emit output.

## VS Code API

### `vscode` module

- [window.createTerminal](https://code.visualstudio.com/api/references/vscode-api#window.createTerminal)

### Proposed API

- `window.Pseudoterminal`
- `window.ExtensionTerminalOptions`

### Contribution Points

- [`contributes.commands`](https://code.visualstudio.com/api/references/contribution-points#contributes.commands)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
