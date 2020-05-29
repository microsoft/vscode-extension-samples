import * as vscode from 'vscode';
import { FoodPyramid, FoodRelation } from './model';

export class FoodPyramidHierarchyProvider implements vscode.CallHierarchyProvider {

	prepareCallHierarchy(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.CallHierarchyItem | undefined {
		const range = document.getWordRangeAtPosition(position);
		if (range) {
			const word = document.getText(range);
			return this.createCallHierarchyItem(word, '', document, range);
		} else {
			return undefined;
		}
	}

	async provideCallHierarchyOutgoingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyOutgoingCall[] | undefined> {
		const document = await vscode.workspace.openTextDocument(item.uri);
		const parser = new FoodPyramidParser();
		parser.parse(document);
		const model = parser.getModel();
		const originRelation = model.getRelationAt(item.range);

		const outgoingCallItems: vscode.CallHierarchyOutgoingCall[] = [];

		if (model.isVerb(item.name)) {
			const outgoingCalls = model.getVerbRelations(item.name)
				.filter(relation => relation.subject === originRelation!.subject);

			outgoingCalls.forEach(relation => {
				const outgoingCallRange = relation.getRangeOf(relation.object);
				const verbItem = this.createCallHierarchyItem(relation.object, 'noun', document, outgoingCallRange);
				const outgoingCallItem = new vscode.CallHierarchyOutgoingCall(verbItem, [outgoingCallRange]);
				outgoingCallItems.push(outgoingCallItem);
			});
		}
		else if (model.isNoun(item.name)) {
			const outgoingCallMap = groupBy(model.getSubjectRelations(item.name), relation => relation.verb);

			outgoingCallMap.forEach((relations, verb) => {
				const outgoingCallRanges = relations.map(relation => relation.getRangeOf(verb));
				const verbItem = this.createCallHierarchyItem(verb, 'verb', document, outgoingCallRanges[0]);
				const outgoingCallItem = new vscode.CallHierarchyOutgoingCall(verbItem, outgoingCallRanges);
				outgoingCallItems.push(outgoingCallItem);
			});
		}

		return outgoingCallItems;
	}

	async provideCallHierarchyIncomingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyIncomingCall[]> {
		const document = await vscode.workspace.openTextDocument(item.uri);
		const parser = new FoodPyramidParser();
		parser.parse(document);
		const model = parser.getModel();
		const originRelation = model.getRelationAt(item.range);

		const outgoingCallItems: vscode.CallHierarchyIncomingCall[] = [];

		if (model.isVerb(item.name)) {
			const outgoingCalls = model.getVerbRelations(item.name)
				.filter(relation => relation.object === originRelation!.object);

			outgoingCalls.forEach(relation => {
				const outgoingCallRange = relation.getRangeOf(relation.subject);
				const verbItem = this.createCallHierarchyItem(relation.subject, 'noun', document, outgoingCallRange);
				const outgoingCallItem = new vscode.CallHierarchyIncomingCall(verbItem, [outgoingCallRange]);
				outgoingCallItems.push(outgoingCallItem);
			});
		}
		else if (model.isNoun(item.name)) {
			const outgoingCallMap = groupBy(model.getObjectRelations(item.name), relation => relation.verb);

			outgoingCallMap.forEach((relations, verb) => {
				const outgoingCallRanges = relations.map(relation => relation.getRangeOf(verb));
				const verbItem = this.createCallHierarchyItem(verb, 'verb-inverted', document, outgoingCallRanges[0]);
				const outgoingCallItem = new vscode.CallHierarchyIncomingCall(verbItem, outgoingCallRanges);
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
		const pattern = /^(\w+)\s+(\w+)\s+(\w+).$/gm;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(textDocument.getText()))) {
			const startPosition = textDocument.positionAt(match.index);
			const range = new vscode.Range(startPosition, startPosition.translate({ characterDelta: match[0].length }));
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
