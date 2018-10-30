# Proposed API Sample

This is a sample illustrating how to use [Proposed API](https://vscode-ext-docs.azurewebsites.net/api/advanced-topics/using-proposed-api) in VS Code. It is adapted from the [Hello Code Sample](/hellocode-sample).

The proposed API being used is `vscode.env.clipboard.readText()`. See details here: https://github.com/Microsoft/vscode/issues/217#issuecomment-433963587.

## VS Code API

### Proposed API

- [`env.clipboard`](https://github.com/Microsoft/vscode/blob/master/src/vs/vscode.proposed.d.ts#L49)
- [`Clipboard.readText`](https://github.com/Microsoft/vscode/blob/master/src/vs/vscode.proposed.d.ts#L44)

## Running the Sample

This sample runs on VS Code Insider with commit [4626bc0e1b679d555dd6f034ece35ffc394b3bb7](https://github.com/Microsoft/vscode/commit/4626bc0e1b679d555dd6f034ece35ffc394b3bb7). If VS Code updated the Clipboard API in the future, you must re-download [`vscode.proposed.d.ts`](https://github.com/Microsoft/vscode/blob/master/src/vs/vscode.proposed.d.ts) to `src/vscode.proposed.d.ts` and update your API usage accordingly.

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
