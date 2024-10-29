/**
 * Try running an npm script for each of the samples.
 */
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { lspSamples, Sample, samples } from './samples';

function tryRun(scriptName: string, sample: Sample) {
	const packageJsonPath = path.join(sample.path, 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
	if (Object.keys(packageJson['scripts'] || {}).includes(scriptName)) {
		console.log(`=== Running ${scriptName} on ${path.basename(sample.path)} ===`)
		child_process.execSync(`npm run ${scriptName}`, {
			cwd: sample.path,
			stdio: 'inherit'
		});
	}
}

if (require.main === module) {
	const scriptName = process.argv[2];
	for (const sample of [...samples, ...lspSamples]) {
		tryRun(scriptName, sample);
	}
}