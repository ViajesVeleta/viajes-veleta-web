# Estado del Idioma (Inglés Deshabilitado)

Actualmente, el soporte multilingüe y la versión en inglés de la web están **deshabilitados**. La web se mostrará siempre en español como su único idioma. El componente del selector de idioma (`LanguagePicker.astro`), la redirección automática y las traducciones de las páginas internas se mantienen en el repositorio, pero no se generarán en la construcción debido al guion bajo en el directorio, y no hay interfaz para que el usuario navegue a esas URL.

## Cambios realizados para deshabilitar el inglés

Para ocultar y desactivar la versión en inglés se siguieron estos pasos:

1. **Renombrar el directorio principal de páginas en inglés**
   Se modificó el nombre del directorio `src/pages/en` a `src/pages/_en`. Astro ignora los directorios que empiezan con un guion bajo, por lo que estas páginas no se incluyen en el "build" de la aplicación.

2. **Ocultación del componente LanguagePicker en el Header**
   En el archivo `src/components/Header.astro`, se comentaron o eliminaron temporalmente las menciones al componente `<LanguagePicker />` en las áreas de navegación de escritorio y móvil.

3. **Desactivación de los scripts de redirección de idioma**
   - En `src/components/Header.astro`, se comentó con `{/* ... */}` todo el bloque de `<script>` que contenía la función `setupLanguagePreference()` para evitar redirecciones automáticas por preferencias guardadas en `sessionStorage`.
   - En `src/components/BaseHead.astro`, se comentó con HTML (`<!-- ... -->`) el `<script>` de "Automatic Language Detection" que redirigía automáticamente a un visitante a la versión en inglés dependiendo del idioma principal de su navegador.

---

## Cómo volver a habilitar el idioma inglés (Prompt para IA)

Si en el futuro deseas volver a habilitar el soporte para múltiples idiomas y el inglés en la plataforma, puedes proporcionar el siguiente prompt a tu asistente de IA:

```markdown
Hola IA. Necesito volver a habilitar el soporte multilenguaje y la versión en inglés en este repositorio, los cuales fueron deshabilitados previamente. Guíate estrictamente por los siguientes pasos para reactivarlo:

1. Renombra el directorio `src/pages/_en` de vuelta a `src/pages/en` para que Astro vuelva a generar las páginas asociadas al idioma de destino.

2. En el archivo `src/components/Header.astro`, busca las llamadas al componente `<LanguagePicker />` que están documentadas y comentadas con `{/* ... */}` (hay una en el encabezado principal y otra en el menú móvil).
   - Descoméntalas borrando el `{/*` y el `*/}`.
   - En este mismo archivo, busca al principio un bloque de código comentado que dice `{/* Language Preference Redirect Disabled ... */}` que contiene el `<script>` con la función `setupLanguagePreference`. Descoméntalo para que la redirección basada en preferencias vuelva a funcionar.

3. En el archivo `src/components/BaseHead.astro`, busca el bloque comentado de código que dice `<!-- Automatic Language Detection Disabled ... -->` y quita las etiquetas HTML de comentarios para que el `<script is:inline>` encargado de analizar y redirigir según el idioma del navegador vuelva a ejecutarse.

Construye la app para verificar que se generan tanto las versiones de `es` como de `en` y revisa que el selector de idiomas en el menú es completamente funcional.
```
