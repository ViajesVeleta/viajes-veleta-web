import path from 'node:path';
import fs from 'node:fs';

export const SUPPORTED_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.avif'];

/**
 * Resolves an asset path (without or with extension) to the actual file,
 * returning the absolute path if found, or null otherwise.
 */
export function resolveAssetPath(assetsDir, assetRelativePath) {
    const candidate = path.join(assetsDir, assetRelativePath);

    // If the path already has a supported extension, check it exists
    const ext = path.extname(assetRelativePath).toLowerCase();
    if (SUPPORTED_EXTENSIONS.includes(ext)) {
        return fs.existsSync(candidate) ? candidate : null;
    }

    // Otherwise, try each extension in order
    for (const extension of SUPPORTED_EXTENSIONS) {
        const withExt = candidate + extension;
        if (fs.existsSync(withExt)) {
            return withExt;
        }
    }

    return null;
}
