/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LanguageService, TokenType } from 'vscode-html-languageservice';

interface EmbeddedRegion {
	languageId: string | undefined;
	start: number;
	end: number;
	attributeValue?: boolean;
}

export function isInsideStyleRegion(
	languageService: LanguageService,
	documentText: string,
	offset: number
) {
	const scanner = languageService.createScanner(documentText);

	let token = scanner.scan();
	while (token !== TokenType.EOS) {
		switch (token) {
			case TokenType.Styles:
				if (offset >= scanner.getTokenOffset() && offset <= scanner.getTokenEnd()) {
					return true;
				}
		}
		token = scanner.scan();
	}

	return false;
}

export function getCSSVirtualContent(
	languageService: LanguageService,
	documentText: string
): string {
	const regions: EmbeddedRegion[] = [];
	const scanner = languageService.createScanner(documentText);
	let lastTagName = '';
	let lastAttributeName: string | null = null;
	let languageIdFromType: string | undefined = undefined;
	const importedScripts: string[] = [];

	let token = scanner.scan();
	while (token !== TokenType.EOS) {
		switch (token) {
			case TokenType.StartTag:
				lastTagName = scanner.getTokenText();
				lastAttributeName = null;
				languageIdFromType = 'javascript';
				break;
			case TokenType.Styles:
				regions.push({
					languageId: 'css',
					start: scanner.getTokenOffset(),
					end: scanner.getTokenEnd()
				});
				break;
			case TokenType.Script:
				regions.push({
					languageId: languageIdFromType,
					start: scanner.getTokenOffset(),
					end: scanner.getTokenEnd()
				});
				break;
			case TokenType.AttributeName:
				lastAttributeName = scanner.getTokenText();
				break;
			case TokenType.AttributeValue:
				if (lastAttributeName === 'src' && lastTagName.toLowerCase() === 'script') {
					let value = scanner.getTokenText();
					if (value[0] === "'" || value[0] === '"') {
						value = value.substr(1, value.length - 1);
					}
					importedScripts.push(value);
				} else if (lastAttributeName === 'type' && lastTagName.toLowerCase() === 'script') {
					if (
						/["'](module|(text|application)\/(java|ecma)script|text\/babel)["']/.test(
							scanner.getTokenText()
						)
					) {
						languageIdFromType = 'javascript';
					} else if (/["']text\/typescript["']/.test(scanner.getTokenText())) {
						languageIdFromType = 'typescript';
					} else {
						languageIdFromType = undefined;
					}
				} else {
					const attributeLanguageId = getAttributeLanguage(lastAttributeName!);
					if (attributeLanguageId) {
						let start = scanner.getTokenOffset();
						let end = scanner.getTokenEnd();
						const firstChar = documentText[start];
						if (firstChar === "'" || firstChar === '"') {
							start++;
							end--;
						}
						regions.push({
							languageId: attributeLanguageId,
							start,
							end,
							attributeValue: true
						});
					}
				}
				lastAttributeName = null;
				break;
		}
		token = scanner.scan();
	}

	let content = documentText
		.split('\n')
		.map(line => {
			return ' '.repeat(line.length);
		}).join('\n');

	regions.forEach(r => {
		if (r.languageId === 'css') {
			content = content.slice(0, r.start) + documentText.slice(r.start, r.end) + content.slice(r.end);
		}
	});

	return content;
}

function getAttributeLanguage(attributeName: string): string | null {
	const match = attributeName.match(/^(style)$|^(on\w+)$/i);
	if (!match) {
		return null;
	}
	return match[1] ? 'css' : 'javascript';
}
