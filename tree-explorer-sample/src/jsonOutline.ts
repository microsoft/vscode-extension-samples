import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';

export class JsonOutlineProvider implements vscode.TreeDataProvider<json.Node> {

	private _onDidChange : vscode.EventEmitter<json.Node | null> = new vscode.EventEmitter<json.Node | null>();
	readonly onDidChange : vscode.Event<json.Node | null> = this._onDidChange.event;

	private tree: json.Node;
	private editor: vscode.TextEditor;

	constructor(private context: vscode.ExtensionContext) {
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (this.parseTree()) {
				this._onDidChange.fire();
			}
		});
		this.parseTree();
	}

	private parseTree() : boolean {
		this.editor = vscode.window.activeTextEditor;
		if (this.editor && this.editor.document.languageId === 'json') {
			this.tree = json.parseTree(this.editor.document.getText());
			return true;
		}
		return false;
	}

	getChildren(node?: json.Node): Thenable<json.Node[]> {
		if (node) {
			return Promise.resolve(node.parent.type === 'array' ? this.toArrayValueNode(node) : (node.type === 'array' ? node.children[0].children : node.children[1].children));
		} else {
			return Promise.resolve(this.tree.children);
		}
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
		return <vscode.TreeItem> {
			label: this.getLabel(node),
			collapsibleState: hasChildren ? vscode.TreeItemCollapsibleState.Collapsed : null,
			command: !hasChildren ? {
				command: 'extension.openJsonSelection',
				title: '',
			} : null,
			iconPath: this.getIcon(node)
		};
	}

	select(node: json.Node) {
		this.editor.selection = new vscode.Selection(this.editor.document.positionAt(node.offset), this.editor.document.positionAt(node.offset + node.length));
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

