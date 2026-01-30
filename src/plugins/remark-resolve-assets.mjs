import { visit } from 'unist-util-visit';
import path from 'path';

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

                // Construct absolute path to the asset
                const assetAbsolutePath = path.join(assetsDir, assetRelativePath);

                // Calculate relative path from current file's directory to the asset
                let relativePath = path.relative(fileDir, assetAbsolutePath);

                // Normalize path separators for Windows to use forward slashes (Markdown/Vite standard)
                relativePath = relativePath.split(path.sep).join('/');

                // Ensure relative paths usually start with ./ or ../ for explicit relativism in restricted envs
                // though strictly not required if not inside node_modules etc, but good practice.
                // If it returns just "foo.png", make it "./foo.png"
                // Actually path.relative might return "foo.png" if in same dir.

                // But assets is likely ../../.. so it will start with ..

                node.url = relativePath;
            }
        });
    };
}
