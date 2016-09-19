# vscode-terminal-api-example

This repo demonstrates how to utilize the integrated terminal extension API coming in Visual Studio Code v1.5.0.

Several commands are exposed prefixed with "Terminal API" that show how to use the API:

- `Terminal API: Create Terminal`: Create a terminal
- `Terminal API: Create Terminal and Immediately Send`: Create a terminal and immediately send text
- `Terminal API: Create Terminal (zsh login shell)`: Create a zsh login shell terminal using a custom shell executable and arguments 
- `Terminal API: Hide`: Hides the most recently created terminal
- `Terminal API: Show`: Shows the most recently created terminal 
- `Terminal API: Send Text`: Sends `echo "Hello World!"` to the terminal
- `Terminal API: Send Text (no implied \n)`: Sends `echo "Hello World!"` to the terminal explicitly indicating to not add a `\n` to the end of the text
- `Terminal API: Dispose`: Disposes the most recently created terminal

Coming in v1.6.0:

- `Create Terminal (zsh login shell) [v1.6+]`: Creates a terminal using shell path and args set by extension
- `Terminal API: Write process ID to console [v1.6+]`: Uses Terminal.processId to get the shell's process ID