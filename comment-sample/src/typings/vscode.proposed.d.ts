/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * This is the place for API experiments and proposals.
 * These API are NOT stable and subject to change. They are only available in the Insiders
 * distribution and CANNOT be used in published extensions.
 *
 * To test these API in local environment:
 * - Use Insiders release of VS Code.
 * - Add `"enableProposedApi": true` to your package.json.
 * - Copy this file to your project.
 */

declare module 'vscode' {
	export enum CommentThreadCollapsibleState {
		/**
		 * Determines an item is collapsed
		 */
		Collapsed = 0,
		/**
		 * Determines an item is expanded
		 */
		Expanded = 1
	}

	/**
	 * A collection of comments representing a conversation at a particular range in a document.
	 */
	interface CommentThread {
		/**
		 * A unique identifier of the comment thread.
		 */
		threadId: string;

		/**
		 * The uri of the document the thread has been created on.
		 */
		resource: Uri;

		/**
		 * The range the comment thread is located within the document. The thread icon will be shown
		 * at the first line of the range.
		 */
		range: Range;

		/**
		 * Label describing the [Comment Thread](#CommentThread)
		 */
		label: string;

		/**
		 * The ordered comments of the thread.
		 */
		comments: Comment[];
		/**
		 * `acceptInputCommand` is the default action rendered on Comment Widget, which is always placed rightmost.
		 * It will be executed when users submit the comment from keyboard shortcut.
		 * This action is disabled when the comment editor is empty.
		 */
		acceptInputCommand?: Command;

		/**
		 * `additionalCommands` are the secondary actions rendered on Comment Widget.
		 */
		additionalCommands?: Command[];

		/**
		 * Whether the thread should be collapsed or expanded when opening the document. Defaults to Collapsed.
		 */
		collapsibleState?: CommentThreadCollapsibleState;
		dispose(): void;
	}

	/**
	 * A comment is displayed within the editor or the Comments Panel, depending on how it is provided.
	 */
	interface Comment {
		/**
		 * The id of the comment
		 */
		commentId: string;

		/**
		 * The text of the comment
		 */
		body: MarkdownString;
		label?: string;

		/**
		 * The display name of the user who created the comment
		 */
		userName: string;

		/**
		 * The icon path for the user who created the comment
		 */
		userIconPath?: Uri;

		/**
		 * The command to be executed if the comment is selected in the Comments Panel
		 */
		command?: Command;

		editCommand?: Command;
		deleteCommand?: Command;
		commentReactions?: CommentReaction[];
	}

	interface CommentReaction {
		readonly label?: string;
		readonly iconPath?: string | Uri;
		count?: number;
		readonly hasReacted?: boolean;
	}

	export interface CommentInputBox {

		/**
		 * Setter and getter for the contents of the input box.
		 */
		value: string;
	}

	export interface CommentController {
		readonly id: string;
		readonly label: string;
		/**
		 * The active (focused) comment input box.
		 */
		readonly inputBox?: CommentInputBox;
		createCommentThread(id: string, resource: Uri, range: Range): CommentThread;
		/**
		 * Provide a list [ranges](#Range) which support commenting to any given resource uri.
		 *
		 * @param uri The uri of the resource open in a text editor.
		 * @param callback, a handler called when users attempt to create a new comment thread, either from the gutter or command palette
		 * @param token A cancellation token.
		 * @return A thenable that resolves to a list of commenting ranges or null and undefined if the provider
		 * does not want to participate or was cancelled.
		 */
		registerCommentingRangeProvider(provider: (document: TextDocument, token: CancellationToken) => ProviderResult<Range[]>, callback: (document: TextDocument, range: Range) => void): void;
		dispose(): void;
	}

	namespace comment {
		export function createCommentController(id: string, label: string): CommentController;
	}

	//#endregion
}
