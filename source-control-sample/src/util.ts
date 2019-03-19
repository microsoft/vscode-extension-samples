export function firstIndex<T>(array: T[], fn: (t: T) => boolean): number {
	for (let i = 0; i < array.length; i++) {
		if (fn(array[i])) {
			return i;
		}
	}

	return -1;
}
