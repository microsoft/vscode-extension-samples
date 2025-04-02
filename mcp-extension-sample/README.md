# MCP Extension sample

This sample demonstrates usage of the MCP connection API. This API is currently still proposed.

## Running the Sample

- Run `npm install` in terminal to install dependencies
- A `postinstall` script would download latest version of `vscode.proposed.<proposalName>.d.ts`
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
- In the new window, run the command `Add Gist Source` command with a gist containing MCP servers ([example](https://gist.github.com/connor4312/3939ae7f6e55b2e391b5d585df27465c))
- You can now run these MCP servers in chat.
