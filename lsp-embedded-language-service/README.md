# LSP Example for Embedded Language using Language Service

Heavily documented sample code for https://code.visualstudio.com/api/language-extensions/embedded-languages#language-services

## Functionality

This Language Server works for HTML file. It has the following language features:
- Completions for HTML
- Completions for CSS in `<style>` tag
- Diagnostics for CSS

## Running the Sample

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a HTML document
  - Type `<d|` to try HTML completion
  - Type `<style>.foo { c| }</style>` to try CSS completino
  - Have `<style>.foo { }</style>` to see CSS Diagnostics
