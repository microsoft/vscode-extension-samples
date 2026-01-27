---
name: Extension Tests
description: Instructions on how to write exension tests for VS Code.
---
Setup: Install @vscode/test-electron package and create a test runner

Test structure:

Tests go in a test folder
Create suite/index.ts to configure Mocha test runner
Create runTest.ts to launch VS Code with tests
Basic test file (*.test.ts):

```
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    });
});
```

Key points:

- Use Mocha framework for tests
-  Tests run in an actual VS Code instance
-  Access full VS Code API via vscode module
-  Can test commands, language features, UI interactions

Run tests:

-  Add script to package.json: "test": "node ./out/test/runTest.js"
-  Run: npm test
