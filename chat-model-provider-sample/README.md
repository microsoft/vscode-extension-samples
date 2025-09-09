# Chat Model Provider Sample

This VS Code extension demonstrates how to implement a custom chat model provider using the Language Model (LM) API. It serves as a sample implementation for developers who want to integrate their own AI models with VS Code's chat functionality.

## Features

This extension provides:

- **Custom Chat Model Provider**: Implements the `LanguageModelChatProvider2` interface to register custom AI models
- **Multiple Model Support**: Demonstrates how to provide multiple models from a single provider
- **Sample Models**: Includes two example models:
  - **Dog Model**: Responds with dog-themed messages ("Woof!")
  - **Cat Model**: Responds with cat-themed messages ("Meow!")

## Architecture

The extension consists of two main components:

### Extension Activation (`src/extension.ts`)
- Registers the sample chat model provider with VS Code's LM API
- Uses the vendor ID `"sample"` to identify the provider

### Chat Model Provider (`src/provider.ts`)
- Implements `LanguageModelChatProvider2` interface
- Provides model information including capabilities (tool calling, vision support)
- Handles chat requests and returns appropriate responses
- Includes token counting functionality

## Model Capabilities

Each sample model declares the following capabilities:
- **Tool Calling**: ✅ Enabled
- **Vision**: ✅ Enabled
- **Max Input Tokens**: 120,000
- **Max Output Tokens**: 8,192

## Getting Started

### Prerequisites
- VS Code version 1.103.0 or higher
- Node.js and npm installed

### Installation and Development

1. Clone this repository
2. Navigate to the extension directory:
   ```bash
   cd chat-model-provider-sample
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Compile the extension:
   ```bash
   npm run compile
   ```
5. Press `F5` to launch a new Extension Development Host window
6. The extension will be active and ready to provide chat models

### Building and Watching

- **Build once**: `npm run compile`
- **Watch mode**: `npm run watch` (automatically recompiles on file changes)
- **Lint code**: `npm run lint`

## Usage

Once the extension is active:

1. Open VS Code's chat interface
2. Click the model picker and click manage models
3. Select the sample provider
4. Check the models based on what you want in the model picker
5. Send a request to the model

## API Usage

This extension uses the proposed `chatProvider` API. The key components include:

- `vscode.lm.registerChatModelProvider()` - Registers the provider
- `LanguageModelChatProvider2` interface - Defines the provider contract
- `LanguageModelChatInformation` - Describes model capabilities
- `ChatResponseFragment2` - Handles streaming responses

## Customization

To create your own chat model provider:

1. Modify the `SampleChatModelProvider` class in `src/provider.ts`
2. Update the model information in `getChatModelInfo()`
3. Implement your custom logic in `provideLanguageModelChatResponse()`
4. Adjust the vendor ID and model IDs as needed
5. Update the `package.json` with your extension details


## Related

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Language Model API Documentation](https://code.visualstudio.com/api/extension-guides/chat)
- [VS Code Extension Samples](https://github.com/Microsoft/vscode-extension-samples)