import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		return new Promise(resolve => {
			if (element) {
				resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
			} else {
				const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
				if (this.pathExists(packageJsonPath)) {
					resolve(this.getDepsInPackageJson(packageJsonPath));
				} else {
					vscode.window.showInformationMessage('Workspace has no package.json');
					resolve([]);
				}
			}
		});
	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
		if (this.pathExists(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			const toDep = (moduleName: string): Dependency => {
				if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
					return new Dependency(moduleName, vscode.TreeItemCollapsibleState.Collapsed);
				} else {
					return new Dependency(moduleName, vscode.TreeItemCollapsibleState.None, {
						command: 'extension.openPackageOnNpm',
						title: '',
						arguments: [moduleName],
					});
				}
			}

			const deps = packageJson.dependencies
				? Object.keys(packageJson.dependencies).map(toDep)
				: [];
			const devDeps = packageJson.devDependencies
				? Object.keys(packageJson.devDependencies).map(toDep)
				: [];
			return deps.concat(devDeps);
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';

}