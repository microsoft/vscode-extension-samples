# MemFS

This extension implements an in-memory file system to show-case the [filesystem provider api](https://github.com/Microsoft/vscode/blob/51a880315fd0ec2cafb511a17de48ec31802ba6d/src/vs/vscode.d.ts#L4968). It serves two purposes:

* Be a sample/reference for extension authors that want to implement a filesystem provider
* Be a test for other extensions that *falsely* assume text document always live on disk.

To *get started* you need this:

* install this extension
* when *not* having a workspace opened, select 'F1 > [MemFS] Setup Workspace' (optionally save the workspace now)
* select 'F1 > [MemFs] Create Files' and notice how the explorer is now populated
* ... try things out, e.g. IntelliSense in memfs-files, create new files, save them, etc
* open `file.txt` and make changes
* 'F1 > [MemFS] Delete "file.txt', observe that the editor is now indicating that the file is deleted
* 'F1 > [MemFS] Add "file.txt', observe that the editor content is reset and the '(delete)' annotation disappeared
* select 'F1 > [MemFs] Delete Files' or reload to restart

![sample screenshot](https://github.com/Microsoft/vscode-extension-samples/raw/main/fsprovider-sample/sample.png)
