/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	LanguageMode,
	LanguageService as HTMLLanguageService,
	Position,
	TextDocument
} from '../languageModes';

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
		onDocumentRemoved(_document: TextDocument) {},
		dispose() {}
	};
}
