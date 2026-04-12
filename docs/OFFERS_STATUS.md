# Estado de Ofertas (Deshabilitado)

Actualmente, la sección de **Ofertas** en la web está **deshabilitada**. Los archivos, componentes y configuraciones se mantienen en el repositorio pero no son accesibles para el usuario final ni se generan durante el build.

## Cambios realizados para deshabilitar las ofertas

Para ocultar y desactivar las ofertas se siguieron los siguientes pasos:

1. **Renombrar directorios de páginas**
   Se les añadió un guion bajo `_` como prefijo a las rutas de ofertas. En Astro, cualquier archivo o directorio que empiece con `_` es ignorado:
   - `src/pages/ofertas` → `src/pages/_ofertas`
   - `src/pages/_en/ofertas` → `src/pages/_en/_ofertas`

2. **Eliminación de la navegación global**
   Se comentaron explícitamente los enlaces a ofertas (`nav.offers`) en el componente `src/components/Header.astro`, tanto en el menú de escritorio como en el móvil.

---

## Cómo volver a habilitar las ofertas (Prompt para IA)

Si en el futuro deseas volver a habilitar la sección de ofertas, puedes proporcionar el siguiente prompt directamente a tu asistente de IA:

```markdown
Hola IA. Necesito volver a habilitar la sección de ofertas en este repositorio. Sigue estos pasos:

1. Renombrar las carpetas con guion bajo `_` para devolverlas a su estado original:
   - `src/pages/_ofertas` → `src/pages/ofertas`
   - `src/pages/_en/_ofertas` → `src/pages/_en/ofertas`

2. Volver a habilitar el enlace a ofertas dentro del Header (`src/components/Header.astro`):
   - En el bloque de enlaces de escritorio, descomenta:
     <HeaderLink href={translatePath("/ofertas")}>{t("nav.offers")}</HeaderLink>
   - En el bloque de enlaces móviles, descomenta:
     <a href={translatePath("/ofertas")} class="mobile-nav-link">{t("nav.offers")}</a>

Por favor, dímelo cuando esté listo.
```
