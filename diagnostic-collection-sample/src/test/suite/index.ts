import * as fs from 'fs';
import * as path from 'path';
import Mocha from 'mocha';

export function run(): Promise<void> {
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
	});

	const testsRoot = path.resolve(__dirname, '.');
	return new Promise((resolve, reject) => {
		fs.readdir(testsRoot, (error, files) => {
			if (error) {
				reject(error);
				return;
			}

			files
				.filter(file => file.endsWith('.test.js'))
				.forEach(file => mocha.addFile(path.resolve(testsRoot, file)));

			mocha.run(failures => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`));
				} else {
					resolve();
				}
			});
		});
	});
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});