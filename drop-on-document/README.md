# Document on Drop Sample

This sample shows usage of the [document on drop API](https://github.com/microsoft/vscode/issues/142990).

This sample adds two sample drop providers for plain text files:

- `ReverseTextOnDropProvider` — This provider reverses any text dropped into a plain text editor.

- `FileNameListOnDropProvider` — This provider inserts a numbered list of files names. It accepts dropped files from VS Code's explorer, VS Code's open editors view, or from the operating system.
