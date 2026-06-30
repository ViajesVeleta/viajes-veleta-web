import type { ImageMetadata } from "astro";

const images = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/**/*.{png,jpg,jpeg,webp,svg}",
  { eager: true }
);

export function getDynamicImage(imagePath: string | ImageMetadata | undefined | null): ImageMetadata | null {
  if (!imagePath) return null;

  // If it's already an ImageMetadata object, return it
  if (typeof imagePath !== 'string') {
    return imagePath;
  }

  // Extract filename without extension
  // Handles: "/assets/foo.webp", "assets/foo.png", "foo", "foo.jpg" -> "foo"
  const filename = imagePath.split('/').pop()?.split('.')[0];

  if (!filename) return null;

  // Normalize the requested path: remove "assets/" prefix and extension if present
  const searchPath = imagePath
    .replace(/^assets\//, '')
    .replace(/\.[^.]+$/, '');

  // Find matching image by full relative path (not just filename)
  const key = Object.keys(images).find((path) => {
    const normalizedPath = path
      .replace(/^\.\.\/assets\//, '')
      .replace(/\.[^.]+$/, '');
    return normalizedPath === searchPath;
  });

  return key ? images[key].default : null;
}
