# Estado del Tema (Modo Oscuro Deshabilitado)

Actualmente, la funcionalidad para cambiar entre modo claro y oscuro está **deshabilitada**. La web se mostrará siempre en modo claro de forma predeterminada. Los componentes (`ThemeToggle.astro`) y las configuraciones se mantienen en el repositorio, pero el control no es visible para el usuario final y los scripts de inicialización no se ejecutan.

## Cambios realizados para deshabilitar el tema

Para ocultar y desactivar el cambio de tema se siguieron estos pasos:

1. **Ocultación del componente ThemeToggle en el Header**
   En el archivo `src/components/Header.astro`, se comentaron o eliminaron temporalmente las menciones al componente `<ThemeToggle />`, tanto en la zona de escritorio (`theme-toggle-wrapper`) como en la de móvil (`mobile-theme-toggle-wrapper`).

2. **Desactivación de la inicialización en BaseHead**
   En el archivo `src/components/BaseHead.astro`, se comentó con HTML (`<!-- ... -->`) el bloque completo del script que inicializaba el tema al cargar la página en la sección `<head>` de la aplicación.

---

## Cómo volver a habilitar el modo oscuro (Prompt para IA)

Si en el futuro deseas volver a habilitar el soporte para modo oscuro y el selector en la interfaz, puedes proporcionar el siguiente prompt a tu asistente de IA:

```markdown
Hola IA. Necesito volver a habilitar el soporte de modo oscuro (Dark Mode) y el selector de tema (Theme Toggle) en este repositorio, los cuales fueron deshabilitados previamente. Guíate estrictamente por los siguientes pasos para reactivarlo:

1. En el archivo `src/components/BaseHead.astro`, busca el bloque comentado de código que dice `<!-- Theme Initialization Disabled ... -->` y quita las etiquetas HTML de comentarios para que el `<script is:inline>` encargado de configurar el modo oscuro vuelva a ejecutarse al principio del head.

2. En el archivo `src/components/Header.astro`, busca las llamadas al componente `<ThemeToggle />` que están documentadas con `{/* ... */}` dentro de `.theme-toggle-wrapper` y `.mobile-theme-toggle-wrapper`.
   - Descoméntalas modificándolas para que vuelvan a formar parte del HTML estándar. Solo debes quitar los `{/*` y `*/}`.

Asegúrate de que la aplicación puede cambiar dinámicamente entre el modo claro y oscuro una vez hechos los cambios.
```
