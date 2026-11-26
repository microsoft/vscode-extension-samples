import { existsSync } from 'node:fs';
import { defineConfig } from '@vscode/test-cli';

const cursorPath = 'C:/Users/DELL/AppData/Local/Programs/cursor/Cursor.exe';
const vscodePath = 'C:/Users/DELL/AppData/Local/Programs/Microsoft VS Code/Code.exe';

const fromPath = existsSync(cursorPath)
	? cursorPath
	: existsSync(vscodePath)
		? vscodePath
		: undefined;

export default defineConfig({
	files: 'out/test/**/*.test.js',
	mocha: {
		timeout: 60_000,
	},
	...(fromPath ? { useInstallation: { fromPath } } : {}),
});
