import * as path from 'path';
import * as Mocha from 'mocha';

export function run(testsRoot: string, cb: (error: any, failures?: number) => void): void {
	let mocha = new Mocha({
		ui: 'tdd',
		reporter: 'nyan'
	});
	mocha.useColors(true)

	const files = [path.resolve(__dirname, '../../out/test/suite/extension.test.js')];

	files.forEach(f => mocha.addFile(f));

	try {
		let stdOutMessages = '';

		const processStdoutWrite = process.stdout.write;

		process.stdout.write = (message: string | Buffer) => {
			if (typeof message !== 'string') {
				message = message.toString();
			}
			stdOutMessages += message;

			return true;
		};

		mocha.run(failures => {
			cb(null, failures);
		}).on('test end', () => {
			process.stdout.write = processStdoutWrite;
			console.log('\n' + stdOutMessages + '\n');
		})
	} catch (err) {
		cb(err);
	}
}
