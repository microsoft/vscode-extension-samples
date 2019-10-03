# Adding Decorations

The Decorator API allows text to be decorated with a subset of CSS.

The following steps can be done to decorate content in an editor:

## Decoration Types

the [TextEditorDecorationType](https://code.visualstudio.com/api/references/vscode-api#TextEditorDecorationType) class defines how to style a decoration.

It can be created using `vscode.window.createTextEditorDecorationType`. It takes an object as a parameter which includes any of the properties of [DecorationRenderOptions](https://code.visualstudio.com/api/references/vscode-api#DecorationRenderOptions) which match up to their CSS properties.

```typescript
const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    overviewRulerColor: 'blue',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    light: {
        // this color will be used in light color themes
        borderColor: 'darkblue'
    },
    dark: {
        // this color will be used in dark color themes
        borderColor: 'lightblue'
    }
});
```

## Creating an array of Ranges

the Decorator API requires an array of [Ranges](https://code.visualstudio.com/api/references/vscode-api#Range). A VS Code range object describes a range of code which can span across both rows and columns in a single file.

you can either use a `Range[]` or a [DecorationOptions[]](https://code.visualstudio.com/api/references/vscode-api#DecorationOptions).

For simple sets of selections, using a regular expression can be useful.

```typescript
const regEx = /\d+/g;

const text = activeEditor.document.getText();
const smallNumbers: vscode.DecorationOptions[] = [];

let match;

while (match = regEx.exec(text)) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(match.index + match[0].length);

const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
    if (match[0].length < 3) {
        smallNumbers.push(decoration);
    }
}
```

## Setting the decoration

Finally, you can insert the decoration into any editor with the `setDecorations` method of the [TextEditor](https://code.visualstudio.com/api/references/vscode-api#TextEditor) class. It takes two arguments:

* The `TextEditorDecorationType` defined for the decoration.
* Either a `Range` array or a `DecorationOptions` array.

```typescript
activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
```

## Tips

As a note, if you insert a new range of decorations using `editor.setDecorations` with a `TextEditorDecorationType` that has already been used, it will overwrite the previous set of decorations.

If you'd like to remove a decoration(s) of a certain decoration type then pass in an empty array to clear it from the editor. Example: `editor.setDecorations(decorationType, []);`
