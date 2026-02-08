import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

// This function will be used at build time to resolve image paths
function resolveImagePath(path: string): string {
	if (!path) return path;

	// Normalize the path to remove 'assets/' prefix if present
	// This allows using 'assets/image-name' instead of '../../../assets/image-name'
	let normalizedPath = path;
	if (path.startsWith('assets/')) {
		normalizedPath = path.replace('assets/', '../../../assets/');
	}

	// If it already has an extension, return as-is
	if (normalizedPath.match(/\.(png|jpg|jpeg|webp|svg)$/i)) {
		return normalizedPath;
	}

	// Otherwise, append .webp (since all images are now webp)
	return `${normalizedPath}.webp`;
}

const commonSchema = ({ image }: SchemaContext) => z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	heroImage: z.string()
		.transform(resolveImagePath)
		.pipe(image())
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

export const collections = { blog, groups, offers };
