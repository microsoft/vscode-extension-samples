import * as path from 'path';
import * as cp from 'child_process';

export function run(testsRoot: string, cb: (error: any) => void): void {
	const cmd = cp.spawnSync('npx', ['mocha'], { cwd: path.resolve(__dirname, '../../') })

	console.log(cmd.stdout.toString())
	if (cmd.status !== 0) {
		cb(new Error('Mocha test failed'))
	} else {
		cb(null);
	}
}