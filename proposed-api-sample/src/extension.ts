import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "proposed-api-sample" is now active!');

	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */

	vscode.commands.registerCommand('openBase64Variable', encoded => {
		openUntitledEditor(Buffer.from(encoded, 'base64').toString());
	});

	context.subscriptions.push(vscode.debug.registerDebugVisualizationProvider('base64Decoder', {
		provideDebugVisualization(context, token) {
			const v = new vscode.DebugVisualization('base64');
			v.iconPath = new vscode.ThemeIcon('rocket');
			v.visualization = {
				title: 'Decode base64',
				command: 'openBase64Variable',
				arguments: [context.variable.value],
			};

			return [v]
		},
	}));

	context.subscriptions.push(vscode.debug.registerDebugVisualizationTreeProvider<vscode.DebugTreeItem & { byte?: number; buffer: Buffer, context: vscode.DebugVisualizationContext }>('inlineBase64Decoder', {
		getTreeItem(context) {
			const decoded = Buffer.from(context.variable.value, 'base64')
			return {
				label: context.variable.name.toString(),
				description: decoded.toString(),
				collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
				buffer: decoded,
				canEdit: true,
				context,
			}
		},
		getChildren(element) {
			if (element.buffer) {
				return [...element.buffer].map((byte, i) => ({
					label: String(i),
					description: '0x' + byte.toString(16),
					canEdit: !!element.context.variable.evaluateName,
					byte: i,
					buffer: element.buffer,
					context: element.context,
				}));
			}
		},
		editItem(item, value) {
			if ('byte' in item) {
				const n = value.startsWith('0x') ? parseInt(value.slice(2), 16) : Math.floor(+value);
				if (isNaN(n)) {
					throw new Error(`cannot parse "${value}" as a number`);
				}
				item.buffer[item.byte!] = n;
				item.label = '0x' + n.toString(16);
			} else {
				item.buffer = Buffer.from(value);
				item.description = item.buffer.toString();
			}

			item.context.session.customRequest('setExpression', {
				expression: item.context.variable.evaluateName,
				frameId: item.context.frameId,
				value: JSON.stringify(item.buffer.toString('base64')),
			});

			return item;
		},
	}));

	context.subscriptions.push(vscode.debug.registerDebugVisualizationProvider('inlineBase64Decoder', {
		provideDebugVisualization(context, token) {
			const v = new vscode.DebugVisualization('inline base64');
			v.iconPath = new vscode.ThemeIcon('rocket');
			v.visualization = { treeId: 'inlineBase64Decoder' }
			return [v];
		},
	}));
}

const openUntitledEditor = async (contents: string) => {
  const untitledDoc = await vscode.workspace.openTextDocument({ content: contents });
  await vscode.window.showTextDocument(untitledDoc);
};
