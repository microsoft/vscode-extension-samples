// This is based off https://github.com/Microsoft/vscode/blob/master/build/gulpfile.extensions.js
// but simplified for the single extension use-case

const es = require('event-stream');
const filter = require('gulp-filter');
const fs = require('fs');
const gulp = require('gulp');
const glob = require('glob');
const nlsDev = require('vscode-nls-dev');
const path = require('path');
const rimraf = require('rimraf');
const shell = require('shelljs');
const tsb = require('gulp-tsb');

const srcBase = path.join(__dirname, 'src');
const src = path.join(srcBase, '**');
const typeDefinitions = path.join(__dirname, 'node_modules/**/*.d.ts');
const out = path.join('./', 'out');
const i18n = path.join('./', 'i18n');
const allErrors = [];
let startTimer = null;
let count = 0;

// TASK: Add your supported languages here
const languages = ['jpn'];

function stripSourceMappingURL() {
  const input = es.through();

  const output = input.pipe(
    es.mapSync(f => {
      const contents = f.contents.toString('utf8');
      f.contents = new Buffer(
        contents.replace(/\n\/\/# sourceMappingURL=(.*)$/gm, ''),
        'utf8'
      );
      return f;
    })
  );

  return es.duplex(input, output);
}

function createPipeline(build) {
  const tsOptions = require(path.join(__dirname, 'tsconfig.json'))
    .compilerOptions;
  tsOptions.verbose = false;
  tsOptions.sourceMap = true;

  tsOptions.inlineSources = !!build;
  const compilation = tsb.create(tsOptions);

  return function() {
    const input = es.through();
    const tsFilter = filter(['**/*.ts', '!**/vscode-nls-dev/lib/**'], {
      restore: true
    });

    const output = input
      .pipe(tsFilter)
      .pipe(compilation())
      .pipe(build ? nlsDev.rewriteLocalizeCalls() : es.through())
      .pipe(build ? stripSourceMappingURL() : es.through())
      .pipe(
        build
          ? nlsDev.createAdditionalLanguageFiles(languages, i18n, out)
          : es.through()
      );

    return es.duplex(input, output);
  };
}

gulp.task('clean-extension', cb => rimraf(out, cb));

const iso639_3_to_2 = {
  chs: 'zh-cn',
  cht: 'zh-tw',
  csy: 'cs-cz',
  deu: 'de',
  enu: 'en',
  esn: 'es',
  fra: 'fr',
  hun: 'hu',
  ita: 'it',
  jpn: 'ja',
  kor: 'ko',
  nld: 'nl',
  plk: 'pl',
  ptb: 'pt-br',
  ptg: 'pt',
  rus: 'ru',
  sve: 'sv-se',
  trk: 'tr'
};

gulp.task('prepare-package-nls-json', () => {
  languages.map(language => {
    const packageJson = path.join(i18n, language, 'package.i18n.json');
    console.log(packageJson);
    if (fs.existsSync(packageJson)) {
      shell.cp(packageJson, `package.nls.${iso639_3_to_2[language]}.json`);
    }
  });
});

gulp.task(
  'build-extension',
  ['clean-extension', 'prepare-package-nls-json'],
  () => {
    const pipeline = createPipeline(true);
    const input = gulp.src([src, typeDefinitions]);
    return input.pipe(pipeline()).pipe(gulp.dest(out));
  }
);
