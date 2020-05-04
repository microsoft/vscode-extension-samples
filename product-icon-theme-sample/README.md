# Product Icon Theme Samples

[Product icons themes](https://code.visualstudio.com/api/extension-guides/product-icon-theme) allow theme authors to customize the icons used in VS Code's built-in views: all icons except file icons (covered by file icon themes) and icons contributed by extensions.

This sample provides a product icon theme with icons used in VS Code 1.0.

## Demo

VSCode V1.0 Icons

![Sample VSCode 1.0](./demo.png)


## VS Code API

### Contribution Points

- [contributes.productIconThemes](https://code.visualstudio.com/api/references/contribution-points#contributes.productIconThemes)

## Running the sample

- Press `F5` to open a new window with your extension loaded.
- The extension development host window will automatically select the theme defined in the extension. To manually select a product icon theme, run the `Preferences: Product Icon Theme` command and select your theme.

## Make changes

- Changes to the product theme file are applied live in the extension development host window. No need to relaunch the extension.