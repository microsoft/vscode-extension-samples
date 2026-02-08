# Virtual Document Sample

This is a sample extension that shows how to add virtual documents to the editor.

![cowsay](https://github.com/Microsoft/vscode-extension-samples/blob/main/virtual-document-sample/cowsay.gif)


## VS Code API

### `vscode` module

- [`workspace.registerTextDocumentContentProvider`](https://code.visualstudio.com/api/references/vscode-api#workspace.registerTextDocumentContentProvider)
- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`window.showInputBox`](https://code.visualstudio.com/api/references/vscode-api#window.showInputBox)

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Launch Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window


## Detailed explanation

If you are new in developing vscode extensions, you may not be familiar with the API style and conventions applied.

For that, here is an explanation of what's going on here, from the ground up.

### 0. Create a project

Run:

```sh
npm install -g yo generator-code
```

Select `New Extension (TypeScript)` option and open the project on vscode.

Right away you can press F5 to see a boilerplate example running, but we will cover that in the next step as well.

### 1. Register a command

```ts
// src/extension.ts
import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("my-extension.helloWorld", async () => {
      // pops up an information snackbar with the message
      vscode.window.showInformationMessage("hello world!")
    })
  )
}
```

`my-extension.helloWorld`  is the unique id of your command. By convention, the first part (`my-extension` here) is the name of your extension as in `package.json`.

Only registering the command on code doesn't mean you will see it on the command palette, as some commands are meant for internal use. To expose it, declare in `package.json`:

```json
  "contributes": {
    "commands": [
      {
        "command": "my-extension.helloWorld",
        "title": "Hello World"
      }
    ]
  }
```

Now press F5 to open the extension development host and you will have `Hello World` in the command palette.


### 2. Open a document

This is how you open a file from a command:

```ts
import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("my-extension.helloWorld", async () => {
      const filePath = "/Users/me/Desktop/hello.txt"

      // Creates an Uri object out of the path
      const uri = vscode.Uri.parse("file://" + filePath)

      // Opens a document in-memory
      const doc = await vscode.workspace.openTextDocument(uri)

      // Shows it in an actual tab
      await vscode.window.showTextDocument(doc, { preview: false })
    })
  )
}
```

Now the `Hello World` command will open the file at `/Users/me/Desktop/hello.txt`

Note we added `"file://"` prefix, that is key for understanding the next step.

### 3. Open a virtual document

The `"file://"` prefix is a scheme protocol, like `https://` in the web.

It is meant to inform VSCode how to open the Uri. In this case, `file` protocol informs it should get the content from an actual file on disk.

A `TextDocumentContentProvider` is VSCode's way of allowing you to 'take ownership' of a custom scheme.

Meaning, if you open an Uri like `my-scheme:<whatever>`, you can create the contents on the fly via code.

```ts
import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
  // Create the provider object and tell TS it complies
  // with the `TextDocumentContentProvider` interface
  const provider: vscode.TextDocumentContentProvider = {
    // The interface requires this function to be defined
    provideTextDocumentContent(uri) {
      return "Hello World"
    },
  }

  // Register the provider under the scheme you want.
  // I'll use the extension name for consistency
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      "my-extension",
      provider
    )
  )

  context.subscriptions.push(
    // Register a command to open an Uri under your scheme
    vscode.commands.registerCommand("my-extension.helloWorld", async () => {
      const uri = vscode.Uri.parse("my-extension:foo")

      const doc = await vscode.workspace.openTextDocument(uri)
      await vscode.window.showTextDocument(doc, { preview: false })
    })
  )
}
```

Now the `Hello World` command will open a tab with the content provided via code!

Note the `provideTextDocumentContent` function receives an `uri` argument, that is the uri that was reqeuested by `vscode.workspace.openTextDocument(uri)`. To understand what is going on, change the provider implementation to be:

```ts
const provider: vscode.TextDocumentContentProvider = {
  provideTextDocumentContent(uri) {
    return `uri: '${uri.toString()}', path: '${uri.path}'`
  },
}
```

Now you can use that information to create the content dynamically! In [the complete example](src/extension.ts) we simply use the `uri.path` as an argument to [`cowsay`<sup>[↗]</sup>](https://www.npmjs.com/package/cowsay)

### 4. Update a virtual document

One optional feature of `TextDocumentContentProvider` is to notify VSCode it has to update the virtual document contents, here is how it works:

```ts
import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
  // Set the initial content to be served
  let content = "Initial"

  // Keep a single top level reference of the virtual document uri for simplicity
  const myUri = vscode.Uri.parse("my-extension:foo")

  // Initialize an EventEmitter that will inform changes
  const changeEmitter = new vscode.EventEmitter<vscode.Uri>()

  const change = (newContent: string) => {
    content = newContent
    // Notify subscribers about the change.
    // We use `myUri` reference so VSCode knows
    // it has to update the tab containing that document
    changeEmitter.fire(myUri)
  }

  const provider: vscode.TextDocumentContentProvider = {
    // The interface has this optional field for telling
    // VSCode to subscribe and run `provideTextDocumentContent`
    // again when this event is fired
    onDidChange: changeEmitter.event,

    provideTextDocumentContent(uri) {
      return content
    },
  }

  // Set a new command to change the virtual document's content.
  // Remember to declare it in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand("my-extension.change", async () => {
      change('Changed!')
    })
  )

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      "my-extension",
      provider
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("my-extension.helloWorld", async () => {
      await vscode.window.showTextDocument(
        await vscode.workspace.openTextDocument(myUri),
        { preview: false }
      )
    })
  )
}
```

And change `package.json` to declare the new command:

```json
  "contributes": {
    "commands": [
      {
        "command": "my-extension.helloWorld",
        "title": "Hello World"
      },
      {
        "command": "my-extension.change",
        "title": "Change Content"
      }
    ],
  }
```

### 5. Dive in the code!

Now you have everything needed to understand [the full example](src/extension.ts)!

Note it shows some extra tricks you can use with the concepts in this tutorial, like modifying the virtual document Uri on the fly or how to make a command run under certain conditions.

Also do note the code conventions used, as this tutorial was made to be more concise and accessible. As you get more familiar, try identifying and following the estabilished conventions on this topic, as it's the community's battle-proven way of avoiding errors and facilitating contribution.


### 6. Extra resources:

- Official docs for [Your First Extension<sup>[↗]</sup>](https://code.visualstudio.com/api/get-started/your-first-extension)
- Official docs for [Virtual Documents<sup>[↗]</sup>](https://code.visualstudio.com/api/extension-guides/virtual-documents)
- More complex example using Virtual Documents: [References Editor Sample<sup>[↗]</sup>](https://github.com/microsoft/vscode-extension-samples/blob/main/contentprovider-sample/README.md)
