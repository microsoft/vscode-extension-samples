# User Profile Sample - Three Variations

This sample demonstrates **three different variations** of implementing user profile management in a VS Code extension. Each variation shows a different approach to storing and retrieving user data.

## The Three Variations

### Variation 1: In-Memory Storage
**Simplest approach** - Data exists only during the extension's lifetime.

**Characteristics:**
- ✅ Fast and simple
- ❌ Data is lost when VS Code restarts
- ❌ Not suitable for persistent data

**Use case:** Temporary session data, cache

**Commands:**
- `User Profile: Set Profile (Variation 1 - In-Memory)` - Set user profile
- `User Profile: Show Profile (Variation 1 - In-Memory)` - Display current profile

### Variation 2: Workspace State Storage
**Workspace-specific persistence** - Data persists per workspace.

**Characteristics:**
- ✅ Survives VS Code restarts
- ✅ Different workspaces can have different profiles
- ❌ Data is not shared across workspaces

**Use case:** Project-specific user preferences, workspace-specific settings

**Commands:**
- `User Profile: Set Profile (Variation 2 - Workspace State)` - Set workspace profile
- `User Profile: Show Profile (Variation 2 - Workspace State)` - Display workspace profile

### Variation 3: Global State with Settings Integration
**Global persistence with defaults** - Data persists globally across all workspaces.

**Characteristics:**
- ✅ Survives VS Code restarts
- ✅ Shared across all workspaces
- ✅ Integrates with VS Code settings for default values
- ✅ Most feature-rich

**Use case:** User identity, global preferences, account information

**Commands:**
- `User Profile: Set Profile (Variation 3 - Global State)` - Set global profile
- `User Profile: Show Profile (Variation 3 - Global State)` - Display global profile

**Settings:**
- `userProfile.defaultName` - Default user name
- `userProfile.defaultEmail` - Default user email

## How to Run

1. Run `npm install` in terminal to install dependencies
2. Run the `Run Extension` target in the Debug View (or press `F5`)
3. In the new VS Code window, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
4. Try any of the six commands to see each variation in action

## Comparison Table

| Feature | Variation 1 | Variation 2 | Variation 3 |
|---------|-------------|-------------|-------------|
| **Storage Type** | In-Memory | Workspace State | Global State |
| **Persists on Restart** | ❌ No | ✅ Yes | ✅ Yes |
| **Shared Across Workspaces** | N/A | ❌ No | ✅ Yes |
| **Settings Integration** | ❌ No | ❌ No | ✅ Yes |
| **Complexity** | Low | Medium | High |
| **Best For** | Session data | Workspace preferences | User identity |

## VS Code API Used

### `vscode` module
- [`ExtensionContext.workspaceState`](https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.workspaceState) - Workspace-specific storage
- [`ExtensionContext.globalState`](https://code.visualstudio.com/api/references/vscode-api#ExtensionContext.globalState) - Global storage
- [`Memento`](https://code.visualstudio.com/api/references/vscode-api#Memento) - Key-value storage interface
- [`workspace.getConfiguration`](https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration) - Access extension settings
- [`window.showInputBox`](https://code.visualstudio.com/api/references/vscode-api#window.showInputBox) - User input
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage) - Display messages

### Contribution Points
- [`contributes.commands`](https://code.visualstudio.com/api/references/contribution-points#contributes.commands) - Register commands
- [`contributes.configuration`](https://code.visualstudio.com/api/references/contribution-points#contributes.configuration) - Define settings

## Key Learning Points

1. **In-Memory vs Persistent Storage**: Understand when to use temporary vs persistent data storage
2. **Workspace vs Global State**: Learn the difference between workspace-specific and global data
3. **Settings Integration**: See how to provide default values through VS Code settings
4. **Memento API**: Master the key-value storage interface for VS Code extensions

## Implementation Details

Each variation is implemented as a separate class:
- `InMemoryProfileManager` - Simple in-memory storage
- `WorkspaceProfileManager` - Uses `workspaceState` Memento
- `GlobalProfileManager` - Uses `globalState` Memento with settings fallback

All three variations implement the same interface for setting and getting user profiles, making it easy to compare their different storage mechanisms.
