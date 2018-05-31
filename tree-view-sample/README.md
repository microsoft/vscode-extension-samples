# Views & View Containers

This sample shows how to register and implement a custom tree view using the VS Code API. It has implementation for following views

- Node dependencies view
- Json Outline view
- Ftp file explorer view

These views help you in understanding how to use TreeView API, title actions, inline actions, context menu actions and how to use `when` context to show views and actions.

You can also learn how to contribute custom view containers and contribute views to it. For eg., Node dependencies view is shown under a Package Explorer custom view container.

![Package Explorer](./resources/package-explorer.png)

## Running the example

- Open this example in VS Code Insiders
- `npm install`
- `npm run compile`
- `F5` to start debugging
- FTP file explorer view should be shown in Explorer
- Json Outline view is shown in explorer when you open a json file and gets hidden when json file is closed.
- Node dependencies view is shown in Package explorer view container in Activity bar.
