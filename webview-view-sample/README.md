# Calico Colors — Webview View API Sample

Demonstrates VS Code's [webview view API](https://github.com/microsoft/vscode/issues/46585). This includes:

- Contributing webview based views to custom view containers (`activitybar`, `panel`, `secondarySidebar`)
- Posting messages from an extension to a webview view
- Posting message from a webview to an extension  
- Persisting state in the view.
- Contributing commands to the view title.

## View containers

This sample registers three custom [viewsContainers](https://code.visualstudio.com/api/references/contribution-points#contributes.viewsContainers):

| Location | Container id | View id |
|----------|--------------|---------|
| Activity Bar | `calicoColors` | `calicoColors.colorsView` |
| Panel | `calicoColorsPanel` | `calicoColors.panelView` |
| Secondary Sidebar | `calicoColorsSecondary` | `calicoColors.secondaryView` |

See [`package.json`](package.json) for the contribution points and [`src/extension.ts`](src/extension.ts) for the providers.

## VS Code API

### `vscode` module

- [`window.registerWebviewViewProvider`](https://code.visualstudio.com/api/references/vscode-api#window.registerWebviewViewProvider)

## Running the example

- Open this example in VS Code 1.49+
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging

In the activity bar, open the **Calico Colors** view container. You can also open the panel and secondary sidebar containers from the View menu.