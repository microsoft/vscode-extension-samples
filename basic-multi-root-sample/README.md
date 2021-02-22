# Basic multi root API samples

This extension adds an entry to the status bar that shows the name of the currently active file. To exercise multi root APIs it:
- only enables itself when more than one `WorkspaceFolder` is opened using `workspace.workspaceFolders` API
- shows the name of the `WorkspaceFolder` the file is from (if any) using `workspace.getWorkspaceFolder()` API
- updates when there are changes to the number of `WorkspaceFolder` via the `workspace.onDidChangeWorkspaceFolders()` API
- registers a setting `multiRootSample.statusColor` with a scope of `resource` to configure a color per `WorkspaceFolder` to use for the status bar item

![Show the folder of the active file](https://raw.githubusercontent.com/Microsoft/vscode-extension-samples/main/basic-multi-root-sample/preview.gif)

## Running the example

- Open this example in VS Code
- `npm install`
- `npm run compile`
- `F5` to start debugging
