// @ts-check
/**
 * Update a dependency to a version in all relevant samples
 */
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { samples } = require('./samples');

function setVersion(
	/** @type {string} */ dependencyName,
	/** @type {string} */ version,
	/** @type {import('./samples').Sample} */ sample
) {
	const packageJsonPath = path.join(sample.path, 'package.json');
	const packageJsonContents = fs.readFileSync(packageJsonPath).toString();
	const packageJson = JSON.parse(packageJsonContents);

	let changed = false;
	if (packageJson.dependencies?.[dependencyName]) {
		packageJson.dependencies[dependencyName] = version;
		changed = true;
	}
	if (packageJson.devDependencies?.[dependencyName]) {
		packageJson.devDependencies[dependencyName] = version;
		changed = true;
	}

	if (!changed) {
		return;
	}

	console.log(`Updated ${dependencyName} in ${packageJson.name}`);
	const space = packageJsonContents.includes('\t') ? '\t' : '  ';
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, space) + '\n');

	if (fs.existsSync(path.join(sample.path, 'package-lock.json'))) {
		console.log(`  npm install in ${packageJson.name}`);
		child_process.execSync(`npm install`, {
			cwd: sample.path,
			stdio: 'inherit'
		});
	}
}

const [, , dependency, version] = process.argv;
if (!dependency || !version) {
	console.log(`Usage: ${process.argv[0]} ${process.argv[1]} <depndency> <version>`);
}
for (const sample of samples) {
	setVersion(dependency, version, sample);
}
