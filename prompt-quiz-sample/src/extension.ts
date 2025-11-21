/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { commands, window, ExtensionContext, workspace, tasks } from 'vscode';
import { runQuiz } from './runQuiz';
import { QuizTaskProvider } from './quizTaskProvider';

export function activate(context: ExtensionContext) {
	// Register quiz command
	const disposable = commands.registerCommand('prompt-quiz-sample.quiz', async () => {
		const config = workspace.getConfiguration('prompt-quiz-sample');
		const showStartPrompt = config.get<boolean>('startPrompt', true);
		
		if (showStartPrompt) {
			const initialPrompt = await window.showInputBox({
				prompt: 'Start quiz? yes[y] or no[n]',
				placeHolder: 'Prompt quiz asking sequence of questions, and verifying answer.',
				validateInput: text => {
					const lowText = text.toLowerCase();
					if (lowText.indexOf("y") > -1) {
						return null;
					} else {
						return "n";
					}
				}
			});
			if (initialPrompt !== undefined) {
				window.showInformationMessage("Prompt Quiz Started");
				runQuiz();
			} else {
				window.showInformationMessage("Prompt Quiz Canceled.");
			}
		} else {
			// Skip prompt and start quiz directly
			runQuiz();
		}
	});

	context.subscriptions.push(disposable);

	// Register task provider
	const workspaceRoot = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
		? workspace.workspaceFolders[0].uri.fsPath
		: '';
	
	if (workspaceRoot) {
		const quizTaskProvider = tasks.registerTaskProvider(
			QuizTaskProvider.quizType,
			new QuizTaskProvider(workspaceRoot)
		);
		context.subscriptions.push(quizTaskProvider);
	}
}

export function deactivate() {}
