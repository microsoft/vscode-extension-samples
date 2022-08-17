import * as vscode from 'vscode';

export class TestViewDragAndDrop implements vscode.TreeDataProvider<Node>, vscode.TreeDragAndDropController<Node> {
	dropMimeTypes = ['application/vnd.code.tree.testViewDragAndDrop'];
	dragMimeTypes = ['text/uri-list'];
	private _onDidChangeTreeData: vscode.EventEmitter<(Node | undefined)[] | undefined> = new vscode.EventEmitter<Node[] | undefined>();
	// We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
	public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
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
	// Keep track of any nodes we create so that we can re-use the same objects.
	private nodes: any = {};

	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('testViewDragAndDrop', { treeDataProvider: this, showCollapseAll: true, canSelectMany: true, dragAndDropController: this });
		context.subscriptions.push(view);
	}

	// Tree data provider 

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

	dispose(): void {
		// nothing to dispose
	}

	// Drag and drop controller

	public async handleDrop(target: Node | undefined, sources: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
		const transferItem = sources.get('application/vnd.code.tree.testViewDragAndDrop');
		if (!transferItem) {
			return;
		}
		const treeItems: Node[] = transferItem.value;
		let roots = this._getLocalRoots(treeItems);
		// Remove nodes that are already target's parent nodes
		roots = roots.filter(r => !this._isChild(this._getTreeElement(r.key), target));
		if (roots.length > 0) {
			// Reload parents of the moving elements
			const parents = roots.map(r => this.getParent(r));
			roots.forEach(r => this._reparentNode(r, target));
			this._onDidChangeTreeData.fire([...parents, target]);
		}
	}

	public async handleDrag(source: Node[], treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
		treeDataTransfer.set('application/vnd.code.tree.testViewDragAndDrop', new vscode.DataTransferItem(source));
	}

	// Helper methods

	_isChild(node: Node, child: Node | undefined): boolean {
		if (!child) {
			return false;
		}
		for (const prop in node) {
			if (prop === child.key) {
				return true;
			} else {
				const isChild = this._isChild((node as any)[prop], child);
				if (isChild) {
					return isChild;
				}
			}
		}
		return false;
	}

	// From the given nodes, filter out all nodes who's parent is already in the the array of Nodes.
	_getLocalRoots(nodes: Node[]): Node[] {
		const localRoots = [];
		for (let i = 0; i < nodes.length; i++) {
			const parent = this.getParent(nodes[i]);
			if (parent) {
				const isInList = nodes.find(n => n.key === parent.key);
				if (isInList === undefined) {
					localRoots.push(nodes[i]);
				}
			} else {
				localRoots.push(nodes[i]);
			}
		}
		return localRoots;
	}

	// Remove node from current position and add node to new target element
	_reparentNode(node: Node, target: Node | undefined): void {
		const element: any = {};
		element[node.key] = this._getTreeElement(node.key);
		const elementCopy = { ...element };
		this._removeNode(node);
		const targetElement = this._getTreeElement(target?.key);
		if (Object.keys(element).length === 0) {
			targetElement[node.key] = {};
		} else {
			Object.assign(targetElement, elementCopy);
		}
	}

	// Remove node from tree
	_removeNode(element: Node, tree?: any): void {
		const subTree = tree ? tree : this.tree;
		for (const prop in subTree) {
			if (prop === element.key) {
				const parent = this.getParent(element);
				if (parent) {
					const parentObject = this._getTreeElement(parent.key);
					delete parentObject[prop];
				} else {
					delete this.tree[prop];
				}
			} else {
				this._removeNode(element, subTree[prop]);
			}
		}
	}

	_getChildren(key: string | undefined): string[] {
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

	_getTreeElement(element: string | undefined, tree?: any): any {
		if (!element) {
			return this.tree;
		}
		const currentNode = tree ?? this.tree;
		for (const prop in currentNode) {
			if (prop === element) {
				return currentNode[prop];
			} else {
				const treeElement = this._getTreeElement(element, currentNode[prop]);
				if (treeElement) {
					return treeElement;
				}
			}
		}
	}

	_getParent(element: string, parent?: string, tree?: any): any {
		const currentNode = tree ?? this.tree;
		for (const prop in currentNode) {
			if (prop === element && parent) {
				return this._getNode(parent);
			} else {
				const parent = this._getParent(element, prop, currentNode[prop]);
				if (parent) {
					return parent;
				}
			}
		}
	}

	_getNode(key: string): Node {
		if (!this.nodes[key]) {
			this.nodes[key] = new Key(key);
		}
		return this.nodes[key];
	}
}

type Node = { key: string };

class Key {
	constructor(readonly key: string) { }
}