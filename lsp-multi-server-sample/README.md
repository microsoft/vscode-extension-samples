# LSP Multi Server Example

A language server example that demonstrates how to start a server per workspace folder. If the workspace has nested workspace folders only a server for the outer most workspace folder is started assuming that the language service handles nested code.

The example uses proposed Language Server protocol. So the code demoed here might change when the final version of the configuration and workspace folder protocol is released.

## Running the Sample

- run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server
- Switch to the Debug viewlet
- Select `Launch Client` from the drop down
- Run the launch config
- If you want to debug the server as well use the launch configuration `Attach to Server`
