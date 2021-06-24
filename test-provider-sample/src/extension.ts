import * as vscode from 'vscode';
import { MarkdownTestData, TestCase, testData, TestFile } from './testTree';

export function activate(context: vscode.ExtensionContext) {
  const ctrl = vscode.test.createTestController('mathTestController');
  context.subscriptions.push(ctrl);

  // All VS Code tests are in a tree, starting at the automatically created "root".
  // We'll give it a label, and set its status so that VS Code will call
  // `resolveChildrenHandler` when the test explorer is opened.
  ctrl.root.label = 'Markdown Math';
  ctrl.root.canResolveChildren = true;

  ctrl.runHandler = (request: vscode.TestRunRequest, cancellation: vscode.CancellationToken) => {
    const queue: { test: vscode.TestItem; data: TestCase }[] = [];
    const run = ctrl.createTestRun(request);
    const discoverTests = async (tests: Iterable<vscode.TestItem>) => {
      for (const test of tests) {
        if (request.exclude?.includes(test)) {
          continue;
        }

        const data = testData.get(test);
        if (data instanceof TestCase) {
          run.setState(test, vscode.TestResultState.Queued);
          queue.push({ test, data });
        } else {
          if (data instanceof TestFile && test.children.size === 0) {
            await data.updateFromDisk(ctrl, test);
          }

          await discoverTests(test.children.values());
        }
      }
    };

    const runTestQueue = async () => {
      for (const { test, data } of queue) {
        run.appendOutput(`Running ${test.id}\r\n`);
        if (cancellation.isCancellationRequested) {
          run.setState(test, vscode.TestResultState.Skipped);
        } else {
          run.setState(test, vscode.TestResultState.Running);
          await data.run(test, run);
        }
        run.appendOutput(`Completed ${test.id}\r\n`);
      }

      run.end();
    };

    discoverTests(request.tests).then(runTestQueue);
  };

  ctrl.resolveChildrenHandler = async item => {
    if (item === ctrl.root) {
      const disposables = await startWatchingWorkspace(ctrl);
      context.subscriptions.push(...disposables);
      return;
    }

    const data = testData.get(item);
    if (data instanceof TestFile) {
      await data.updateFromDisk(ctrl, item);
    }
  };

  function updateNodeForDocument(e: vscode.TextDocument) {
    if (!e.uri.path.endsWith('.md')) {
      return;
    }

    const { file, data } = getOrCreateFile(ctrl, e.uri);
    data.updateFromContents(ctrl, e.getText(), file);
  }

  for (const document of vscode.workspace.textDocuments) {
    updateNodeForDocument(document);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(updateNodeForDocument),
    vscode.workspace.onDidChangeTextDocument(e => updateNodeForDocument(e.document))
  );
}

function getOrCreateFile(controller: vscode.TestController, uri: vscode.Uri) {
  const existing = controller.root.children.get(uri.toString());
  if (existing) {
    return { file: existing, data: testData.get(existing) as TestFile };
  }

  const file = controller.createTestItem(uri.toString(), uri.path.split('/').pop()!, controller.root, uri);

  const data = new TestFile();
  testData.set(file, data);

  file.canResolveChildren = true;
  return { file, data };
}

function startWatchingWorkspace(controller: vscode.TestController) {
  if (!vscode.workspace.workspaceFolders) {
    return [];
  }

  return Promise.all(
    vscode.workspace.workspaceFolders.map(async workspaceFolder => {
      const pattern = new vscode.RelativePattern(workspaceFolder, '**/*.md');
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);
      const contentChange = new vscode.EventEmitter<vscode.Uri>();

      watcher.onDidCreate(uri => getOrCreateFile(controller, uri));
      watcher.onDidChange(uri => contentChange.fire(uri));
      watcher.onDidDelete(uri => controller.root.children.get(uri.toString())?.dispose());

      const files = await vscode.workspace.findFiles(pattern);
      for (const file of files) {
        getOrCreateFile(controller, file);
      }

      return watcher;
    })
  );
}
