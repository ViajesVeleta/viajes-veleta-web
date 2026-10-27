# Estado del Blog (Deshabilitado)

Actualmente, la funcionalidad del blog en la web está **deshabilitada**. Los archivos, componentes y configuraciones se mantienen en el repositorio subyacente para poder recuperarlos en el futuro, pero el blog no será accesible para el usuario final ni sus páginas se generarán en el build.

## Cambios realizados para deshabilitar el blog

Para ocultar y desactivar el blog se siguieron los siguientes pasos:

1. **Renombrar directorios y archivos base**
   Se les añadió un guion bajo `_` como prefijo a las rutas del blog y feed RSS. En Astro, cualquier archivo o directorio que empiece con `_` es ignorado a la hora de procesar las rutas.
   - `src/pages/blog` → `src/pages/_blog`
   - `src/pages/_en/blog` → `src/pages/_en/_blog`
   - `src/pages/rss.xml.js` → `src/pages/_rss.xml.js`
   - `src/pages/_en/rss.xml.js` → `src/pages/_en/_rss.xml.js`

2. **Eliminación de la navegación global**
   Se eliminaron explícitamente los enlaces al blog (`nav.blog`) del menú de navegación (tanto en la versión de ordenador como en la de móvil) en el componente `src/components/Header.astro`.

3. **Exclusión en el sistema de etiquetado (Tags)**
   `src/pages/tags/[tag].astro` y `src/pages/tags/index.astro` solo usan la colección `groups` (viajes en grupo en español). No se consulta `blog` para no generar etiquetas que enlacen a páginas inexistentes.

4. **Enlace RSS eliminado del `<head>`**
   `src/components/BaseHead.astro` ya no incluye `<link rel="alternate" type="application/rss+xml">`, porque `/rss.xml` no existe mientras el blog está deshabilitado.

5. **Referencias estáticas**
   Se eliminó una pequeña mención sobre el blog en el texto estático dentro del archivo de inicio de idioma inglés (`src/pages/_en/index.astro`).

---

## Cómo volver a habilitar el blog (Prompt para IA)

Si en el futuro deseas volver a habilitar el blog, puedes proporcionar el siguiente prompt directamente a tu asistente de IA. Este prompt contiene los pasos inversos exactos, asegurando que se restaure su visibilidad e integración.

```markdown
Hola IA. Necesito volver a habilitar el blog en este repositorio, el cual fue deshabilitado previamente. Guíate estrictamente por los siguientes pasos para reactivarlo, prestando mucha atención al código fuente de los archivos mencionados:

1. Renombrar las carpetas y archivos con guion bajo `_` para devolverlos a su estado original para que Astro vuelva a compilarlos:
   - `src/pages/_blog` → `src/pages/blog`
   - `src/pages/_en/_blog` → `src/pages/_en/blog`
   - `src/pages/_rss.xml.js` → `src/pages/rss.xml.js`
   - `src/pages/_en/_rss.xml.js` → `src/pages/_en/rss.xml.js`

2. Volver a añadir el enlace al blog dentro del Header (`src/components/Header.astro`). 
   - En el bloque de enlaces de escritorio, añade:
     <HeaderLink href={translatePath("/blog/")}>{t("nav.blog")}</HeaderLink>
   - En el bloque de enlaces móviles, añade:
     <a href={translatePath("/blog/")} class="mobile-nav-link">{t("nav.blog")}</a>
   (Los enlaces internos llevan siempre barra final.)

3. Modificar `src/pages/tags/[tag].astro` y `src/pages/tags/index.astro` para que incluyan también la colección `blog` (filtrando por idioma `es/`), con URL `/blog/{slug}/` en `allTaggedContent`.

4. En `src/components/BaseHead.astro`, volver a añadir el enlace RSS: `<link rel="alternate" type="application/rss+xml" title={SITE_TITLE} href={new URL("rss.xml", Astro.site)} />`.

5. (Opcional) Restaurar cualquier referencia estática al blog en `src/pages/_en/index.astro`.

Ejecuta `npm run build` y comprueba que `/blog/` y `/rss.xml` aparecen en `dist/` y que las páginas del blog están en el sitemap.

Por favor, actúa sobre los archivos correspondientes y dímelo cuando esté listo o si encuentras algún problema intermedio.
```
