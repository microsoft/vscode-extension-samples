# FileSystem Usage Sample

This is a sample extension that shows how to use the `vscode.workspace.fs` API. It is a series of commands, all prefixed with *FS*, that demonstrate file system capabilities and how to derive file-uris from existing uris. 


### Derive new paths with `path.posix`

Throughout this sample [`path.posix`](https://nodejs.org/dist/latest-v10.x/docs/api/path.html#path_path_posix) is being used. This is important because uri paths are always slash-separated (`/`) and because the backslash (`\`) can be a valid file name. For more details see: https://nodejs.org/dist/latest-v10.x/docs/api/path.html#path_windows_vs_posix 

# How it works, what it shows?

- The extension registers different commands that use the `workspace.fs`-API.
- Registers command and the corresponding activation events via `package.json`

# How to run locally

* `npm run watch` to start the compiler in watch mode
* open this folder in VS Code and press `F5`
