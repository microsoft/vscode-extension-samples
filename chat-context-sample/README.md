# Chat Context Provider Sample

This sample shows how to provide custom context to VS Code's chat feature using the Chat Context Provider API.

The sample uses the [`ChatContextProvider`](https://code.visualstudio.com/api/references/vscode-api#ChatContextProvider) API to implement a simple context provider that displays line count information for JSON files:

![JSON line count context](example.png)

The extension registers a chat context provider that:
- Activates when JSON files are opened
- Provides the line count of JSON files as contextual information
- Makes this context available in VS Code's chat interface

## VS Code API

### `ChatContextProvider` API proposal

You can find details about this API proposal [here](https://github.com/microsoft/vscode/issues/271104).
