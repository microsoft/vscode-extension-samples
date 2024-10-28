# esbuild & Extensions

This is an extension that uses [esbuild](https://esbuild.github.io/) to bundle and minify its sources. Using a bundler will help to reduce the install- and startup-time of large extensions because instead of hundreds of files, a single file is produced.

## Configuration

The build script does the following:
- It creates a build context with esbuild. The context is configured to:
  - Bundle the code at [`src/extension.ts`](./src/extension.ts) into a single file `dist/extension.js`.
  - Minify the code if the `--production` flag was passed.
  - Generate source maps unless the `--production` flag was passed.
  - Exclude the 'vscode' module from the bundle (since it's provided by the VS Code runtime).
- Use the esbuildProblemMatcherPlugin plugin to report errors that prevented the bundler to complete. This plugin emits the errors in a format that is detected by the `esbuild` problem matcher with also needs to be installed as an extension.
- If the `--watch` flag was passed, it starts watching the source files for changes and rebuilds the bundle whenever a change is detected.

esbuild can work directly with TypeScript files. However, esbuild simply strips off all type declarations without doing any type checks.
Only syntax error are reported and can cause esbuild to fail.

For that reason, we separatly run the TypeScript compiler (`tsc`) to check the types, but without emmiting any code (flag `--noEmit`).

## Scripts

The `scripts`-section of the [`package.json`](./package.json)-file has entries for compiling and watching and creating a production target. esbuild in ran to produce a minified output file and `tsc`, the TypeScript compiler, is used for type checking.

```json
"scripts": {
    "compile": "npm run check-types && node esbuild.js",
    "check-types": "tsc --noEmit",
    "watch": "npm-run-all -p watch:*",
    "watch:esbuild": "node esbuild.js --watch",
    "watch:tsc": "tsc --noEmit --watch --project tsconfig.json",
    "vscode:prepublish": "npm run package",
    "package": "npm run check-types && node esbuild.js --production"
}
```


### Launching and debugging

To run the extension use F5, as always. The launch configuration in [`.vscode/extensions.json`](./.vscode/extensions.json) will use build tasks defined in [`.vscode/launch.json`](./.vscode/launch.json) that will create a separate terminal for the `esbuild` and `tsc` watch tasks.

The `esbuild` task relies on esbuild problem matcher that is defined by the extension [`connor4312.esbuild-problem-matchers`](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers). This extension needs to be installed for the launch to complete.

To not forget that, we add a [`.vscode/extension.json`](./.vscode/extension.json) file to the workspace that recommends [`connor4312.esbuild-problem-matchers`](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers)






