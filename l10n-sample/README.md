# l10n-sample README

This folder contains a sample VS code extension that shows how to localize an extension. For this sample, it shows two commands: Hello and Bye in English and Japanese.

Localization for VS Code extension's source code has 4 important parts:

* `package.nls.json` - The file used for translating static contributions in your extension's package.json
* `vscode.l10n.t` - The API for translating strings in your extension's code
* `@vscode/l10n` - The library used for loading the translations into subprocesses of your extension
* `@vscode/l10n-dev` - The tooling used for extracting l10n strings from vscode extensions and working with XLF files

## `package.nls.json`

Take a look at the [package.nls.json](./package.nls.json) file. This file contains the translations for the static contributions in your extension's manifest (package.json). The keys in this file are the same as the keys in your package.json. The values are the translations for the corresponding key. Now open the [package.json](./package.json). You'll notice that the keys in the file (ex. `extension.sayHello.title`) surrounded by `%`s.

## `vscode.l10n.t`

`l10n` is a new namespace that's a part of the official VS Code API. This is the new way to mark a string as "needing to be translated" and replaces the old way of using the `vscode-nls` and the `vscode-nls-dev` packages.

> NOTE: This API is currently a proposed API, so we have a couple of additional pre-reqs that are needed to get this working. The plan is to finalize this API in October.

### Pre-reqs for the Proposed API

* When running an extension using a proposed API, you must either run VS Code with `code-insiders . --enable-proposed-api vscode-samples.l10n-sample` or by running your extension in the extension development host with `F5` (which will automatically enable the proposed API for you).

> More docs on this [can be found on our docs website](https://code.visualstudio.com/api/advanced-topics/using-proposed-api#:~:text=Proposed%20API%20is%20a%20set%20of%20unstable%20API,distribution%20and%20cannot%20be%20used%20in%20published%20extensions.).

### Usage

In `extension.ts` and `command/sayBye.ts` you'll notice the usages of `vscode.l10n.t()`. This is how you mark a string a localized string. Localized strings will be pulled out of a `bundle.l10n.<LANG>.json` file if one is available. In this repo, [we have one for Japanese](./l10n/bundle.l10n.ja.json). There are two function signatures for this API:

```ts
function t(message: string, ...args: any[]): string;
function t(options: { message: string; args?: any[]; comment: string[] }): string;
```

These strings support arguments and comments. The arguments are used to replace placeholders in the string which look like `Hello {0}` where `{0}` is a placeholder and will be filled in with the argument at the specified index. The comments are used to provide context for the translators. For example, if you have a string that says `Hello {0}`, the translators might not know what `{0}` is. So you can provide a comment to explain what `{0}` is.

### Extension manifest `l10n` property

An absolute must for this to work is that you must add the following to your extension manifest which you can see is done in this extension. Like so:

```json
{
    // example
    "main": "./out/extension.js",
    // ...
    "l10n": "./l10n"
}
```

This tells VS Code where to find the localized strings for your extension and should be set to the directory that has the `bundle.l10n.<LANG>.json` files. You can set `l10n` to whatever you want, but note that it must be a relative path to the root of your extension. At runtime, that property will be used to load the correct localized strings for your extension so you will need to make sure that you put the files with the localized strings in the correct place.

### `@vscode/l10n`

In this repo, you can see that there is a `cli.ts`. This file will be run outside of your extension using the `node` executable directly. This is a simple example of how you can use the `@vscode/l10n` package to load the localized strings for your extension inside of that subprocess.

Those `l10n.t` calls will pull the strings from the file uri that was passed in... but the importance of this package is that these `l10n.t()` calls will also be picked up by the tooling that we use to extract strings for localization.

## `@vscode/l10n-dev`

This package is used for extracting strings from your extension and working with XLF files. It's a CLI tool that you can run from the command line. You can see the full usage of this tool in [its repo](https://github.com/microsoft/vscode-l10n/tree/main/l10n-dev). But for this sample, we'll just go over the basics.

First off, if you want to generate a `bundle.l10n.json` file which contains the sample's localizable strings, run:

```
npx @vscode/l10n-dev export -o ./l10n ./src
```

This will generate a `bundle.l10n.json` file in the `l10n` folder. This file contains all of the strings that are localizable in the extension. You can then create a `bundle.l10n.<LANG>.json` file for each language that you want to support and add the key/value pairs for the strings that you want to translate.

On the VS Code team, we work with a team at Microsoft that accepts XLF files and handles translating strings for us. So we use the `@vscode/l10n-dev` tool to convert our `bundle.l10n.json` and `package.nls.json` files into XLF files. If you want to generate an XLF file, you can run:

```
npx @vscode/l10n-dev generate-xlf -o ./l10n-sample.xlf ./l10n/bundle.l10n.json ./package.nls.json
```

The `l10n-dev` tooling also supports converting XLF files back into `bundle.l10n.json` and `package.nls.json` files, but we won't cover this here as it's not needed for this sample.
