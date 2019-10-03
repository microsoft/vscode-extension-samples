export interface FiddleConfiguration {
	readonly slug: string;
	readonly version?: number;
	readonly downloaded: boolean;
}

export function parseFiddleId(id: string): FiddleConfiguration {
	let idFragments = id.split('/');
	let fiddleSlug = idFragments[0];
	let fiddleVersion = idFragments.length > 1 ? parseInt(id.split('/')[1]) : undefined;

	return { slug: fiddleSlug, version: fiddleVersion, downloaded: false };
}