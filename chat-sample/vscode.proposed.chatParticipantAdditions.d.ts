/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

declare module 'vscode' {

	export interface ChatParticipant {
		onDidPerformAction: Event<ChatUserActionEvent>;
	}

	/**
	 * Now only used for the "intent detection" API below
	 */
	export interface ChatCommand {
		readonly name: string;
		readonly description: string;
	}

	export class ChatResponseDetectedParticipantPart {
		participant: string;
		// TODO@API validate this against statically-declared slash commands?
		command?: ChatCommand;
		constructor(participant: string, command?: ChatCommand);
	}

	export interface ChatVulnerability {
		title: string;
		description: string;
		// id: string; // Later we will need to be able to link these across multiple content chunks.
	}

	export class ChatResponseMarkdownWithVulnerabilitiesPart {
		value: MarkdownString;
		vulnerabilities: ChatVulnerability[];
		constructor(value: string | MarkdownString, vulnerabilities: ChatVulnerability[]);
	}

	export class ChatResponseCodeblockUriPart {
		value: Uri;
		constructor(value: Uri);
	}

	/**
	 * Displays a {@link Command command} as a button in the chat response.
	 */
	export interface ChatCommandButton {
		command: Command;
	}

	export interface ChatDocumentContext {
		uri: Uri;
		version: number;
		ranges: Range[];
	}

	export class ChatResponseTextEditPart {
		uri: Uri;
		edits: TextEdit[];
		isDone?: boolean;
		constructor(uri: Uri, done: true);
		constructor(uri: Uri, edits: TextEdit | TextEdit[]);
	}

	export class ChatResponseConfirmationPart {
		title: string;
		message: string;
		data: any;
		buttons?: string[];
		constructor(title: string, message: string, data: any, buttons?: string[]);
	}

	export class ChatResponseCodeCitationPart {
		value: Uri;
		license: string;
		snippet: string;
		constructor(value: Uri, license: string, snippet: string);
	}

	export class ChatResponseChoicesPart {
		title: string;
		message: string;
		items: Array<string | ChatResponseChoice>;
		disableAfterUse: boolean;
		constructor(title: string, message: string, items: Array<string | ChatResponseChoice>);
	}

	export type ExtendedChatResponsePart = ChatResponsePart | ChatResponseTextEditPart | ChatResponseDetectedParticipantPart | ChatResponseConfirmationPart | ChatResponseCodeCitationPart | ChatResponseReferencePart2 | ChatResponseMovePart | ChatResponseChoicesPart;

	export class ChatResponseWarningPart {
		value: MarkdownString;
		constructor(value: string | MarkdownString);
	}

	export class ChatResponseProgressPart2 extends ChatResponseProgressPart {
		value: string;
		task?: (progress: Progress<ChatResponseWarningPart | ChatResponseReferencePart>) => Thenable<string | void>;
		constructor(value: string, task?: (progress: Progress<ChatResponseWarningPart | ChatResponseReferencePart>) => Thenable<string | void>);
	}

	export class ChatResponseReferencePart2 {
		/**
		 * The reference target.
		 */
		value: Uri | Location | { variableName: string; value?: Uri | Location } | string;

		/**
		 * The icon for the reference.
		 */
		iconPath?: Uri | ThemeIcon | {
			/**
			 * The icon path for the light theme.
			 */
			light: Uri;
			/**
			 * The icon path for the dark theme.
			 */
			dark: Uri;
		};
		options?: { status?: { description: string; kind: ChatResponseReferencePartStatusKind } };

		/**
		 * Create a new ChatResponseReferencePart.
		 * @param value A uri or location
		 * @param iconPath Icon for the reference shown in UI
		 */
		constructor(value: Uri | Location | { variableName: string; value?: Uri | Location } | string, iconPath?: Uri | ThemeIcon | {
			/**
			 * The icon path for the light theme.
			 */
			light: Uri;
			/**
			 * The icon path for the dark theme.
			 */
			dark: Uri;
		}, options?: { status?: { description: string; kind: ChatResponseReferencePartStatusKind } });
	}

	export class ChatResponseMovePart {

		readonly uri: Uri;
		readonly range: Range;

		constructor(uri: Uri, range: Range);
	}

	export interface ChatResponseAnchorPart {
		/**
		 * The target of this anchor.
		 *
		 * If this is a {@linkcode Uri} or {@linkcode Location}, this is rendered as a normal link.
		 *
		 * If this is a {@linkcode SymbolInformation}, this is rendered as a symbol link.
		 *
		 * TODO mjbvz: Should this be a full `SymbolInformation`? Or just the parts we need?
		 * TODO mjbvz: Should we allow a `SymbolInformation` without a location? For example, until `resolve` completes?
		 */
		value2: Uri | Location | SymbolInformation;

		/**
		 * Optional method which fills in the details of the anchor.
		 *
		 * THis is currently only implemented for symbol links.
		 */
		resolve?(token: CancellationToken): Thenable<void>;
	}

	/**
	 * Represents an action shown in {@link ChatResponseStream.choices}.
	 */
	export interface ChatResponseChoice {
		/**
		 * A short title for the choice, like 'Accept'.
		 */
		title: string;
	}

	export interface ChatChoicesOptions {
		/**
		 * The title of the choices show in the UI.
		 */
		title: string;

		/**
		 * The message to show in the UI.
		 */
		message: string;

		/**
		 * If set to true, the choices buttons will be disabled once any of them are actioned.
		 */
		disableAfterUse?: boolean;
	}

	export interface ChatResponseStream {

		/**
		 * Push a progress part to this stream. Short-hand for
		 * `push(new ChatResponseProgressPart(value))`.
		*
		* @param value A progress message
		* @param task If provided, a task to run while the progress is displayed. When the Thenable resolves, the progress will be marked complete in the UI, and the progress message will be updated to the resolved string if one is specified.
		* @returns This stream.
		*/
		progress(value: string, task?: (progress: Progress<ChatResponseWarningPart | ChatResponseReferencePart>) => Thenable<string | void>): void;

		textEdit(target: Uri, edits: TextEdit | TextEdit[]): void;

		textEdit(target: Uri, isDone: true): void;

		markdownWithVulnerabilities(value: string | MarkdownString, vulnerabilities: ChatVulnerability[]): void;
		codeblockUri(uri: Uri): void;
		detectedParticipant(participant: string, command?: ChatCommand): void;
		push(part: ChatResponsePart | ChatResponseTextEditPart | ChatResponseDetectedParticipantPart | ChatResponseWarningPart | ChatResponseProgressPart2): void;

		/**
		 * Show an inline message in the chat view asking the user to confirm an action.
		 * Multiple confirmations may be shown per response. The UI might show "Accept All" / "Reject All" actions.
		 * @param title The title of the confirmation entry
		 * @param message An extra message to display to the user
		 * @param data An arbitrary JSON-stringifiable object that will be included in the ChatRequest when
		 * the confirmation is accepted or rejected
		 * TODO@API should this be MarkdownString?
		 * TODO@API should actually be a more generic function that takes an array of buttons
		 */
		confirmation(title: string, message: string, data: any, buttons?: string[]): void;

		/**
		 * Show a message with choices to the user. Items will be presented as clickable buttons.
		 * A choice will result in another chat request being made {@link ChatRequest.choiceData}.
		 *
		 * @param title The title of the confirmation entry
		 * @param message An extra message to display to the user
		 * @param items Items to display
		 */
		choices<T extends string>(title: string, message: string, ...items: T[]): void;

		/**
		 * Show a message with choices to the user. Items will be presented as clickable buttons.
		 * A choice will result in another chat request being made {@link ChatRequest.choiceData}.
		 * Additional JSON-stringifiable data can be provided on each item when given as an object,
		 * and will be included in the `choiceData`.
		 *
		 * @param title Title to show.
		 * @param message The message to show.
		 * @param items A set of items that will be rendered as actions in the message.
		 */
		choices<T extends string | ChatResponseChoice>(title: string, message: string, ...items: T[]): void;

		/**
		 * Show a message with choices to the user. Items will be presented as clickable buttons.
		 * A choice will result in another chat request being made {@link ChatRequest.choiceData}.
		 * Additional JSON-stringifiable data can be provided on each item when given as an object,
		 * and will be included in the `choiceData`.
		 *
		 * @param options Configuration for the choices.
		 * @param items A set of items that will be rendered as actions in the message.
		 */
		choices<T extends string | ChatResponseChoice>(options: ChatChoicesOptions, ...items: T[]): void;

		/**
		 * Push a warning to this stream. Short-hand for
		 * `push(new ChatResponseWarningPart(message))`.
		 *
		 * @param message A warning message
		 * @returns This stream.
		 */
		warning(message: string | MarkdownString): void;

		reference(value: Uri | Location | { variableName: string; value?: Uri | Location }, iconPath?: Uri | ThemeIcon | { light: Uri; dark: Uri }): void;

		reference2(value: Uri | Location | string | { variableName: string; value?: Uri | Location }, iconPath?: Uri | ThemeIcon | { light: Uri; dark: Uri }, options?: { status?: { description: string; kind: ChatResponseReferencePartStatusKind } }): void;

		codeCitation(value: Uri, license: string, snippet: string): void;

		push(part: ExtendedChatResponsePart): void;
	}

	export enum ChatResponseReferencePartStatusKind {
		Complete = 1,
		Partial = 2,
		Omitted = 3
	}

	/**
	 * Does this piggy-back on the existing ChatRequest, or is it a different type of request entirely?
	 * Does it show up in history?
	 */
	export interface ChatRequest {
		/**
		 * The `data` for any confirmations that were accepted
		 */
		acceptedConfirmationData?: any[];

		/**
		 * The `data` for any confirmations that were rejected
		 */
		rejectedConfirmationData?: any[];

		/**
		 * The data for any choices that were made. The data is the item passed
		 * to the original {@link ChatResponseStream.choices} call: either a string
		 * or a JSON-deserialized {@link ChatResponseChoice} object.
		 */
		choiceData?: Array<string | ChatResponseChoice>;
	}

	// TODO@API fit this into the stream
	export interface ChatUsedContext {
		documents: ChatDocumentContext[];
	}

	export interface ChatParticipant {
		/**
		 * Provide a set of variables that can only be used with this participant.
		 */
		participantVariableProvider?: { provider: ChatParticipantCompletionItemProvider; triggerCharacters: string[] };
	}

	export interface ChatParticipantCompletionItemProvider {
		provideCompletionItems(query: string, token: CancellationToken): ProviderResult<ChatCompletionItem[]>;
	}

	export class ChatCompletionItem {
		id: string;
		label: string | CompletionItemLabel;
		values: ChatVariableValue[];
		fullName?: string;
		icon?: ThemeIcon;
		insertText?: string;
		detail?: string;
		documentation?: string | MarkdownString;
		command?: Command;

		constructor(id: string, label: string | CompletionItemLabel, values: ChatVariableValue[]);
	}

	export type ChatExtendedRequestHandler = (request: ChatRequest, context: ChatContext, response: ChatResponseStream, token: CancellationToken) => ProviderResult<ChatResult | void>;

	export interface ChatResult {
		nextQuestion?: {
			prompt: string;
			participant?: string;
			command?: string;
		};
	}

	export namespace chat {
		/**
		 * Create a chat participant with the extended progress type
		 */
		export function createChatParticipant(id: string, handler: ChatExtendedRequestHandler): ChatParticipant;

		export function registerChatParticipantDetectionProvider(participantDetectionProvider: ChatParticipantDetectionProvider): Disposable;
	}

	export interface ChatParticipantMetadata {
		participant: string;
		command?: string;
		disambiguation: { category: string; description: string; examples: string[] }[];
	}

	export interface ChatParticipantDetectionResult {
		participant: string;
		command?: string;
	}

	export interface ChatParticipantDetectionProvider {
		provideParticipantDetection(chatRequest: ChatRequest, context: ChatContext, options: { participants?: ChatParticipantMetadata[]; location: ChatLocation }, token: CancellationToken): ProviderResult<ChatParticipantDetectionResult>;
	}

	/**
	 * The location at which the chat is happening.
	 */
	export enum ChatLocation {
		/**
		 * The chat panel
		 */
		Panel = 1,
		/**
		 * Terminal inline chat
		 */
		Terminal = 2,
		/**
		 * Notebook inline chat
		 */
		Notebook = 3,
		/**
		 * Code editor inline chat
		 */
		Editor = 4,
		/**
		 * Chat is happening in an editing session
		 */
		EditingSession = 5,
	}

	/*
	 * User action events
	 */

	export enum ChatCopyKind {
		// Keyboard shortcut or context menu
		Action = 1,
		Toolbar = 2
	}

	export interface ChatCopyAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'copy';
		codeBlockIndex: number;
		copyKind: ChatCopyKind;
		copiedCharacters: number;
		totalCharacters: number;
		copiedText: string;
	}

	export interface ChatInsertAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'insert';
		codeBlockIndex: number;
		totalCharacters: number;
		newFile?: boolean;
	}

	export interface ChatApplyAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'apply';
		codeBlockIndex: number;
		totalCharacters: number;
		newFile?: boolean;
		codeMapper?: string;
	}

	export interface ChatTerminalAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'runInTerminal';
		codeBlockIndex: number;
		languageId?: string;
	}

	export interface ChatCommandAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'command';
		commandButton: ChatCommandButton;
	}

	export interface ChatFollowupAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'followUp';
		followup: ChatFollowup;
	}

	export interface ChatBugReportAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'bug';
	}

	export interface ChatEditorAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'editor';
		accepted: boolean;
	}

	export interface ChatEditingSessionAction {
		// eslint-disable-next-line local/vscode-dts-string-type-literals
		kind: 'chatEditingSessionAction';
		uri: Uri;
		hasRemainingEdits: boolean;
		outcome: ChatEditingSessionActionOutcome;
	}

	export enum ChatEditingSessionActionOutcome {
		Accepted = 1,
		Rejected = 2,
		Saved = 3
	}

	export interface ChatUserActionEvent {
		readonly result: ChatResult;
		readonly action: ChatCopyAction | ChatInsertAction | ChatApplyAction | ChatTerminalAction | ChatCommandAction | ChatFollowupAction | ChatBugReportAction | ChatEditorAction | ChatEditingSessionAction;
	}

	export interface ChatPromptReference {
		/**
		 * TODO Needed for now to drive the variableName-type reference, but probably both of these should go away in the future.
		 */
		readonly name: string;
	}

	export interface ChatResultFeedback {
		readonly unhelpfulReason?: string;
	}

	export namespace lm {
		export function fileIsIgnored(uri: Uri, token: CancellationToken): Thenable<boolean>;
	}
}


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

declare module 'vscode' {

	export namespace chat {

		/**
		 * Register a variable which can be used in a chat request to any participant.
		 * @param id A unique ID for the variable.
		 * @param name The name of the variable, to be used in the chat input as `#name`.
		 * @param userDescription A description of the variable for the chat input suggest widget.
		 * @param modelDescription A description of the variable for the model.
		 * @param isSlow Temp, to limit access to '#codebase' which is not a 'reference' and will fit into a tools API later.
		 * @param resolver Will be called to provide the chat variable's value when it is used.
		 * @param fullName The full name of the variable when selecting context in the picker UI.
		 * @param icon An icon to display when selecting context in the picker UI.
		 */
		export function registerChatVariableResolver(id: string, name: string, userDescription: string, modelDescription: string | undefined, isSlow: boolean | undefined, resolver: ChatVariableResolver, fullName?: string, icon?: ThemeIcon): Disposable;
	}

	export interface ChatVariableValue {
		/**
		 * The detail level of this chat variable value. If possible, variable resolvers should try to offer shorter values that will consume fewer tokens in an LLM prompt.
		 */
		level: ChatVariableLevel;

		/**
		 * The variable's value, which can be included in an LLM prompt as-is, or the chat participant may decide to read the value and do something else with it.
		 */
		value: string | Uri;

		/**
		 * A description of this value, which could be provided to the LLM as a hint.
		 */
		description?: string;
	}

	// TODO@API align with ChatRequest
	export interface ChatVariableContext {
		/**
		 * The message entered by the user, which includes this variable.
		 */
		// TODO@API AS-IS, variables as types, agent/commands stripped
		prompt: string;

		// readonly variables: readonly ChatResolvedVariable[];
	}

	export interface ChatVariableResolver {
		/**
		 * A callback to resolve the value of a chat variable.
		 * @param name The name of the variable.
		 * @param context Contextual information about this chat request.
		 * @param token A cancellation token.
		 */
		resolve(name: string, context: ChatVariableContext, token: CancellationToken): ProviderResult<ChatVariableValue[]>;

		/**
		 * A callback to resolve the value of a chat variable.
		 * @param name The name of the variable.
		 * @param context Contextual information about this chat request.
		 * @param token A cancellation token.
		*/
		resolve2?(name: string, context: ChatVariableContext, stream: ChatVariableResolverResponseStream, token: CancellationToken): ProviderResult<ChatVariableValue[]>;
	}


	/**
	 * The detail level of this chat variable value.
	 */
	export enum ChatVariableLevel {
		Short = 1,
		Medium = 2,
		Full = 3
	}

	export interface ChatVariableResolverResponseStream {
		/**
		 * Push a progress part to this stream. Short-hand for
		 * `push(new ChatResponseProgressPart(value))`.
		 *
		 * @param value
		 * @returns This stream.
		 */
		progress(value: string): ChatVariableResolverResponseStream;

		/**
		 * Push a reference to this stream. Short-hand for
		 * `push(new ChatResponseReferencePart(value))`.
		 *
		 * *Note* that the reference is not rendered inline with the response.
		 *
		 * @param value A uri or location
		 * @returns This stream.
		 */
		reference(value: Uri | Location): ChatVariableResolverResponseStream;

		/**
		 * Pushes a part to this stream.
		 *
		 * @param part A response part, rendered or metadata
		 */
		push(part: ChatVariableResolverResponsePart): ChatVariableResolverResponseStream;
	}

	export type ChatVariableResolverResponsePart = ChatResponseProgressPart | ChatResponseReferencePart;
}
