# Chat Output Renderer sample

This VS Code extension sample demonstrates usage of the proposed chat output renderer API. This API allows extensions to contribute custom rendered widgets into VS Code's chat interface. Language models can invoke tools to create these widgets. The widgets are rendered using VS Code's webview API.

## Running the Sample

- Make sure you are using VS Code 1.109 or newer.
- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
