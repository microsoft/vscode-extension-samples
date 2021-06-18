import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import { parseMarkdown } from './parser';

const textDecoder = new TextDecoder('utf-8');

export type MarkdownTestData = TestFile | TestHeading | TestCase;

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

export class TestFile {
  public async updateFromDisk(controller: vscode.TestController, item: vscode.TestItem) {
    try {
      const content = await getContentFromFilesystem(item.uri!);
      item.error = undefined;
      this.updateFromContents(controller, content, item);
    } catch (e) {
      item.error = e.stack;
    }
  }

  /**
   * Parses the tests from the input text, and updates the tests contained
   * by this file to be those from the text,
   */
  public updateFromContents(controller: vscode.TestController, content: string, item: vscode.TestItem) {
    const ancestors: (vscode.TestItem<TestFile> | vscode.TestItem<TestHeading>)[] = [item];
    const thisGeneration = generationCounter++;

    parseMarkdown(content, {
      onTest: (range, a, operator, b, expected) => {
        const parent = ancestors[ancestors.length - 1];
        const data = new TestCase(a, operator as Operator, b, expected, thisGeneration);
        const id = `${item.uri}/${data.getLabel()}`;

        const existing = parent.children.get(id);
        if (existing) {
          existing.data.generation = thisGeneration;
          existing.range = range;
        } else {
          const tcase = controller.createTestItem(id, data.getLabel(), parent, item.uri, data);
          tcase.range = range;
        }
      },

      onHeading: (range, name, depth) => {
        while (ancestors.length > depth) {
          ancestors.pop();
        }

        const parent = ancestors[ancestors.length - 1];
        const id = `${item.uri}/${name}`;
        const existing = parent.children.get(id);

        if (existing && existing.data instanceof TestHeading) {
          ancestors.push(existing);
          existing.data.generation = thisGeneration;
          existing.range = range;
        } else {
          existing?.dispose();
          const thead = controller.createTestItem(id, name, parent, item.uri, new TestHeading(thisGeneration));
          thead.range = range;
          ancestors.push(thead);
        }
      },
    });

    this.prune(item, thisGeneration);
    item.status = vscode.TestItemStatus.Resolved;
  }

  /**
   * Removes tests that were deleted from the source. Each test suite and case
   * has a 'generation' counter which is updated each time we discover it. This
   * is called after discovery is finished to remove any children who are no
   * longer in this generation.
   */
  private prune(item: vscode.TestItem, thisGeneration: number) {
    const queue: vscode.TestItem<TestHeading | TestCase | TestFile>[] = [item];
    for (const parent of queue) {
      for (const child of parent.children.values()) {
        if (child.data.generation < thisGeneration) {
          child.dispose();
        } else if (child.data instanceof TestHeading) {
          queue.push(child);
        }
      }
    }
  }
}

export class TestHeading {
  constructor(public generation: number) {}
}

type Operator = '+' | '-' | '*' | '/';

export class TestCase {
  constructor(
    private readonly a: number,
    private readonly operator: Operator,
    private readonly b: number,
    private readonly expected: number,
    public generation: number
  ) {}

  getLabel() {
    return `${this.a} ${this.operator} ${this.b} = ${this.expected}`;
  }

  async run(item: vscode.TestItem, options: vscode.TestRun<MarkdownTestData>): Promise<void> {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    const actual = this.evaluate();
    const duration = Date.now() - start;

    if (actual === this.expected) {
      options.setState(item, vscode.TestResultState.Passed, duration);
    } else {
      const message = vscode.TestMessage.diff(`Expected ${item.label}`, String(this.expected), String(actual));
      message.location = new vscode.Location(item.uri!, item.range!);
      options.appendMessage(item, message);
      options.setState(item, vscode.TestResultState.Failed, duration);
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
