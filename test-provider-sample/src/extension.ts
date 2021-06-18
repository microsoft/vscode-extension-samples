import * as vscode from 'vscode';
import { MarkdownTestData, TestCase, TestFile } from './testTree';

export function activate(context: vscode.ExtensionContext) {
  const ctrl = vscode.test.createTestController<MarkdownTestData>('mathTestController');
  context.subscriptions.push(ctrl);

  // All VS Code tests are in a tree, starting at the automatically created "root".
  // We'll give it a label, and set its status so that VS Code will call
  // `resolveChildrenHandler` when the test explorer is opened.
  ctrl.root.label = 'Markdown Math';
  ctrl.root.status = vscode.TestItemStatus.Pending;

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
          if (test.data instanceof TestFile && test.status === vscode.TestItemStatus.Pending) {
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

  ctrl.resolveChildrenHandler = (item, token) => {
    if (item === ctrl.root) {
      startWatchingWorkspace(ctrl, token);
    } else if (item.data instanceof TestFile) {
      item.data.updateFromDisk(ctrl, item);
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

  file.status = vscode.TestItemStatus.Pending;
  return file;
}

function startWatchingWorkspace(controller: vscode.TestController, token: vscode.CancellationToken) {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }

  for (const workspaceFolder of vscode.workspace.workspaceFolders) {
    const pattern = new vscode.RelativePattern(workspaceFolder, '**/*.md');
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    const contentChange = new vscode.EventEmitter<vscode.Uri>();

    watcher.onDidCreate(uri => getOrCreateFile(controller, uri));
    watcher.onDidChange(uri => contentChange.fire(uri));
    watcher.onDidDelete(uri => controller.root.children.get(uri.toString())?.dispose());
    token.onCancellationRequested(() => {
      controller.root.status = vscode.TestItemStatus.Pending;
      watcher.dispose();
    });

    vscode.workspace.findFiles(pattern).then(files => {
      for (const file of files) {
        getOrCreateFile(controller, file);
      }

      controller.root.status = vscode.TestItemStatus.Resolved;
    });
  }
}
