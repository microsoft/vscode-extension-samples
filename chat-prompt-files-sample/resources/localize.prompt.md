---
name: vscodeLocalize
description: Add or update the localization of the current VS Code extension.
---

Add or update the localization of the current VS Code extension.

When adding or updating localization for a VS Code project, follow these steps:

Replace all user-facing strings in the codebase with calls to `vscode.l10n.t` from the vscode API. For example, change:
```typescript
const label = "Hello, World!";
```
with
```typescript
import * as vscode from 'vscode';
const label = vscode.l10n.t("Hello, World!");
```


When all strings have been replaced, use the `@vscode/l10n-dev` CLI tool to extract the strings into a `./l10n/bundle.l10n.json` localization file. From there you can make a bundle.l10n.LOCALE.json file for each locale you want to support. 

For example, let's say that the command above generates the following bundle.l10n.json file:
```
{
  "Hello, World!": "Hello, World!",
}
```

To create a French localization, create a file named `bundle.l10n.fr.json` in the same directory with the following content:
```
{
  "Hello, World!": "Bonjour le monde!",
}
```

Finally, ensure that your `package.json` includes the localization configuration. Add an entry like this:
```json
"l10n": "./l10n"
```
