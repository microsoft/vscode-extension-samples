import {
	Range, Position, CallHierarchyProvider, TextDocument, CancellationToken, CallHierarchyItem,
	SymbolKind, ProviderResult, CallHierarchyIncomingCall, CallHierarchyOutgoingCall, workspace, Uri
} from 'vscode';

/**
 * Sample model of what the text in the document contains.
 */
export class FoodPyramid {
	private relations: FoodRelation[] = [];
	private nouns = new Set<string>();
	private verbs = new Set<string>();

	getRelationAt(wordRange: Range): FoodRelation | undefined {
		return this.relations.find(relation => relation.range.contains(wordRange));
	}

	addRelation(relation: FoodRelation): void {
		this.relations.push(relation);
		this.nouns.add(relation.object).add(relation.subject);
		this.verbs.add(relation.verb);
	}

	isVerb(name: string): boolean {
		return this.verbs.has(name.toLowerCase());
	}

	isNoun(name: string): boolean {
		return this.nouns.has(name.toLowerCase());
	}

	getVerbRelations(verb: string): FoodRelation[] {
		return this.relations
			.filter(relation => relation.verb === verb.toLowerCase());
	}

	getNounRelations(noun: string): FoodRelation[] {
		return this.relations
			.filter(relation => relation.involves(noun));
	}

	getSubjectRelations(subject: string): FoodRelation[] {
		return this.relations
			.filter(relation => relation.subject === subject.toLowerCase());
	}

	getObjectRelations(object: string): FoodRelation[] {
		return this.relations
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
		private readonly originalText: string, public readonly range: Range) {
			
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
		let needle = noun.toLowerCase();
		return this._subject === needle || this._object === needle;
	}

	getRangeOf(word: string): Range {
		let indexOfWord = new RegExp("\\b" + word + "\\b", "i").exec(this.originalText)!.index;
		return new Range(this.range.start.translate({ characterDelta: indexOfWord }),
			this.range.start.translate({ characterDelta: indexOfWord + word.length }));
	}
}
