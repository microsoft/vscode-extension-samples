const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function npmInstall(location) {
	const result = cp.spawnSync(npm, ['install', '-D', 'tslint'], {
		cwd: location,
		stdio: 'inherit'
	});

	if (result.error || result.status !== 0) {
		process.exit(1);
	}
}


const cwd = process.cwd();
for (const element of fs.readdirSync(cwd)) {
	if (element[0] !== '.' && element.endsWith('-sample')) {
		const fullpath = path.join(cwd, element, 'package.json');
		if (fs.existsSync(fullpath)) {
			npmInstall(path.join(cwd, element));
		}
	}
}