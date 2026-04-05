import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import fs from 'node:fs';
import nodePath from 'node:path';

// This function is used at build time to resolve image paths without extensions.
// It searches for the actual file on disk trying all supported extensions.
// Uses node:path (cross-platform) and always returns forward-slash URLs for Vite.
import { resolveAssetPath, SUPPORTED_EXTENSIONS } from './utils/resolveAsset.mjs';

function resolveImagePath(imagePath: string): string {
	if (!imagePath) return imagePath;

	// If it already has a known extension, just normalise the prefix and return
	if (SUPPORTED_EXTENSIONS.some(ext => imagePath.toLowerCase().endsWith(ext))) {
		if (imagePath.startsWith('assets/')) {
			return '../../../assets/' + imagePath.slice('assets/'.length);
		}
		return imagePath;
	}

	// Strip the 'assets/' shorthand prefix to get the relative path inside src/assets/
	if (imagePath.startsWith('assets/')) {
		const relativeToAssets = imagePath.slice('assets/'.length); // e.g. "europa/italia/sicilia/segesta"
		const assetsDir = nodePath.join(process.cwd(), 'src', 'assets');
		
		const absoluteAssetPath = resolveAssetPath(assetsDir, relativeToAssets);
		if (absoluteAssetPath) {
			const relToAssetsDir = nodePath.relative(assetsDir, absoluteAssetPath);
			// Always use forward slashes — Vite requires them on all platforms
			return '../../../assets/' + relToAssetsDir.split(nodePath.sep).join('/');
		}

		// File not found with any extension — return a .webp path so the error is explicit
		console.warn(`[content.config] Image not found for: ${imagePath}`);
		return '../../../assets/' + relativeToAssets + '.webp';
	}

	return imagePath;
}

const commonSchema = ({ image }: SchemaContext) => z.object({
	title: z.string(),
	description: z.string(),
	date: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	image: z.string()
		.transform(resolveImagePath)
		.pipe(image())
		.optional(),
	location: z.union([z.string(), z.array(z.string())])
		.transform((val) => (Array.isArray(val) ? val : [val]))
		.optional(),
	tags: z.array(z.string()).optional(),
	id: z.string().optional(),
});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: commonSchema,
});

const groups = defineCollection({
	loader: glob({ base: './src/content/viajes-en-grupo', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }: SchemaContext) => commonSchema({ image }).extend({
		category: z.enum(['spain', 'europe', 'long-haul']).optional(),
	}),
});

const offers = defineCollection({
	loader: glob({ base: './src/content/ofertas', pattern: '**/*.{md,mdx}' }),
	schema: commonSchema,
});

const reviews = defineCollection({
	loader: glob({ base: './src/content/reviews', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		name: z.string(),
		role: z.string(),
		date: z.coerce.date(),
	}),
});

export const collections = { blog, groups, offers, reviews };
