import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import { parseMarkdown } from './parser';

const textDecoder = new TextDecoder('utf-8');

export type MarkdownTestData = TestFile | TestHeading | TestCase;

export const testData = new WeakMap<vscode.TestItem, MarkdownTestData>();

let generationCounter = 0;

export const getContentFromFilesystem = async (uri: vscode.Uri) => {
  try {
    const rawContent = await vscode.workspace.fs.readFile(uri);
    return textDecoder.decode(rawContent);
  } catch (e) {
    console.warn(`Error providing tests for ${uri.fsPath}`, e);
    return '';
  }
};

export class TestFile {
  public didResolve = false;

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
    const ancestors: vscode.TestItem[] = [item];
    const thisGeneration = generationCounter++;
    this.didResolve = true;

    parseMarkdown(content, {
      onTest: (range, a, operator, b, expected) => {
        const parent = ancestors[ancestors.length - 1];
        const data = new TestCase(a, operator as Operator, b, expected, thisGeneration);
        const id = `${item.uri}/${data.getLabel()}`;

        const existing = parent.children.get(id);
        if (existing) {
          (testData.get(existing) as TestHeading).generation = thisGeneration;
          existing.range = range;
        } else {
          const tcase = controller.createTestItem(id, data.getLabel(), parent, item.uri);
          testData.set(tcase, data);
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
        const data = existing && testData.get(existing);

        if (existing && data instanceof TestHeading) {
          ancestors.push(existing);
          data.generation = thisGeneration;
          existing.range = range;
        } else {
          existing?.dispose();
          const thead = controller.createTestItem(id, name, parent, item.uri);
          thead.range = range;
          testData.set(thead, new TestHeading(thisGeneration));
          ancestors.push(thead);
        }
      },
    });

    this.prune(item, thisGeneration);
  }

  /**
   * Removes tests that were deleted from the source. Each test suite and case
   * has a 'generation' counter which is updated each time we discover it. This
   * is called after discovery is finished to remove any children who are no
   * longer in this generation.
   */
  private prune(item: vscode.TestItem, thisGeneration: number) {
    const queue: vscode.TestItem[] = [item];
    for (const parent of queue) {
      for (const child of parent.children.values()) {
        const data = testData.get(child) as TestCase | TestHeading;
        if (data.generation < thisGeneration) {
          child.dispose();
        } else if (data instanceof TestHeading) {
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

  async run(item: vscode.TestItem, options: vscode.TestRun): Promise<void> {
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
