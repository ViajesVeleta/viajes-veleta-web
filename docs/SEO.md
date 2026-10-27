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

Ya configurado (octubre 2026):

- Cloudflare → SSL/TLS → Edge Certificates → **Always Use HTTPS** activado.
- Cloudflare → Rules → Redirect Rules: `www.viajesveleta.es` → `https://viajesveleta.es` + ruta, con 301. El aviso de "DNS not proxied" al crear la regla es una falsa alarma: `www` es un registro de tipo Worker.
- Google Search Console: propiedad de dominio `viajesveleta.es` (verificada con un registro TXT en Cloudflare que no se debe borrar) y sitemap `https://viajesveleta.es/sitemap-index.xml` enviado.

## Mantenimiento

**Última revisión de Search Console: 2026-10-27**

### Al publicar un viaje o página nueva

1. Entra en https://search.google.com/search-console.
2. En la barra de arriba ("Inspeccionar URL"), pega la URL **completa** (`https://viajesveleta.es/viajes-en-grupo/...`), pulsa Enter y luego **Solicitar indexación**.

Límite de unas 10 solicitudes al día.

### Al cambiar la imagen, el título o la descripción de una página ya compartida

1. Entra en https://developers.facebook.com/tools/debug/.
2. Pega la URL, pulsa **Depurar** y después **Volver a extraer**. La vista previa debe mostrar la imagen nueva.

Para varias URLs a la vez, usa https://developers.facebook.com/tools/debug/sharing/batch/ con las URLs **separadas por espacios en una sola línea** (con saltos de línea las toma como una sola). Debe indicar tantas "URL revisadas" como URLs hayas pegado.

WhatsApp usa la misma caché, pero puede tardar uno o dos días en reflejar el cambio.

### Revisión mensual

En Search Console:

- **Rendimiento**: búsquedas por las que aparece la web, impresiones y clics.
- **Indexación → Páginas**: páginas no indexadas y el motivo. Lo normal es que estén todas las del sitemap.
- **Mejoras** (p. ej. "Rutas de exploración"): no debe haber errores en rojo.
- Avisos que Google haya enviado por correo.

Al terminar, actualiza la fecha de "Última revisión" de arriba.
