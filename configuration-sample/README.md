# Configuration Sample Extension

This sample shows

- How to define a `window` and `resource` scoped configurations.
- How to read and update a `window` scoped configuration
- How to read a `resource` scoped configuration of a resource
- How to update a value for `resource` scoped configuration of a resource
- How to listen to configuration changes
- How to test it

See [extension.ts](./src/extension.ts)

# Testing

## Empty Workspace

Explains how to test this extension in an Empty workspace

### Testing Window configuration

- Open User Settings and set `"conf.view.showOnWindowOpen": "scm"`
- Refresh the Window. SCM view will be shown always, even if you refresh from a view other than SCM.
- Run the command `Configure view to show on window open` and Select the value (View to show when opening a window)
- Value should be updated in `User Settings`

### Testing Resource configuration

- Open User Settings and set `"conf.resource.insertEmptyLastLine": {"${absolute_path_to_file}": true}`
- Open the above configured file in the empty window. A message about adding empty line from the extension is shown.
- Open a different file. No message is shown.
- Run the command `Configure empty last line for current file`
- Value in User settings is updated. Message is shown now
- Run the command `Configure empty last line for files` and provide abosoulte path of another file
- Value should be updated in User Settings

## Folder Workspace

Explains how to test this extension in a Folder workspace

### Testing Window configuration

- Open User or Workspace Settings and set `"conf.view.showOnWindowOpen": "scm"`
- Refresh the Window. SCM view will be shown always, even if you refresh from a view other than SCM.
- Run the command `Configure view to show on window open`. Select the value (View to show when opening a window)
- Pick the target `User Settings` or `Workspace Settings` into which the value should be updated
- Value should be updated in selected target

### Testing Resource configuration

- Open User Settings and set `"conf.resource.insertEmptyLastLine": {"${absolute_path_to_file}": true}`
- Open the above configured file in the empty window. A message about adding empty line from the extension is shown.
- Open a different file from the opened folder. No message is shown.
- Run the command `Configure empty last line for current file`
- Value in Workspace settings is updated. Message is shown now.
- Run the command `Configure empty last line for files` and provide abosoulte path of another file.
- Pick the target `User Settings` or `Workspace Settings` into which the value should be updated
- Value should be updated in selected target

### Multiroot Workspace

Explains how to test this extension in a Multiroot workspace

### Testing Window configuration

- Open User or Workspace Settings and set `"conf.view.showOnWindowOpen": "scm"`
- Refresh the Window. SCM view will be shown always, even if you refresh from a view other than SCM.
- *NOTE*: This setting cannot be applied under Folder settings, doing so will show a warning and value is not respected.
- Run the command `Configure view to show on window open`. Select the value (View to show when opening a window)
- Pick the target `User Settings` or `Workspace Settings` into which the value should be updated
- Value should be updated in selected target

### Testing Resource configuration

- Open User Settings and set `"conf.resource.insertEmptyLastLine": {"${absolute_path_to_file}": true}`
- Open the above configured file in the empty window. A message about adding empty line from the extension is shown.
- Open a different file from one of the root folders. No message is shown.
- Run the command `Configure empty last line for current file`
- Value in Folder Settings of the root folder of the current file is updated. Message is shown now.
- Run the command `Configure empty last line for files` and provide abosoulte path of another file.
- Pick the target `User Settings` or `Workspace Settings` or `Workspace Folder Settings` into which the value should be updated
- Selecting User or Workspace Settings should update the value in respective targets.
- Selecting Workspace Folder Settings will show a Workspace Folder Picker
- Picking a workspace folder should update the value in the respective folder settings file.
