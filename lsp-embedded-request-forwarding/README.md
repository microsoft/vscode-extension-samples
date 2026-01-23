# LSP Example for Embedded Language using Request Forwarding

Heavily documented sample code for https://code.visualstudio.com/api/language-extensions/embedded-languages#request-forwarding

## Functionality

This extension contributes a new language, `html1`. The new language is for illustration purpose and has basic syntax highlighting.

This Language Server works for `html1` file. HTML1 is like HTML file but has file extension `.html1`. You can create a `test.html1` file to play with below functionalities:

- Completions for HTML
- Completions for CSS in `<style>` tag

## Running the Sample

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Run and Debug View in the Sidebar (Ctrl+Shift+D).
- Select `Launch Client` from the drop down (if it is not already).
- Press ▷ to run the launch config (F5).
- In the [Extension Development
  Host](https://code.visualstudio.com/api/get-started/your-first-extension#:~:text=Then%2C%20inside%20the%20editor%2C%20press%20F5.%20This%20will%20compile%20and%20run%20the%20extension%20in%20a%20new%20Extension%20Development%20Host%20window.)
  instance of VSCode, open a HTML document
  - Type `<d|` to try HTML completion
  - Type `<style>.foo { c| }</style>` to try CSS completion
