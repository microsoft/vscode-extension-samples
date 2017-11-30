import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';

export class JsonOutlineProvider implements vscode.TreeDataProvider<json.Node> {

	private _onDidChangeTreeData: vscode.EventEmitter<json.Node | null> = new vscode.EventEmitter<json.Node | null>();
	readonly onDidChangeTreeData: vscode.Event<json.Node | null> = this._onDidChangeTreeData.event;

	private tree: json.Node;
	private text: string;
	private editor: vscode.TextEditor;

	constructor(private context: vscode.ExtensionContext) {
		vscode.window.onDidChangeActiveTextEditor(editor => {
			this.parseTree();
			this._onDidChangeTreeData.fire();
		});
		vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
		this.parseTree();
	}

	private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
		if (changeEvent.document.uri.toString() === this.editor.document.uri.toString()) {
			for (const change of changeEvent.contentChanges) {
				const location = json.getLocation(this.text, this.editor.document.offsetAt(change.range.start));
				const node = json.findNodeAtLocation(this.tree, location.path);
				this.parseTree();
				this._onDidChangeTreeData.fire(node);
			}
		}
	}

	private parseTree(): void {
		this.text = '';
		this.tree = null;
		this.editor = vscode.window.activeTextEditor;
		if (this.editor && this.editor.document && this.editor.document.languageId === 'json') {
			this.text = this.editor.document.getText();
			this.tree = json.parseTree(this.text);
		}
	}

	getChildren(node?: json.Node): Thenable<json.Node[]> {
		if (node) {
			return Promise.resolve(this._getChildren(node));
		} else {
			return Promise.resolve(this.tree ? this.tree.children : []);
		}
	}

	private _getChildren(node: json.Node): json.Node[] {
		return node.parent.type === 'array' ? this.toArrayValueNode(node) : (node.type === 'array' ? node.children[0].children : node.children[1].children);
	}

	private toArrayValueNode(node: json.Node): json.Node[] {
		if (node.type === 'array' || node.type === 'object') {
			return node.children;
		}
		node['arrayValue'] = true;
		return [node];
	}

	getTreeItem(node: json.Node): vscode.TreeItem {
		let valueNode = node.parent.type === 'array' ? node : node.children[1];
		let hasChildren = (node.parent.type === 'array' && !node['arrayValue']) || valueNode.type === 'object' || valueNode.type === 'array';
		let treeItem: vscode.TreeItem = new vscode.TreeItem(this.getLabel(node), hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
		treeItem.command = {
			command: 'extension.openJsonSelection',
			title: '',
			arguments: [new vscode.Range(this.editor.document.positionAt(node.offset), this.editor.document.positionAt(node.offset + node.length))]
		};
		treeItem.iconPath = this.getIcon(node);
		treeItem.contextValue = this.getNodeType(node);
		return treeItem;
	}

	select(range: vscode.Range) {
		this.editor.selection = new vscode.Selection(range.start, range.end);
	}

	private getIcon(node: json.Node): any {
		let nodeType = this.getNodeType(node);
		if (nodeType === 'boolean') {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'boolean.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'boolean.svg'))
			}
		}
		if (nodeType === 'string') {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'string.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'string.svg'))
			}
		}
		if (nodeType === 'number') {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'number.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'number.svg'))
			}
		}
		return null;
	}

	private getNodeType(node: json.Node): json.NodeType {
		if (node.parent.type === 'array') {
			return node.type;
		}
		return node.children[1].type;
	}

	private getLabel(node: json.Node): string {
		if (node.parent.type === 'array') {
			if (node['arrayValue']) {
				delete node['arrayValue'];
				if (!node.children) {
					return node.value.toString();
				}
			} else {
				return node.parent.children.indexOf(node).toString();
			}
		}
		const property = node.children[0].value.toString();
		if (node.children[1].type === 'object') {
			return '{ } ' + property;
		}
		if (node.children[1].type === 'array') {
			return '[ ] ' + property;
		}
		const value = this.editor.document.getText(new vscode.Range(this.editor.document.positionAt(node.children[1].offset), this.editor.document.positionAt(node.children[1].offset + node.children[1].length)))
		return `${property}: ${value}`;
	}
}

