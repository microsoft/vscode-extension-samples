/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function npmInstall(location) {
	const result = cp.spawnSync(npm, ['install'], {
		cwd: location,
		stdio: 'inherit'
	});

	if (result.error || result.status !== 0) {
		process.exit(1);
	}
}


const cwd = process.cwd();
for (const element of fs.readdirSync(cwd)) {
	const fullpath = path.join(cwd, element, 'package.json');
	if (fs.existsSync(fullpath)) {
		npmInstall(path.join(cwd, element));
	}
}
