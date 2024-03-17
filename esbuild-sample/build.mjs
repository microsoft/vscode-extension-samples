/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import esbuild from 'esbuild';
import console from 'node:console';
import process from 'node:process';

const production = process.argv[2] === '--production';
const watch = process.argv[2] === '--watch';
let desktopContext, browserContext;

// This is the base config that will be used by both web and desktop versions of the extension
const baseConfig = {
	entryPoints: ['./src/extension.ts'], // the entry point of this extension, 📖 -> https://esbuild.github.io/api/#entry-points
	bundle: true,
	external: ['vscode'], // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be packaged, 📖 -> https://esbuild.github.io/api/#external
	sourcemap: !production,
	minify: production,
	format: 'cjs',
	target: 'ES2022', // VS Code 1.82 onwards will support ES2022, this also overrides tsconfig.json.
};

// Build both desktop and web versions of the extension in parallel
// By using .context() instead of .build() we can rebuild in watch mode when the source changes
try {
	[desktopContext, browserContext] = await Promise.all([
		// https://esbuild.github.io/getting-started/#bundling-for-node
		esbuild.context({
			...baseConfig,
			outfile: './dist/extension.js',
			platform: 'node',
		}),
		// If you're building for the browser, you'll need to generate a second bundle which is suitable
		// https://esbuild.github.io/getting-started/#bundling-for-the-browser
		esbuild.context({
			...baseConfig,
			outfile: './dist/browser.js',
			platform: 'browser',
		}),
	]);
} catch (e) {
	console.error(e);
	process.exit(1);
}

if (watch) {
	await desktopContext.watch();
	await browserContext.watch();
} else {
	desktopContext.rebuild();
	browserContext.rebuild();

	desktopContext.dispose();
	browserContext.dispose();
}
