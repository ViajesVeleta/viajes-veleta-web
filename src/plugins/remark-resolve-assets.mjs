import { visit } from 'unist-util-visit';
import path from 'path';
import fs from 'fs';

const SUPPORTED_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.avif'];

/**
 * Resolves an asset path (without or with extension) to the actual file,
 * returning the absolute path if found, or null otherwise.
 */
function resolveAssetPath(assetsDir, assetRelativePath) {
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

export function remarkResolveAssets() {
    return function (tree, file) {
        if (!file.history || file.history.length === 0) return;

        // file.history[0] is typically the absolute path to the file being processed
        const filePath = file.history[0];
        const fileDir = path.dirname(filePath);

        // Define absolute path to assets.
        // process.cwd() is the project root in Astro.
        const assetsDir = path.join(process.cwd(), 'src', 'assets');

        visit(tree, 'image', (node) => {
            if (node.url && node.url.startsWith('assets/')) {
                // Remove 'assets/' prefix to get the relative file path inside assets dir
                const assetRelativePath = node.url.replace(/^assets\//, '');

                // Resolve the actual asset file (including finding the extension if omitted)
                const assetAbsolutePath = resolveAssetPath(assetsDir, assetRelativePath);

                if (!assetAbsolutePath) {
                    // Asset not found — leave the URL as-is so the broken image is visible in dev
                    return;
                }

                // Calculate relative path from current file's directory to the asset
                let relativePath = path.relative(fileDir, assetAbsolutePath);

                // Normalize path separators for Windows → forward slashes (Markdown/Vite standard)
                relativePath = relativePath.split(path.sep).join('/');

                node.url = relativePath;
            }
        });
    };
}
