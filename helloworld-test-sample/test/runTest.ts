import * as path from 'path'

import { runTests } from 'vscode-test'

async function go() {
  try {
    const extensionPath = path.resolve(__dirname, '../../')
    const testRunnerPath = path.resolve(__dirname, './testRunner.js')
    const testWorkspace = path.resolve(__dirname, '../../test/suite/fixture')

    /**
     * Basic usage
     */
    await runTests({
      extensionPath,
      testRunnerPath,
      testWorkspace
    })
    await sleep(10000)
  } catch (err) {
    console.error('Failed to run tests')
    process.exit(1)
  }
}

go()

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
