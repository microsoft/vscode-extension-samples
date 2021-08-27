/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LanguageService as CSSLanguageService } from 'vscode-css-languageservice';
import { HTMLDocumentRegions } from '../embeddedSupport';
import { LanguageModelCache } from '../languageModelCache';
import { LanguageMode, Position } from '../languageModes';
import { TextDocument } from 'vscode-languageserver-textdocument';

export function getCSSMode(
	cssLanguageService: CSSLanguageService,
	documentRegions: LanguageModelCache<HTMLDocumentRegions>
): LanguageMode {
	return {
		getId() {
			return 'css';
		},
		doValidation(document: TextDocument) {
			// Get virtual CSS document, with all non-CSS code replaced with whitespace
			const embedded = documentRegions.get(document).getEmbeddedDocument('css');
			const stylesheet = cssLanguageService.parseStylesheet(embedded);
			return cssLanguageService.doValidation(embedded, stylesheet);
		},
		doComplete(document: TextDocument, position: Position) {
			// Get virtual CSS document, with all non-CSS code replaced with whitespace
			const embedded = documentRegions.get(document).getEmbeddedDocument('css');
			const stylesheet = cssLanguageService.parseStylesheet(embedded);
			return cssLanguageService.doComplete(embedded, position, stylesheet);
		},
		onDocumentRemoved(_document: TextDocument) { /* nothing to do */ },
		dispose() { /* nothing to do */ }
	};
}
