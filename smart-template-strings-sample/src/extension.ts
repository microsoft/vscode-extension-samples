'use strict';

import * as vscode from 'vscode';
import * as ts from 'typescript';
import * as html from 'vscode-html-languageservice';
import { TextDocument, Position } from 'vscode-languageserver-types';

export function activate(context: vscode.ExtensionContext) {
	// create and keep html language service
	const service = html.getLanguageService();

	vscode.languages.registerCompletionItemProvider(['typescript', 'javascript'], {
		provideCompletionItems(doc, pos) {
			const offset = doc.offsetAt(pos);
			const source = ts.createSourceFile(doc.fileName, doc.getText(), ts.ScriptTarget.Latest, true);

			let token = (ts as any).getTokenAtPosition(source, offset);
			let template: ts.TaggedTemplateExpression;
			while (token) {
				if (token.kind === ts.SyntaxKind.TaggedTemplateExpression) {
					template = token;
					break;
				}
				token = token.parent;
			}

			if (
				!template ||
				template.tag.getText() !== 'html' ||
				(offset < template.template.pos && offset > template.template.end)
			) {
				return;
			}

			const content = template.template.getText().slice(1, -1);
			const embeddedDoc = TextDocument.create(
				doc.uri.with({ scheme: 'html-fake' }).toString(),
				'html',
				doc.version,
				content
			);
			const htmlDoc = service.parseHTMLDocument(embeddedDoc);

			const list = service.doComplete(embeddedDoc, Position.create(0, offset - template.template.pos - 1), htmlDoc);

			return list.items.map(item => {
				// translate to vscode items
				return new vscode.CompletionItem(item.label);
			});
		}
	});
}
