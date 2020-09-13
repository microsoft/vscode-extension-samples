import * as vscode from 'vscode';

/**
 * Sample model of what the text in the document contains.
 */
export class FoodPyramid {
	private _relations: FoodRelation[] = [];
	private _nouns = new Set<string>();
	private _verbs = new Set<string>();

	getRelationAt(wordRange: vscode.Range): FoodRelation | undefined {
		return this._relations.find(relation => relation.range.contains(wordRange));
	}

	addRelation(relation: FoodRelation): void {
		this._relations.push(relation);
		this._nouns.add(relation.object).add(relation.subject);
		this._verbs.add(relation.verb);
	}

	isVerb(name: string): boolean {
		return this._verbs.has(name.toLowerCase());
	}

	isNoun(name: string): boolean {
		return this._nouns.has(name.toLowerCase());
	}

	getVerbRelations(verb: string): FoodRelation[] {
		return this._relations
			.filter(relation => relation.verb === verb.toLowerCase());
	}

	getNounRelations(noun: string): FoodRelation[] {
		return this._relations
			.filter(relation => relation.involves(noun));
	}

	getSubjectRelations(subject: string): FoodRelation[] {
		return this._relations
			.filter(relation => relation.subject === subject.toLowerCase());
	}

	getObjectRelations(object: string): FoodRelation[] {
		return this._relations
			.filter(relation => relation.object === object.toLowerCase());
	}
}

/**
 * Model element.
 */
export class FoodRelation {
	private _subject: string;
	private _verb: string;
	private _object: string;

	constructor(subject: string, verb: string, object: string,
		private readonly originalText: string, public readonly range: vscode.Range) {
			
		this._subject = subject.toLowerCase();
		this._verb = verb.toLowerCase();
		this._object = object.toLowerCase();
	}

	get subject(): string {
		return this._subject;
	}
	
	get object(): string {
		return this._object;
	}
	
	get verb(): string {
		return this._verb;
	}

	involves(noun: string): boolean {
		const needle = noun.toLowerCase();
		return this._subject === needle || this._object === needle;
	}

	getRangeOf(word: string): vscode.Range {
		const indexOfWord = new RegExp("\\b" + word + "\\b", "i").exec(this.originalText)!.index;
		return new vscode.Range(this.range.start.translate({ characterDelta: indexOfWord }),
			this.range.start.translate({ characterDelta: indexOfWord + word.length }));
	}
}
