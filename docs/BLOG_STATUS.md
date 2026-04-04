# Estado del Blog (Deshabilitado)

Actualmente, la funcionalidad del blog en la web está **deshabilitada**. Los archivos, componentes y configuraciones se mantienen en el repositorio subyacente para poder recuperarlos en el futuro, pero el blog no será accesible para el usuario final ni sus páginas se generarán en el build.

## Cambios realizados para deshabilitar el blog

Para ocultar y desactivar el blog se siguieron los siguientes pasos:

1. **Renombrar directorios y archivos base**
   Se les añadió un guion bajo `_` como prefijo a las rutas del blog y feed RSS. En Astro, cualquier archivo o directorio que empiece con `_` es ignorado a la hora de procesar las rutas.
   - `src/pages/blog` → `src/pages/_blog`
   - `src/pages/en/blog` → `src/pages/en/_blog`
   - `src/pages/rss.xml.js` → `src/pages/_rss.xml.js`
   - `src/pages/en/rss.xml.js` → `src/pages/en/_rss.xml.js`

2. **Eliminación de la navegación global**
   Se eliminaron explícitamente los enlaces al blog (`nav.blog`) del menú de navegación (tanto en la versión de ordenador como en la de móvil) en el componente `src/components/Header.astro`.

3. **Exclusión en el sistema de etiquetado (Tags)**
   En `src/pages/tags/[tag].astro`, se impidió que el generador de páginas y la recolección de contenido extrajeran los datos de la colección de *blog*. Específicamente, se eliminó la llamada `await getCollection("blog")` y el mapeo de `blogPosts` hacia el array de contenido `allTaggedContent`, para evitar falsos positivos y errores de ruteo 404 en el listado.

4. **Referencias estáticas**
   Se eliminó una pequeña mención sobre el blog en el texto estático dentro del archivo de inicio de idioma inglés (`src/pages/en/index.astro`).

---

## Cómo volver a habilitar el blog (Prompt para IA)

Si en el futuro deseas volver a habilitar el blog, puedes proporcionar el siguiente prompt directamente a tu asistente de IA. Este prompt contiene los pasos inversos exactos, asegurando que se restaure su visibilidad e integración.

```markdown
Hola IA. Necesito volver a habilitar el blog en este repositorio, el cual fue deshabilitado previamente. Guíate estrictamente por los siguientes pasos para reactivarlo, prestando mucha atención al código fuente de los archivos mencionados:

1. Renombrar las carpetas y archivos con guion bajo `_` para devolverlos a su estado original para que Astro vuelva a compilarlos:
   - `src/pages/_blog` → `src/pages/blog`
   - `src/pages/en/_blog` → `src/pages/en/blog`
   - `src/pages/_rss.xml.js` → `src/pages/rss.xml.js`
   - `src/pages/en/_rss.xml.js` → `src/pages/en/rss.xml.js`

2. Volver a añadir el enlace al blog dentro del Header (`src/components/Header.astro`). 
   - En el bloque de enlaces de escritorio, añade:
     <HeaderLink href={translatePath("/blog")}>{t("nav.blog")}</HeaderLink>
   - En el bloque de enlaces móviles, añade:
     <a href={translatePath("/blog")} class="mobile-nav-link">{t("nav.blog")}</a>

3. Modificar `src/pages/tags/[tag].astro` para que recupere otra vez los artículos del blog y los adjunte a la página de tags. Deberás añadir la query `getCollection("blog")` tanto en el método estático como en el de recolección local, y volver a introducirlos dentro del array de la constante global `allTaggedContent`.

4. (Opcional) Restaurar cualquier referencia estática al blog en `src/pages/en/index.astro`.

Por favor, actúa sobre los archivos correspondientes y dímelo cuando esté listo o si encuentras algún problema intermedio.
```
