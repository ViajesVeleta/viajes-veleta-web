# SEO y enlaces compartidos

## Metadatos

`src/components/BaseHead.astro` genera para cada página:

- `<title>` y `<meta name="description">`. La descripción se limpia de Markdown y se recorta a ~160 caracteres (`src/utils/seo.ts`).
- Canonical con barra final.
- Open Graph y Twitter: título, descripción, imagen con dimensiones, tipo y texto alternativo, y `og:site_name`.
- `hreflang` solo para los idiomas de `publishedLanguages` (`src/i18n/ui.ts`).
- `noindex, follow` cuando se pasa la prop `noindex` (404 y etiquetas).
- JSON-LD: `TravelAgency` (datos en `BUSINESS`, `src/consts.ts`) en todas las páginas, más `TouristTrip` y `BreadcrumbList` en las fichas de viaje (`src/layouts/BlogPost.astro`) y `BreadcrumbList` en las páginas con `PageHero`.

Formato de títulos: `{Página} | Viajes Veleta`.

## Imagen al compartir en redes

- **Fichas de viaje**: la imagen `image` del frontmatter (WebP), con sus dimensiones reales.
- **Resto de páginas**: `public/og-default.jpg` (1200×630, logo sobre foto). Es el único JPG del sitio, porque necesita URL estable y máxima compatibilidad. El script `.github/scripts/optimize-images.sh` excluye `public/`, así que no se convierte a WebP.

Facebook, WhatsApp y LinkedIn guardan en caché la vista previa. Tras cambiar una imagen, vuelve a pedirla en:

- Facebook / WhatsApp: https://developers.facebook.com/tools/debug/
- LinkedIn: https://www.linkedin.com/post-inspector/

## Indexación

- `public/robots.txt` apunta a `/sitemap-index.xml`.
- El sitemap (`@astrojs/sitemap` en `astro.config.mjs`) excluye `/tags/` y `/404/`.
- `trailingSlash: 'always'`: todos los enlaces internos llevan barra final. Una URL sin barra recibe un 307 de Cloudflare hacia la versión con barra.
- `src/pages/404.astro` es la página de error. El worker la sirve gracias al binding `ASSETS` de `wrangler.toml`; sin ese binding, las URLs inexistentes devuelven 500.
- Redirecciones permanentes (301) en `public/_redirects` (p. ej. el antiguo slug con tilde de Lofoten).

## Configuración fuera del código (Cloudflare / Google)

- Cloudflare → SSL/TLS → Edge Certificates → **Always Use HTTPS** activado.
- Cloudflare → Rules → Redirect Rules: `www.viajesveleta.es/*` → `https://viajesveleta.es/${1}` con 301.
- Google Search Console: propiedad de dominio `viajesveleta.es` con el sitemap `https://viajesveleta.es/sitemap-index.xml` enviado.
