# Sample Guideline

Each sample should have the following components and structure, so that users could have a smooth experience when playing with different samples.
The quickest way is to start your project by copying hellocode-sample.

## 1: Sample Listing

- 1.1: Each sample should add itself to the sample listing at `.scripts/samples.js`. This file will be used for generating tables in the README and on the [Extension Guides / Overview](https://vscode-ext-docs.azurewebsites.net/api/extension-guides/overview) topic of the website.
- 1.2: Each sample should list the API / Contribution that it means to illustrate.

## 2: README

- 2.1: Each README should start with a short sentence / paragraph that describes what the extensions is and what it is meant to illustrate.
- 2.2: If the sample has a corresponding guide, it should link to the guide.
- 2.3: If the illustrated functionality is visual, a gif/image should follow the explanation. (File should be demo.png/gif/jpg. Use Dark+ theme)
- 2.4: A `VS Code API` section listing the illustrated API, Contribution Points and Activation Events.
- 2.5: A `Running the Sample` section should describe the actions to run the sample.

## 3: .vscode

- 3.1: launch.json: use 0.2.0 version.
- 3.2: extensions.json: use `eg2.tslint` and `esbenp.prettier-vscode`.
- 3.3: settings.json: use `"editor.insertSpaces": false`. This ensure when user opens the subfolder, tab indentation is enforced.

## 4: Lockfile

- 4.1: Use `npm`'s `package-lock.json` instead of `yarn.lock`.

## 5: Formatter and Linter

Only deviate from the standard setting if your sample needs to.

- 5.1: Include a `.prettier.json` following https://github.com/Microsoft/vscode-extension-samples/blob/ext-docs/hellocode-sample/.prettierrc.json.
- 5.2: Include a `tslint.json` following https://github.com/Microsoft/vscode-extension-samples/blob/ext-docs/hellocode-sample/tslint.json.
- 5.3: Include a `tsconfig.json` following https://github.com/Microsoft/vscode-extension-samples/blob/ext-docs/hellocode-sample/tsconfig.json.
- 5.4: Your source code should be formatted using the formatter and contain no TSLint/TS errors.

## 6: Tests

- 6.1: If your extension does not have meaningful tests, remove the `src/test` folder.
- 6.2: If your extension can be meaningfully tested, include a sample test. If you have an associated guide, explain the test in the guide.