import { renderPrompt, renderElementJSON } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
import { MyCustomPrompt, TestPrompt } from './asdf';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "proposed-api-sample" is now active!');

	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */

	vscode.lm.registerTool('myTestTool', {
		async invoke(context, token): Promise<vscode.LanguageModelToolResult> {
			return {
				'mytype': await renderElementJSON(MyCustomPrompt, {}, context, token),
				toString() {
					return 'hello world!';
				}
			};
		},
	});

	const disposable = vscode.commands.registerCommand('extension.helloWorld', async () => {
		const result = await vscode.lm.invokeTool('myTestTool', {
			parameters: {},
		}, new vscode.CancellationTokenSource().token);

		console.log(result);

		const rendered = await renderPrompt(
			TestPrompt,
			{ userQuery: result['mytype'] },
			{ modelMaxPromptTokens: 4096 },
			{
				tokenLength(text, token) {
					return text.split(' ').length;
				},
				countMessageTokens(message) {
					return message.content.split(' ').length;
				}
			},
		);

		console.log(JSON.stringify( rendered, null, 2));
	});

	context.subscriptions.push(disposable);
}
