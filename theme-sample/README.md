# Theme Samples

This sample contains two example TextMate themes. 

Token colorization (syntax highlighting) is based on TextMate grammars and TextMate themes. Colors are matched against one or more scopes. To learn more about scopes and how they're used, check out the [theme](https://code.visualstudio.com/docs/extensions/themes-snippets-colorizers#_adding-a-new-color-theme) documentation.

You can directly use .tmTheme files in your extensions or import/convert them with VS Code's extension generator [yo code](https://code.visualstudio.com/docs/extensions/yocode).

## Running the sample

- Press `F5` to open a new window with your extension loaded.
- Open `File > Preferences > Color Themes` (or ) and pick `Sample Light` or `Sample Dark`.
- Open a file that has a language associated. The languages' configured grammar will tokenize the text and assign 'scopes' to the tokens. To examine these scopes, invoke the `Inspect TM Scopes` command from the Commmand Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) .

## Make changes

- You can relaunch the extension from the debug toolbar after making changes to the files listed above.
- You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.