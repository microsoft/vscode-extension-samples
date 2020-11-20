import * as vscode from 'vscode';

export class TestTreeDataProvider implements vscode.TreeDataProvider<vscode.TestItem> {
  public static readonly viewId = 'sampleTestExplorerView';

  private readonly didChangeEmitter = new vscode.EventEmitter<null | vscode.TestItem>();
  private observers?: vscode.TestObserver[];

  constructor() {
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this.disposeExistingObservers();
    });

    let stopOngoingProgress: undefined | (() => void);
    this.didChangeEmitter.event(() => {
      const anyRunningTest = this.observers?.some(o =>
        o.tests.some(t => getComputedState(t) === vscode.TestRunState.Running)
      );

      if (stopOngoingProgress && !anyRunningTest) {
        stopOngoingProgress();
        stopOngoingProgress = undefined;
      } else if (!stopOngoingProgress && anyRunningTest) {
        vscode.window.withProgress(
          { location: { viewId: TestTreeDataProvider.viewId } },
          () => new Promise<void>(resolve => (stopOngoingProgress = resolve))
        );
      }
    });
  }

  /**
   * @inheritdoc
   */
  public readonly onDidChangeTreeData = this.didChangeEmitter.event;

  /**
   * @inheritdoc
   */
  getTreeItem(test: vscode.TestItem): vscode.TreeItem {
    const item = new vscode.TreeItem(
      test.label,
      test.children?.length ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
    );
    item.description = test.description;
    const state = getComputedState(test);
    item.iconPath = getStateIcon(state);
    item.contextValue = (test.runnable !== false ? 'runnable-' : '') + (test.debuggable !== true ? 'debuggable-' : '');
    if (test.location) {
      item.command = {
        title: 'Go to test location',
        command: 'vscode.open',
        arguments: [test.location.uri, { selection: test.location.range }]
      };
    }

    return item;
  }

  /**
   * @inheritdoc
   */
  getChildren(element?: vscode.TestItem): vscode.ProviderResult<vscode.TestItem[]> {
    if (!this.observers) {
      this.observers = [];
      for (const folder of vscode.workspace.workspaceFolders ?? []) {
        const observer = vscode.test.createWorkspaceTestObserver(folder);
        observer.onDidChangeTest(evt => this.didChangeEmitter.fire(evt.commonChangeAncestor));
        this.observers.push(observer);
      }
    }

    return element ? element.children : this.observers.flatMap(o => o.tests);
  }

  public dispose() {
    this.disposeExistingObservers();
  }

  private disposeExistingObservers() {
    if (this.observers) {
      for (const d of this.observers) {
        d.dispose();
      }
      this.observers = undefined;
    }
  }
}

const statePriorities: { [S in vscode.TestRunState]: number } = {
  [vscode.TestRunState.Running]: 0,
  [vscode.TestRunState.Failed]: 1,
  [vscode.TestRunState.Errored]: 2,
  [vscode.TestRunState.Running]: 3,
  [vscode.TestRunState.Passed]: 4,
  [vscode.TestRunState.Unset]: 5,
  [vscode.TestRunState.Skipped]: 6,
};

/**
 * Gets the state that should be displayed in the tree for a test item.
 */
const getComputedState = (item: vscode.TestItem): vscode.TestRunState => {
  let bestChildState: vscode.TestRunState = item.state.runState;
  let bestChildScore = statePriorities[bestChildState];
  for (const child of item.children ?? []) {
    const state = getComputedState(child);
    const score = statePriorities[state];
    if (score < bestChildScore) {
      bestChildScore = score;
      bestChildState = state;
    }
  }

  return bestChildState;
};

const getStateIcon = (state: vscode.TestRunState) => {
  switch (state) {
    case vscode.TestRunState.Failed:
      return new vscode.ThemeIcon('close');
    case vscode.TestRunState.Running:
      return new vscode.ThemeIcon('sync');
    case vscode.TestRunState.Passed:
      return new vscode.ThemeIcon('check');
    default:
      return undefined;
  }
};
