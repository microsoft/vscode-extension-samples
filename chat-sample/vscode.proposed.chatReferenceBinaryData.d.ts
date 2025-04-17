/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

declare module 'vscode' {

/**
	 * A reference to a value that the user added to their chat request.
	 */
	export interface ChatPromptReference {
		/**
		 * A unique identifier for this kind of reference.
		 */
		readonly id: string;

		/**
		 * The start and end index of the reference in the {@link ChatRequest.prompt prompt}. When undefined, the reference was not part of the prompt text.
		 *
		 * *Note* that the indices take the leading `#`-character into account which means they can
		 * used to modify the prompt as-is.
		 */
		readonly range?: [start: number, end: number];

		/**
		 * A description of this value that could be used in an LLM prompt.
		 */
		readonly modelDescription?: string;

		/**
		 * The value of this reference. The `string | Uri | Location` types are used today, but this could expand in the future.
		 */
		readonly value: string | Uri | Location | ChatReferenceBinaryData| unknown;
	}


	export class ChatReferenceBinaryData {
		/**
		 * The MIME type of the binary data.
		 */
		readonly mimeType: string;

		/**
		 * Retrieves the binary data of the reference.
		 * @returns A promise that resolves to the binary data as a Uint8Array.
		 */
		data(): Thenable<Uint8Array>;

		/**
		 * @param mimeType The MIME type of the binary data.
		 * @param data The binary data of the reference.
		 */
		constructor(mimeType: string, data: () => Thenable<Uint8Array>);
	}
}


