# Contributing a View Container & View

* Contribute a view container using the [viewContainers](https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributesviewscontainers) extension point.
* Contribute a view using the [views](https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributesviews) extension point.
* Register a data provider for the view using the [TreeDataProvider](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_TreeDataProvider) API.
* Contribute actions to the view using `view/title` and `view/item/context` locations in [menus](https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributesmenus) extension point.

## contributes.viewsContainers extension point

As of Visual Studio Code v1.23.0, you can move custom views into your own view container which will show up in the activity bar.

To do such, extension writers can add a `viewContainers` object in the contributes section. each object will require three things:

- `id`: The name of the new view you're creating
- `title`: The name which will show up at the top of the view
- `icon`: an image which will be displayed for the view container in the activity bar


## contributes.views extension point

You must specify an identifier and name for the view. You can contribute to following locations

- `explorer`: Explorer view in the Side bar
- `debug`: Debug view in the Side bar
- `scm`: Debug view in the Side bar

When the user opens the view, VS Code will then emit an activationEvent `onView:${viewId}` (e.g. `onView:nodeDependencies` for the example below). You can also control the visibility of the view by providing the `when` context value.

Following, in the views object, you can then add a field with the same string as the `id` in the `viewContainers`.

```json
"contributes": {
    "viewContainers": {
        "activitybar": [
            {
                "id": "package-explorer",
				"title": "Package Explorer",
				"icon": "media/dep.svg"
            }
        ]
    },
    "views": {
        "tree-view": [
            {
                "id": "nodeDependencies",
                "name": "Node Dependencies",
                "when": "workspaceHasPackageJSON"
            }
        ]
    }
}
```

## View actions

You can contribute actions at following locations in the view

- `view/title`: Location to show actions in the view title. Primary or inline actions use `"group": "navigation"` and rest are secondary actions which are in `...` menu.
- `view/item/context`: Location to show actions for the tree item. Inline actions use `"group": "inline"` and rest are secondary actions which are in `...` menu. 

You can control the visibility of these actions using the `when` property. 

Examples:

```json
"contributes": {
    "commands": [
        {
            "command": "nodeDependencies.refreshEntry",
            "title": "Refresh",
            "icon": {
                "light": "resources/light/refresh.svg",
                "dark": "resources/dark/refresh.svg"
            }
        }
    ],
    "menus": {
        "view/title": [
            {
                "command": "nodeDependencies.refreshEntry",
                "when": "view == nodeDependencies",
                "group": "navigation"
            }
        ]
    }
}
```

**Note:** If you want to show an action for specific items, you can do it by defining context of a tree item using `TreeItem.contextValue` and you can specify the context value for key `viewItem` in `when` expression.

Examples:

```json
"contributes": {
    "menus": {
       "view/item/context": [
           {
                "command": "nodeDependencies.deleteEntry",
                "when": "view == nodeDependencies && viewItem == dependency"
			}
        ]
    }
}
```

## TreeDataProvider

Extension writers should register a [provider](/docs/extensionAPI/vscode-api.md#TreeDataProvider) programmatically to populate data in the view.

```typescript
vscode.window.registerTreeDataProvider('nodeDependencies', new DepNodeProvider());
```

See [nodeDependencies.ts](src/nodeDependencies.ts) for the implementation.


## TreeView

If you would like to perform some UI operations on the view programatically, you can use `window.createTreeView` instead of `window.registerDataProvider`. This will give access to the view which you can use for performing view operations.

```typescript
vscode.window.createTreeView('ftpExplorer', { treeDataProvider: new FtpTreeDataProvider() });
```

See [ftpExplorer.ts](src/ftpExplorer.ts) for the implementation.
