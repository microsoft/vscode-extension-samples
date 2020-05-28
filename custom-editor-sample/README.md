# Cat Customs - Custom Editor API Samples

![Paw draw editor ](documentation/example.png)

Demonstrates VS Code's [custom editor API](https://code.visualstudio.com/api/extension-guides/custom-editors) using two custom editors:

- Cat Scratch — Uses the finalized custom text editor api to provide a custom editor for `.cscratch` files (which are just json files)
- Paw Draw - Uses the proposed binary custom editor api to provide a custom editor for `.pawdraw` files (which are just jpeg files with a different file extension). **Note that this sample requires VS Code 1.45+**

## VS Code API

### `vscode` module

- [`window.registerCustomEditorProvider`](https://code.visualstudio.com/api/references/vscode-api#window.registerCustomEditorProvider)
- [`CustomTextEditor`](https://code.visualstudio.com/api/references/vscode-api#CustomTextEditor)
- [`CustomEditor`](https://code.visualstudio.com/api/references/vscode-api#CustomEditor)

## Running the example

- Open this example in VS Code 1.44+ (note that the custom binary editor requires VS Code 1.45+)
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging

Open the example files from the `exampleFiles` directory.