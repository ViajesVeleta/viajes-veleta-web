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

	// Normalize the path by removing any leading 'assets/' prefix if present
	// We want to find the file inside srcDir/assets/
	const assetSubPath = imagePath.replace(/^assets\//, '');
	const assetsBaseDir = path.join(srcDir, 'assets');

	// Search for the actual file with a supported extension
	const extensions = ['webp', 'jpg', 'jpeg', 'png', 'svg', 'JPG', 'JPEG', 'PNG'];

	// Check if the path already has a supported extension
	const currentExt = path.extname(assetSubPath).toLowerCase();
	if (currentExt && extensions.includes(currentExt.slice(1))) {
		const fullPath = path.join(assetsBaseDir, assetSubPath);
		if (existsSync(fullPath)) return fullPath;
	}

	// Probe disk for the real extension
	for (const ext of extensions) {
		const fullPath = path.join(assetsBaseDir, `${assetSubPath}.${ext}`);
		if (existsSync(fullPath)) {
			// Returning an absolute path works perfectly with Astro's image()
			return fullPath;
		}
	}

	// Fallback (this might still break, but it's consistent with existing behavior)
	return path.join(assetsBaseDir, `${assetSubPath}.webp`);
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
