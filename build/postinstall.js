/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const cp = require('child_process');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function npmInstall(location) {
	const result = cp.spawnSync(npm, ['install'], {
		cwd: location ,
		stdio: 'inherit'
	});

	if (result.error || result.status !== 0) {
		process.exit(1);
	}
}

const samples = [
	'contentprovider-sample',
	'decorator-sample',
	'languageprovider-sample',
	'vim-sample',
	'terminal-example',
	'tree-explorer-sample'
];

samples.forEach(npmInstall);