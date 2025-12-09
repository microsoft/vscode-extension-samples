# LSP web extension Example

A LSP server that runs in a web extension

## Functionality

This Language Server add color decorators to plain text files.

- create a plain text file
- enter text that contains colors in hex format (#rrggbb)
- color decorators


It also includes an End-to-End test.

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   └── browserClientMain.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── browserServerMain.ts // Language Server entry point
```

## Running the Sample

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Run Web Extension` from the drop down.
- Run the launch config.
- In the [Extension Development Host] instance of VSCode, open a document in 'plain text' language mode.
  - Type #00ff00 or any other color in hex format.
  - color decorators will appear.
- You can set breakpoints in the client or server code.


You can also run and debug the extension in a browser
- `npm run chrome`
- use browser dev tools to set breakpoints
