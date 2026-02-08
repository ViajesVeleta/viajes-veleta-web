import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

import type { ImageMetadata } from "astro";

// Load all images eagerly for dynamic resolution
const allImages = import.meta.glob<{ default: ImageMetadata }>(
	"/src/assets/*.{png,jpg,jpeg,webp,svg}",
	{ eager: true },
);

const resolveImage = (path: string) => {
	// Normalize path: assets/foo.png -> foo
	// Also handle full paths if passed
	const cleanName = path.split("/").pop()?.split(".")[0];
	if (!cleanName) return undefined;

	// Search for matching image in glob results
	const match = Object.keys(allImages).find((key) => {
		const keyName = key.split("/").pop()?.split(".")[0];
		return keyName === cleanName;
	});

	return match ? allImages[match].default : undefined;
};

const commonSchema = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	heroImage: z.string().transform((val, ctx) => {
		const img = resolveImage(val);
		if (!img) {
			// Warn but don't fail hard? Or fail? The original schema would fail if image missing.
			// We can let it pass as undefined or throw error.
			// Let's emulate pipe(image()) behavior which validates existence.
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Image not found: ${val}`,
			});
			return z.NEVER;
		}
		return img;
	}).optional(),
	tags: z.array(z.string()).optional(),
	id: z.string().optional(),
});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: commonSchema,
});

const groups = defineCollection({
	loader: glob({ base: './src/content/viajes-en-grupo', pattern: '**/*.{md,mdx}' }),
	schema: commonSchema.extend({
		category: z.enum(['spain', 'europe', 'long-haul']).optional(),
	}),
});

const offers = defineCollection({
	loader: glob({ base: './src/content/ofertas', pattern: '**/*.{md,mdx}' }),
	schema: commonSchema,
});

export const collections = { blog, groups, offers };
