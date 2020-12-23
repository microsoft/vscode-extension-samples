# Rollup & Extensions

This is an extension that uses [https://rollupjs.org/]() to bundle and minify its sources. Using Rollup will help to reduce the install and startup-time of large extensions because instead of hundreds of files, a single file is produced.

Rollup should help export extensions as native ESModules in future.

## Configuration

Rollup is configured in the [`rollup.config.js`](./rollup.config.js)-file. Find annotation inside the file itself or refer to the excellent rollup documentation: [https://rollupjs.org](). In short, the config-files defines the entry point of the extension, to use TypeScript, to produce a commonjs-module, and what modules not to bundle.

## Scripts

The `scripts`-section of the [`package.json`](./package.json)-file has entries for rollup. Those compile TypeScript and produce the bundle as well as producing a minified production build.
