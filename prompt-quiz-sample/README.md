# Prompt Quiz Sample

This is a sample extension that demonstrates how to create an interactive quiz using VS Code's QuickPick and InputBox APIs. The quiz evaluates user responses and provides immediate feedback, utilizing JSON data to populate questions with both multiple-choice and text input formats.

It serves as both a personal learning tool and a foundation for a production-quality extension. The modular JSON-based structure makes it easy to create custom quiz modules for different topics, enabling community contributions of specialized quiz content.

## Instructions

- Open the command palette `Ctrl + Shift + P`.
- Run "`quiz`".
- Answer questions using either multiple-choice selections or text input.
- Type "`hint`" in text input questions to get a helpful hint.
- Complete all 15 questions to see your final score.

### Demo

![Take quiz](/prompt-quiz-sample/demo.gif)

## How it works

- The extension uses both [`QuickPick`](https://code.visualstudio.com/api/references/vscode-api#QuickPick) and [`InputBox`](https://code.visualstudio.com/api/references/vscode-api#InputBox) APIs to show different UI types for user input.
- Questions are loaded from `src/data.json` which contains quiz data with categories, hints, and multiple-choice settings.
- Multiple-choice questions use `window.showQuickPick` with shuffled answer options.
- Text input questions use `window.showInputBox` with flexible answer matching (case-insensitive, supports variations).
- Registers a command via `package.json` that triggers the quiz experience.
- Provides instant feedback with ✓ for correct answers and ✗ for incorrect ones using `window.showInformationMessage()`.

## Features

- **15 Questions**: Covering VS Code extension development fundamentals.
- **Mixed Question Types**: 5 multiple-choice questions and 10 text input questions.
- **Flexible Answers**: Text input questions accept multiple valid answer formats.
- **Hint System**: Type "hint" during text input questions to receive guidance.
- **Category Organization**: Questions organized by topics like Extension Anatomy, VS Code API, and Development Setup.
  - **Special "all" Category**: Questions with category "all" appear in every category filter.
- **Progress Tracking**: Shows current question number and category.
- **Final Score**: Displays percentage and total correct at completion.
- **Quiz Management Tasks**: Create new quizzes and load saved quizzes using VS Code tasks.

## Quiz Management with Tasks

This extension implements a [Task Provider](https://code.visualstudio.com/api/extension-guides/task-provider) that allows you to create and manage multiple quizzes.

### Available Tasks

Run tasks via `Terminal > Run Task...` or `Ctrl+Shift+P` → "Tasks: Run Task"

#### Make Quiz

Creates a new quiz interactively:

1. Saves the current quiz to `src/quiz/` folder
2. Prompts for a new quiz title
3. Guides you through adding questions:
   - Question text
   - Multiple choice or text input
   - Correct and incorrect answers
   - Category (use "all" for questions that appear in every category)
   - Hints
4. Saves the new quiz as `src/data.json`

**Example workflow:**

```text
Terminal > Run Task... > quiz: Make Quiz
```

#### Load Quiz

Loads a previously saved quiz:

1. Saves the current quiz to `src/quiz/` folder
2. Shows a list of available saved quizzes
3. Loads the selected quiz as the active `src/data.json`

**Example workflow:**

```text
Terminal > Run Task... > quiz: Load Quiz
```

### Quiz File Structure

```text
src/
├── data.json          # Active quiz
└── quiz/              # Saved quizzes
    ├── javascript.json
    ├── typescript.json
    └── vs-code-extension.json
```

## VS Code API

### `vscode` module

- [`QuickPick`](https://code.visualstudio.com/api/references/vscode-api#QuickPick)
- [`InputBox`](https://code.visualstudio.com/api/references/vscode-api#InputBox)
- [`window.createQuickPick`](https://code.visualstudio.com/api/references/vscode-api#window.createQuickPick)
- [`window.showQuickPick`](https://code.visualstudio.com/api/references/vscode-api#window.showQuickPick)
- [`window.createInputBox`](https://code.visualstudio.com/api/references/vscode-api#window.createInputBox)
- [`window.showInputBox`](https://code.visualstudio.com/api/references/vscode-api#window.showInputBox)
- [`window.showInformationMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)
- [`window.showWarningMessage`](https://code.visualstudio.com/api/references/vscode-api#window.showWarningMessage)
- [`workspace.getConfiguration`](https://code.visualstudio.com/api/references/vscode-api#workspace.getConfiguration)
- [`commands.registerCommand`](https://code.visualstudio.com/api/references/vscode-api#commands.registerCommand)
- [`tasks.registerTaskProvider`](https://code.visualstudio.com/api/references/vscode-api#tasks.registerTaskProvider)
- [`Task`](https://code.visualstudio.com/api/references/vscode-api#Task)
- [`CustomExecution`](https://code.visualstudio.com/api/references/vscode-api#CustomExecution)
- [`Pseudoterminal`](https://code.visualstudio.com/api/references/vscode-api#Pseudoterminal)

### Extension Guides

This extension demonstrates concepts from the VS Code [Task Provider Guide](https://code.visualstudio.com/api/extension-guides/task-provider), implementing custom task execution with interactive prompts for quiz creation and management.

## Data Structure

The quiz data in `src/data.json` follows this structure:

```json
{
  "quiz": [
    {
      "id": 1,
      "question": "Question text here?",
      "answer": ["correct answer", "variation 1", "variation 2"],
      "hints": ["Hint 1", "Hint 2"],
      "category": "Category Name",
      "multipleChoice": false
    }
  ]
}
```

- **multipleChoice: true**: First answer is correct, array contains several options (shown shuffled)
- **multipleChoice: false**: Array contains acceptable answer variations (exact/partial match)

## How to run locally

- `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
  - Start a task `npm: watch` to compile the code
  - Run the extension in a new VS Code window
- Press `Ctrl+Shift+P` and type "Start VS Code Extension Quiz" to launch the quiz

## Configuration

To customize type `Ctrl + ,` to open settings, then input `prompt-quiz` in the search. The extension provides several settings to customize your quiz experience:

### `prompt-quiz-sample.randomize`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: When enabled, questions are presented in random order, ignoring the `order` setting.

**Example**:

```json
"prompt-quiz-sample.randomize": true
```

### `prompt-quiz-sample.order`

- **Type**: `string`
- **Default**: `"order"`
- **Options**: `"order"` | `"reverse"`
- **Description**: Controls the order in which questions are presented. This setting is ignored when `randomize` is enabled.
  - `"order"`: Present questions in their original order (1, 2, 3...)
  - `"reverse"`: Present questions in reverse order (last to first)

**Example**:

```json
"prompt-quiz-sample.order": "reverse"
```

### `prompt-quiz-sample.range`

- **Type**: `string`
- **Default**: `"0"`
- **Description**: Specify which questions to include in the quiz. The range is applied after ordering/reversing but before randomization.

**Supported formats**:

- `"0"`: Include all questions (default)
- `"5"`: Include the first 5 questions (relative to current order)
- `"3-6"`: Include questions 3 through 6 (relative to current order)

**Examples**:

```json
// All questions
"prompt-quiz-sample.range": "0"

// First 5 questions
"prompt-quiz-sample.range": "5"

// Questions 3 through 6
"prompt-quiz-sample.range": "3-6"

// With reverse order, "5" would give you the last 5 questions
"prompt-quiz-sample.order": "reverse",
"prompt-quiz-sample.range": "5"
```

### `prompt-quiz-sample.startPrompt`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show a confirmation prompt before starting the quiz. When disabled, the quiz starts immediately when the command is invoked.

**Example**:

```json
// Skip the initial confirmation and start quiz immediately
"prompt-quiz-sample.startPrompt": false
```

### `prompt-quiz-sample.category`

- **Type**: `string`
- **Default**: `"All Categories"`
- **Options**: `"All Categories"` | `"Extension Anatomy"` | `"Extension Manifest"` | `"Contribution Points"` | `"VS Code API"` | `"Extension Concepts"` | `"Activation Events"` | `"Development Setup"` | `"VS Code Basics"` | `"Publishing"` | `"Debugging"`
- **Description**: Filter quiz questions by category. Select a specific category to focus on particular topics, or choose "All Categories" to include all questions. Category filtering is applied before ordering and range settings.

**Available Categories**:

- **All Categories**: Include questions from all categories (default)
- **Extension Anatomy**: Questions about extension structure and entry points
- **Extension Manifest**: Questions about package.json and extension configuration
- **Contribution Points**: Questions about contribution points in VS Code extensions
- **VS Code API**: Questions about the VS Code Extension API
- **Extension Concepts**: Questions about core extension development concepts
- **Activation Events**: Questions about extension activation
- **Development Setup**: Questions about development tools and setup
- **VS Code Basics**: Questions about basic VS Code usage
- **Publishing**: Questions about publishing extensions to the marketplace
- **Debugging**: Questions about debugging extensions

**Example**:

```json
// Focus on VS Code API questions only
"prompt-quiz-sample.category": "VS Code API"
```

### Configuration Examples

**Study specific topics**:

```json
{
  "prompt-quiz-sample.category": "Extension Anatomy",
  "prompt-quiz-sample.order": "order",
  "prompt-quiz-sample.range": "0"
}
```

**Practice with randomized API questions**:

```json
{
  "prompt-quiz-sample.category": "VS Code API",
  "prompt-quiz-sample.randomize": true,
  "prompt-quiz-sample.range": "0"
}
```

**Review manifest questions in reverse**:

```json
{
  "prompt-quiz-sample.category": "Extension Manifest",
  "prompt-quiz-sample.order": "reverse",
  "prompt-quiz-sample.range": "0"
}
```

**Quick 5-question practice on development setup**:

```json
{
  "prompt-quiz-sample.category": "Development Setup",
  "prompt-quiz-sample.randomize": true,
  "prompt-quiz-sample.range": "5",
  "prompt-quiz-sample.startPrompt": false
}
```

## Customization

To create your own quiz:

1. Edit `src/data.json` with your questions
2. Set `multipleChoice: true` for QuickPick questions (5 answer options)
3. Set `multipleChoice: false` for InputBox questions (flexible text matching)
4. Add hints to help users learn
5. Organize questions by category for better learning flow
6. Run `npm run sync-categories` to update the category dropdown in settings (happens automatically during compile)

**Note**: When you add or modify categories in `data.json`, the `sync-categories` script automatically updates the category dropdown options in VS Code settings. This script runs automatically during compilation, or you can run it manually with `npm run sync-categories`.
