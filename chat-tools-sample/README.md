# Chat Tools Example

This sample shows

- How to create LanguageModelTools.
- How to write a participant that calls tools via a LanguageModelChat.

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window

## TODO
- Read files from references
- Tools
	- Something to collect some vscode window context (tab count)
	- Something that has a side effect and confirmation- run in terminal?
	- Something that returns a large amount of data and uses Prompt-TSX and references- findFiles
- Use prompt-tsx for main prompt