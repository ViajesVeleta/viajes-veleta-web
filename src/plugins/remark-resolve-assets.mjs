import { visit } from 'unist-util-visit';
import path from 'path';
import { resolveAssetPath } from '../utils/resolveAsset.mjs';

const srcRoot = () => path.join(process.cwd(), 'src');

/**
 * Path inside src/assets (no leading assets/), may omit extension.
 */
function resolveUnderAssets(assetsDir, assetRelativePath) {
    return resolveAssetPath(assetsDir, assetRelativePath);
}

function relativeImportFromFile(fileDir, assetAbsolutePath) {
    let relativePath = path.relative(fileDir, assetAbsolutePath);
    return relativePath.split(path.sep).join('/');
}

/**
 * `/src/assets/...` URL with real extension (for inline JS strings loaded at runtime).
 */
function absoluteSrcUrlFromFile(assetAbsolutePath) {
    const rel = path.relative(srcRoot(), assetAbsolutePath).split(path.sep).join('/');
    return `/src/${rel}`;
}

/**
 * Replace extensionless `/src/assets/...` paths inside a JS string (e.g. onclick) with URLs that include the real file extension.
 */
function resolveExtensionlessStringsInJs(js, assetsDir) {
    return js.replace(/(['"])(\/?src\/assets\/[^'"]+)\1/g, (full, quote, inner) => {
        const normalized = inner.startsWith('/') ? inner : `/${inner}`;
        if (!normalized.startsWith('/src/assets/')) return full;

        const assetRelativePath = normalized.replace(/^\/src\/assets\//, '');
        const assetAbsolutePath = resolveUnderAssets(assetsDir, assetRelativePath);
        if (!assetAbsolutePath) return full;

        return `${quote}${absoluteSrcUrlFromFile(assetAbsolutePath)}${quote}`;
    });
}

export function remarkResolveAssets() {
    return function (tree, file) {
        if (!file.history || file.history.length === 0) return;

        const filePath = file.history[0];
        const fileDir = path.dirname(filePath);
        const assetsDir = path.join(process.cwd(), 'src', 'assets');

        visit(tree, 'image', (node) => {
            if (node.url && node.url.startsWith('assets/')) {
                const assetRelativePath = node.url.replace(/^assets\//, '');
                const assetAbsolutePath = resolveUnderAssets(assetsDir, assetRelativePath);

                if (!assetAbsolutePath) {
                    return;
                }

                node.url = relativeImportFromFile(fileDir, assetAbsolutePath);
            }
        });

        /**
         * MDX: no reescribir `src` de `<img>` aquí: rutas relativas al .mdx rompen en el HTML estático.
         * Los `<img>` JSX se normalizan en `rehype-resolve-mdx-img-src` + `rehypeImageToComponent` (Astro).
         * Solo seguimos completando extensiones en strings JS (onclick, etc.).
         */
        visit(tree, (node) => {
            if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') {
                return;
            }
            if (!node.attributes || !Array.isArray(node.attributes)) {
                return;
            }

            for (const attr of node.attributes) {
                if (attr.type !== 'mdxJsxAttribute' || typeof attr.value !== 'string') {
                    continue;
                }

                if (
                    attr.value.includes('/src/assets/') &&
                    (attr.name === 'onclick' || attr.name === 'onClick' || attr.name?.startsWith('on'))
                ) {
                    attr.value = resolveExtensionlessStringsInJs(attr.value, assetsDir);
                }
            }
        });
    };
}
