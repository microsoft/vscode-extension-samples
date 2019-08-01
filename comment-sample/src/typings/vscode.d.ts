declare module 'vscode' {

	/**
	 * Reactions of a [comment](#Comment)
	 */
	export interface CommentReaction {
		/**
		 * The human-readable label for the reaction
		 */
		readonly label: string;

		/**
		 * Icon for the reaction shown in UI.
		 */
		readonly iconPath: string | Uri;

		/**
		 * The number of users who have reacted to this reaction
		 */
		readonly count: number;

		/**
		 * Whether the [author](CommentAuthorInformation) of the comment has reacted to this reaction
		 */
		readonly authorHasReacted: boolean;
	}

	export interface Comment {
		reactions?: CommentReaction[];
	}

	export interface CommentController {
		/**
		 *
		 */
		reactionHandler?: (comment: Comment, reaction: CommentReaction) => Promise<void>;
	}
}