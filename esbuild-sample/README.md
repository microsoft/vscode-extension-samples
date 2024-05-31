# ESBuild & Extensions

This is an extension that uses [https://esbuild.github.io/]() to bundle and minify its sources. Using ESBuild will help to reduce the install- and startup-time of large extensions because instead of hundreds of files, a single file is produced. It is also much faster than the [Webpack](https://github.com/microsoft/vscode-extension-samples/tree/main/webpack-sample) alternative and should be preferred.

## Configuration

ESBuild is configured in the [`build.mjs`](./build.mjs)-file. Find annotation inside the file itself or refer to the excellent ESBuild documentation: [https://esbuild.github.io/api/](). In short, the config-files defines the entry point of the extension, to use TypeScript, to produce a commonjs-module, and what modules not to bundle.

## Web Extension Support

This ESBuild config is already setup to support both Desktop and Web extensions, it will build both versions in parallel. The package.json then has a "browser" and "main" entry to point to the correct bundles once built.

## Scripts

The `scripts`-section of the [`package.json`](./package.json)-file has entries for ESBuild. Those compile TypeScript and produce the bundle as well as producing a minified production build.
