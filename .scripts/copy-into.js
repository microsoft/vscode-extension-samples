// @ts-check
/**
 * Copies a file into every sample, overwriting the existing file if it exists.
 */
const fs = require('fs');
const path = require('path');
const { samples, lspSamples } = require('./samples')

const filePath = process.argv[2];
if (!filePath) {
	console.error('Please provide a file path as the argument.');
	process.exit(1);
}

const fileName = path.basename(filePath);
const fileContent = fs.readFileSync(filePath);

for (const sample of [...samples, ...lspSamples]) {
	const destinationPath = path.join(sample.path, fileName);
	fs.writeFileSync(destinationPath, fileContent);
	console.log(`Copied ${fileName} to ${sample.path}`);
}