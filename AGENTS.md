# Reglas para agentes de IA

Web de Viajes Veleta (Astro + Cloudflare Workers). Estructura, comandos y documentación en `README.md` y `docs/`.

## Entorno

- Servidor de desarrollo para pruebas: `npm run dev -- --port 4329` (puerto fijo para no chocar con otras instancias).
- Verificar que `npm run build` pase después de cada cambio significativo (incluye `astro check`).

## Código

- Minimizar comentarios innecesarios
- Respetar las convenciones existentes del codebase
- Enlaces internos siempre con barra final (`/contacto/`, `/viajes-en-grupo/`): el sitio usa `trailingSlash: 'always'`.
- Las secciones deshabilitadas (blog, ofertas, inglés, modo oscuro) están documentadas en `docs/*_STATUS.md`. No enlazar a ellas mientras estén deshabilitadas.
- Iconos: `<Icon name="fa-solid fa-phone" />` (también en MDX), que inserta el SVG de Font Awesome en el HTML. No usar `<i class="fa-...">`: la hoja de estilos y la fuente de Font Awesome no se cargan. Si el icono es nuevo, añadirlo a la lista de `src/components/Icon.astro`.

### Soluciones estándar primero

Antes de escribir código propio, usar la herramienta menos potente que resuelva el problema, en este orden:

1. **CSS**: layout con Flexbox/Grid, responsive con media queries, animaciones con transitions/keyframes, estados con pseudo-clases (`:hover`, `:focus`, `:active`).
2. **HTML**: elementos semánticos, tipos de input y validación nativos.
3. **Web APIs**: IntersectionObserver, ResizeObserver, localStorage…
4. **JavaScript mínimo**, solo para comportamiento (lógica, datos dinámicos, APIs), nunca para presentación.

Señales de que se va por mal camino: listeners de `resize`, calcular posiciones o anchos para maquetar, bucles de animación o `setTimeout` para animar, mostrar/ocultar elementos según el tamaño de pantalla desde JS. Ejemplo real de este repo: el menú responsive se hizo primero con ~100 líneas de JS que medían anchos y daba fallos; se sustituyó por una media query de 4 líneas.

## Imágenes

- **Sin extensiones en rutas MDX/MD**: En cualquier `.md` o `.mdx` del repo, las rutas hacia assets **no llevan extensión**. El build resuelve el fichero real (p. ej. `.png` en disco).
  - No escribir `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.avif`, `.pdf` ni otras extensiones en rutas dentro del Markdown/MDX.
  - Cubre: `![alt](ruta)`, `<img src="ruta" />`, atributos `image="ruta"` / `src` en componentes, frontmatter tipo `image: "assets/..."`, y cadenas dentro de JS inline en MDX.
  - Si encuentras una ruta con extensión al editar, quítala.
  - El fichero en `src/assets/` puede guardarse con extensión en disco; solo el texto del MDX/MD omite la extensión.

- **Imágenes en el cuerpo del contenido**: Prefiere `![alt](assets/.../nombre-sin-ext)` en lugar de `<img src="...">`. Así Astro pasa la imagen por el pipeline de assets y el HTML final usa URLs absolutas (`/_astro/...`) que funcionan en cualquier ruta del sitio. Un `<img>` con ruta relativa al fichero fuente se rompe en el HTML estático, porque el navegador la resuelve respecto a la URL de la página.

  ```mdx
  <!-- ❌ MAL -->
  ![Mapa](assets/europa/espana/cantabria/cantabria-infinita-mapa.png)
  <TimelineItem image="assets/europa/espana/cantabria/comillas.jpg" />

  <!-- ✅ BIEN -->
  ![Mapa](assets/europa/espana/cantabria/cantabria-infinita-mapa)
  <TimelineItem image="assets/europa/espana/cantabria/comillas" />
  ```

- **URLs remotas**: Nunca usar URLs remotas en el contenido final. Cualquier imagen externa debe descargarse y guardarse en `src/assets/...` antes de referenciarla.

- **Nombres de mapas**: Si la imagen es un mapa, el nombre del archivo debe terminar en `-mapa` (p. ej. `selva-negra-y-alsacia-mapa.png`); en el MDX se referencia como `.../selva-negra-y-alsacia-mapa` sin extensión.

- **Imágenes múltiples**: Si hay varias imágenes del mismo sitio, usar sufijos numéricos (por ejemplo `...-1`, `...-2`).

- **Nombres de fichero**: minúsculas, kebab-case, sin tildes. Si ya existe un fichero con ese nombre, añadir sufijo numérico.

- **Formato original**: No convertir manualmente a `webp`; usar el formato original y dejar la conversión a CI.

- **Estructura de carpetas**: Todas las imágenes del viaje deben guardarse en `src/assets/` siguiendo estructura `continente/pais/...` (p. ej. `src/assets/europa/francia/paris/torre-eiffel.jpg`); no usar `public/`.
  - `public/` queda reservado a ficheros que necesitan URL y formato fijos: `og-default.jpg`, favicons, `robots.txt`, `site.webmanifest`, `_redirects` y fuentes. El CI no convierte nada de `public/`.

## SEO

- Los metadatos (title, description, Open Graph, Twitter, hreflang, JSON-LD) se generan en `src/components/BaseHead.astro`. Detalles en `docs/SEO.md`.
- La imagen de cabecera (`image` del frontmatter) es la que se muestra al compartir el enlace en redes. Todo viaje debe tenerla, preferiblemente horizontal.
- Slugs (nombre de fichero) e `id` en minúsculas, kebab-case y **sin tildes ni ñ** (`articos`, no `árticos`).
- Tags en minúsculas, kebab-case y sin tildes (`gastronomia`, `artico`).
- Si se cambia el slug de una página publicada, añadir una redirección 301 en `public/_redirects`.
- No añadir enlaces a páginas en inglés en `translatedPaths` si el idioma no está en `publishedLanguages` (`src/i18n/ui.ts`).

## Recordatorios al usuario

Las tareas de SEO fuera del código (Search Console, caché de Facebook) son manuales y se olvidan. Recuérdalas al terminar la tarea, de forma breve, una sola vez por conversación y sin bloquear el trabajo. Los pasos detallados están en `docs/SEO.md` → "Mantenimiento".

- **Viaje o página nueva publicada**: recordar pedir la indexación de su URL en Search Console.
- **Cambio de imagen de cabecera, título o descripción de una página ya publicada**: recordar volver a extraerla en el Sharing Debugger de Facebook (también actualiza WhatsApp).
- **Cambio de slug**: además de la redirección 301 en `public/_redirects`, recordar ambas cosas para la URL nueva.
- **Revisión mensual**: `docs/SEO.md` guarda la fecha de la última revisión de Search Console. Si han pasado más de 30 días respecto a la fecha actual, recordar al usuario que revise "Rendimiento" y "Páginas". Cuando confirme que lo ha hecho, actualizar esa fecha.

## Viajes en grupo

### Estructura

- Al crear un nuevo viaje en grupo, copiar completa la plantilla `.templates/plantilla-viaje-en-grupo.mdx` y crear el fichero en `src/content/viajes-en-grupo/es/`. La plantilla nunca se publica dentro de `src/content/`.
- El nombre del fichero es el slug de la URL; el `id` del frontmatter debe coincidir con él y ser único.
- Mantener la misma estructura de secciones y componentes (itinerario, precios, incluye/excluye, vuelos, pagos, observaciones).

### Contenido

- No inventar datos del viaje durante el proceso de sustitución de la plantilla.
- Si faltan datos, mantener placeholders de la plantilla sin cambios.
- Sustituir solo los campos que el usuario indique explícitamente en cada paso. Si pide "solo título", actualizar únicamente `title`.
- Si el usuario no indica mantener contenido adicional de la plantilla en un bloque ya editado, eliminar ese contenido residual.
- Si el viaje no tiene vuelos, eliminar por completo la sección `## Vuelos` (sin texto de reemplazo).
- La introducción y la descripción son siempre el mismo texto: cualquier texto nuevo de `description` debe copiarse exactamente también en el primer `<ColumnItem>`.
  - La primera frase de la descripción es lo que Google y las redes muestran (se recorta a ~160 caracteres y se elimina el Markdown automáticamente), así que debe resumir el viaje por sí sola.
- `date` es la fecha de salida y `endDate` la de regreso: se usan para marcar el viaje como realizado y en los datos estructurados.
- Solo cuando el usuario indique que el proceso está completo, rellenar los campos técnicos del frontmatter (`id`, `category`, `tags`, `location`) a partir del contenido real del viaje, sin inventar información.
- Antes de dar el viaje por terminado, comprobar que no queda ningún placeholder de la plantilla (`Título del viaje`, `assets/continente/pais/...`, `nombre-del-pais`, `tematica`, `Ciudad1`...). Si falta el dato, avisar al usuario en lugar de publicarlo.

### Viajes de experiencia fotográfica

- Si el título contiene `Experiencia fotográfica`, añadir las secciones: `## Dirigido a`, `## Localizaciones`, `## Programa`, `## Equipo necesario` y `## A tener en cuenta`.
- Incluir también las secciones `## Miguel Gil León` y la galería final de imágenes (sin título visible si el usuario lo pide).
- Estas secciones son obligatorias aunque su contenido se complete de forma progresiva.

## Posts del blog

> ⚠️ El blog está **deshabilitado** (ver `docs/BLOG_STATUS.md`): los posts se crean en `src/content/blog/` pero no se publican hasta que se reactive. Avisar al usuario si pide un post sin haberlo reactivado.

Pasos, en orden:

1. **Rama**: `git checkout main && git pull origin main && git checkout -b blog/{slug}`. El slug es el título en kebab-case, en español, sin tildes (“Mi Viaje a París” → `blog/mi-viaje-a-paris`).
2. **Imagen**: si `git status` muestra una imagen nueva sin seguimiento, moverla y renombrarla a `src/assets/{continente}/{pais}/{ciudad}/{nombre}.{ext}` siguiendo las reglas de [Imágenes](#imágenes).
3. **Datos**: el usuario da `title` y `content`. Si faltan:
   - `date`: la indicada o la actual, formato `YYYY-MM-DD`.
   - `image`: si no hay, omitir la línea entera (no poner `image: ""`).
   - `tags`: inferir 2-5 etiquetas, sin tildes (ES `["viajes", "europa", "gastronomia"]`, EN `["travel", "europe", "gastronomy"]`).
   - `location`: inferir; siempre array con formato `"Ciudad, País (Continente)"` (ES `["París, Francia (Europa)"]`, EN `["Paris, France (Europe)"]`).
4. **Frontmatter**:

   ```markdown
   ---
   id: "slug-del-post"
   title: "Título del post"
   description: "Descripción SEO de 1-2 frases, atractiva y distinta del título."
   date: "YYYY-MM-DD"
   image: "assets/{continente}/{pais}/{ciudad}/{nombre}"
   tags: ["etiqueta1", "etiqueta2"]
   location: ["Ciudad, País (Continente)"]
   ---
   ```

   `id` igual en ES y EN y coincidente con el nombre del fichero; `image` empieza por `assets/` y sin extensión.
5. **Cuerpo**: **negritas** para conceptos clave, lugares y datos; *cursivas* para palabras en otro idioma; títulos `##`/`###` solo en posts largos. Tono cercano y narrativo.
6. **Dos ficheros con el mismo nombre**: `src/content/blog/es/{slug}.md` (fuente, primero) y `src/content/blog/en/{slug}.md` (traducción). Se traducen `title`, `description`, `tags`, `location` y el cuerpo; `id`, `date` e `image` se mantienen.
7. **Commit y PR**: `git add .` (para incluir la imagen), `git commit -m "feat(blog): add post '{título en español}'"`, `git push origin blog/{slug}` y PR de `blog/{slug}` a `main`.
