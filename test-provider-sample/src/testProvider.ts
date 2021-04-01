import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import { parseMarkdown } from './parser';

const textDecoder = new TextDecoder('utf-8');

type MarkdownTestItem = WorkspaceTestRoot | DocumentTestRoot | TestFile | TestHeading | TestCase;

export class MathTestProvider implements vscode.TestProvider<MarkdownTestItem> {
  /**
   * @inheritdoc
   */
  public provideWorkspaceTestRoot(workspaceFolder: vscode.WorkspaceFolder) {
    return new WorkspaceTestRoot(workspaceFolder);
  }

  /**
   * @inheritdoc
   */
  public provideDocumentTestRoot(document: vscode.TextDocument) {
    return new DocumentTestRoot(document);
  }

  /**
   * @inheritdoc
   */
  public async runTests(run: vscode.TestRunOptions<MarkdownTestItem>, cancellation: vscode.CancellationToken) {
    const runTests = async (tests: Iterable<MarkdownTestItem>) => {
      for (const test of tests) {
        if (run.exclude?.includes(test)) {
          continue;
        }

        if (test instanceof TestCase) {
          if (cancellation.isCancellationRequested) {
            run.setState(test, vscode.TestResultState.Skipped);
          } else {
            run.setState(test, vscode.TestResultState.Running);
            await test.run(run);
          }
        } else {
          if (test instanceof TestFile && test.children.size === 0) {
            await test.refresh();
          }

          await runTests(test.children);
        }
      }
    };

    await runTests(run.tests);
  }
}

class WorkspaceTestRoot extends vscode.TestItem<TestFile> {
  public readonly parent = undefined;

  constructor(private readonly workspaceFolder: vscode.WorkspaceFolder) {
    super('markdowntests', 'Markdown Tests', workspaceFolder.uri, true);
  }

  public discoverChildren(progress: vscode.Progress<{ busy: boolean }>, token: vscode.CancellationToken) {
    const pattern = new vscode.RelativePattern(this.workspaceFolder, '**/*.md');
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidCreate(uri =>
      this.children.add(new TestFile(uri, this, getContentFromFilesystem))
    );
    watcher.onDidChange(uri => this.children.get(uri.toString())?.refresh());
    watcher.onDidDelete(uri => this.children.delete(uri.toString()));
    token.onCancellationRequested(() => watcher.dispose());

    vscode.workspace.findFiles(pattern).then(files => {
      for (const file of files) {
        this.children.add(new TestFile(file, this, getContentFromFilesystem));
      }

      progress.report({ busy: false });
    });
  }
}

class DocumentTestRoot extends vscode.TestItem<TestFile> {
  public readonly parent = undefined;

  constructor(private readonly document: vscode.TextDocument) {
    super('markdowntests', 'Markdown Tests', document.uri, true);
  }

  public discoverChildren(progress: vscode.Progress<{ busy: boolean }>, token: vscode.CancellationToken) {
    const file = new TestFile(this.document.uri, this, () =>
      Promise.resolve(this.document.getText())
    );
    this.children.add(file);

    const changeListener = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document === this.document) {
        file.refresh();
      }
    });

    token.onCancellationRequested(() => changeListener.dispose());
    file.refresh().then(() => progress.report({ busy: false }));
  }
}

let generationCounter = 0;

const getContentFromFilesystem = async (uri: vscode.Uri) => {
  try {
    const rawContent = await vscode.workspace.fs.readFile(uri);
    return textDecoder.decode(rawContent);
  } catch (e) {
    console.warn(`Error providing tests for ${uri.fsPath}`, e);
    return '';
  }
};

type Operator = '+' | '-' | '*' | '/';

class TestFile extends vscode.TestItem<TestHeading | TestCase> {
  constructor(
    uri: vscode.Uri,
    public parent: WorkspaceTestRoot | DocumentTestRoot,
    private readonly getContent: (uri: vscode.Uri) => Promise<string>,
  ) {
    super(uri.toString(), uri.path.split('/').pop()!, uri, true);
  }

  public discoverChildren(progress: vscode.Progress<{ busy: boolean }>, token: vscode.CancellationToken) {
    this.refresh().then(() => progress.report({ busy: false }));
  }

  /**
   * Parses the tests from the input text, and updates the tests contained
   * by this file to be those from the text,
   */
  public async refresh() {
    const ancestors: (TestFile | TestHeading)[] = [this];
    const thisGeneration = generationCounter++;

    parseMarkdown(await this.getContent(this.uri), {
      onTest: (range, a, operator, b, expected) => {
        const parent = ancestors[ancestors.length - 1];
        const tcase = new TestCase(Number(a), operator as Operator, Number(b), Number(expected), range, thisGeneration, parent);

        const existing = parent.children.get(tcase.id);
        if (existing) {
          existing.generation = thisGeneration;
        } else {
          parent.children.add(tcase);
        }
      },
      onHeading: (range, name, depth) => {
        while (ancestors.length > depth) {
          ancestors.pop();
        }

        const parent = ancestors[ancestors.length - 1];
        const thead = new TestHeading(name, range, thisGeneration, parent);
        const existing = parent.children.get(thead.id);
        if (existing instanceof TestHeading) {
          ancestors.push(existing);
          existing.generation = thisGeneration;
        } else {
          parent.children.add(thead);
          ancestors.push(thead);
        }
      }
    });

    this.prune(thisGeneration);
  }

  /**
   * Removes tests that were deleted from the source. Each test suite and case
   * has a 'generation' counter which is updated each time we discover it. This
   * is called after discovery is finished to remove any children who are no
   * longer in this generation.
   */
  private prune(thisGeneration: number) {
    const queue: (TestHeading | TestFile)[] = [this];
    for (const parent of queue) {
      for (const child of parent.children) {
        if (child.generation < thisGeneration) {
          parent.children.delete(child);
        } else if (child instanceof TestHeading) {
          queue.push(child);
        }
      }
    }
  }
}

class TestHeading extends vscode.TestItem<TestHeading | TestCase> {
  public readonly level: number = this.parent instanceof TestFile ? 1 : this.parent.level + 1;

  constructor(
    label: string,
    range: vscode.Range,
    public generation: number,
    public readonly parent: TestFile | TestHeading,
  ) {
    super(`markdown/${parent.uri.toString()}/${label}`, label, parent.uri, true);
  }
}

class TestCase extends vscode.TestItem {
  constructor(
    private readonly a: number,
    private readonly operator: Operator,
    private readonly b: number,
    private readonly expected: number,
    public readonly range: vscode.Range,
    public generation: number,
    public readonly parent: TestHeading | TestFile,
  ) {
    super(`markdown/${parent.uri.toString()}/${a} ${operator} ${b} = ${expected}`, `${a} ${operator} ${b} = ${expected}`, parent.uri, false);
  }

  async run(options: vscode.TestRunOptions): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 3000));
    const start = Date.now();
    const actual = this.evaluate();
    const duration = Date.now() - start;

    if (actual === this.expected) {
      options.setState(this, vscode.TestResultState.Passed);
    } else {
      const message = vscode.TestMessage.diff(`Expected ${this.label}`, String(this.expected), String(actual));
      message.location = new vscode.Location(this.uri, this.range);
      options.appendMessage(this, message);
      options.setState(this, vscode.TestResultState.Failed, duration);
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
