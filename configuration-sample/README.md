# Configuration Sample

This VS Code extension sample demonstrates how to add and manage different types of configuration settings in your extension.

## 📖 What This Sample Demonstrates

- **Window-scoped configurations**: Settings that apply to the entire VS Code window
- **Resource-scoped configurations**: Settings that apply to specific files
- **Language-overridable configurations**: Settings that can be customized for different programming languages
- How to read, update, and listen to configuration changes

## 🚀 Quick Start

### Prerequisites
- [Visual Studio Code](https://code.visualstudio.com/) version 1.74.0 or higher
- [Node.js](https://nodejs.org/) (version 14 or higher)

### Installation & Running
1. **Open this folder** in VS Code:
   ```bash
   cd configuration-sample
   code .
Install dependencies:

bash
npm install
Run the extension:

Press F5 or go to Run > Start Debugging

This will open a new VS Code window with your extension loaded

🧪 Testing the Configuration
Test 1: Window Configuration
Open Settings (Ctrl+, or Cmd+,)

Search for conf.view.showOnWindowOpen

Set value to "scm"

Reload VS Code window - the Source Control view should open automatically

Run command Configure view to show on window open to change this setting

Test 2: Resource Configuration
Open Settings and set:

json
"conf.resource.insertEmptyLastLine": {
  "/absolute/path/to/your/file.txt": true
}
Open that specific file - you'll see a message about adding empty lines

Run command Configure empty last line for current file to apply to current file

Test 3: Language Configuration
Open Settings and set "conf.language.showSize": true

Open any file - file size appears in status bar

Run command Configuration Sample: Configure show size for language to set for specific languages

🔧 Key Code Examples
Reading Configuration
typescript
// Get window-scoped configuration
const config = vscode.workspace.getConfiguration('conf.view');
const showView = config.get('showOnWindowOpen');

// Get resource-scoped configuration  
const resourceConfig = vscode.workspace.getConfiguration('conf.resource', document.uri);
const insertEmptyLine = resourceConfig.get('insertEmptyLastLine');
Updating Configuration
typescript
// Update window configuration
await vscode.workspace.getConfiguration('conf.view')
  .update('showOnWindowOpen', 'explorer', vscode.ConfigurationTarget.Global);

// Update resource configuration
await vscode.workspace.getConfiguration('conf.resource')
  .update('insertEmptyLastLine', { [filePath]: true }, vscode.ConfigurationTarget.Global);
Listening to Changes
typescript
vscode.workspace.onDidChangeConfiguration(event => {
  if (event.affectsConfiguration('conf.view.showOnWindowOpen')) {
    // React to configuration changes
  }
});
🛠️ Configuration Scopes Explained
Window-Scoped
Applies to entire VS Code instance

Stored in User/Workspace settings

Example: Which view to show on startup

Resource-Scoped
Applies to specific files/folders

Uses file paths in configuration

Example: File-specific formatting rules

Language-Overridable
Can be customized per programming language

Example: Show file size for JavaScript files only

❓ Troubleshooting
Extension not loading? Check Debug Console (View > Debug Console)

Settings not appearing? Reload window (Ctrl+Shift+P > "Developer: Reload Window")

Changes not detected? Ensure you're editing the correct settings scope

Command not found? Make sure extension is properly installed and activated

📚 Learn More
VS Code Extension API

Configuration Reference

Other Extension Samples

Detailed Testing Scenarios
Empty Workspace
Window Config: Set in User Settings only

Resource Config: Requires absolute file paths

Language Config: Applies globally

Folder Workspace
Window Config: Can set in User or Workspace Settings

Resource Config: Works with files in the opened folder

Language Config: Can be set at workspace level

Multiroot Workspace
Window Config: Cannot be set per folder

Resource Config: Can target specific workspace folders

Language Config: Can be configured per workspace folder