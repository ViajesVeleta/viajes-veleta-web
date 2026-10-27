export function toMetaDescription(text: string, maxLength = 160): string {
	const plain = text
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/(\*\*|__|\*|_|`)/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	if (plain.length <= maxLength) return plain;

	const cut = plain.slice(0, maxLength - 1);
	const lastSpace = cut.lastIndexOf(' ');
	return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
}

export function withTrailingSlash(path: string): string {
	const [pathname, hash = ''] = path.split('#');
	const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
	return hash ? `${normalized}#${hash}` : normalized;
}
