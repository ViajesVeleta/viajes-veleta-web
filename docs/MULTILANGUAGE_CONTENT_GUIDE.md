# Guía: contenido en varios idiomas

> ⚠️ Ahora mismo solo se publica el **español**. La versión en inglés, el blog y las ofertas están deshabilitados (ver `docs/LANGUAGE_STATUS.md`, `docs/BLOG_STATUS.md` y `docs/OFFERS_STATUS.md`). Los ficheros en inglés pueden existir en el repo, pero no generan páginas hasta que se reactive el idioma.

## Idiomas

- **Español (`es`)**: idioma por defecto, sin prefijo en la URL.
- **Inglés (`en`)**: prefijo `/en/` (deshabilitado).

Los idiomas publicados se controlan con `publishedLanguages` en `src/i18n/ui.ts`.

## Colecciones y carpetas

| Colección | Carpeta | URL (es) | Estado |
|---|---|---|---|
| `groups` | `src/content/viajes-en-grupo/{es,en}/` | `/viajes-en-grupo/{slug}/` | Publicada |
| `blog` | `src/content/blog/{es,en}/` | `/blog/{slug}/` | Deshabilitada |
| `offers` | `src/content/ofertas/{es,en}/` | `/ofertas/{slug}/` | Deshabilitada |

El esquema de cada colección está en `src/content.config.ts`.

## Cómo se enlazan las traducciones

- El **slug** de la URL es el nombre del fichero (sin extensión): minúsculas, kebab-case, sin tildes ni ñ.
- El campo **`id`** del frontmatter une las traducciones: debe ser **el mismo en `es/` y `en/`** y coincidir con el nombre del fichero español.
- Usa el mismo nombre de fichero en ambos idiomas.

## Frontmatter de un viaje en grupo

Para viajes nuevos, parte siempre de `.templates/plantilla-viaje-en-grupo.mdx` (ver `AGENTS.md`).

```yaml
---
id: "nombre-del-viaje"
title: "Nombre del viaje"
description: "Primera frase que resume el viaje. Resto de la introducción…"
date: "2027-05-10"        # fecha de salida
endDate: "2027-05-17"     # fecha de regreso (opcional)
image: "assets/europa/espana/ciudad/cabecera"   # sin extensión
category: "spain"         # spain | europe | long-haul | photography (o un array)
tags: ["viajes-en-grupo", "espana", "cultura"]  # minúsculas, sin tildes
location: ["Ciudad 1", "Ciudad 2"]
---
```

En la versión inglesa se mantienen `id`, `date`, `endDate`, `image` y `category`, y se traducen `title`, `description`, `tags`, `location` y el cuerpo.

## Frontmatter de un post del blog

Sigue `.agent/rules/blog-post-creation.md`. Los campos son `id`, `title`, `description`, `date`, `image` (opcional), `tags` y `location`.

## Qué se genera

- **URLs**: `/viajes-en-grupo/{slug}/` y, si el inglés está publicado, `/en/viajes-en-grupo/{slug}/`.
- **SEO**: `BaseHead.astro` añade `hreflang` entre traducciones solo para los idiomas de `publishedLanguages`. Más detalles en `docs/SEO.md`.
- **RSS**: solo con el blog habilitado (`/rss.xml`, `/en/rss.xml`).

## Comprobaciones

- [ ] Mismo `id` y mismo nombre de fichero en `es/` y `en/`.
- [ ] Nombre de fichero e `id` sin tildes ni ñ.
- [ ] `image` sin extensión y empezando por `assets/`.
- [ ] Tags sin tildes y traducidos en la versión inglesa.
- [ ] `npm run build` pasa.
- [ ] Revisión local con `npm run dev -- --port 4329`.
