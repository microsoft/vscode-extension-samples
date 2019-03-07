'use strict';

import * as vscode from 'vscode';

let threadId = 0;
let commentId = 0;

export function activate(context: vscode.ExtensionContext) {
	const commentController = vscode.comment.createCommentController('comment-sample', 'Comment API Sample');
	context.subscriptions.push(commentController);

	const provideCommentingRange = (document: vscode.TextDocument, token: vscode.CancellationToken) => {
		let lineCount = document.lineCount;
		return [new vscode.Range(0, 0, lineCount - 1, 0)];
	};

	const newCommentWidgetCallback = (document: vscode.TextDocument, range: vscode.Range) => {
		let thread = commentController.createCommentThread(`${++threadId}`, document.uri, range);
		thread.collapsibleState = vscode.CommentThreadCollapsibleState.Expanded;
		thread.label = 'Create New Note';
		thread.acceptInputCommands = [
			{
				title: 'Create Note',
				command: 'mywiki.createNote',
				arguments: [
					commentController,
					thread
				]
			}
		];
	};

	commentController.registerCommentingRangeProvider(provideCommentingRange, newCommentWidgetCallback);

	context.subscriptions.push(vscode.commands.registerCommand('mywiki.createNote', (commentController: vscode.CommentController, thread: vscode.CommentThread) => {
		if (commentController.inputBox) {
			let text = commentController.inputBox.value;
			let markedString = new vscode.MarkdownString(text);
			let newComment: vscode.Comment = { commentId: `${++commentId}`, body: markedString, userName: 'vscode' };

			thread.comments = [newComment];
			thread.label = 'Participants: vscode';
			thread.acceptInputCommands = [
				{
					title: 'Create Comment',
					command: 'mywiki.createComment',
					arguments: [
						commentController,
						thread
					]
				}
			];

			commentController.inputBox.value = '';
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('mywiki.createComment', (commentController: vscode.CommentController, thread: vscode.CommentThread) => {
		if (commentController.inputBox) {
			let text = commentController.inputBox.value;
			let markedString = new vscode.MarkdownString(text);
			let newComment: vscode.Comment = { commentId: `${++commentId}`, body: markedString, userName: 'vscode' };

			thread.comments = [...thread.comments, newComment];
			commentController.inputBox.value = '';
		}
	}));
}
