# notebook-serializer-sample

This is a very simple extension sample demonstrating the use of the notebook serializer and controller APIs. This sample includes:

- A notebook serializer that is activated for files matching `*.sample-json-notebook`. It serializes notebook data into a simple JSON-based format.
- A notebook controller that "executes" JSON-type code cells by adding an output to the cell that includes the content of the cell parsed as JSON.
- A command "Create JSON Notebook" that creates a new untitled notebook of this type.

## Running this sample

 1. `cd notebook-serializer-sample`
 1. `code .`: Open the folder in VS Code
 1. Hit `F5` to build+debug
 1. Run the command "Create JSON Notebook"
 1. Add and edit cells, and click the run button to invoke the controller
