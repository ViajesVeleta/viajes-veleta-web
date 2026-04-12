import { visit } from 'unist-util-visit';
import path from 'node:path';
import { resolveAssetPath } from '../utils/resolveAsset.mjs';

function relativeImportFromFile(fileDir, assetAbsolutePath) {
    let relativePath = path.relative(fileDir, assetAbsolutePath);
    return relativePath.split(path.sep).join('/');
}

function resolveImgSrcString(src, fileDir, assetsDir, localImagePaths) {
    if (typeof src !== 'string') return null;
    const decoded = decodeURI(src.trim());
    if (/^https?:\/\//i.test(decoded)) return null;

    let assetRelativePath = null;
    if (decoded.startsWith('/src/assets/')) {
        assetRelativePath = decoded.slice('/src/assets/'.length);
    } else if (decoded.startsWith('assets/')) {
        assetRelativePath = decoded.replace(/^assets\//, '');
    }

    if (!assetRelativePath) return null;

    const assetAbsolutePath = resolveAssetPath(assetsDir, assetRelativePath);
    if (!assetAbsolutePath) return null;

    const relImport = relativeImportFromFile(fileDir, assetAbsolutePath);
    localImagePaths.add(relImport);
    return relImport;
}

/**
 * MDX: Las etiquetas <img> compilan a `_jsx("img", …)` y no usan `components.img`.
 * En el árbol rehype son `mdxJsxFlowElement` / `mdxJsxTextElement` con `name: "img"`,
 * no nodos `element`; hay que normalizar el atributo `src` ahí también.
 *
 * Las imágenes `![]()` llegan como `element` con `tagName: "img"`.
 *
 * Tras fijar `src` a una ruta relativa importable (con extensión), `rehypeImageToComponent`
 * las enlaza con `astro:assets`.
 */
export function rehypeResolveMdxImgSrc() {
    return (tree, file) => {
        const filePath = file.path || file.history?.[0];
        if (!filePath || typeof filePath !== 'string') return;

        const fileDir = path.dirname(filePath);
        const assetsDir = path.join(process.cwd(), 'src', 'assets');

        file.data.astro ??= {};
        if (!Array.isArray(file.data.astro.localImagePaths)) {
            file.data.astro.localImagePaths = [];
        }
        const localImagePaths = new Set(file.data.astro.localImagePaths);

        /** @param {import('hast').Element} node */
        const patchHtmlImg = (node) => {
            if (node.tagName !== 'img' || !node.properties?.src) return;
            const raw = node.properties.src;
            if (typeof raw !== 'string') return;
            const rel = resolveImgSrcString(raw, fileDir, assetsDir, localImagePaths);
            if (rel) node.properties.src = rel;
        };

        /**
 * `rehypeImageToComponent` solo visita nodos `element`, no `mdxJsxFlowElement`.
 * Tras normalizar `src`, convertimos `<img />` JSX a `element` para el paso siguiente.
 * @param {import('hast').Element['properties']} properties
 * @param {unknown[]} attributes
 */
        function applyMdxAttributesToProperties(properties, attributes) {
            for (const attr of attributes) {
                if (attr.type !== 'mdxJsxAttribute' || !attr.name) continue;
                if (typeof attr.value !== 'string') continue;
                const name = attr.name === 'className' ? 'class' : attr.name;
                properties[name] = attr.value;
            }
        }

        /** @param {import('mdast').Root['children'][number]} node */
        const patchMdxImg = (node) => {
            if (
                (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') ||
                node.name !== 'img' ||
                !node.attributes?.length
            ) {
                return;
            }
            for (const attr of node.attributes) {
                if (attr.type !== 'mdxJsxAttribute' || attr.name !== 'src') continue;
                if (typeof attr.value !== 'string') continue;
                const rel = resolveImgSrcString(attr.value, fileDir, assetsDir, localImagePaths);
                if (rel) attr.value = rel;
                break;
            }
        };

        /** @param {import('mdast').Root['children'][number]} node */
        const mdxJsxImgToHastElement = (node) => {
            /** @type {import('hast').Element} */
            const hastImg = {
                type: 'element',
                tagName: 'img',
                properties: {},
                children: [],
            };
            applyMdxAttributesToProperties(hastImg.properties, node.attributes);
            return hastImg;
        };

        visit(tree, 'element', patchHtmlImg);
        visit(tree, patchMdxImg);

        visit(tree, (node, index, parent) => {
            if (
                (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') ||
                node.name !== 'img' ||
                parent == null ||
                typeof index !== 'number'
            ) {
                return;
            }
            parent.children[index] = mdxJsxImgToHastElement(node);
        });

        file.data.astro.localImagePaths = Array.from(localImagePaths);
    };
}
