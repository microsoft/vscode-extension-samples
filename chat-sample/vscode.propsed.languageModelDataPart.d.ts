/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

declare module 'vscode' {

	export interface LanguageModelChat {
		sendRequest(messages: Array<LanguageModelChatMessage | LanguageModelChatMessage2>, options?: LanguageModelChatRequestOptions, token?: CancellationToken): Thenable<LanguageModelChatResponse>;
		countTokens(text: string | LanguageModelChatMessage | LanguageModelChatMessage2, token?: CancellationToken): Thenable<number>;
	}

	/**
	 * Represents a message in a chat. Can assume different roles, like user or assistant.
	 */
	export class LanguageModelChatMessage2 {

		/**
		 * Utility to create a new user message.
		 *
		 * @param content The content of the message.
		 * @param name The optional name of a user for the message.
		 */
		static User(content: string | Array<LanguageModelTextPart | LanguageModelToolResultPart2 | LanguageModelDataPart>, name?: string): LanguageModelChatMessage2;

		/**
		 * Utility to create a new assistant message.
		 *
		 * @param content The content of the message.
		 * @param name The optional name of a user for the message.
		 */
		static Assistant(content: string | Array<LanguageModelTextPart | LanguageModelToolCallPart | LanguageModelDataPart>, name?: string): LanguageModelChatMessage2;

		/**
		 * The role of this message.
		 */
		role: LanguageModelChatMessageRole;

		/**
		 * A string or heterogeneous array of things that a message can contain as content. Some parts may be message-type
		 * specific for some models.
		 */
		content: Array<LanguageModelTextPart | LanguageModelToolResultPart2 | LanguageModelToolCallPart | LanguageModelDataPart>;

		/**
		 * The optional name of a user for this message.
		 */
		name: string | undefined;

		/**
		 * Create a new user message.
		 *
		 * @param role The role of the message.
		 * @param content The content of the message.
		 * @param name The optional name of a user for the message.
		 */
		constructor(role: LanguageModelChatMessageRole, content: string | Array<LanguageModelTextPart | LanguageModelToolResultPart2 | LanguageModelToolCallPart | LanguageModelDataPart>, name?: string);
	}

	/**
	 * A language model response part containing an image, returned from a {@link LanguageModelChatResponse}.
	 */
	export class LanguageModelDataPart {
		/**
		 * The image content of the part.
		 */
		value: ChatImagePart;

		/**
		 * Construct an image part with the given content.
		 * @param value The image content of the part.
		 */
		constructor(value: ChatImagePart);
	}

	/**
	 * Enum for supported image MIME types.
	 */
	export enum ChatImageMimeType {
		PNG = 'image/png',
		JPEG = 'image/jpeg',
		GIF = 'image/gif',
		WEBP = 'image/webp',
		BMP = 'image/bmp',
	}

	export interface ChatImagePart {
		/**
		 * The image's MIME type.
		 */
		mimeType: ChatImageMimeType;

		/**
		 * The raw binary data of the image, encoded as a Uint8Array. Note: do not use base64 encoding. Maximum image size is 5MB.
		 */
		data: Uint8Array;
	}


	/**
	 * The result of a tool call. This is the counterpart of a {@link LanguageModelToolCallPart tool call} and
	 * it can only be included in the content of a User message
	 */
	export class LanguageModelToolResultPart2 {
		/**
		 * The ID of the tool call.
		 *
		 * *Note* that this should match the {@link LanguageModelToolCallPart.callId callId} of a tool call part.
		 */
		callId: string;

		/**
		 * The value of the tool result.
		 */
		content: Array<LanguageModelTextPart | LanguageModelPromptTsxPart | LanguageModelDataPart | unknown>;

		/**
		 * @param callId The ID of the tool call.
		 * @param content The content of the tool result.
		 */
		constructor(callId: string, content: Array<LanguageModelTextPart | LanguageModelPromptTsxPart | LanguageModelDataPart | unknown>);
	}


	/**
	 * A tool that can be invoked by a call to a {@link LanguageModelChat}.
	 */
	export interface LanguageModelTool<T> {
		/**
		 * Invoke the tool with the given input and return a result.
		 *
		 * The provided {@link LanguageModelToolInvocationOptions.input} has been validated against the declared schema.
		 */
		invoke(options: LanguageModelToolInvocationOptions<T>, token: CancellationToken): ProviderResult<LanguageModelToolResult2>;
	}

	/**
 * A result returned from a tool invocation. If using `@vscode/prompt-tsx`, this result may be rendered using a `ToolResult`.
 */
	export class LanguageModelToolResult2 {
		/**
		 * A list of tool result content parts. Includes `unknown` becauses this list may be extended with new content types in
		 * the future.
		 * @see {@link lm.invokeTool}.
		 */
		content: Array<LanguageModelTextPart | LanguageModelPromptTsxPart | LanguageModelDataPart | unknown>;

		/**
		 * Create a LanguageModelToolResult
		 * @param content A list of tool result content parts
		 */
		constructor(content: Array<LanguageModelTextPart | LanguageModelPromptTsxPart | LanguageModelDataPart | unknown>);
	}

	export namespace lm {
		export function invokeTool(name: string, options: LanguageModelToolInvocationOptions<object>, token?: CancellationToken): Thenable<LanguageModelToolResult2>;
	}

}
