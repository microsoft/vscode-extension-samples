# Language Configuration Sample

This is the source code for the [Language Configuration Guide](https://code.visualstudio.com/api/language-extensions/language-configuration-guide). This sample controls the following [Declarative Language Features](https://code.visualstudio.com/api/language-extensions/overview#declarative-language-support) for JavaScript:

- Comment toggling
- Brackets definition
- Autoclosing
- Autosurrounding
- Folding
- Word pattern
- Indentation rules

## `language-configuration.json` schema

The `comments.lineComment` property is valid per the [language configuration guide](https://code.visualstudio.com/api/language-extensions/language-configuration-guide#comment-actions). If VS Code shows `Incorrect type. Expected "object"` on `lineComment`, that is a schema validation bug in the editor rather than an error in this file.

The authoritative shape is documented in the guide above. VS Code loads this file at runtime via `contributes.languages[].configuration` in `package.json`.

The `indentationRules` use standard JavaScript patterns: `increaseIndentPattern` matches lines ending with an unclosed `{`, `(`, or `[`; `decreaseIndentPattern` matches lines that begin with or consist of a closing `}` or `]`.

## Try it

- Open this folder in VS Code
- Open any `.js` file
- Toggle line comments with `Ctrl+/` / `Cmd+/`
