'use strict';

import * as vscode from 'vscode';

let commentId = 1;

class NoteComment implements vscode.Comment {
	id: number;
	constructor(
		public body: string | vscode.MarkdownString,
		public mode: vscode.CommentMode,
		public author: vscode.CommentAuthorInformation,
		public parent?: vscode.CommentThread
	) {
		this.id = ++commentId;
	}
}

export function activate(context: vscode.ExtensionContext) {
	// A `CommentController` is able to provide comments for documents.
	const commentController = vscode.comment.createCommentController('comment-sample', 'Comment API Sample');
	context.subscriptions.push(commentController);

	// commenting range provider
	commentController.commentingRangeProvider = {
		provideCommentingRanges: (document: vscode.TextDocument, token: vscode.CancellationToken) => {
			let lineCount = document.lineCount;
			return [new vscode.Range(0, 0, lineCount - 1, 0)];
		}
	};
	
	let replyNote = (reply: vscode.CommentReply) => {
		let thread = reply.thread;
		let newComment = new NoteComment(reply.text, vscode.CommentMode.Preview, { name: 'vscode' }, thread);
		thread.comments = [...thread.comments, newComment];
	}

	context.subscriptions.push(vscode.commands.registerCommand('mywiki.createNote', replyNote));
	context.subscriptions.push(vscode.commands.registerCommand('mywiki.replyNote', replyNote));
	context.subscriptions.push(vscode.commands.registerCommand('mywiki.deleteNoteComment', (comment: NoteComment) => {
		let thread = comment.parent;
		thread.comments = thread.comments.filter((cmt: NoteComment) => cmt.id == comment.id);
		
		if (thread.comments.length === 0) {
			thread.dispose();
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('mywiki.deleteNote', (thread: vscode.CommentThread) => {
		thread.dispose();
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('mywiki.editNote', (comment: NoteComment) => {
		comment.parent.comments = comment.parent.comments.map((cmt: NoteComment) => {
			if (cmt.id === comment.id) { 
				cmt.mode = vscode.CommentMode.Editing;
			}
			
			return cmt;
		});
	}));
}
