# Inline Completions Sample

This sample demonstrates usage of the proposed inline completions API. It enables you to have suggestions of code within VSCode.

![Demo Video](./demo.gif)

## VS Code API

Read more about the inline completion API [here](https://code.visualstudio.com/api/references/vscode-api#InlineCompletionItemProvider)

**Important**: Make sure to use `@types/vscode^1.69.0`

## Running the Sample

The demo is very simple: you type `foo ` and the extension proposes `bar` or `baz`. It works for any language.

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
  - Start a task `npm: watch` to compile the code
  - Run the extension in a new VS Code window
- Open a text file and type `foo `, the extension suggests `bar` or `baz`
