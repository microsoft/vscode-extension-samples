//@ts-check
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

/**@type {import('rollup').RollupOptions}*/
const config = {
	input: './src/extension.ts', // the entry point of this extension
	output: {
		file: 'dist/extension.js',
		format: 'cjs', // 'esm' is still experimental, but you just need to change this and tsconfig to export esmodules
		sourcemap: !isProduction, // don't generate sourcemaps in production builds
	},
	external: ['vscode'],
	plugins: [typescript({ module: 'es6' }), isProduction && terser()], // rollup doesn't transpile typescript by default, we need to use this plugin
};

export default config;
