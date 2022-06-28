const { DefinePlugin } = require('webpack');
const path = require('path');

const outputFilename = 'index.js';
const devServerPort = 8111;

module.exports = (env, argv) => ({
  mode: argv.mode,
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  entry: './src/index.ts',
  output: {
    path: path.join(__dirname, 'out'),
    filename: outputFilename,
    publicPath: '',
    libraryTarget: 'module',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  experiments: {
      outputModule: true,
  },
  module: {
    rules: [
      // Allow importing ts(x) files:
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: path.join(__dirname, 'tsconfig.json'),
          // transpileOnly enables hot-module-replacement
          transpileOnly: true,
          compilerOptions: {
            // Overwrite the noEmit from the client's tsconfig
            noEmit: false,
          },
        },
      },
      // Allow importing CSS modules:
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      // Path from the output filename to the output directory
      __webpack_relative_entrypoint_to_root__: JSON.stringify(
        path.posix.relative(path.posix.dirname(`/${outputFilename}`), '/'),
      ),
      scriptUrl: 'import.meta.url',
    }),
  ],
});
