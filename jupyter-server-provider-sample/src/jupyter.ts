import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { promisify } from 'util';

const homeDir = getUserHomeDir();

export async function findLocallyRunningServers(type: 'lab' | 'notebook') {
	const runtimeDir = path.join(getDataDirectory(), 'runtime');
	const files = await promisify(fs.readdir)(runtimeDir);
	const servers: {
		url: string;
		token: string;
		root_dir: string;
		pid: number;
		port: number;
	}[] = [];
	const prefix = type === 'lab' ? 'jpserver-' : 'nbserver';
	await Promise.all(
		files.map(async (file) => {
			if (!file.startsWith(prefix) || !file.endsWith('.json')) {
				return;
			}

			const contents = await promisify(fs.readFile)(path.join(runtimeDir, file)).then(
				(c) => c.toString()
			);
			const json: {
				url: string;
				token: string;
				root_dir: string;
				secure: boolean;
				pid: number;
				port: number;
			} = JSON.parse(contents);
			if (json.secure) {
				return;
			}
			try {
				process.kill(json.pid, 0);
				servers.push(json);
			} catch {
				//
			}
		})
	);

	return servers;
}

function getDataDirectory() {
	if (process.env['JUPYTER_DATA_DIR']) {
		return path.normalize(process.env['JUPYTER_DATA_DIR']);
	}
	switch (getOSType()) {
		case 'osx':
			return path.join(homeDir, 'Library', 'Jupyter');
		case 'windows': {
			const appData = process.env['APPDATA']
				? path.normalize(process.env['APPDATA'])
				: '';
			if (appData) {
				return path.join(appData, 'jupyter');
			}
			const configDir = getJupyterConfigDir();
			if (configDir) {
				return path.join(configDir, 'data');
			}
			return path.join(homeDir, 'Library', 'Jupyter');
		}
		default: {
			// Linux, non-OS X Unix, AIX, etc.
			const xdgDataHome = process.env['XDG_DATA_HOME']
				? path.normalize(process.env['XDG_DATA_HOME'])
				: path.join(homeDir, '.local', 'share');
			return path.join(xdgDataHome, 'jupyter');
		}
	}
}

function getJupyterConfigDir() {
	if (process.env['JUPYTER_CONFIG_DIR']) {
		return path.normalize(process.env['JUPYTER_CONFIG_DIR']);
	}
	return path.join(homeDir, '.jupyter');
}

function getOSType() {
	const platform = process.platform;
	if (/^win/.test(platform)) {
		return 'windows';
	} else if (/^darwin/.test(platform)) {
		return 'osx';
	} else {
		return 'linux';
	}
}

function getUserHomeDir() {
	const homePath = os.homedir();
	if (getOSType() === 'windows') {
		return process.env['USERPROFILE'] || homePath;
	}
	const homeVar = process.env['HOME'] || process.env['HOMEPATH'] || homePath;

	// Make sure if linux, it uses linux separators
	return homeVar.replace(/\\/g, '/');
}
