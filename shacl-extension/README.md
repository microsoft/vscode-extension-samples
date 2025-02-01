# SHACL Shapes Editor

## Overview

The SHACL Shapes Editor extension provides a user-friendly interface for authoring, creating, and editing SHACL Shapes for RDF graphs. SHACL (Shapes Constraint Language) is a language for validating RDF (Resource Description Framework) graphs against a set of conditions. This extension helps users to define and manage SHACL Shapes within Visual Studio Code.

## Features

- Create new SHACL Shapes
- Edit existing SHACL Shapes
- Visualize SHACL Shapes
- Validate RDF graphs against SHACL Shapes

## Installation

1. Install Visual Studio Code.
2. Open the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
3. Search for "SHACL Shapes Editor" and click Install.

## Usage

### Creating a SHACL Shape

1. Open the Command Palette by pressing `Ctrl+Shift+P`.
2. Type "Create SHACL Shape" and select the command.
3. Enter the name of the SHACL Shape when prompted.
4. A new document will open with the SHACL Shape definition in Turtle format.

### Editing a SHACL Shape

1. Open the SHACL Shape document you want to edit.
2. Make the necessary changes to the SHACL Shape definition.
3. Save the document.

### Validating RDF Graphs

1. Open the RDF graph document you want to validate.
2. Open the SHACL Shape document you want to use for validation.
3. Run the validation command from the Command Palette.

## Examples

### Example SHACL Shape

```turtle
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ex: <http://example.org/> .

ex:PersonShape
    a sh:NodeShape ;
    sh:targetClass ex:Person ;
    sh:property [
        sh:path ex:name ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
    ] .
```

### Example RDF Graph

```turtle
@prefix ex: <http://example.org/> .

ex:JohnDoe
    a ex:Person ;
    ex:name "John Doe" .
```

### Validating the RDF Graph

To validate the RDF graph against the SHACL Shape, run the validation command from the Command Palette. The results will be displayed in the Output panel.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
