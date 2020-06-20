# Parcel & Extensions

This is an extension that uses [parcel](https://github.com/parcel-bundler/parcel) to bundle and minify its sources. Using parcel will help to reduce the install- and startup-time of large extensions because instead of hundreds of files, a single file is produced.

## Configuration

Parcel is configured in the [`package.json`](./package.json)-file. Refer to the parcel documentation for mote information: [https://github.com/parcel-bundler/parcel](https://github.com/parcel-bundler/parcel). In short, the config-files defines the entry point of the extension, to use TypeScript, to produce a commonjs-module, and what modules not to bundle.

## Scripts

The `scripts`-section of the [`package.json`](./package.json)-file has entries for parcel. Those compile TypeScript and produce the bundle as well as producing a minified production build.

