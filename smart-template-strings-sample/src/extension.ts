'use strict';

import * as vscode from 'vscode';
import * as ts from 'typescript';

export function activate(context: vscode.ExtensionContext) {

    vscode.languages.registerCompletionItemProvider(['typescript', 'javascript'], {
        provideCompletionItems(doc, pos) {

            const offset = doc.offsetAt(pos);
            const source = ts.createSourceFile(doc.fileName, doc.getText(), ts.ScriptTarget.Latest, true);

            let token = (ts as any).getTokenAtPosition(source, offset)
            let template: ts.TaggedTemplateExpression;
            while (token) {
                if (token.kind === ts.SyntaxKind.TaggedTemplateExpression) {
                    template = token;
                    break;
                }
                token = token.parent;
            }

            if (!template
                || template.tag.getText() !== 'foo'
                || (offset < template.template.pos && offset > template.template.end)
            ) {
                return;
            }

            return [
                new vscode.CompletionItem('bar', vscode.CompletionItemKind.Value),
                new vscode.CompletionItem('baz', vscode.CompletionItemKind.Value),
                new vscode.CompletionItem('far', vscode.CompletionItemKind.Value)
            ];
        }
    });
}

