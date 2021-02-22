# Progress Sample

This is a sample extension that shows a running progress in the notification area with support for cancellation.

It is not intended as a product quality extension.

- Open the command palette
- Run "Show Progress"
- Observe the running task in the notification area

![Show progress in notification area](https://raw.githubusercontent.com/Microsoft/vscode-extension-samples/main/progress-sample/preview.gif)

# How it works, what it shows?

- The extension uses the [`withProgress`](https://code.visualstudio.com/api/references/vscode-api#ProgressOptions) API to show the task in the notification area.
- Registers a command via `package.json` that will trigger the task

# How to run locally

* `npm run compile` to start the compiler in watch mode
* open this folder in VS Code and press `F5`
