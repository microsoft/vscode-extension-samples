/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
//@ts-check
const esbuild = require('esbuild');

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

/** @type BuildOptions */
const sharedWebOptions = {
	bundle: true,
	external: ['vscode'],
	target: 'es2020',
	platform: 'browser',
	sourcemap: true,
};

/** @type BuildOptions */
const webOptions = {
	entryPoints: ['client/src/extension.ts'],
	outfile: 'client/dist/web/extension.js',
	format: 'cjs',
	...sharedWebOptions,
};

/** @type BuildOptions */
const sharedDesktopOptions = {
	bundle: true,
	external: ['vscode'],
	target: 'es2020',
	platform: 'node',
	sourcemap: true,
};

/** @type BuildOptions */
const desktopOptions = {
	entryPoints: ['client/src/extension.ts'],
	outfile: 'client/dist/desktop/extension.js',
	format: 'cjs',
	...sharedDesktopOptions,
};

function createContexts() {
	return Promise.all([
		esbuild.context(webOptions),
		esbuild.context(desktopOptions),
	]);
}

createContexts().then(contexts => {
	if (process.argv[2] === '--watch') {
		const promises = [];
		for (const context of contexts) {
			promises.push(context.watch());
		}
		return Promise.all(promises).then(() => { return undefined; });
	} else {
		const promises = [];
		for (const context of contexts) {
			promises.push(context.rebuild());
		}
		Promise.all(promises).then(async () => {
			for (const context of contexts) {
				await context.dispose();
			}
		}).then(() => { return undefined; }).catch(console.error);
	}
}).catch(console.error);