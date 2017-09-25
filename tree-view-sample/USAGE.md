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
