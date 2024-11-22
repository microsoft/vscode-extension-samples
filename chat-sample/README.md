# Chat Example

Visual Studio Code's Copilot Chat architecture enables extension authors to integrate with the GitHub Copilot Chat experience. A chat extension is a VS Code extension that uses the Chat extension API by contributing a Chat participant. Chat participants are domain experts that can answer user queries within a specific domain.

The Language Model API enables you to use the Language Model and integrate AI-powered features and natural language processing in your Visual Studio Code extension.

When an extension uses the Chat or the Language Model API, we call it a GitHub Copilot Extension, since GitHub Copilot is the provider of the Chat and the Language Model experience.

This GitHub Copilot Extension sample shows:

- How to contribute a simple chat participant to the GitHub Copilot Chat view. (`@cat`, [simple.ts](src/simple.ts))
- How to use the Language Model API to request access to the Language Model.
- How to use the `@vscode/chat-extension-utils` library to easily create a chat participant that uses tools. (`@catTools`, [chatUtilsSample.ts](src/chatUtilsSample.ts))
- How to contribute a more sophisticated chat participant that uses the LanguageModelTool API to contribute and invoke tools. (`@tool`, [toolParticipant.ts](src/toolParticipant.ts))

![demo](./demo.png)

Documentation can be found here:
- https://code.visualstudio.com/api/extension-guides/chat
- https://code.visualstudio.com/api/extension-guides/language-model

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
	- You will see the @cat chat participant show in the GitHub Copilot Chat view

## About this sample

This sample shows two different ways to build a chat participant in VS Code:

See [simple.ts](src/simple.ts) for an example of a simple chat participant that makes requests and responds to user queries. It shows how you can create chat participants with or without the [@vscode/prompt-tsx](https://www.npmjs.com/package/@vscode/prompt-tsx) library.

See [toolParticipant.ts](src/toolParticipant.ts) for an example of a chat participant that invokes tools, either dynamically or using the `toolReferences` that are attached to the request. This is a more advanced example that shows how you can use the [@vscode/prompt-tsx](https://www.npmjs.com/package/@vscode/prompt-tsx) library to implement the LLM tool calling flow and tries to implement all the features of the chat API.
