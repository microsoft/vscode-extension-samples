# QuickInput Sample

NOTE: This extension is using API in 'proposed' stage in VS Code 1.25. Please provide feedback in issue [#49340](https://github.com/Microsoft/vscode/issues/49340).

This is a sample extension that shows the QuickInput UI and usage of the QuickInput API.

It is not intended as a production quality extension.

- Open the command palette
- Run "Quick Input Samples"
- Pick one of the samples and see it run

![Multi-step sample](https://raw.githubusercontent.com/Microsoft/vscode-extension-samples/master/quickinput-sample/preview.gif)

# How it works, what it shows?

- The extension uses the [`QuickPick`](https://code.visualstudio.com/api/references/vscode-api#QuickPick) and [`InputBox`](https://code.visualstudio.com/api/references/vscode-api#InputBox) API to show a UI for user input.
- Registers a command via `package.json` that will trigger the task

# How to run locally

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window