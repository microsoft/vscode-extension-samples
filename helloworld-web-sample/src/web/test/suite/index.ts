// imports mocha for the browser, defining the `mocha` global.
require('mocha/mocha');
import * as vscode from 'vscode';

export async function run(): Promise<void> {
	await vscode.extensions.getExtension('vscode-samples.helloworld-web-sample')?.activate();
	return new Promise((c, e) => {
		mocha.setup({
			ui: 'tdd',
			reporter: undefined
		});

		// bundles all files in the current directory matching `*.test`
		const importAll = (r: __WebpackModuleApi.RequireContext) => r.keys().forEach(r);
		importAll(require.context('.', true, /\.test$/));

		try {
			// Run the mocha test
			mocha.run(failures => {
				if (failures > 0) {
					e(new Error(`${failures} tests failed.`));
				} else {
					c();
				}
			});
		} catch (err) {
			console.error(err);
			e(err);
		}
	});
}
