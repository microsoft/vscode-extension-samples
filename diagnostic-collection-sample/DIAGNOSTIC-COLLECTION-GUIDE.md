# A Beginner's Guide to Diagnostic Collections in VS Code

When an editor underlines a problem and lists it in the Problems view, it is showing a *diagnostic*. An extension can create diagnostics too: a spelling checker might report misspelled words, a language extension might report syntax errors, and a configuration tool might warn about questionable settings.

This guide walks through the Diagnostic Collection API using the Diagnostic Collection Sample. You do not need to know the VS Code API already; basic TypeScript familiarity is enough.

## Start with the sample

In this sample, lines beginning with `ERROR:`, `WARNING:`, or `INFO:` produce diagnostics. The extension watches `sample-demo.txt`, turns each matching line into a diagnostic, and publishes the results to VS Code.

To try it:

1. Open this sample folder in VS Code and run `npm install`.
2. Press `F5` to start an Extension Development Host.
3. Open `sample-demo.txt` from the `test-workspace` folder in that new window.
4. Change a marker or its message. The diagnostic should update as you edit.
5. Open the Command Palette and try **Diagnostic Collection Sample: Inspect Collection**, **Clear Diagnostics**, or **Scan Active Document**.

The Problems view is available from **View > Problems**. It shows diagnostics from this and other extensions together.

## What is a diagnostic?

A diagnostic is a small description of something worth showing about a document. At minimum, it has a range, a message, and a severity:

```ts
const range = new vscode.Range(0, 0, 0, 5);
const diagnostic = new vscode.Diagnostic(
    range,
    'Something needs attention.',
    vscode.DiagnosticSeverity.Warning
);
```

This range starts at line `0`, character `0` and ends at line `0`, character `5`. VS Code positions are zero-based, so line `0` is the first line of the file. The range determines where the editor draws an underline and where navigation takes the user.

Severity controls how VS Code presents the result. The API provides `Error`, `Warning`, `Information`, and `Hint`. Choose the severity that reflects the impact; the sample maps its three text markers to `Error`, `Warning`, and `Information`.

Optional metadata can make a diagnostic more useful:

```ts
diagnostic.code = 'DEMO_WARNING';
diagnostic.source = 'Diagnostic Collection Sample';
```

The code identifies the kind of issue, while the source tells the user which tool reported it. These values appear in places such as the Problems view.

## Give diagnostics a collection

Create a collection once while your extension activates:

```ts
const collection = vscode.languages.createDiagnosticCollection('diagnosticCollectionSample');
```

Think of the collection as your extension's published diagnostics, organized by document URI. A URI identifies a resource such as a file. The collection name identifies the collection; it is not the diagnostic source shown to the user.

When your extension has finished checking a document, publish that document's current results:

```ts
collection.set(document.uri, diagnostics);
```

The second argument is the complete set of diagnostics for that document, not just the ones that are new. Replacing the set after each check ensures that fixed problems disappear and changed problems are refreshed. To publish results for multiple documents, call `set` for each URI (the API also supports setting multiple URI/diagnostic pairs at once).

## Build diagnostics from a document

The sample's scanner walks through the document one line at a time. For each line, it looks for a known marker, calculates the text range, constructs a diagnostic, and adds it to an array:

```ts
const diagnostics: vscode.Diagnostic[] = [];

for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
    const line = document.lineAt(lineNumber);
    const match = markerPattern.exec(line.text);
    if (!match) {
        continue;
    }

    const marker = match[1];
    const severity = marker === 'ERROR'
        ? vscode.DiagnosticSeverity.Error
        : marker === 'WARNING'
            ? vscode.DiagnosticSeverity.Warning
            : vscode.DiagnosticSeverity.Information;
    const range = new vscode.Range(
        lineNumber,
        match.index,
        lineNumber,
        match.index + match[0].length
    );
    const diagnostic = new vscode.Diagnostic(range, match[2], severity);
    diagnostic.code = `DEMO_${marker}`;
    diagnostic.source = 'Diagnostic Collection Sample';
    diagnostics.push(diagnostic);
}

collection.set(document.uri, diagnostics);
```

The sample uses a regular expression to keep the example small. A real language extension would usually use a parser, compiler, or language server to decide what is wrong. The collection API does not perform the analysis; it publishes the results your extension has already computed.

## Keep the collection in sync

Diagnostics become stale if they are only computed once. The sample listens for document events and calls its scanner again:

```ts
vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
vscode.workspace.onDidChangeTextDocument(event => updateDiagnostics(event.document)),
```

It also checks documents that were already open when the extension activates. This covers both documents opened later and documents that were open before activation.

The scanner first checks whether the document is one the sample owns. It ignores every file except `sample-demo.txt`, so this demonstration does not report marker-like text in unrelated files. In a real extension, use an appropriate language ID, URI scheme, file pattern, or project rule to decide which documents your extension should analyze.

## Read and remove results

The sample demonstrates the collection's main operations:

- `collection.get(uri)` returns the diagnostics currently stored for one document, or `undefined` if there are none.
- `collection.has(uri)` checks whether the collection has diagnostics associated with that document.
- `collection.forEach((uri, diagnostics) => ...)` visits the documents and diagnostics in the collection.
- `collection.delete(uri)` removes diagnostics for one document. The sample does this when its document closes.
- `collection.clear()` removes all diagnostics in the collection. The sample exposes this as a command.

Use `set` when a document is analyzed again, `delete` when you want to remove one document's results, and `clear` when you want to remove everything owned by that collection. Clearing a collection does not clear diagnostics published by other extensions.

## Clean up when the extension stops

The sample registers the collection, output channel, event listeners, and commands in `context.subscriptions`:

```ts
context.subscriptions.push(
    collection,
    output,
    vscode.workspace.onDidChangeTextDocument(/* listener */),
    vscode.commands.registerCommand(/* command */)
);
```

VS Code disposes these subscriptions when the extension is deactivated. A diagnostic collection is disposable too, so registering it here lets VS Code clean up the diagnostics and release the collection with the rest of the extension's resources.

## A useful mental model

There are two separate jobs:

1. **Analyze:** your extension decides whether a document contains a problem and creates `Diagnostic` objects.
2. **Publish:** your extension puts the complete result for a document into a `DiagnosticCollection`.

The collection does not scan files or decide what counts as an error. It is the bridge between your analysis and VS Code's editor, Problems view, and diagnostic consumers.

## Explore the code

The full implementation is in [src/extension.ts](src/extension.ts). The sample's integration tests in [src/test/suite/diagnosticCollection.test.ts](src/test/suite/diagnosticCollection.test.ts) verify severity, message, metadata, updates, clearing, rescanning, and cleanup when the document closes.