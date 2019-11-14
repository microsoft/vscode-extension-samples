import * as vscode from 'vscode';
import { FoodPyramid, FoodRelation } from './model';

export class FoodPyramidHierarchyProvider implements vscode.CallHierarchyProvider {

	prepareCallHierarchy(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.CallHierarchyItem | undefined {
		let range = document.getWordRangeAtPosition(position);
		if (range) {
			let word = document.getText(range);
			return this.createCallHierarchyItem(word, '', document, range);
		} else {
			return undefined;
		}
	}

	async provideCallHierarchyOutgoingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyOutgoingCall[] | undefined> {
		let document = await vscode.workspace.openTextDocument(item.uri);
		let parser = new FoodPyramidParser();
		parser.parse(document);
		let model = parser.getModel();
		let originRelation = model.getRelationAt(item.range);

		let outgoingCallItems: vscode.CallHierarchyOutgoingCall[] = [];

		if (model.isVerb(item.name)) {
			let outgoingCalls = model.getVerbRelations(item.name)
				.filter(relation => relation.subject === originRelation!.subject);

			outgoingCalls.forEach(relation => {
				let outgoingCallRange = relation.getRangeOf(relation.object);
				let verbItem = this.createCallHierarchyItem(relation.object, 'noun', document, outgoingCallRange);
				let outgoingCallItem = new vscode.CallHierarchyOutgoingCall(verbItem, [outgoingCallRange]);
				outgoingCallItems.push(outgoingCallItem);
			});
		}
		else if (model.isNoun(item.name)) {
			let outgoingCallMap = groupBy(model.getSubjectRelations(item.name), relation => relation.verb);

			outgoingCallMap.forEach((relations, verb) => {
				let outgoingCallRanges = relations.map(relation => relation.getRangeOf(verb));
				let verbItem = this.createCallHierarchyItem(verb, 'verb', document, outgoingCallRanges[0]);
				let outgoingCallItem = new vscode.CallHierarchyOutgoingCall(verbItem, outgoingCallRanges);
				outgoingCallItems.push(outgoingCallItem);
			});
		}

		return outgoingCallItems;
	}

	async provideCallHierarchyIncomingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyIncomingCall[]> {
		let document = await vscode.workspace.openTextDocument(item.uri);
		let parser = new FoodPyramidParser();
		parser.parse(document);
		let model = parser.getModel();
		let originRelation = model.getRelationAt(item.range);

		let outgoingCallItems: vscode.CallHierarchyIncomingCall[] = [];

		if (model.isVerb(item.name)) {
			let outgoingCalls = model.getVerbRelations(item.name)
				.filter(relation => relation.object === originRelation!.object);

			outgoingCalls.forEach(relation => {
				let outgoingCallRange = relation.getRangeOf(relation.subject);
				let verbItem = this.createCallHierarchyItem(relation.subject, 'noun', document, outgoingCallRange);
				let outgoingCallItem = new vscode.CallHierarchyIncomingCall(verbItem, [outgoingCallRange]);
				outgoingCallItems.push(outgoingCallItem);
			});
		}
		else if (model.isNoun(item.name)) {
			let outgoingCallMap = groupBy(model.getObjectRelations(item.name), relation => relation.verb);

			outgoingCallMap.forEach((relations, verb) => {
				let outgoingCallRanges = relations.map(relation => relation.getRangeOf(verb));
				let verbItem = this.createCallHierarchyItem(verb, 'verb-inverted', document, outgoingCallRanges[0]);
				let outgoingCallItem = new vscode.CallHierarchyIncomingCall(verbItem, outgoingCallRanges);
				outgoingCallItems.push(outgoingCallItem);
			});
		}

		return outgoingCallItems;
	}

	private createCallHierarchyItem(word: string, type: string, document: vscode.TextDocument, range: vscode.Range): vscode.CallHierarchyItem {
		return new vscode.CallHierarchyItem(vscode.SymbolKind.Object, word, `(${type})`, document.uri, range, range);
	}

}

/**
 * Sample parser of the document text into the [FoodPyramid](#FoodPyramid) model.
 */
class FoodPyramidParser {
	private _model = new FoodPyramid();

	getModel(): FoodPyramid {
		return this._model;
	}

	parse(textDocument: vscode.TextDocument): void {
		let pattern = /^(\w+)\s+(\w+)\s+(\w+).$/gm;
		let match: RegExpExecArray | null;
		while (match = pattern.exec(textDocument.getText())) {
			let startPosition = textDocument.positionAt(match.index);
			let range = new vscode.Range(startPosition, startPosition.translate({ characterDelta: match[0].length }));
			this._model.addRelation(new FoodRelation(match[1], match[2], match[3], match[0], range));
		}
	}
}

/**
 * Groups array items by a field defined using a key selector.
 * @param array array to be grouped
 * @param keyGetter grouping key selector
 */
function groupBy<K, V>(array: Array<V>, keyGetter: (value: V) => K): Map<K, V[]> {
	const map = new Map();
	array.forEach((item) => {
		const key = keyGetter(item);
		const groupForKey = map.get(key) || [];
		groupForKey.push(item);
		map.set(key, groupForKey);
	});
	return map;
}
