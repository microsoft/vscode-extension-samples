# Sample Guideline

Each sample should have the following components and structure, so that users could have a smooth experience when playing with different samples.
The quickest way is to start your project by copying [.base-sample](https://github.com/microsoft/vscode-extension-samples/tree/main/.base-sample).

## 1: Sample Listing

- 1.1: Each sample should add itself to the sample listing at `.scripts/samples.js`. This file will be used for generating tables in the README and on the [Extension Guides / Overview](https://code.visualstudio.com/api/extension-guides/overview) topic of the website.
- 1.2: Each sample should list the API / Contribution that it means to illustrate.

## 2: README

- 2.1: Each README should start with a short sentence / paragraph that describes what the extensions is and what it is meant to illustrate.
- 2.2: If the sample has a corresponding guide, it should link to the guide.
- 2.3: If the illustrated functionality is visual, a gif/image should follow the explanation. (File should be demo.png/gif/jpg. Use default Dark+/Light+ theme)
- 2.4: A `VS Code API` section listing the illustrated API, Contribution Points and Activation Events.
- 2.5: A `Running the Sample` section should describe the actions to run the sample.

## 3: .vscode

- 3.1: `launch.json`: use 0.2.0 version.
- 3.2: `settings.json`: use `"editor.insertSpaces": false`. This ensures when user opens the subfolder, tab indentation is enforced.

## 4: Dependencies

- 4.1: Use `npm`'s `package-lock.json` instead of `yarn.lock`.
- 4.2: `devDependencies` should include `@types/node`, `@types/vscode`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint`, and `typescript`.

## 5: Formatter and Linter

Only deviate from the standard setting if your sample needs to.

- 5.1: Include a `.eslintrc.js` following <https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-sample/.eslintrc.js>.
- 5.2: Include a `tsconfig.json` following <https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-sample/tsconfig.json>.
- 5.3: Your source code should be formatted either using [tsfmt](https://github.com/vvakame/typescript-formatter) or the editor's TS formatter and contain no ESLint/TS errors.

## 6: Tests

- 6.1: If your extension does not have meaningful tests, remove the `src/test` folder.
- 6.2: If your extension can be meaningfully tested, include a sample test. If you have an associated guide, explain the test in the guide.
