'use strict';

import * as vscode from 'vscode';
import { TreeExplorerNodeProvider } from 'vscode';

import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	const rootPath = vscode.workspace.rootPath;

	// The `providerId` here must be identical to `contributes.explorer.treeExplorerNodeProviderId` in package.json.
	vscode.window.registerTreeExplorerNodeProvider('depTree', new DepNodeProvider(rootPath));

	// This command will be invoked using exactly the node you provided in `resolveChildren`.
	vscode.commands.registerCommand('extension.openPackageOnNpm', (node: DepNode) => {
		if (node.kind === 'leaf') {
			vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${node.moduleName}`));
		}
	});
}

class DepNodeProvider implements TreeExplorerNodeProvider<DepNode> {
	constructor(private workspaceRoot: string) {

	}

	/**
	 * As root node is invisible, its label doesn't matter.
	 */
	getLabel(node: DepNode): string {
		return node.kind === 'root' ? '' : node.moduleName;
	}

	/**
	 * Leaf is unexpandable.
	 */
	getHasChildren(node: DepNode): boolean {
		return node.kind !== 'leaf';
	}

	/**
	 * Invoke `extension.openPackageOnNpm` command when a Leaf node is clicked.
	 */
	getClickCommand(node: DepNode): string {
		return node.kind === 'leaf' ? 'extension.openPackageOnNpm' : null;
	}

	provideRootNode(): DepNode {
		return new Root();
	}

	resolveChildren(node: DepNode): Thenable<DepNode[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		return new Promise((resolve) => {
			switch (node.kind) {
				case 'root':
					const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
					if (this.pathExists(packageJsonPath)) {
						resolve(this.getDepsInPackageJson(packageJsonPath));
					} else {
						vscode.window.showInformationMessage('Workspace has no package.json');
						resolve([]);
					}
					break;
				/**
				 * npm3 has flat dependencies, so indirect dependencies are still in `node_modules`.
				 */
				case 'node':
					resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', node.moduleName, 'package.json')));
					break;
				case 'leaf':
					resolve([]);
			}
		});
	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getDepsInPackageJson(packageJsonPath: string): DepNode[] {
		if (this.pathExists(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			const toDep = (moduleName: string): DepNode => {
				if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
					return new Node(moduleName);
				} else {
					return new Leaf(moduleName);
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

type DepNode = Root // Root node
	| Node // A dependency installed to `node_modules`
	| Leaf // A dependency not present in `node_modules`
	;

class Root {
	kind: 'root' = 'root';
}

class Node {
	kind: 'node' = 'node';

	constructor(
		public moduleName: string
	) {
	}
}

class Leaf {
	kind: 'leaf' = 'leaf'

	constructor(
		public moduleName: string
	) {
	}
}
