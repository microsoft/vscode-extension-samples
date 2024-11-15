import * as fs from 'fs';
import * as path from 'path';
import { lspSamples, samples } from './samples';

const root = path.join(__dirname, '..');
console.log(root);

/**
 * Validates that all samples are correctly listed in `.scripts/samples.js`.
 */
function validateSamplesAreListed() {
	const allSamples = samples.concat(lspSamples);

	const samplesByPath = new Map();
	for (const sample of allSamples) {
		samplesByPath.set(sample.path, sample);
	}

	for (const fileName of fs.readdirSync(root)) {
		if (fileName === 'node_modules'
			|| fileName.startsWith('.')
			|| !fs.lstatSync(path.join(root, fileName)).isDirectory()
		) {
			continue;
		}

		const sampleEntry = samplesByPath.get(fileName);
		if (!sampleEntry) {
			throw new Error(`Sample '${fileName}' is not listed in samples.js`);
		}
	}
}

/**
 * Validates that all samples are correctly listed in `.scripts/samples.js`.
 */
function validateReadmeUpdated() {
	const { updateReadme } = require('./update-readme');
	if (updateReadme(true)) {
		throw new Error(`Readme not updated. Run 'node .scripts/update-readme.js' to update the readme.`);
	}
}

validateSamplesAreListed();
validateReadmeUpdated();