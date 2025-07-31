import * as vscode from 'vscode';
import * as trackedSearch from './tracked-search';


export default class VerilogHoverProvider implements vscode.HoverProvider {
	public provideHover(
		document: vscode.TextDocument, 
		position: vscode.Position, 
		token: vscode.CancellationToken
	): vscode.Hover | null {
		const IDENTIFIER_REGEX = /[a-z_][a-z0-9_$]*|\\[\S+]/ig;
		
		const ref = trackedSearch.findInlineAt(IDENTIFIER_REGEX, document, position);
		if(ref){
			const md = new vscode.MarkdownString();
			const potentialDeclarationRe = new RegExp(
				'\\b(parameter|localparam|input|output|inout|wire|bit|logic|reg)\\b.*?' +
				trackedSearch.escapeRegex(ref.text), 'g'
			)
			const decl = trackedSearch.findNext(potentialDeclarationRe, document);
			if(decl){
				const declLine = document.lineAt(decl.range.start.line).text.trim();
				md.appendText('sample\n\n')
				md.appendCodeblock(declLine, document.languageId);
				return new vscode.Hover(md, ref.range);
			}
		}
		return null;
	}
}

