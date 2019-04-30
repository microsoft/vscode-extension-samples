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

	//#region Comments

	/**
	 * Collapsible state of a [comment thread](#CommentThread)
	 */
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
	 * A collection of [comments](#Comment) representing a conversation at a particular range in a document.
	 */
	export interface CommentThread {
		/**
		 * A unique identifier of the comment thread.
		 */
		readonly id: string;

		/**
		 * The uri of the document the thread has been created on.
		 */
		readonly resource: Uri;

		/**
		 * The range the comment thread is located within the document. The thread icon will be shown
		 * at the first line of the range.
		 */
		readonly range: Range;

		/**
		 * The ordered comments of the thread.
		 */
		comments: Comment[];

		/**
		 * Whether the thread should be collapsed or expanded when opening the document.
		 * Defaults to Collapsed.
		 */
		collapsibleState: CommentThreadCollapsibleState;

		/**
		 * The optional human-readable label describing the [Comment Thread](#CommentThread)
		 */
		label?: string;

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
		 * The command to be executed when users try to delete the comment thread. Currently, this is only called
		 * when the user collapses a comment thread that has no comments in it.
		 */
		deleteCommand?: Command;

		/**
		 * Dispose this comment thread.
		 *
		 * Once disposed, this comment thread will be removed from visible editors and Comment Panel when approriate.
		 */
		dispose(): void;
	}

	/**
	 * A comment is displayed within the editor or the Comments Panel, depending on how it is provided.
	 */
	export class Comment {
		/**
		 * The id of the comment
		 */
		readonly id: string;

		/**
		 * The human-readable comment body
		 */
		readonly body: MarkdownString;

		/**
		 * The display name of the user who created the comment
		 */
		readonly userName: string;

		/**
		 * Optional label describing the [Comment](#Comment)
		 * Label will be rendered next to userName if exists.
		 */
		readonly label?: string;

		/**
		 * The icon path for the user who created the comment
		 */
		readonly userIconPath?: Uri;

		/**
		 * The command to be executed if the comment is selected in the Comments Panel
		 */
		readonly selectCommand?: Command;

		/**
		 * The command to be executed when users try to save the edits to the comment
		 */
		readonly editCommand?: Command;

		/**
		 * The command to be executed when users try to delete the comment
		 */
		readonly deleteCommand?: Command;

		/**
		 * @param id The id of the comment
		 * @param body The human-readable comment body
		 * @param userName The display name of the user who created the comment
		 */
		constructor(id: string, body: MarkdownString, userName: string);
	}

	/**
	 * The comment input box in Comment Widget.
	 */
	export interface CommentInputBox {
		/**
		 * Setter and getter for the contents of the comment input box
		 */
		value: string;

		/**
		 * The uri of the document comment input box has been created on
		 */
		resource: Uri;

		/**
		 * The range the comment input box is located within the document
		 */
		range: Range;
	}

	/**
	 * Commenting range provider for a [comment controller](#CommentController).
	 */
	export interface CommentingRangeProvider {
		/**
		 * Provide a list of ranges which allow new comment threads creation or null for a given document
		 */
		provideCommentingRanges(document: TextDocument, token: CancellationToken): ProviderResult<Range[]>;
	}

	/**
	 * Comment thread template for new comment thread creation.
	 */
	export interface CommentThreadTemplate {
		/**
		 * The human-readable label describing the [Comment Thread](#CommentThread)
		 */
		readonly label: string;

		/**
		 * Optional accept input command
		 *
		 * `acceptInputCommand` is the default action rendered on Comment Widget, which is always placed rightmost.
		 * This command will be invoked when users the user accepts the value in the comment editor.
		 * This command will disabled when the comment editor is empty.
		 */
		readonly acceptInputCommand?: Command;

		/**
		 * Optional additonal commands.
		 *
		 * `additionalCommands` are the secondary actions rendered on Comment Widget.
		 */
		readonly additionalCommands?: Command[];

		/**
		 * The command to be executed when users try to delete the comment thread. Currently, this is only called
		 * when the user collapses a comment thread that has no comments in it.
		 */
		readonly deleteCommand?: Command;
	}

	/**
	 * A comment controller is able to provide [comments](#CommentThread) support to the editor and
	 * provide users various ways to interact with comments.
	 */
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
		 * The active [comment input box](#CommentInputBox) or `undefined`. The active `inputBox` is the input box of
		 * the comment thread widget that currently has focus. It's `undefined` when the focus is not in any CommentInputBox.
		 */
		readonly inputBox: CommentInputBox | undefined;

		/**
		 * Optional comment thread template information.
		 *
		 * The comment controller will use this information to create the comment widget when users attempt to create new comment thread
		 * from the gutter or command palette.
		 *
		 * When users run `CommentThreadTemplate.acceptInputCommand` or `CommentThreadTemplate.additionalCommands`, extensions should create
		 * the approriate [CommentThread](#CommentThread).
		 *
		 * If not provided, users won't be able to create new comment threads in the editor.
		 */
		template?: CommentThreadTemplate;

		/**
		 * Optional commenting range provider. Provide a list [ranges](#Range) which support commenting to any given resource uri.
		 *
		 * If not provided and `emptyCommentThreadFactory` exits, users can leave comments in any document opened in the editor.
		 */
		commentingRangeProvider?: CommentingRangeProvider;

		/**
		 * Create a [comment thread](#CommentThread). The comment thread will be displayed in visible text editors (if the resource matches)
		 * and Comments Panel once created.
		 *
		 * @param id An `id` for the comment thread.
		 * @param resource The uri of the document the thread has been created on.
		 * @param range The range the comment thread is located within the document.
		 * @param comments The ordered comments of the thread.
		 */
		createCommentThread(id: string, resource: Uri, range: Range, comments: Comment[]): CommentThread;

		/**
		 * Dispose this comment controller.
		 *
		 * Once disposed, all [comment threads](#CommentThread) created by this comment controller will also be removed from the editor
		 * and Comments Panel.
		 */
		dispose(): void;
	}

	namespace comment {
		/**
		 * Creates a new [comment controller](#CommentController) instance.
		 *
		 * @param id An `id` for the comment controller.
		 * @param label A human-readable string for the comment controller.
		 * @return An instance of [comment controller](#CommentController).
		 */
		export function createCommentController(id: string, label: string): CommentController;
	}

	//#endregion

}
