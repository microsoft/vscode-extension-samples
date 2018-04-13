# MemFS

This extension implements an in-memory file system to show-case a API. It also enables to see how other extensions behave with documents/files that aren't stored on disk. 

**NOTE** that this extension requires a very recent version of VS Code Insiders or the development version of VS Code, e.g. `./scripts/code.[sh|bat]`.

To *get started* you need the extension and a workspace with an entry like this:

```json
{
  "uri": "memfs:/",
  "name": "MemFS"
}
```

Then, select 'F1 > Initialize MemFS' and notice how the file explorer is populated with some files. 
