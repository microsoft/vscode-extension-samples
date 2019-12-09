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

	//#region Semantic tokens: https://github.com/microsoft/vscode/issues/86415

	export class SemanticTokensLegend {
		public readonly tokenTypes: string[];
		public readonly tokenModifiers: string[];

		constructor(tokenTypes: string[], tokenModifiers: string[]);
	}

	export class SemanticTokensBuilder {
		constructor();
		push(line: number, char: number, length: number, tokenType: number, tokenModifiers: number): void;
		build(): Uint32Array;
	}

	export class SemanticTokens {
		/**
		 * The result id of the tokens.
		 *
		 * On a next call to `provideSemanticTokens`, if VS Code still holds in memory this result,
		 * the result id will be passed in as `SemanticTokensRequestOptions.previousResultId`.
		 */
		readonly resultId?: string;
		readonly data: Uint32Array;

		constructor(data: Uint32Array, resultId?: string);
	}

	export class SemanticTokensEdits {
		/**
		 * The result id of the tokens.
		 *
		 * On a next call to `provideSemanticTokens`, if VS Code still holds in memory this result,
		 * the result id will be passed in as `SemanticTokensRequestOptions.previousResultId`.
		 */
		readonly resultId?: string;
		readonly edits: SemanticTokensEdit[];

		constructor(edits: SemanticTokensEdit[], resultId?: string);
	}

	export class SemanticTokensEdit {
		readonly start: number;
		readonly deleteCount: number;
		readonly data?: Uint32Array;

		constructor(start: number, deleteCount: number, data?: Uint32Array);
	}

	export interface SemanticTokensRequestOptions {
		readonly ranges?: readonly Range[];
		/**
		 * The previous result id that the editor still holds in memory.
		 *
		 * Only when this is set it is safe for a `SemanticTokensProvider` to return `SemanticTokensEdits`.
		 */
		readonly previousResultId?: string;
	}

	/**
	 * The semantic tokens provider interface defines the contract between extensions and
	 * semantic tokens.
	 */
	export interface SemanticTokensProvider {
		/**
		 * A file can contain many tokens, perhaps even hundreds of thousands of tokens. Therefore, to improve
		 * the memory consumption around describing semantic tokens, we have decided to avoid allocating an object
		 * for each token and we represent tokens from a file as an array of integers. Furthermore, the position
		 * of each token is expressed relative to the token before it because most tokens remain stable relative to
		 * each other when edits are made in a file.
		 *
		 *
		 * ---
		 * In short, each token takes 5 integers to represent, so a specific token `i` in the file consists of the following fields:
		 *  - at index `5*i`   - `deltaLine`: token line number, relative to the previous token
		 *  - at index `5*i+1` - `deltaStart`: token start character, relative to the previous token (relative to 0 or the previous token's start if they are on the same line)
		 *  - at index `5*i+2` - `length`: the length of the token. A token cannot be multiline.
		 *  - at index `5*i+3` - `tokenType`: will be looked up in `SemanticTokensLegend.tokenTypes`
		 *  - at index `5*i+4` - `tokenModifiers`: each set bit will be looked up in `SemanticTokensLegend.tokenModifiers`
		 *
		 *
		 *
		 * ---
		 * ### How to encode tokens
		 *
		 * Here is an example for encoding a file with 3 tokens:
		 * ```
		 *    { line: 2, startChar:  5, length: 3, tokenType: "properties", tokenModifiers: ["private", "static"] },
		 *    { line: 2, startChar: 10, length: 4, tokenType: "types",      tokenModifiers: [] },
		 *    { line: 5, startChar:  2, length: 7, tokenType: "classes",    tokenModifiers: [] }
		 * ```
		 *
		 * 1. First of all, a legend must be devised. This legend must be provided up-front and capture all possible token types.
		 * For this example, we will choose the following legend which must be passed in when registering the provider:
		 * ```
		 *    tokenTypes: ['properties', 'types', 'classes'],
		 *    tokenModifiers: ['private', 'static']
		 * ```
		 *
		 * 2. The first transformation step is to encode `tokenType` and `tokenModifiers` as integers using the legend. Token types are looked
		 * up by index, so a `tokenType` value of `1` means `tokenTypes[1]`. Multiple token modifiers can be set by using bit flags,
		 * so a `tokenModifier` value of `3` is first viewed as binary `0b00000011`, which means `[tokenModifiers[0], tokenModifiers[1]]` because
		 * bits 0 and 1 are set. Using this legend, the tokens now are:
		 * ```
		 *    { line: 2, startChar:  5, length: 3, tokenType: 0, tokenModifiers: 3 },
		 *    { line: 2, startChar: 10, length: 4, tokenType: 1, tokenModifiers: 0 },
		 *    { line: 5, startChar:  2, length: 7, tokenType: 2, tokenModifiers: 0 }
		 * ```
		 *
		 * 3. The next steps is to encode each token relative to the previous token in the file. In this case, the second token
		 * is on the same line as the first token, so the `startChar` of the second token is made relative to the `startChar`
		 * of the first token, so it will be `10 - 5`. The third token is on a different line than the second token, so the
		 * `startChar` of the third token will not be altered:
		 * ```
		 *    { deltaLine: 2, deltaStartChar: 5, length: 3, tokenType: 0, tokenModifiers: 3 },
		 *    { deltaLine: 0, deltaStartChar: 5, length: 4, tokenType: 1, tokenModifiers: 0 },
		 *    { deltaLine: 3, deltaStartChar: 2, length: 7, tokenType: 2, tokenModifiers: 0 }
		 * ```
		 *
		 * 4. Finally, the last step is to inline each of the 5 fields for a token in a single array, which is a memory friendly representation:
		 * ```
		 *    // 1st token,  2nd token,  3rd token
		 *    [  2,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]
		 * ```
		 *
		 *
		 *
		 * ---
		 * ### How tokens change when the document changes
		 *
		 * Let's look at how tokens might change.
		 *
		 * Continuing with the above example, suppose a new line was inserted at the top of the file.
		 * That would make all the tokens move down by one line (notice how the line has changed for each one):
		 * ```
		 *    { line: 3, startChar:  5, length: 3, tokenType: "properties", tokenModifiers: ["private", "static"] },
		 *    { line: 3, startChar: 10, length: 4, tokenType: "types",      tokenModifiers: [] },
		 *    { line: 6, startChar:  2, length: 7, tokenType: "classes",    tokenModifiers: [] }
		 * ```
		 * The integer encoding of the tokens does not change substantially because of the delta-encoding of positions:
		 * ```
		 *    // 1st token,  2nd token,  3rd token
		 *    [  3,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]
		 * ```
		 * It is possible to express these new tokens in terms of an edit applied to the previous tokens:
		 * ```
		 *    [  2,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]
		 *    [  3,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]
		 *
		 *    edit: { start:  0, deleteCount: 1, data: [3] } // replace integer at offset 0 with 3
		 * ```
		 *
		 * Furthermore, let's assume that a new token has appeared on line 4:
		 * ```
		 *    { line: 3, startChar:  5, length: 3, tokenType: "properties", tokenModifiers: ["private", "static"] },
		 *    { line: 3, startChar: 10, length: 4, tokenType: "types",      tokenModifiers: [] },
		 *    { line: 4, startChar:  3, length: 5, tokenType: "properties", tokenModifiers: ["static"] },
		 *    { line: 6, startChar:  2, length: 7, tokenType: "classes",    tokenModifiers: [] }
		 * ```
		 * The integer encoding of the tokens is:
		 * ```
		 *    // 1st token,  2nd token,  3rd token,  4th token
		 *    [  3,5,3,0,3,  0,5,4,1,0,  1,3,5,0,2,  2,2,7,2,0, ]
		 * ```
		 * Again, it is possible to express these new tokens in terms of an edit applied to the previous tokens:
		 * ```
		 *    [  3,5,3,0,3,  0,5,4,1,0,  3,2,7,2,0 ]
		 *    [  3,5,3,0,3,  0,5,4,1,0,  1,3,5,0,2,  2,2,7,2,0, ]
		 *
		 *    edit: { start: 10, deleteCount: 1, data: [1,3,5,0,2,2] } // replace integer at offset 10 with [1,3,5,0,2,2]
		 * ```
		 *
		 *
		 *
		 * ---
		 * ### When to return `SemanticTokensEdits`
		 *
		 * When doing edits, it is possible that multiple edits occur until VS Code decides to invoke the semantic tokens provider.
		 * In principle, each call to `provideSemanticTokens` can return a full representations of the semantic tokens, and that would
		 * be a perfectly reasonable semantic tokens provider implementation.
		 *
		 * However, when having a language server running in a separate process, transferring all the tokens between processes
		 * might be slow, so VS Code allows to return the new tokens expressed in terms of multiple edits applied to the previous
		 * tokens.
		 *
		 * To clearly define what "previous tokens" means, it is possible to return a `resultId` with the semantic tokens. If the
		 * editor still has in memory the previous result, the editor will pass in options the previous `resultId` at
		 * `SemanticTokensRequestOptions.previousResultId`. Only when the editor passes in the previous `resultId`, it is allowed
		 * that a semantic tokens provider returns the new tokens expressed as edits to be applied to the previous result. Even in this
		 * case, the semantic tokens provider needs to return a new `resultId` that will identify these new tokens as a basis
		 * for the next request.
		 *
		 * *NOTE 1*: It is illegal to return `SemanticTokensEdits` if `options.previousResultId` is not set.
		 * *NOTE 2*: All edits in `SemanticTokensEdits` contain indices in the old integers array, so they all refer to the previous result state.
		 */
		provideSemanticTokens(document: TextDocument, options: SemanticTokensRequestOptions, token: CancellationToken): ProviderResult<SemanticTokens | SemanticTokensEdits>;
	}

	export namespace languages {
		/**
		 * Register a semantic tokens provider.
		 *
		 * Multiple providers can be registered for a language. In that case providers are sorted
		 * by their [score](#languages.match) and the best-matching provider is used. Failure
		 * of the selected provider will cause a failure of the whole operation.
		 *
		 * @param selector A selector that defines the documents this provider is applicable to.
		 * @param provider A semantic tokens provider.
		 * @return A [disposable](#Disposable) that unregisters this provider when being disposed.
		 */
		export function registerSemanticTokensProvider(selector: DocumentSelector, provider: SemanticTokensProvider, legend: SemanticTokensLegend): Disposable;
	}

	//#endregion

}
