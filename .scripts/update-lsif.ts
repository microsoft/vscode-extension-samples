import * as fs from 'fs/promises';
import * as path from 'path';
import { samples } from './samples';

const root = path.join(__dirname, '..');

async function main() {
	const references = [];
	for (const sample of samples) {
		try {
			const stat = await fs.stat(path.join(root, sample.path, 'tsconfig.json'));
			if (stat.isFile()) {
				references.push(`./${sample.path}/tsconfig.json`);
			}
		} catch (error) {
			// Ignore error of stat call.
		}
	}
	const tsconfig = {
		compilerOptions: {
		},
		files: [
		],
		references: references.map(reference => { return { path: reference } })
	}
	await fs.writeFile(path.join(root, 'tsconfig.lsif.json'), JSON.stringify(tsconfig, undefined, '\t'), { encoding: 'utf8' });
}

if (require.main === module) {
	main().catch(console.error);
}