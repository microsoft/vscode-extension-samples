# Inline Completions Sample

This sample demonstrates usage of the inline completions API with **two different variations**:

1. **Pattern-Based Provider** - Advanced features including proposed APIs
2. **Simple Context-Aware Provider** - Basic inline completions for common code patterns

![Demo Video](./demo.gif)

## Two Variations

### Variation 1: Pattern-Based Provider (Default)

This provider demonstrates advanced inline completion features:
- Custom syntax for triggering completions via special comments
- Support for snippets with the `s` flag
- Bracket pair completion with the `b` flag  
- Proposed API features (`handleDidShowCompletionItem`, `handleDidPartiallyAcceptCompletionItem`)
- Commands attached to completion items

**Usage**: Add special comment lines in your code like:
```javascript
// [0,*):console.log("Hello")
// Type here and the completion will appear
```

The syntax is: `// [start,end)flags:completion_text`
- `start`: Starting column position (0-based)
- `end`: Ending column position, or `*` for end of line
- `flags`: Optional flags (`s` for snippet, `b` for bracket pairs)
- `completion_text`: The text to insert

### Variation 2: Simple Context-Aware Provider

This provider demonstrates basic inline completion features:
- Context-aware completions based on what you're typing
- Simple pattern matching for common code constructs
- No proposed API usage (more stable, production-ready)

**Examples**:
- Type `console.` → suggests `log()`
- Type `function ` → suggests `myFunction() { }`
- Type `if ` → suggests `(condition) { }`
- Type `for ` → suggests `(let i = 0; i < length; i++) { }`

### Switching Between Variations

You can switch between the two providers by running the command:
**"Inline Completion: Switch Provider (Pattern-Based ↔ Simple)"** from the Command Palette (Ctrl+Shift+P / Cmd+Shift+P).

## Running the Sample

- Run `npm install` in terminal to install dependencies
- A `postinstall` script would download latest version of `vscode.proposed.*.d.ts`
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
- Try both variations:
  - **Pattern-Based**: Use the playground.js file with special comment syntax
  - **Simple**: Type common code patterns like `console.`, `if `, `for `, etc.
  - Use the Command Palette to switch between providers and see the differences
