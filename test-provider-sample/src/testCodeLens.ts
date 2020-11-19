import * as vscode from 'vscode';

/**
 * Create code lenses for tests in the current document.
 */
export class TestCodeLensProvider implements vscode.CodeLensProvider {
  private readonly changeEmitter = new vscode.EventEmitter<void>();

  public readonly onDidChangeCodeLenses = this.changeEmitter.event;

  private currentObserver?: {
    observer: vscode.TestObserver;
    document: vscode.TextDocument;
  };

  constructor() {
    vscode.workspace.onDidCloseTextDocument(doc => {
      if (doc === this.currentObserver?.document) {
        this.disposeCurrentObserver();
      }
    });
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
    if (this.currentObserver?.document !== document) {
      this.disposeCurrentObserver();
    }
    if (!this.currentObserver) {
      this.currentObserver = { document, observer: vscode.test.createDocumentTestObserver(document) };
      this.currentObserver.observer.onDidChangeTest(() => this.changeEmitter.fire());
    }

    return testsToLenses(document, this.currentObserver.observer.tests);
  }

  private disposeCurrentObserver() {
    if (this.currentObserver) {
      this.currentObserver.observer.dispose();
      this.currentObserver = undefined;
    }
  }
}

const testsToLenses = (document: vscode.TextDocument, tests: Iterable<vscode.TestItem>) => {
  const lenses: vscode.CodeLens[] = [];
  const queue = [tests];
  while (queue.length) {
    for (const test of queue.pop()!) {
      if (test.location && test.location.uri.toString() === document.uri.toString()) {
        lenses.push(new TestCodeLens(test, test.location.range));
      }
      if (test.children) {
        queue.push(test.children);
      }
    }
  }

  return lenses;
};

class TestCodeLens extends vscode.CodeLens {
  constructor(public readonly test: vscode.TestItem, range: vscode.Range) {
    super(range, {
      title: statePrefix(test) + test.label,
      command: 'test-provider-sample.runTests',
      arguments: [[test]],
    });
  }
}

const statePrefix = (test: vscode.TestItem) => {
  switch (test.state.runState) {
    case vscode.TestRunState.Running:
      return 'running: ';
    case vscode.TestRunState.Passed:
      return 'passed: ';
    case vscode.TestRunState.Failed:
      return 'failed: ';
    default:
      return 'Click to run: ';
  }
};
