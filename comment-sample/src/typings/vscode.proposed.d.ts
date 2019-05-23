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

	export enum CommentMode {
		Editing = 0,
		Preview = 1
	}

	/**
	 * A collection of [comments](#Comment) representing a conversation at a particular range in a document.
	 */
	export interface CommentThread {
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
		comments: ReadonlyArray<Comment>;

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
		 * Context value of the comment thread. This can be used to contribute thread specific actions.
		 * For example, a comment thread is given a context value as `editable`. When contributing actions to `comments/commentThread/title`
		 * using `menus` extension point, you can specify context value for key `commentThread` in `when` expression like `commentThread == editable`.
		 * ```
		 *	"contributes": {
		 *		"menus": {
		 *			"comments/commentThread/title": [
		 *				{
		 *					"command": "extension.deleteCommentThread",
		 *					"when": "commentThread == editable"
		 *				}
		 *			]
		 *		}
		 *	}
		 * ```
		 * This will show action `extension.deleteCommentThread` only for comment threads with `contextValue` is `editable`.
		 */
		contextValue?: string;

		/**
		 * Dispose this comment thread.
		 *
		 * Once disposed, this comment thread will be removed from visible editors and Comment Panel when approriate.
		 */
		dispose(): void;
	}

	/**
	 * Author information of a [comment](#Comment)
	 */
	export interface CommentAuthorInformation {
		/**
		 * The display name of the author of the comment
		 */
		name: string;

		/**
		 * The optional icon path for the author
		 */
		iconPath?: Uri;
	}

	/**
	 * A comment is displayed within the editor or the Comments Panel, depending on how it is provided.
	 */
	export interface Comment {
		/**
		 * The human-readable comment body
		 */
		body: string | MarkdownString;

		mode: CommentMode;

		/**
		 * The author information of the comment
		 */
		author: CommentAuthorInformation;

		/**
		 * Optional label describing the [Comment](#Comment)
		 * Label will be rendered next to authorName if exists.
		 */
		label?: string;

		/**
		 * Context value of the comment. This can be used to contribute comment specific actions.
		 * For example, a comment is given a context value as `editable`. When contributing actions to `comments/comment/title`
		 * using `menus` extension point, you can specify context value for key `comment` in `when` expression like `comment == editable`.
		 * ```
		 *	"contributes": {
		 *		"menus": {
		 *			"comments/comment/title": [
		 *				{
		 *					"command": "extension.deleteComment",
		 *					"when": "comment == editable"
		 *				}
		 *			]
		 *		}
		 *	}
		 * ```
		 * This will show action `extension.deleteComment` only for comments with `contextValue` is `editable`.
		 */
		contextValue?: string;
	}

	export interface CommentReply {
		thread: CommentThread;

		text: string;
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
		createCommentThread(uri: Uri, range: Range, comments: Comment[]): CommentThread;

		/**
		 * Dispose this comment controller.
		 *
		 * Once disposed, all [comment threads](#CommentThread) created by this comment controller will also be removed from the editor
		 * and Comments Panel.
		 */
		dispose(): void;
	}

	namespace comments {
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
