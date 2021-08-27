/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	LanguageMode,
	LanguageService as HTMLLanguageService,
	Position,
} from '../languageModes';
import { TextDocument } from 'vscode-languageserver-textdocument';

export function getHTMLMode(htmlLanguageService: HTMLLanguageService): LanguageMode {
	return {
		getId() {
			return 'html';
		},
		doComplete(document: TextDocument, position: Position) {
			return htmlLanguageService.doComplete(
				document,
				position,
				htmlLanguageService.parseHTMLDocument(document)
			);
		},
		onDocumentRemoved(_document: TextDocument) { /* nothing to do */ },
		dispose() { /* nothing to do */ }
	};
}
