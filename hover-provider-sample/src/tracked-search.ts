
import * as vscode from 'vscode';

type TrackedMatch = {
	text: string,
	groups?: {[key: string]: string},
	range: vscode.Range
};
export function escapeRegex(s: string) {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
export function findInlineAt(re: RegExp, document: vscode.TextDocument, pos: vscode.Position): TrackedMatch | null {
		let match;
		const s = document.lineAt(pos.line).text;
		while((match = re.exec(s)) !== null){
			if(match.index > pos.character){
				break;
			}else if(re.lastIndex > pos.character){
				return {
					text: match[0], 
					groups: match.groups,
					range: new vscode.Range(
						new vscode.Position(pos.line, match.index), 
						new vscode.Position(pos.line, re.lastIndex)
					)};
			}
		}
		return null
	}

	
	export function findNext(re: RegExp, document: vscode.TextDocument): TrackedMatch | null {
		let match;
		const s = document.getText();
		while((match = re.exec(s)) !== null){
			return {
				text: match[0], 
				groups: match.groups,
				range: new vscode.Range(
					document.positionAt(match.index), 
					document.positionAt(re.lastIndex) || match.index + match[0].length
				)};
		}
		return null
	}


	export function findAt(re: RegExp, document: vscode.TextDocument, pos: vscode.Position): TrackedMatch | null {
		let match;
		const s = document.getText();
		const charOffset = document.offsetAt(pos);
		while((match = re.exec(s)) !== null){
			if(match.index > charOffset){
				break;
			}else if(re.lastIndex > charOffset){
				return {
					text: match[0], 
					groups: match.groups,
					range: new vscode.Range(
						document.positionAt(match.index), 
						document.positionAt(re.lastIndex)
					)};
			}
		}
		return null
	}
