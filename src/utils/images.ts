import type { ImageMetadata } from "astro";

const images = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/*.{png,jpg,jpeg,webp,svg}",
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

  // Find matching image in glob result
  const key = Object.keys(images).find((path) => {
    const pathName = path.split('/').pop()?.split('.')[0];
    return pathName === filename;
  });

  return key ? images[key].default : null;
}
