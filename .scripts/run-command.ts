// @ts-check
/**
 * Try running install for all the samples
 */
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { lspSamples, Sample, samples } from './samples';

async function tryRunCommand(command: string, sample: Sample) {
	const packageJsonPath = path.join(sample.path, 'package.json');
	if (fs.existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
			if (packageJson['devDependencies'] || packageJson['dependencies']) {
				console.log(`=== Running ${command} on ${path.basename(sample.path)} ===`);
				child_process.execSync(command, {
					cwd: sample.path,
					stdio: 'inherit'
				});
			}
		} catch (e) {
			console.error(e);
		}
	}
}

if (require.main === module) {
	const command = process.argv.slice(2).join(' ');
	for (const sample of [...samples, ...lspSamples]) {
		tryRunCommand(command, sample);
	}
}
