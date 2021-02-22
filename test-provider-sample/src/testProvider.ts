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

    const discoveredInitialTests = vscode.workspace
      .findFiles(pattern, undefined, undefined)
      .then(files => Promise.all(files.map(file => updateTestsInFile(root, file, changeTestEmitter))));

    return {
      root,
      onDidChangeTest: changeTestEmitter.event,
      discoveredInitialTests,
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
    file.updateTestsFromText(document.getText());

    const listener = vscode.workspace.onDidChangeTextDocument(evt => {
      if (evt.document === document) {
        file.updateTestsFromText(document.getText());
        changeTestEmitter.fire(file);
      }
    });

    return {
      root,
      onDidChangeTest: changeTestEmitter.event,
      discoveredInitialTests: Promise.resolve(),
      dispose: () => listener.dispose(),
    };
  }

  /**
   * @inheritdoc
   */
  public async runTests(run: vscode.TestRun, cancellation: vscode.CancellationToken) {
    const runTests = async (tests: Iterable<vscode.TestItem>) => {
      for (const test of tests) {
        if (test instanceof TestCase) {
          if (cancellation.isCancellationRequested) {
            run.setState(test, { state: vscode.TestRunState.Skipped });
          } else {
            run.setState(test, { state: vscode.TestRunState.Running });
            run.setState(test, await test.run());
          }
        }

        if (test.children) {
          await runTests(test.children);
        }
      }
    };

    await runTests(run.tests);
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

  if ((await testFile.updateTestsFromFs()) === 0) {
    removeTestsForFile(root, uri);
    emitter.fire(root);
  } else {
    emitter.fire(changeTarget);
  }
};

type Operator = '+' | '-' | '*' | '/';

const testRe = /^([0-9]+)\s*([+*/-])\s*([0-9]+)\s*=\s*([0-9]+)/;
const headingRe = /^(#+)\s*(.+)$/;

class TestRoot implements vscode.TestItem {
  public readonly label = 'Markdown Tests';
  public children = [] as TestFile[];
}

class TestFile implements vscode.TestItem {
  public readonly label = this.uri.path.split('/').pop()!;
  public children: (TestHeading | TestCase)[] = [];
  constructor(public readonly uri: vscode.Uri) {}

  public async updateTestsFromFs() {
    let text: string;
    try {
      const rawContent = await vscode.workspace.fs.readFile(this.uri);
      text = textDecoder.decode(rawContent);
    } catch (e) {
      console.warn(`Error providing tests for ${this.uri.fsPath}`, e);
      return;
    }

    return this.updateTestsFromText(text);
  }

  public updateTestsFromText(text: string) {
    const lines = text.split('\n');
    const ancestors: (TestFile | TestHeading)[] = [this];
    let discovered = 0;
    this.children = [];

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
      const line = lines[lineNo];
      const heading = headingRe.exec(line);

      const test = testRe.exec(line);
      if (test) {
        const [, a, operator, b, expected] = test;
        const range = new vscode.Range(new vscode.Position(lineNo, 0), new vscode.Position(lineNo, test[0].length));
        const tcase = new TestCase(Number(a), operator as Operator, Number(b), Number(expected), new vscode.Location(this.uri, range));
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

  public get id() {
    return `${this.location.uri.toString()}: ${this.label}`;
  }

  constructor(
    private readonly a: number,
    private readonly operator: Operator,
    private readonly b: number,
    private readonly expected: number,
    public readonly location: vscode.Location,
  ) {}

  async run(): Promise<vscode.TestState> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 3000));
    const actual = this.evaluate();
    if (actual === this.expected) {
      return { state: vscode.TestRunState.Passed};
    } else {
      return { state: vscode.TestRunState.Failed, messages: [
          {
            message: `Expected ${this.label}`,
            expectedOutput: String(this.expected),
            actualOutput: String(actual),
            location: this.location,
          },
      ]};
    }
  }

  private evaluate() {
    switch (this.operator) {
      case '-':
        return this.a - this.b;
      case '+':
        return this.a + this.b;
      case '/':
        return Math.floor(this.a / this.b);
      case '*':
        return this.a * this.b;
    }
  }
}
