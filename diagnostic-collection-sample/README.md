# Diagnostic Collection Sample

This extension creates a `DiagnosticCollection` and reports diagnostics for marker lines in [sample-demo.txt](test-workspace/sample-demo.txt). Edit a marker line to see its diagnostic update immediately in the editor and the Problems view.

The sample demonstrates `DiagnosticCollection.set`, `get`, `has`, `forEach`, `delete`, and `clear`. Diagnostics for the demo document are removed from the collection when it closes.

## Set up & Test

- Run `npm install` in this folder.
- Press `F5` to launch the extension.
- Open `sample-demo.txt` from the `test-workspace` folder in the Extension Development Host.
- Try changing `ERROR`, `WARNING`, or `INFO` and the message after it.
- Run **Diagnostic Collection Sample: Inspect Collection** from the Command Palette to view its current contents.
- Run **Diagnostic Collection Sample: Clear Diagnostics** to clear the collection, or **Diagnostic Collection Sample: Scan Active Document** to repopulate it.

## API

- `languages.createDiagnosticCollection`
- `DiagnosticCollection.set`
- `DiagnosticCollection.get`
- `DiagnosticCollection.has`
- `DiagnosticCollection.forEach`
- `DiagnosticCollection.delete`
- `DiagnosticCollection.clear`
