# Contributing a View

* Contribute a view using the [views](https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributesviews) extension point.
* Register a data provider for the view using the [TreeDataProvider](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_TreeDataProvider) API.
* Contribute actions to the view using `view/title` and `view/item/context` locations in [menus](https://code.visualstudio.com/docs/extensionAPI/extension-points#_contributesmenus) extension point.


# contributes.views extension point

You must specify an identifier and name for the view. You can contribute to following locations

- `explorer`: Explorer view in the Side bar
- `debug`: Debug view in the Side bar

When the user opens the view, VS Code will then emit an activationEvent `onView:${viewId}` (e.g. `onView:nodeDependencies` for the example below). You can also control the visibility of the view by providing the `when` context value.

```json
"contributes": {
    "views": {
        "explorer": [
            {
                "id": "nodeDependencies",
                "name": "Node Dependencies",
                "when": "workspaceHasPackageJSON"
            }
        ]
    }
}
```

# TreeDataProvider

Extension writers should register a [provider](/docs/extensionAPI/vscode-api.md#TreeDataProvider) programmatically to populate data in the view.

```typescript
vscode.window.registerTreeDataProvider('nodeDependencies', new DepNodeProvider());
```

See [nodeDependencies.ts](src/nodeDependencies.ts) for the implementation.

# contributes.viewsContainers extension point

As of Visual Studio Code v1.23.0, you can move custom views into your own view container which will show up in the activity bar.

To do such, extension writers can add a `viewContainers` object in the contributes section. each object will require three things:

- `id`: The name of the new view you're creating
- `title`: The name which will show up at the top of the view
- `icon`: an image which will be displayed for the view container in the activity bar

Following, in the views object, you can then add a field with the same string as the `id` in the `viewContainers`.

```json
"contributes": {
    "viewContainers": {
        "activitybar": [
            {
                "id": "tree-view",
                "title": "Tree View",
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