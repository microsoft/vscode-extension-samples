import * as vscode from 'vscode';

const didChangeTreeData = new vscode.EventEmitter<{ key: string } | undefined>();
export class TestView {

	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('testView', { treeDataProvider: aNodeWithIdTreeDataProvider(), showCollapseAll: true });
		context.subscriptions.push(view);
		vscode.commands.registerCommand('testView.reveal', async () => {
			const key = await vscode.window.showInputBox({ placeHolder: 'Type the label of the item to reveal' });
			if (key) {
				await view.reveal({ key }, { focus: true, select: false, expand: true });
			}
		});
		vscode.commands.registerCommand('testView.changeTitle', async () => {
			const title = await vscode.window.showInputBox({ prompt: 'Type the new title for the Test View', placeHolder: view.title });
			if (title) {
				view.title = title;
			}
		});

		vscode.commands.registerCommand('testView.swapTrees', async () => {
			setTimeout(() => {
				if (currentTree === tree) {
					currentTree = tree2;
				} else {
					currentTree = tree;
				}
				didChangeTreeData.fire(undefined);
			}, 500);
		});
		// This does not fire when you run `swapTrees` command
		view.onDidChangeSelection(e => {
			vscode.window.showInformationMessage('Change Selected ' + e.selection[0].key);
		});

		// To show that selected goes from "something" to "undefined" and back to "something
		setInterval(() => {
			vscode.window.showInformationMessage('Selected ' + view.selection[0]?.key);
		}, 5000);
	}
}

const tree: any = {
	'a': {
		'aa': {
			'aaa': {
				'aaaa': {
					'aaaaa': {
						'aaaaaa': {

						}
					}
				}
			}
		},
		'ab': {}
	},
	'b': {
		'ba': {},
		'bb': {}
	}
};
const tree2: any = {
	'c': {
		'cc': {
			'ccc': {
				'cccc': {
					'ccccc': {
						'cccccc': {

						}
					}
				}
			}
		},
		'cd': {}
	},
	'd': {
		'dc': {},
		'dd': {}
	}
};

let currentTree = tree;

const nodes: any = {};

function aNodeWithIdTreeDataProvider(): vscode.TreeDataProvider<{ key: string }> {
	return {
		getChildren: (element: { key: string }): { key: string }[] => {
			return getChildren(element ? element.key : undefined).map(key => getNode(key));
		},
		getTreeItem: (element: { key: string }): vscode.TreeItem => {
			const treeItem = getTreeItem(element.key);
			treeItem.id = element.key;
			return treeItem;
		},
		getParent: ({ key }: { key: string }): { key: string } | undefined => {
			const parentKey = key.substring(0, key.length - 1);
			return parentKey ? new Key(parentKey) : undefined;
		},
		onDidChangeTreeData: didChangeTreeData.event
	};
}

function getChildren(key: string | undefined): string[] {
	if (!key) {
		return Object.keys(currentTree);
	}
	const treeElement = getTreeElement(key);
	if (treeElement) {
		return Object.keys(treeElement);
	}
	return [];
}

function getTreeItem(key: string): vscode.TreeItem {
	const treeElement = getTreeElement(key);
	// An example of how to use codicons in a MarkdownString in a tree item tooltip.
	const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${key}`, true);
	return {
		label: /**vscode.TreeItemLabel**/<any>{ label: key, highlights: key.length > 1 ? [[key.length - 2, key.length - 1]] : void 0 },
		tooltip,
		collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
	};
}

function getTreeElement(element: string): any {
	let parent = currentTree;
	for (let i = 0; i < element.length; i++) {
		parent = parent[element.substring(0, i + 1)];
		if (!parent) {
			return null;
		}
	}
	return parent;
}

function getNode(key: string): { key: string } {
	if (!nodes[key]) {
		nodes[key] = new Key(key);
	}
	return nodes[key];
}

class Key {
	constructor(readonly key: string) { }
}