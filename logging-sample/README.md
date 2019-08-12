# Logging Sample

This folder contains a sample VS code extension (based on hello-world example) that demonstrates
how to implement a simple logger for a VSCode extension.

This logger has the following functionality:
- Dynamically configurable log levels via VSCode extension's configuration.
- Logging to rotating **Files**.
- Logging to a VSCode's outputChannel  .

## VSCode API

The sample code show the usage of the following vscode APIs:
- [vscode.workspace.**getConfiguration**](https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration). 
- [ExtensionContext.**logPath**](https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.logPath).
- [vscode.window.**createOutputChannel**](https://code.visualstudio.com/api/references/vscode-api#window.createOutputChannel).
- [OutputChannel.**appendLine**](https://code.visualstudio.com/api/references/vscode-api#OutputChannel.appendLine).
- [OutputChannel.**dispose**](https://code.visualstudio.com/api/references/vscode-api#OutputChannel.dispose)

## Running the Sample

### Initial setup
- `npm install` to initialize the project
- `npm run watch` to start the compiler in watch mode
- Open this folder in VSCode.
- Press F5 in VSCode to start the sample Extension.

### Basic logging flows
- Activate the **Hello World Command**: `View Menu -> Command Palette -> Hello World`
- Open the **Output Panel**: `View Menu -> Output`
- Switch to the **logging-sample** output Channel using the dropdown.
- Inspect the output channel log and note that the location of the log **Files** was written.
- Inspect the contents of the log files using your favorite file system explorer.

### Changing logging levels.
- Open the **Settings Page**: `File -> Preferences -> Settings`
- Find the **Sample_logging: Logging Level** configuration.
- Modify the log level to the highest: **trace**.
- Now each time the **Hello World Command** is executed additional information will be written to the logs.
