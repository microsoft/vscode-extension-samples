# Tabs API Sample

This sample demonstrates usage of [the tabs api](https://code.visualstudio.com/api/references/vscode-api#Tab) . This sample utilizes the tabs API to create a simple tab cleaner. Tabs will be closed after a configurable amount of inactivity. This threshold can be set via the `tabs.maxInactiveTime` setting.

## VS Code API

### `vscode` module

- [`workspace.getConfiguration`](https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration)
### Contribution Points

- [`contributes.configuration`](https://code.visualstudio.com/api/references/contribution-points#contributes.configurations)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
