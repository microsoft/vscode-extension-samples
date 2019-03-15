import { Range } from "vscode";

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
		 * The human-readable label describing the [Comment Thread](#CommentThread)
		 */
		label: string;

		/**
		 * The ordered comments of the thread.
		 */
		comments: Comment[];

		/**
		 * Optional accept input command
		 *
		 * `acceptInputCommand` is the default action rendered on Comment Widget, which is always placed rightmost.
		 * This command will be invoked when users the user accepts the value in the comment editor.
		 * This command will disabled when the comment editor is empty.
		 */
		acceptInputCommand?: Command;

		/**
		 * Optional additonal commands.
		 *
		 * `additionalCommands` are the secondary actions rendered on Comment Widget.
		 */
		additionalCommands?: Command[];

		/**
		 * Whether the thread should be collapsed or expanded when opening the document.
		 * Defaults to Collapsed.
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
		selectCommand?: Command;

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

	export interface CommentingRangeProvider {
		provideCommentingRanges(document: TextDocument, token: CancellationToken): ProviderResult<Range[]>;
	}

	export interface EmptyCommentThreadFactory {
		/**
		 * The method `createEmptyCommentThread` is called when users attempt to create new comment thread from the gutter or command palette.
		 * Extensions still need to call `createCommentThread` inside this call when appropriate.
		 */
		createEmptyCommentThread(document: TextDocument, range: Range): ProviderResult<void>;
	}

	export interface CommentController {
		/**
		 * The id of this comment controller.
		 */
		readonly id: string;

		/**
		 * The human-readable label of this comment controller.
		 */
		readonly label: string;

		/**
		 * The active (focused) [comment input box](#CommentInputBox).
		 */
		readonly inputBox?: CommentInputBox;
		createCommentThread(id: string, resource: Uri, range: Range, comments: Comment[]): CommentThread;

		/**
		 * Optional commenting range provider.
		 * Provide a list [ranges](#Range) which support commenting to any given resource uri.
		 */
		commentingRangeProvider?: CommentingRangeProvider;

		/**
		 * Optional new comment thread factory.
		 */
		emptyCommentThreadFactory?: EmptyCommentThreadFactory;

		/**
		 * Dispose this comment controller.
		 */
		dispose(): void;
	}

	namespace comment {
		export function createCommentController(id: string, label: string): CommentController;
	}

	//#endregion
}
