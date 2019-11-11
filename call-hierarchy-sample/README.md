# Call Hierarchy Provider Sample

This sample shows the **Call Hierarchy** in action based on a simple food pyramid model defined using simple subject ~ verb ~ object syntax.

![Sample](demo.gif)

## VS Code API

### `vscode` module

- [`languages.registerCallHierarchyProvider`](https://code.visualstudio.com/api/references/vscode-api#languages.registerCallHierarchyProvider)
- [`CallHierarchyProvider`](https://code.visualstudio.com/api/references/vscode-api#CallHierarchyProvider)

## Running the Sample

Start the extension in the debugger and it automatically opens a file that is ready for the right-click > Peek Call Hierarchy. Otherwise, it can be testing by creating a file with extension `.txt` and pasting following text:

```plaintext
Coyote eats deer.
Deer eats plants.
Coyote eats lizard.
Lizard eats bird.
Lizard eats frog.
Lizard eats butterfly.
Bird eats seeds.
Frog eats insects.
Butterfly eats fruit.
```

Right click on a noun or a verb and select _Peek Call Hierarchy_.

## Contributing to the Sample and Testing the Sample

Run the _Run Extension Tests_ configuration and verify in the Debug Console that all tests are passing.
