# Language Model API Tutorial Sample

This is the source code for the [Language Model API Tutorial](). It demonstrates how to use the GitHub Copilot Language Model API to build an extension that annotates your code with inline tutoring tips.

## Demo
![Link to demo from docs]()

### Running the sample

- Run `npm install` in terminal to install depedencies
- Run the `Run Extension` target in the Debug View. This will:
    - Start a task `npm: watch` to compile the client code
    - Run the extension in a new VS Code window.
- Open a folder in the new VS Code window.
- Open a code file.
- Run the `Toggle Tutor Annotations` command from the command palette.