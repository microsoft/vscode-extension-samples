# Source Control Sample

This sample implements a minimal source control provider. It shows how the source control experience in VS Code could be used to for example interact with code in JSFiddle.

![alt text](resources/images/demo.gif "Extension demo")

## VS Code API

Following VS Code APIs are demonstrated by this extension:

- `workspace.workspaceFolders`
- `scm.createSourceControl`
- `SourceControl`
- `SourceControlResourceGroup`
- `TextDocumentContentProvider`

## Running the Sample

Activate the extension by invoking the `Open JSFiddle` command, specify the JSFiddle code, if no workspace folder is open, select a workspace folder. This invokes following 4 lines, which does the following:

1. creates the custom source control provider associated with the workspace folder
1. creates the source control resource group to later show the local changes to the files in the repository
1. registers the `quickDiffProvider`, which implements the mapping between the documents in the remote repository and documents in the local folder.

```javascript
this.jsFiddleScm = vscode.scm.createSourceControl('jsfiddle', 'JSFiddle #' + fiddle.slug, workspaceFolder.uri);
this.changedResources = this.jsFiddleScm.createResourceGroup('workingTree', 'Changes');
this.fiddleRepository = new FiddleRepository(workspaceFolder, fiddle.slug);
this.jsFiddleScm.quickDiffProvider = this.fiddleRepository;
```

![alt text](resources/images/source_control_view.PNG "Source control view")

See `fiddleSourceControl.ts` for full code listing.

The three commands (command, roll-back and refresh) in the title of the source control view pane are configured this way:

```JSON
"contributes": {
    "commands": [
        ...
    ],
    "menus": {
        "scm/title": [
            {
                "command": "extension.source-control.commit",
                "group": "navigation",
                "when": "scmProvider == jsfiddle"
            },
            {
                "command": "extension.source-control.discard",
                "group": "navigation",
                "when": "scmProvider == jsfiddle"
            },
            {
                "command": "extension.source-control.refresh",
                "group": "navigation",
                "when": "scmProvider == jsfiddle"
            },
            {
                "command": "extension.source-control.browse",
                "when": "scmProvider == jsfiddle"
            }
        ]
    }
},
```

Note that the `extension.source-control.browse` command is intentionally missing the `"group": "navigation"` placement specification, which makes it show up under the [dot dot dot] button.

It is also worth noting that the sample extension needs to overcome reloading that VS Code triggers when a new workspace folder is added. This could be done either by writing a memo into the `context.globalState`, or a configuration file into the workspace folder and reading it upon the next extension activation. The selected solution is to use `.jsfiddle` configuration file as described below.

## Status bar controls

The custom source control can add its own controls to the status bar. This typically needs to be refreshed every time a new version/branch is checked-out.

```javascript
this.jsFiddleScm.statusBarCommands = [
    {
        "command": "extension.source-control.checkout",
        "title": `↕ ${this.fiddle.slug} #${this.fiddle.version} / ${this.latestFiddleVersion}`,
        "tooltip": "Checkout another version of this fiddle.",
    }
];
```

![alt text](resources/images/status_bar.PNG "Status bar integration")

The command `extension.source-control.checkout` displays quick pick of the JSFiddle versions to check-out.

## Populating changed files view

The extension listens to changes to files in the workspace folder and compares the new document text to the version originally checked out from the repository. When it differs, it creates `vscode.SourceControlResourceState` for every changed document assigns such list to `this.changedResources.resourceStates`, where the `this.changedResources` was created earlier.

```javascript
{
    resourceUri: doc.uri,
    command: {
        title: "Show changes",
        command: "vscode.diff",
        arguments: [repositoryUri, doc.uri, `Checked-out version ↔ Local changes`],
        tooltip: "Diff your changes"
    }
}
```

where `repositoryUri` is determined by

```javascript
this.fiddleRepository.provideOriginalResource(doc.uri, null)
```

## Quick diff

Both the regular diff (invoking the built-in `vscode.diff` when user clicks on the changed resource in the source control view) and the Quick Diff (available in the left margin of the text editor) are rendered automatically by VS Code as long as the extension provides it with the content of the original document checked out from the repository. This is done by implementing a `TextDocumentContentProvider`.

![alt text](resources/images/quick_diff.gif "Quick diff")

## Source Control extension activation

A source control extensions gets activated either when a remote repository gets _cloned_
upon user request, or when a previously _cloned_ workspace folder is open.

```JSON
    "activationEvents": [
        "onCommand:extension.source-control.open",
        "workspaceContains:.jsfiddle"
    ],
```

This extension implements the _cloning_ using the `extension.source-control.open` command.

This sample extension stores the source control configuration in the `.jsfiddle` JSON file in the workspace folder root.

This is done by storing the `.jsfiddle` configuration file into the `WorkspaceFolder` just inserting the workspace folder via the `vscode.workspace.updateWorkspaceFolders(...)` call, which seems to make the extension re-activate. Upon the re-activation, the `initializeFromConfigurationFile()` function scans all `WorkspaceFolder`s for the `.jsfiddle` configuration files and re-creates the `SourceControl` instances.

## Multiple workspace folder support

Source control extension should support multiple workspace folders bound to different remote repositories.

![alt text](resources/images/multi-workspace-folder.gif "Multiple workspace folder support")

## Testing the sample

This sample can be tested on any JSFiddle with (e.g. `u8B29/1`) or without (e.g. `u8B29`) the version number specified. However, if you want to test committing code back to the repository, try typing in `demo` instead of a real fiddle name, which lets you mock the repository without reading/writing from/to actual JSFiddle.
