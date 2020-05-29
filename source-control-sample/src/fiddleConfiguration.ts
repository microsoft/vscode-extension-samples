export interface FiddleConfiguration {
	readonly slug: string;
	readonly version?: number;
	readonly downloaded: boolean;
}

export function parseFiddleId(id: string): FiddleConfiguration {
	const idFragments = id.split('/');
	const fiddleSlug = idFragments[0];
	const fiddleVersion = idFragments.length > 1 ? parseInt(id.split('/')[1]) : undefined;

	return { slug: fiddleSlug, version: fiddleVersion, downloaded: false };
}