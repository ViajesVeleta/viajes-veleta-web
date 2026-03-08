#!/usr/bin/env node

/**
 * migrate-wp-posts.js
 *
 * Migra posts de WordPress (viajesveleta.net) al formato Markdown de Astro.
 * Solo genera archivos en español (es/). Las traducciones al inglés se hacen manualmente.
 *
 * Uso:
 *   node scripts/migrate-wp-posts.js             # Migra todos los posts pendientes
 *   node scripts/migrate-wp-posts.js --limit 5   # Solo los 5 más recientes (para pruebas)
 *   node scripts/migrate-wp-posts.js --slug mi-post  # Solo un post concreto
 *
 * Los placeholders TODO_TAGS y TODO_LOCATION se pueden reemplazar
 * luego con una búsqueda por regex en toda la carpeta es/.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const WP_BASE = 'https://viajesveleta.net/wp-json/wp/v2';
const BLOG_CATEGORY_ID = 7; // "Lugares Singulares" ← los posts del blog real
const ES_DIR = path.join(ROOT, 'src/content/blog/es/TODO');
const ASSETS_DIR = path.join(ROOT, 'src/assets/TODO');
const ASSETS_URL_PREFIX = 'assets/TODO';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Convierte cualquier texto a kebab-case sin tildes */
function toSlug(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita diacríticos
        .replace(/[^a-z0-9\s-]/g, '')   // solo alfanum y guiones
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

/** Genera un nombre de fichero de imagen a partir de una URL */
function imageFilenameFromUrl(url) {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname);              // 2024.08.12-0841-phayao-lake-blog.jpg
    const ext = path.extname(base);                           // .jpg
    const nameRaw = path.basename(base, ext);                 // 2024.08.12-0841-phayao-lake-blog
    const decoded = decodeURIComponent(nameRaw);              // decodifica %C3%B1 → ñ
    const name = toSlug(decoded.replace(/\./g, '-'));         // limpio, sin tildes
    return { filename: name + ext, ext: ext.slice(1) };
}

/** Devuelve un nombre único para la imagen (añade sufijo si ya existe) */
function uniqueImagePath(dir, filename) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    let candidate = path.join(dir, filename);
    let counter = 2;
    while (fs.existsSync(candidate)) {
        candidate = path.join(dir, `${base}-${counter}${ext}`);
        counter++;
    }
    return candidate;
}

/** Descarga un archivo binario a destino */
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        const file = fs.createWriteStream(dest);
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                // Sigue redirecciones
                downloadFile(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} al descargar ${url}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

/** Hace una petición GET a la WP API y devuelve el JSON parseado */
function wpGet(endpoint) {
    return new Promise((resolve, reject) => {
        const url = endpoint.startsWith('http') ? endpoint : `${WP_BASE}${endpoint}`;
        https.get(url, { headers: { 'User-Agent': 'ViajesVeleta-Migrator/1.0' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error(`JSON inválido en ${url}: ${e.message}`)); }
            });
        }).on('error', reject);
    });
}

/** Convierte HTML a Markdown simplificado */
function htmlToMarkdown(html) {
    return html
        // Eliminar scripts/styles
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // Cabeceras
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, c) => `# ${stripTags(c)}\n\n`)
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `## ${stripTags(c)}\n\n`)
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `### ${stripTags(c)}\n\n`)
        .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, c) => `#### ${stripTags(c)}\n\n`)
        // Énfasis
        .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, c) => `**${stripTags(c)}**`)
        .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, c) => `**${stripTags(c)}**`)
        .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, c) => `*${stripTags(c)}*`)
        .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, c) => `*${stripTags(c)}*`)
        // Links
        .replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `[${stripTags(text)}](${href})`)
        // Lists
        .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, items) => items + '\n')
        .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, items) => items + '\n')
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `- ${stripTags(c).trim()}\n`)
        // Párrafos y bloques
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')
        .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => `> ${stripTags(c).trim()}\n\n`)
        // Limpiar resto de tags (excepto img que se tratan aparte)
        .replace(/<(?!img)[^>]+>/gi, '')
        // Entidades HTML
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
        .replace(/&#8216;|&#8217;|&lsquo;|&rsquo;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#\d+;/g, '')
        // Espacios en blanco excesivos
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function stripTags(str) {
    return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/** Elimina los <a> que envuelven <img> para evitar links rotos en el Markdown */
function unwrapLinkedImages(html) {
    return html.replace(/<a[^>]*>\s*(<img[^>]+>)\s*<\/a>/gi, '$1');
}

/**
 * Extrae todas las URLs de imágenes (<img src="...">) del HTML.
 * Solo incluye imágenes alojadas en viajesveleta.net (no externas).
 */
function extractBodyImages(html) {
    const images = [];
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        const src = match[1];
        if (src.includes('viajesveleta.net')) {
            images.push(src);
        }
    }
    return images;
}

/** Reemplaza los <img> del HTML por placeholders [[IMAGEN:url]] para procesarlos después */
function markBodyImages(html) {
    return html.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, (_, src) => {
        if (src.includes('viajesveleta.net')) {
            return `[[IMAGEN:${src}]]`;
        }
        return ''; // descarta imágenes externas
    });
}

// ─── LÓGICA PRINCIPAL ────────────────────────────────────────────────────────

/** Obtiene slugs y títulos normalizados de todos los posts ya migrados en es/ y es/TODO/ */
function getMigratedPosts() {
    const slugs = new Set();
    const titles = new Set();

    // Buscamos en es/ (ya definitivos) y en es/TODO/ (pendientes de revisar)
    const dirsToScan = [
        path.join(ROOT, 'src/content/blog/es'),
        path.join(ROOT, 'src/content/blog/es/TODO'),
    ];

    for (const dir of dirsToScan) {
        if (!fs.existsSync(dir)) continue;
        for (const file of fs.readdirSync(dir)) {
            if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
            slugs.add(path.basename(file, path.extname(file)));
            try {
                const content = fs.readFileSync(path.join(dir, file), 'utf-8');
                const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
                if (titleMatch) titles.add(toSlug(titleMatch[1]));
            } catch { /* ignoramos si no se puede leer */ }
        }
    }

    return { slugs, titles };
}

/** Obtiene la URL de la imagen destacada por media_id */
async function getFeaturedImageUrl(mediaId) {
    if (!mediaId) return null;
    try {
        const media = await wpGet(`/media/${mediaId}?_fields=source_url`);
        return media.source_url || null;
    } catch {
        return null;
    }
}

/**
 * Descarga una imagen y devuelve la referencia assets/... sin extensión.
 * Las imágenes se guardan directamente en src/assets/TODO/
 */
async function downloadAndRegisterImage(imageUrl) {
    const { filename } = imageFilenameFromUrl(imageUrl);
    const destDir = ASSETS_DIR;
    const destPath = uniqueImagePath(destDir, filename);
    const imageName = path.basename(destPath, path.extname(destPath));

    try {
        await downloadFile(imageUrl, destPath);
        return `${ASSETS_URL_PREFIX}/${imageName}`;
    } catch (err) {
        console.warn(`  ⚠️  No se pudo descargar imagen: ${imageUrl} → ${err.message}`);
        return null;
    }
}

/** Procesa un post de la API y lo escribe en es/ */
async function migratePost(post) {
    const slug = post.slug;
    const rawTitle = post.title.rendered;
    // Decodificar entidades HTML en el título (ej: &#8230; → …)
    const title = rawTitle
        .replace(/&#8230;/g, '…')
        .replace(/&#8220;|&ldquo;/g, '"')
        .replace(/&#8221;|&rdquo;/g, '"')
        .replace(/&#8216;|&lsquo;/g, "'")
        .replace(/&#8217;|&rsquo;/g, "'")
        .replace(/&#8211;|&ndash;/g, '–')
        .replace(/&#8212;|&mdash;/g, '—')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    const rawDate = post.date.substring(0, 10); // YYYY-MM-DD
    const htmlContent = post.content.rendered;

    console.log(`\n📝 Migrando: "${title}" [${slug}]`);

    // 1. Imagen destacada (hero)
    let heroRef = null;
    let heroUrl = null;
    if (post.featured_media) {
        heroUrl = await getFeaturedImageUrl(post.featured_media);
        if (heroUrl) {
            console.log(`  🖼  Hero: ${heroUrl}`);
            heroRef = await downloadAndRegisterImage(heroUrl);
        }
    }

    // 2. Imágenes del body
    // Primero limpiamos <a href><img></a> para evitar links rotos en el MD
    const cleanHtml = unwrapLinkedImages(htmlContent);
    const bodyImageUrls = extractBodyImages(cleanHtml);
    console.log(`  🖼  Imágenes en body: ${bodyImageUrls.length}`);

    // Mapa: URL original → referencia assets/... sin extensión
    // Si la url del body coincide con la hero, reutilizamos la ref (evita duplicado -2)
    const bodyImageMap = {};
    for (const imgUrl of bodyImageUrls) {
        if (heroRef && heroUrl && imgUrl === heroUrl) {
            bodyImageMap[imgUrl] = heroRef;
        } else {
            const ref = await downloadAndRegisterImage(imgUrl);
            if (ref) bodyImageMap[imgUrl] = ref;
        }
    }

    // 3. Convertir HTML a Markdown (con placeholders [[IMAGEN:url]])
    const markedHtml = markBodyImages(cleanHtml);
    let md = htmlToMarkdown(markedHtml);

    // 4. Reemplazar los placeholders por el formato Astro correcto (sin extensión)
    md = md.replace(/\[\[IMAGEN:([^\]]+)\]\]/g, (_, url) => {
        const ref = bodyImageMap[url];
        if (ref) return `\n\n![](${ref})\n\n`;
        return ''; // si no se pudo descargar, se omite
    });

    // Limpieza final de saltos
    md = md.replace(/\n{3,}/g, '\n\n').trim();

    // 5. Construir frontmatter
    const imageField = heroRef ? `image: "${heroRef}"` : null;

    const frontmatter = [
        '---',
        `id: "${slug}"`,
        `title: "${title.replace(/"/g, '\\"')}"`,
        `description: "TODO_DESCRIPTION"`,
        `date: "${rawDate}"`,
        ...(imageField ? [imageField] : []),
        `tags: ["TODO_TAGS"]`,
        `location: ["TODO_LOCATION"]`,
        '---',
    ].join('\n');

    // 6. Escribir archivo Markdown
    const destFile = path.join(ES_DIR, `${slug}.md`);
    fs.mkdirSync(ES_DIR, { recursive: true });
    fs.writeFileSync(destFile, `${frontmatter}\n\n${md}\n`, 'utf-8');

    console.log(`  ✅  Escrito: src/content/blog/es/${slug}.md`);
}

/** Pagina la API de WP y devuelve todos los posts */
async function fetchAllPosts(opts = {}) {
    const posts = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        let url = `${WP_BASE}/posts?per_page=${perPage}&page=${page}&categories=${BLOG_CATEGORY_ID}&_fields=id,slug,title,date,content,featured_media&orderby=date&order=desc`;
        if (opts.slug) {
            url = `${WP_BASE}/posts?slug=${opts.slug}&categories=${BLOG_CATEGORY_ID}&_fields=id,slug,title,date,content,featured_media`;
        }

        const batch = await wpGet(url);
        if (!Array.isArray(batch) || batch.length === 0) break;
        posts.push(...batch);

        if (opts.slug) break; // slug único
        if (batch.length < perPage) break;
        page++;

        process.stdout.write(`  📦 Descargando posts... página ${page} (${posts.length} obtenidos hasta ahora)\r`);
    }

    return posts;
}

// ─── ENTRADA ─────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const limitIdx = args.indexOf('--limit');
    const slugIdx = args.indexOf('--slug');
    const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) : null;
    const slugFilter = slugIdx !== -1 ? args[slugIdx + 1] : null;

    console.log('🚀 Iniciando migración de posts de viajesveleta.net...\n');

    const migratedPosts = getMigratedPosts();
    console.log(`ℹ️  Posts ya migrados: ${migratedPosts.slugs.size}`);
    if (migratedPosts.slugs.size > 0) {
        console.log(`   ${[...migratedPosts.slugs].join(', ')}\n`);
    }

    console.log('📡 Descargando lista de posts desde la API...');
    const posts = await fetchAllPosts({ limit, slug: slugFilter });
    console.log(`\n📊 Posts encontrados en WP: ${posts.length}`);

    const pending = posts.filter(p => {
        // Comprobación 1: por slug (nombre de archivo)
        if (migratedPosts.slugs.has(p.slug)) return false;
        // Comprobación 2: por título normalizado (por si el archivo tiene nombre distinto)
        const wpTitleSlug = toSlug(p.title.rendered);
        if (migratedPosts.titles.has(wpTitleSlug)) {
            console.log(`  ⏭️  Saltando "${p.title.rendered}" (título ya migrado con slug distinto)`);
            return false;
        }
        return true;
    });

    // Ordenar explícitamente por fecha DESC (más recientes primero)
    pending.sort((a, b) => new Date(b.date) - new Date(a.date));

    const toMigrate = limit ? pending.slice(0, limit) : pending;
    console.log(`📝 Posts pendientes de migrar: ${pending.length}${limit ? ` (migrando los ${toMigrate.length} más recientes)` : ''}`);

    if (pending.length === 0) {
        console.log('\n✅ ¡Todo está migrado! No hay nada que hacer.');
        return;
    }

    let success = 0;
    let errors = 0;

    for (const post of toMigrate) {
        try {
            await migratePost(post);
            success++;
        } catch (err) {
            console.error(`\n❌ Error migrando "${post.slug}": ${err.message}`);
            errors++;
        }
    }

    console.log(`\n\n🏁 Migración completada.`);
    console.log(`   ✅ Migrados: ${success}`);
    if (errors > 0) console.log(`   ❌ Errores: ${errors}`);
    console.log(`\n💡 Recuerda reemplazar los placeholders TODO_TAGS, TODO_LOCATION y TODO_DESCRIPTION`);
    console.log(`   con los valores correctos para cada post antes de hacer el commit.`);
}

main().catch(err => {
    console.error('\n💥 Error fatal:', err);
    process.exit(1);
});
