export type PiconVariant = 'default' | 'light' | 'dark' | 'white' | 'black';

export const PICON_VARIANTS: readonly PiconVariant[] = [
	'default',
	'light',
	'dark',
	'white',
	'black',
] as const;

export type PiconSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface ParsedPiconUrl {
	type: 'channel' | 'srp';
	value: string;
}

export function parsePiconUrl(url: string): ParsedPiconUrl | null {
	if (!url || !url.startsWith('picon://')) return null;

	const rest = url.slice('picon://'.length);
	const slashIndex = rest.indexOf('/');
	if (slashIndex === -1) return null;

	const type = rest.slice(0, slashIndex);
	const value = rest.slice(slashIndex + 1);

	if ((type !== 'channel' && type !== 'srp') || !value) return null;

	return { type, value };
}

export function buildPiconImageUrl(
	piconUrl: string,
	variant: PiconVariant = 'default',
): string | null {
	if (!piconUrl) return null;

	const parsed = parsePiconUrl(piconUrl);
	if (!parsed) {
		// Allow direct image URLs/paths for static mocks in Storybook and custom logos.
		return piconUrl;
	}

	if (import.meta.env.STORYBOOK) {
		return `/storybook/picons/${variant}.svg`;
	}

	const encodedValue = encodeURIComponent(parsed.value);
	const variantParam = variant !== 'default' ? `?variant=${encodeURIComponent(variant)}` : '';
	return `/api/picon/${parsed.type}/${encodedValue}${variantParam}`;
}
