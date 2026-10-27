# Viajes Veleta – Web

Web de [viajesveleta.es](https://viajesveleta.es), agencia de viajes en Guadix. Hecha con [Astro](https://astro.build) y desplegada en Cloudflare Workers.

## Comandos

| Comando | Acción |
| :-- | :-- |
| `npm install` | Instala dependencias |
| `npm run dev -- --port 4329` | Servidor de desarrollo |
| `npm run build` | `astro check` + build de producción en `./dist/` |
| `npm run preview` | Previsualiza el build |
| `npx wrangler dev` | Ejecuta el build con el worker de Cloudflare en local (tras `npm run build`) |

## Estructura

```text
├── .templates/              Plantilla para nuevos viajes en grupo
├── docs/                    Documentación (SEO, estado de secciones, design system…)
├── public/                  Ficheros con URL fija: og-default.jpg, favicons, robots.txt, _redirects, fuentes
├── src/
│   ├── assets/              Imágenes por continente/país/… (se referencian sin extensión)
│   ├── components/          Componentes Astro (BaseHead gestiona el SEO)
│   ├── content/             Colecciones: viajes-en-grupo, blog, ofertas, reviews
│   ├── layouts/             BlogPost.astro: layout de fichas de viaje y posts
│   ├── pages/               Rutas (las que empiezan por _ están deshabilitadas)
│   └── styles/              CSS global
├── astro.config.mjs
└── wrangler.toml
```

## Contenido

- Viajes en grupo: `src/content/viajes-en-grupo/es/`, a partir de `.templates/plantilla-viaje-en-grupo.mdx`.
- Reglas para crear contenido e imágenes: [AGENTS.md](AGENTS.md).
- Varios idiomas: [docs/MULTILANGUAGE_CONTENT_GUIDE.md](docs/MULTILANGUAGE_CONTENT_GUIDE.md).

## Secciones deshabilitadas

- Blog: [docs/BLOG_STATUS.md](docs/BLOG_STATUS.md)
- Ofertas: [docs/OFFERS_STATUS.md](docs/OFFERS_STATUS.md)
- Inglés: [docs/LANGUAGE_STATUS.md](docs/LANGUAGE_STATUS.md)
- Modo oscuro: [docs/THEME_STATUS.md](docs/THEME_STATUS.md)

## SEO

Ver [docs/SEO.md](docs/SEO.md): metadatos, imagen al compartir, sitemap, redirecciones y la configuración necesaria en Cloudflare y Search Console.

## CI/CD

- `deploy-web.yml`: en cada push a `main`, check + build + `wrangler deploy`.
- `preview-web.yml` / `cleanup-preview-web.yml`: un worker de preview por PR.
- `pr-image-optimization.yml` / `weekly-image-optimization.yml`: convierten PNG/JPG a WebP y reducen imágenes grandes (excepto `public/`).
