# Cat Customs - Custom Editor API Samples

Demonstrates VS Code's [custom editor API](TODO) using two custom editors:

- Cat Scratch — A text based custom editor for `.cscratch` files (which are just json files)
- Paw Draw - A binary custom editor for `.pawdraw` files (which are just jpeg files with a different file extension)

## VS Code API

### `vscode` module

- [`window.registerCustomEditorProvider`](https://code.visualstudio.com/api/references/vscode-api#window.registerCustomEditorProvider)
- [`CustomTextEditor`](https://code.visualstudio.com/api/references/vscode-api#CustomTextEditor)
- [`CustomEditor`](https://code.visualstudio.com/api/references/vscode-api#CustomEditor)

## Running the example

- Open this example in VS Code 1.44+
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging

Open the example files from the `exampleFiles` directory.