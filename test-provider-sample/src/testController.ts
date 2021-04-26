import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import { parseMarkdown } from './parser';

const textDecoder = new TextDecoder('utf-8');

type MarkdownTestData = WorkspaceTestRoot | DocumentTestRoot | TestFile | TestHeading | TestCase;

export class MathTestController implements vscode.TestController<MarkdownTestData> {
  /**
   * @inheritdoc
   */
  public createWorkspaceTestRoot(workspaceFolder: vscode.WorkspaceFolder) {
    return WorkspaceTestRoot.create(workspaceFolder);
  }

  /**
   * @inheritdoc
   */
  public createDocumentTestRoot(document: vscode.TextDocument) {
    return DocumentTestRoot.create(document);
  }

  /**
   * @inheritdoc
   */
  public runTests(request: vscode.TestRunRequest<MarkdownTestData>, cancellation: vscode.CancellationToken) {
    const run = vscode.test.createTestRun(request);
    const runTests = async (tests: Iterable<vscode.TestItem<MarkdownTestData>>) => {
      for (const test of tests) {
        if (request.exclude?.includes(test)) {
          continue;
        }

        if (test.data instanceof TestCase) {
          run.appendOutput(`Running ${test.id}\r\n`);
          if (cancellation.isCancellationRequested) {
            run.setState(test, vscode.TestResultState.Skipped);
          } else {
            run.setState(test, vscode.TestResultState.Running);
            await test.data.run(run);
          }
          run.appendOutput(`Completed ${test.id}\r\n`);
        } else {
          if (test.data instanceof TestFile && test.children.size === 0) {
            await test.data.refresh();
          }

          await runTests(test.children.values());
        }
      }
    };

    runTests(request.tests).then(() => run.end());
  }
}


class WorkspaceTestRoot {
  public static create(workspaceFolder: vscode.WorkspaceFolder) {
    const item = vscode.test.createTestItem<WorkspaceTestRoot, TestFile>(
      { id: `mdtests ${workspaceFolder.uri}`, label: 'Markdown Tests', uri: workspaceFolder.uri },
      new WorkspaceTestRoot(workspaceFolder)
    );

    item.status = vscode.TestItemStatus.Pending;
    item.resolveHandler = token => {
      const pattern = new vscode.RelativePattern(workspaceFolder, '**/*.md');
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);
      const contentChange = new vscode.EventEmitter<vscode.Uri>();

      watcher.onDidCreate(uri =>
        item.addChild(TestFile.create(uri, getContentFromFilesystem, contentChange.event))
      );
      watcher.onDidChange(uri => contentChange.fire(uri));
      watcher.onDidDelete(uri => item.children.get(uri.toString())?.dispose());
      token.onCancellationRequested(() => {
        item.status = vscode.TestItemStatus.Pending;
        watcher.dispose();
      });

      vscode.workspace.findFiles(pattern).then(files => {
        for (const file of files) {
          item.addChild(TestFile.create(file, getContentFromFilesystem, contentChange.event));
        }

        item.status = vscode.TestItemStatus.Resolved;
      });
    };

    return item;
  }

  constructor(public readonly workspaceFolder: vscode.WorkspaceFolder) { }
}

class DocumentTestRoot {
  public static create(document: vscode.TextDocument) {
    const item = vscode.test.createTestItem<DocumentTestRoot, TestFile>(
      { id: `mdtests ${document.uri}`, label: 'Markdown Tests', uri: document.uri },
      new DocumentTestRoot()
    );

    item.status = vscode.TestItemStatus.Pending;
    item.resolveHandler = token => {
      const contentChange = new vscode.EventEmitter<vscode.Uri>();
      const changeListener = vscode.workspace.onDidChangeTextDocument(e => {
        contentChange.fire(e.document.uri);
      });

      const file = TestFile.create(document.uri, () => Promise.resolve(document.getText()), contentChange.event);
      item.addChild(file);

      token.onCancellationRequested(() => {
        changeListener.dispose();
        item.status = vscode.TestItemStatus.Pending;
      });

      item.status = vscode.TestItemStatus.Resolved;
    };

    return item;
  }
}

let generationCounter = 0;

type ContentGetter = (uri: vscode.Uri) => Promise<string>;

const getContentFromFilesystem: ContentGetter = async uri => {
  try {
    const rawContent = await vscode.workspace.fs.readFile(uri);
    return textDecoder.decode(rawContent);
  } catch (e) {
    console.warn(`Error providing tests for ${uri.fsPath}`, e);
    return '';
  }
};

class TestFile {
  public static create(uri: vscode.Uri, getContent: ContentGetter, onContentChange: vscode.Event<vscode.Uri>) {
    const item = vscode.test.createTestItem<TestFile>({
      id: uri.toString(),
      label: uri.path.split('/').pop()!,
      uri,
    });

    item.data = new TestFile(uri, getContent, item);
    item.status = vscode.TestItemStatus.Pending;
    item.resolveHandler = token => {
      const doRefresh = () => {
        item.data.refresh().then(() => {
          if (!token.isCancellationRequested) {
            item.status = vscode.TestItemStatus.Resolved;
          }
        });
      };

      const listener = onContentChange(uri => {
        if (uri.toString() === uri.toString()) {
          doRefresh();
        }
      });

      token.onCancellationRequested(() => {
        item.status = vscode.TestItemStatus.Pending;
        listener.dispose();
      });

      doRefresh();
    };

    return item;
  }

  constructor(
    private readonly uri: vscode.Uri,
    private readonly getContent: ContentGetter,
    private readonly item: vscode.TestItem<TestFile>,
  ) {
  }

  /**
   * Parses the tests from the input text, and updates the tests contained
   * by this file to be those from the text,
   */
  public async refresh() {
    const ancestors: (vscode.TestItem<TestFile> | vscode.TestItem<TestHeading>)[] = [this.item];
    const thisGeneration = generationCounter++;

    parseMarkdown(await this.getContent(this.uri), {
      onTest: (range, a, operator, b, expected) => {
        const parent = ancestors[ancestors.length - 1];
        const tcase = TestCase.create(Number(a), operator as Operator, Number(b), Number(expected), range, thisGeneration, parent);

        const existing = parent.children.get(tcase.id);
        if (existing) {
          existing.data.generation = thisGeneration;
        } else {
          parent.addChild(tcase);
        }
      },
      onHeading: (range, name, depth) => {
        while (ancestors.length > depth) {
          ancestors.pop();
        }

        const parent = ancestors[ancestors.length - 1];
        const thead = TestHeading.create(name, range, thisGeneration, parent);
        const existing = parent.children.get(thead.id);
        if (existing && existing.data instanceof TestHeading) {
          ancestors.push(existing);
          existing.data.generation = thisGeneration;
        } else {
          existing?.dispose();
          parent.addChild(thead);
          ancestors.push(thead);
        }
      }
    });

    this.prune(thisGeneration);
    this.item.error = this.item.children.size === 0 ? new vscode.MarkdownString('No _tests_ were **found** in this file') : undefined;
  }

  /**
   * Removes tests that were deleted from the source. Each test suite and case
   * has a 'generation' counter which is updated each time we discover it. This
   * is called after discovery is finished to remove any children who are no
   * longer in this generation.
   */
  private prune(thisGeneration: number) {
    const queue: (vscode.TestItem<TestHeading | TestFile, TestHeading | TestCase>)[] = [this.item];
    for (const parent of queue) {
      for (const child of parent.children.values()) {
        if (child.data.generation < thisGeneration) {
          child.dispose();
        } else if (child.data instanceof TestHeading) {
          queue.push(child as vscode.TestItem<TestHeading>);
        }
      }
    }
  }
}

class TestHeading {
  public static create(label: string, range: vscode.Range, generation: number, parent: vscode.TestItem<TestFile | TestHeading>) {
    const item = vscode.test.createTestItem<TestHeading, TestHeading | TestCase>({
      id: `mktests/${parent.uri.toString()}/${label}`,
      label,
      uri: parent.uri,
    }, new TestHeading(generation));

    item.range = range;
    return item;
  }

  protected constructor(public generation: number) { }
}

type Operator = '+' | '-' | '*' | '/';

class TestCase {
  public static create(
    a: number,
    operator: Operator,
    b: number,
    expected: number,
    range: vscode.Range,
    generation: number,
    parent: vscode.TestItem<TestHeading | TestFile>,
  ) {
    const label = `${a} ${operator} ${b} = ${expected}`;
    const item = vscode.test.createTestItem<TestCase, never>({
      id: `mktests/${parent.uri.toString()}/${label}`,
      label,
      uri: parent.uri,
    });

    item.data = new TestCase(a, operator, b, expected, item, generation);
    item.range = range;
    return item;
  }

  protected constructor(
    private readonly a: number,
    private readonly operator: Operator,
    private readonly b: number,
    private readonly expected: number,
    private readonly item: vscode.TestItem<TestCase>,
    public generation: number,
  ) { }

  async run(options: vscode.TestRun<MarkdownTestData>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    const start = Date.now();
    const actual = this.evaluate();
    const duration = Date.now() - start;

    if (actual === this.expected) {
      options.setState(this.item, vscode.TestResultState.Passed);
    } else {
      const message = vscode.TestMessage.diff(`Expected ${this.item.label}`, String(this.expected), String(actual));
      message.location = new vscode.Location(this.item.uri, this.item.range!);
      options.appendMessage(this.item, message);
      options.setState(this.item, vscode.TestResultState.Failed, duration);
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
