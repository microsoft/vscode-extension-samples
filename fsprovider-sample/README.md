# MemFS

This extension implements an in-memory file system to show-case the [filesytem provider api](https://github.com/Microsoft/vscode/blob/51a880315fd0ec2cafb511a17de48ec31802ba6d/src/vs/vscode.d.ts#L4968). It serves two purposes:

* Be a sample/reference for extension authors that want to implement a filesystem provider
* Be a test for other extensions that *falsely* assume text document always live on disk.


To *get started* you need this:

* install this extension
* have a workspace-file as shown below and open it via 'File > Open Workspace'
* select 'F1 > [MemFs] Create Files' and notice how the explorer is now populated
* ... try things out, e.g. IntelliSense in memfs-files, create new files, save them, etc
* select 'F1 > [MemFs] Delete Files' or reload to restart

A sample workspace file, saved as `Test.code-workspace`, is this:

```json
{
  "uri": "memfs:/",
  "name": "MemFS"
}
```
