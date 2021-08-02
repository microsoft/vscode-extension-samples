// This script checks that the test provider isn't included in the package.json
// or extension.ts. The extension provider is given as a tool for development,
// but should not be published to the marketplace.
//
// This script is not super comprehensive, it's just here to prevent simple mistakes.

import * as ts from 'typescript';
import * as path from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { EOL } from 'os';

const rootDir = path.resolve(__dirname, '..', '..');
const packageJson = require('../../package.json');

class DetectedError extends Error {
  constructor(message: string, public readonly fix: () => void) {
    super(message);
  }
}

const checkNotInExtensionTs = () => {
  const entrypoint = path.resolve(rootDir, 'src', 'extension', 'extension.ts');
  if (!existsSync(entrypoint)) {
    return;
  }

  const contents = readFileSync(entrypoint, 'utf-8');
  const program = ts.createSourceFile(
    path.basename(entrypoint),
    contents,
    ts.ScriptTarget.ESNext,
    true,
  );

  const removeRegistration = (node: ts.Node) => () => writeFileSync(
    entrypoint,
    contents.slice(0, node.pos) + contents.slice(node.end + +(contents[node.end] === ',')),
  );

  ts.forEachChild(program, function walk(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      /(^|\W)registerNotebookContentProvider$/.test(node.expression.getText()) &&
      node.arguments[1]?.getText().includes('SampleContentProvider')
    ) {
      throw new DetectedError(
        '`registerNotebookContentProvider()` is still called with the SampleContentProvider.',
        removeRegistration(node),
      );
    }

    if (
      ts.isCallExpression(node) &&
      /(^|\W)registerNotebookKernel$/.test(node.expression.getText()) &&
      node.arguments[2]?.getText().includes('SampleKernel')
    ) {
      throw new DetectedError(
        '`registerNotebookKernel()` is still called with the TestKernel.',
        removeRegistration(node),
      );
    }

    ts.forEachChild(node, walk);
  });
};

const checkNotInPackageJson = () => {
  const providers = packageJson.contributes?.notebookProvider ?? [];
  const testIndex = providers.findIndex(
    (p: { viewType: string }) => p.viewType === 'test-notebook-renderer',
  );
  if (testIndex !== -1) {
    throw new DetectedError(
      `The "test-notebook-renderer" is still registered in the contributes section of your package.json.`,
      () => {
        providers.splice(testIndex, 1);
        writeFileSync(
          path.resolve(rootDir, 'package.json'),
          JSON.stringify(packageJson, null, 2) + EOL,
        );
      },
    );
  }
};
(() => {
  if (process.argv.includes('--fix')) {
    while (true) {
      try {
        checkNotInPackageJson();
        checkNotInExtensionTs();
      } catch (e) {
        if (!(e instanceof DetectedError)) {
          throw e;
        } else {
          e.fix();
          continue;
        }
      }

      return console.log('Test provider removed!');
    }
  }

  let errors: DetectedError[] = [];
  for (const check of [checkNotInPackageJson, checkNotInExtensionTs]) {
    try {
      check();
    } catch (e) {
      if (!(e instanceof DetectedError)) {
        throw e;
      }

      errors.push(e);
    }
  }


  if (!errors.length) {
    return;
  }

  const execPath = path.relative(process.cwd(), __filename);
  console.error(errors.map((e) => e.message).join(' '));
  console.error('');
  console.error(
    'You should remove the test provider before publishing your extension to avoid ' +
    `conflicts. To fix this automatically, run \`node ${execPath} --fix\``,
  );
})();
