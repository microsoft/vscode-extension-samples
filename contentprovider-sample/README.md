# References Editor Sample

This is a sample extension that shows how an editor-based representation for the _Find References_ feature can be build.

It is not intended as a product quality extension.


- Select a symbol
- Select `F1 > Show All References`
- An editor opens to the side and show the references in a textual form

![Print References](https://raw.githubusercontent.com/Microsoft/vscode-extension-samples/master/contentprovider-sample/preview.gif)

# How it works, what it shows?

- The extension implements and registers a [`TextDocumentContentProvider`](http://code.visualstudio.com/docs/extensionAPI/vscode-api#TextDocumentContentProvider) for a particular URI scheme.
- The content provider uses the [`vscode.executeReferenceProvider`](http://code.visualstudio.com/docs/extensionAPI/vscode-api-commands)-API command to delegate searching for references to the language extensions, like TypeScript, vscode-go, or C#
- The generated document initially contains a caption only and incrementally updates as each reference location is resolved.
- The content provider uses the decoration API to highlight matches inside the generated document
- Add an entry to editor context menu via `package.json`

# How to run locally

* `npm run compile` to start the compiler in watch mode
* open this folder in VS Code and press `F5`