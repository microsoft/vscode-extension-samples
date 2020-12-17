import { TextDecoder } from 'util';
import * as vscode from 'vscode';

const textDecoder = new TextDecoder('utf-8');

export class MathTestProvider implements vscode.TestProvider {
  /**
   * @inheritdoc
   */
  public createWorkspaceTestHierarchy(workspaceFolder: vscode.WorkspaceFolder): vscode.TestHierarchy<vscode.TestItem> {
    const root = new TestRoot();
    const pattern = new vscode.RelativePattern(workspaceFolder, '**/*.md');

    const changeTestEmitter = new vscode.EventEmitter<vscode.TestItem>();
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidCreate(async uri => await updateTestsInFile(root, uri, changeTestEmitter));
    watcher.onDidChange(async uri => await updateTestsInFile(root, uri, changeTestEmitter));
    watcher.onDidDelete(uri => {
      removeTestsForFile(root, uri);
      changeTestEmitter.fire(root);
    });

    const onDidDiscoverInitialTests = new vscode.EventEmitter<void>();
    vscode.workspace
      .findFiles(pattern, undefined, undefined)
      .then(files => Promise.all(files.map(file => updateTestsInFile(root, file, changeTestEmitter))))
      .then(() => onDidDiscoverInitialTests.fire());

    return {
      root,
      onDidChangeTest: changeTestEmitter.event,
      onDidDiscoverInitialTests: onDidDiscoverInitialTests.event,
      dispose: () => watcher.dispose(),
    };
  }

  /**
   * @inheritdoc
   */
  public createDocumentTestHierarchy(document: vscode.TextDocument): vscode.TestHierarchy<vscode.TestItem> {
    const root = new TestRoot();
    const file = new TestFile(document.uri);
    root.children.push(file);

    const changeTestEmitter = new vscode.EventEmitter<vscode.TestItem>();
    file.updateTestsFromText(document.getText(), changeTestEmitter);

    const listener = vscode.workspace.onDidChangeTextDocument(evt => {
      if (evt.document === document) {
        file.updateTestsFromText(document.getText(), changeTestEmitter);
        changeTestEmitter.fire(file);
      }
    });

    const onDidDiscoverInitialTests = new vscode.EventEmitter<void>();
    setTimeout(() => onDidDiscoverInitialTests.fire(), 0);

    return {
      root,
      onDidChangeTest: changeTestEmitter.event,
      onDidDiscoverInitialTests: onDidDiscoverInitialTests.event,
      dispose: () => listener.dispose(),
    };
  }

  /**
   * @inheritdoc
   */
  public async runTests(options: vscode.TestRunOptions, cancellation: vscode.CancellationToken) {
    const queue = await this.gatherTestTree(options.tests);

    while (queue.length && !cancellation.isCancellationRequested) {
      await queue.shift()!.run();
    }

    while (queue.length) {
      queue.shift()!.cancel();
    }
  }

  private async gatherTestTree(tests: vscode.TestItem[], queue: ({ run(): Promise<void>; cancel(): void; })[] = []) {
    for (const test of tests) {
      if (test instanceof TestCase) {
        test.markQueued();
        queue.push({ run: () => test.run(), cancel: () => test.markCancelled() });
      }

      if (test.children) {
        this.gatherTestTree(test.children, queue);
      }
    }

    return queue;
  }
}

const removeTestsForFile = (root: TestRoot, uri: vscode.Uri) => {
  root.children = root.children.filter(file => file.uri.toString() !== uri.toString());
};

const updateTestsInFile = async (root: TestRoot, uri: vscode.Uri, emitter: vscode.EventEmitter<vscode.TestItem>) => {
  let testFile = root.children.find(file => file.uri.toString() === uri.toString());
  const changeTarget = testFile ?? root;
  if (!testFile) {
    testFile = new TestFile(uri);
    root.children.push(testFile);
  }

  if (await testFile.updateTestsFromFs(emitter) === 0) {
    removeTestsForFile(root, uri);
    emitter.fire(root);
  } else {
    emitter.fire(changeTarget);
  }
};

const testRe = /^([0-9]+)\s*\+\s*([0-9]+)\s*=\s*([0-9]+)/;
const headingRe = /^(#+)\s*(.+)$/;

class TestRoot implements vscode.TestItem {
  public readonly label = 'Markdown Tests';
  public readonly state = new vscode.TestState(vscode.TestRunState.Unset);
  public children = [] as TestFile[];
}

class TestFile implements vscode.TestItem {
  public readonly label = this.uri.path.split('/').pop()!;
  public children: (TestHeading | TestCase)[] = [];

  public state = new vscode.TestState(vscode.TestRunState.Unset);

  constructor(public readonly uri: vscode.Uri) {}

  public async updateTestsFromFs(updateEmitter: vscode.EventEmitter<vscode.TestItem>) {
    let text: string;
    try {
      const rawContent = await vscode.workspace.fs.readFile(this.uri);
      text = textDecoder.decode(rawContent);
    } catch (e) {
      console.warn(`Error providing tests for ${this.uri.fsPath}`, e);
      return;
    }

    return this.updateTestsFromText(text, updateEmitter);
  }

  public updateTestsFromText(text: string, updateEmitter: vscode.EventEmitter<vscode.TestItem>) {
    const lines = text.split('\n');
    const ancestors: (TestFile | TestHeading)[] = [this];
    let discovered = 0;
    this.children = [];

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
      const line = lines[lineNo];
      const heading = headingRe.exec(line);

      const test = testRe.exec(line);
      if (test) {
        const [, a, b, expected] = test!.map(Number);
        const range = new vscode.Range(new vscode.Position(lineNo, 0), new vscode.Position(lineNo, test[0].length));
        const tcase = new TestCase(a, b, expected, new vscode.Location(this.uri, range), updateEmitter);
        ancestors[ancestors.length - 1].children.push(tcase);
        discovered++;
        continue;
      }

      if (heading) {
        const [, pounds, name] = heading;
        const level = pounds.length;
        while (ancestors.length > level) {
          ancestors.pop();
        }
        const range = new vscode.Range(new vscode.Position(lineNo, 0), new vscode.Position(lineNo, line.length));
        const thead = new TestHeading(level, name, new vscode.Location(this.uri, range));
        ancestors[ancestors.length - 1].children.push(thead);
        ancestors.push(thead);
        continue;
      }
    }

    return discovered;
  }
}

class TestHeading implements vscode.TestItem {
  public readonly children: (TestHeading | TestCase)[] = [];

  public state = new vscode.TestState(vscode.TestRunState.Unset);

  constructor(
    public readonly level: number,
    public readonly label: string,
    public readonly location: vscode.Location
  ) {}
}

class TestCase implements vscode.TestItem {
  public get label() {
    return `${this.a} + ${this.b} = ${this.expected}`;
  }

  public state = new vscode.TestState(vscode.TestRunState.Unset);

  constructor(
    private readonly a: number,
    private readonly b: number,
    private readonly expected: number,
    public readonly location: vscode.Location,
    private readonly updateEmitter: vscode.EventEmitter<vscode.TestItem>
  ) {}

  markQueued() {
    this.state = new vscode.TestState(vscode.TestRunState.Queued);
    this.updateEmitter.fire(this);
  }

  markCancelled() {
    this.state = new vscode.TestState(vscode.TestRunState.Skipped);
    this.updateEmitter.fire(this);
  }

  async run() {
    this.state = new vscode.TestState(vscode.TestRunState.Running);
    this.updateEmitter.fire(this);

    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 3000));
    const actual = this.a + this.b;
    if (actual === this.expected) {
      this.state = new vscode.TestState(vscode.TestRunState.Passed);
    } else {
      this.state = new vscode.TestState(vscode.TestRunState.Failed, [
        {
          message: `Expected ${this.label}`,
          expectedOutput: String(this.expected),
          actualOutput: String(actual),
          location: this.location,
        },
      ]);
    }

    this.updateEmitter.fire(this);
  }
}
