import * as vscode from 'vscode';
import { MarkdownTestData, TestCase, TestFile } from './testTree';

export function activate(context: vscode.ExtensionContext) {
  const ctrl = vscode.test.createTestController<MarkdownTestData>('mathTestController');
  context.subscriptions.push(ctrl);

  // All VS Code tests are in a tree, starting at the automatically created "root".
  // We'll give it a label, and set its status so that VS Code will call
  // `resolveChildrenHandler` when the test explorer is opened.
  ctrl.root.label = 'Markdown Math';
  ctrl.root.canResolveChildren = true;

  ctrl.runHandler = (request: vscode.TestRunRequest<MarkdownTestData>, cancellation: vscode.CancellationToken) => {
    const queue: vscode.TestItem<TestCase>[] = [];
    const run = ctrl.createTestRun(request);
    const discoverTests = async (tests: Iterable<vscode.TestItem<MarkdownTestData>>) => {
      for (const test of tests) {
        if (request.exclude?.includes(test)) {
          continue;
        }

        if (test.data instanceof TestCase) {
          run.setState(test, vscode.TestResultState.Queued);
          queue.push(test as vscode.TestItem<TestCase>);
        } else {
          if (test.data instanceof TestFile && test.children.size === 0) {
            await test.data.updateFromDisk(ctrl, test);
          }

          await discoverTests(test.children.values());
        }
      }
    };

    const runTestQueue = async () => {
      for (const test of queue) {
        run.appendOutput(`Running ${test.id}\r\n`);
        if (cancellation.isCancellationRequested) {
          run.setState(test, vscode.TestResultState.Skipped);
        } else {
          run.setState(test, vscode.TestResultState.Running);
          await test.data.run(test, run);
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
    } else if (item.data instanceof TestFile) {
      await item.data.updateFromDisk(ctrl, item);
    }
  };

  function updateNodeForDocument(e: vscode.TextDocument) {
    if (!e.uri.path.endsWith('.md')) {
      return;
    }

    const node = getOrCreateFile(ctrl, e.uri);
    node.data.updateFromContents(ctrl, e.getText(), node);
  }

  for (const document of vscode.workspace.textDocuments) {
    updateNodeForDocument(document);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(updateNodeForDocument),
    vscode.workspace.onDidChangeTextDocument(e => updateNodeForDocument(e.document))
  );
}

function getOrCreateFile(controller: vscode.TestController, uri: vscode.Uri): vscode.TestItem<TestFile> {
  const existing = controller.root.children.get(uri.toString());
  if (existing) {
    return existing;
  }

  const file = controller.createTestItem(
    uri.toString(),
    uri.path.split('/').pop()!,
    controller.root,
    uri,
    new TestFile()
  );

  file.canResolveChildren = true;
  return file;
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
