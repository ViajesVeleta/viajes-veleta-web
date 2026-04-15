# Reglas para agentes de IA

## Imágenes

- **Sin extensiones en rutas MDX/MD**: En cualquier `.md` o `.mdx` del repo, las rutas hacia assets **no llevan extensión**. El build resuelve el fichero real (p. ej. `.png` en disco).
  - No escribir `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.avif`, `.pdf` ni otras extensiones en rutas dentro del Markdown/MDX.
  - Cubre: `![alt](ruta)`, `<img src="ruta" />`, atributos `image="ruta"` / `src` en componentes, frontmatter tipo `image: "assets/..."`, y cadenas dentro de JS inline en MDX.
  - El fichero en `src/assets/` puede guardarse con extensión en disco; solo el texto del MDX/MD omite la extensión.

- **Imágenes en el cuerpo del contenido**: Prefiere `![alt](assets/.../nombre-sin-ext)` en lugar de `<img src="...">`. Así Astro pasa la imagen por el pipeline de assets y el HTML final usa URLs absolutas (`/_astro/...`) que funcionan en cualquier ruta del sitio.

- **URLs remotas**: Nunca usar URLs remotas en el contenido final. Cualquier imagen externa debe descargarse y guardarse en `src/assets/...` antes de referenciarla.

- **Nombres de mapas**: Si la imagen es un mapa, el nombre del archivo debe terminar en `-mapa` (p. ej. `selva-negra-y-alsacia-mapa.png`); en el MDX se referencia como `.../selva-negra-y-alsacia-mapa` sin extensión.

- **Imágenes múltiples**: Si hay varias imágenes del mismo sitio, usar sufijos numéricos (por ejemplo `...-1`, `...-2`).

- **Formato original**: No convertir manualmente a `webp`; usar el formato original y dejar la conversión a CI.

- **Estructura de carpetas**: Todas las imágenes del viaje deben guardarse en `src/assets/` siguiendo estructura `continente/pais/...`; no usar `public/`.

## Código

- Minimizar comentarios innecesarios
- Respetar las convenciones existentes del codebase

## Viajes en grupo

- Al crear un nuevo viaje en grupo, usar como base `.templates/plantilla-viaje-en-grupo.mdx`.
- Mantener la misma estructura de secciones y componentes (itinerario, precios, incluye/excluye, vuelos, pagos, observaciones).
- No inventar datos del viaje durante el proceso de sustitución de la plantilla.
- Si faltan datos, mantener placeholders de la plantilla sin cambios.
- La introducción y la descripción son siempre el mismo texto: cualquier texto nuevo de `description` debe copiarse exactamente también en el primer `<ColumnItem>`.
- Verificar que el `id` del frontmatter sea único y coherente con el slug.

### Viajes de experiencia fotográfica

- Si el título contiene `Experiencia fotográfica`, añadir las secciones: `## Dirigido a`, `## Localizaciones`, `## Programa`, `## Equipo necesario` y `## A tener en cuenta`.
- Incluir también las secciones `## Miguel Gil León` y la galería final de imágenes.

## Builds

- Verificar que `npm run build` pase después de cada cambio significativo
