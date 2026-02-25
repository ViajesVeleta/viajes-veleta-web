import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

// Absolute path to src/ so we can probe files on disk
const srcDir = fileURLToPath(new URL('.', import.meta.url));

// This function will be used at build time to resolve image paths.
// It probes disk for the actual extension so it works with .jpg originals
// in development and with CI/CD-converted .webp files in production.
function resolveImagePath(imagePath: string): string {
	if (!imagePath) return imagePath;

	// Normalize the path: 'assets/foo' → '../../../assets/foo'
	let normalizedPath = imagePath;
	if (imagePath.startsWith('assets/')) {
		normalizedPath = imagePath.replace('assets/', '../../../assets/');
	}

	// If it already has an extension, return as-is
	if (normalizedPath.match(/\.(png|jpg|jpeg|webp|svg)$/i)) {
		return normalizedPath;
	}

	// Probe disk for the real extension (webp first — CI/CD output — then originals)
	const assetRelPath = normalizedPath.replace('../../../assets/', 'assets/');
	for (const ext of ['webp', 'jpg', 'jpeg', 'png']) {
		if (existsSync(path.join(srcDir, `${assetRelPath}.${ext}`))) {
			return `${normalizedPath}.${ext}`;
		}
	}

	// Fallback (never reached if the image actually exists)
	return `${normalizedPath}.webp`;
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
