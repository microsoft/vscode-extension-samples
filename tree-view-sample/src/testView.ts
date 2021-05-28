import * as vscode from 'vscode';

export class TestView implements vscode.TreeDataProvider<Node>, vscode.DragAndDropController<Node> {
	private _onDidChangeTreeData: vscode.EventEmitter<Node | undefined> = new vscode.EventEmitter<Node | undefined>();
	public onDidChangeTreeData: vscode.Event<Node | undefined> = this._onDidChangeTreeData.event;
	public tree: any = {
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

	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('testView', { treeDataProvider: this, showCollapseAll: true, canSelectMany: true, dragAndDropController: this });
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
	}
	public getChildren(element: Node): Node[] {
		return this._getChildren(element ? element.key : undefined).map(key => this._getNode(key));
	}

	public getTreeItem(element: Node): vscode.TreeItem {
		const treeItem = this._getTreeItem(element.key);
		treeItem.id = element.key;
		return treeItem;
	}
	public getParent(element: Node): Node {
		return this._getParent(element.key);
	}

	public async onDrop(sources: Node[], target: Node): Promise<void> {
		let roots = this._getLocalRoots(sources);
		// remove nodes that are already target's parent nodes
		roots = roots.filter(r => !this._isChild(this._getTreeElement(r.key), target));
		if (roots.length > 0) {
			// add nodes to target node
			roots.forEach(r => this._addNode(r, target));
			this._onDidChangeTreeData.fire(undefined);
		}
	}

	dispose(): void {
		console.log('destroy')
	}

	// Helper methods

	_isChild(node: Node, child: Node): boolean {
		let toReturn = undefined;
		for (const prop in node) {
			if (prop === child.key) {
				return true;
			} else {
				toReturn = this._isChild(node[prop], child);
				if (toReturn) {
					return toReturn;
				}
			}
		}
		return false;
	}

	_getLocalRoots(nodes: Node[]): Node[] {
		let localRoots = [];
		for (let i = 0; i < nodes.length; i++) {
			let parent = this._getParent(nodes[i].key);
			if (parent) {
				let isInList = nodes.find(n => n.key === parent.key);
				if (isInList === undefined) {
					localRoots.push(nodes[i]);
				}
			} else {
				localRoots.push(nodes[i]);
			}
		}
		return localRoots;
	}

	_addNode(node: Node, target: Node): void {
		let element = {};
		element[node.key] = this._getTreeElement(node.key);
		const elementCopy = { ...element };
		this._removeNode(node);
		const targetElement = this._getTreeElement(target.key);
		if (Object.keys(element).length === 0) {
			targetElement[node.key] = {};
		} else {
			Object.assign(targetElement, elementCopy);
		}
	}

	_removeNode(element: Node, tree?: any, parentKey?: string): void {
		let parent = tree ? tree : this.tree;
		for (const prop in parent) {
			if (prop === element.key) {
				let parentObject = this.getParent(element);
				if (parentObject) {
					delete parentObject[parentKey][prop];
				} else {
					delete this.tree[prop];
				}

			} else {
				this._removeNode(element, parent[prop], prop);
			}
		}
	}

	_getChildren(key: string): string[] {
		if (!key) {
			return Object.keys(this.tree);
		}
		const treeElement = this._getTreeElement(key);
		if (treeElement) {
			return Object.keys(treeElement);
		}
		return [];
	}

	_getTreeItem(key: string): vscode.TreeItem {
		const treeElement = this._getTreeElement(key);
		// An example of how to use codicons in a MarkdownString in a tree item tooltip.
		const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${key}`, true);
		return {
			label: /**vscode.TreeItemLabel**/<any>{ label: key, highlights: key.length > 1 ? [[key.length - 2, key.length - 1]] : void 0 },
			tooltip,
			collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
			resourceUri: vscode.Uri.parse(`/tmp/${key}`),
		};
	}

	_getTreeElement(element: string, tree?: any): Node {
		let toReturn = undefined;
		let currentNode = tree ?? this.tree;
		for (const prop in currentNode) {
			if (prop === element) {
				return currentNode[prop];
			} else {
				toReturn = this._getTreeElement(element, currentNode[prop]);
				if (toReturn) {
					return toReturn;
				}
			}
		}
	}

	_getParent(element: string, parent? : string, tree?): any {
		let toReturn = undefined;
		let currentNode = tree ?? this.tree;
		for (const prop in currentNode) {
			if (prop === element) {
				let tmp = {};
				tmp[parent] = currentNode;
				return tmp;
			} else {
				toReturn = this._getParent(element, prop, currentNode[prop]);
				if (toReturn) {
					return toReturn;
				}
			}
		}
	}

	_getNode(key: string): Node {
		if (!nodes[key]) {
			nodes[key] = new Key(key);
		}
		return nodes[key];
	}
}

const nodes = {};
type Node = { key: string };

class Key {
	constructor(readonly key: string) { }
}