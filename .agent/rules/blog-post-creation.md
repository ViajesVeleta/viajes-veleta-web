---
trigger: always_on
---

# Reglas para la Creación de Posts en el Blog

Sigue estos pasos en orden cada vez que crees un post.

---

## 1. Git: rama

Antes de tocar nada:

```bash
git checkout main
git pull origin main
git checkout -b blog/{slug}
```

El `{slug}` es el título del post en kebab-case, en español, sin tildes ni caracteres especiales.
> "Mi Viaje a París" → `blog/mi-viaje-a-paris`

---

## 2. Imagen

Ejecuta `git status`. Si hay una imagen nueva sin seguimiento (untracked), **muévela y renómbrala** a:

```
src/assets/{continente}/{pais}/{ciudad}/{nombre}.{ext}
```

- Todo en minúsculas, kebab-case, sin tildes.
- Si ya existe un archivo con ese nombre exacto en esa ruta, añade sufijo numérico: `torre-eiffel-2.webp`.
- Los directorios intermedios créalos si no existen.

```
✅ src/assets/europa/francia/paris/torre-eiffel.jpg
✅ src/assets/america/mexico/ciudad-de-mexico/zocalo.webp
❌ src/assets/Europa/França/París/TorreEiffel.jpg
```

---

## 3. Plantilla

Se te pasará una plantilla con estos campos. Si alguno falta o viene vacío, infíerelo:

| Campo | Si falta |
|---|---|
| `title` | — siempre se proporciona |
| `date` | Si se proporciona, úsala. Si no, usa la fecha actual. Siempre en formato `YYYY-MM-DD` |
| `content` | — siempre se proporciona |
| `image` | Omite el campo `image` del frontmatter |
| `tags` | Infiere 2-5 etiquetas en español a partir del título y contenido |
| `locations` | Infiere localizaciones a partir del título y contenido |

**Formato de `location`:** `"Ciudad, País (Continente)"`
- ES: `["París, Francia (Europa)"]`
- EN: `["Paris, France (Europe)"]`

**Formato de `tags`:** sin tildes, en minúsculas.
- ES: `["viajes", "europa", "gastronomia", "cultura"]`
- EN: `["travel", "europe", "gastronomy", "culture"]`

---

## 4. Frontmatter

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

### Reglas críticas

- **`id`**: mismo valor en ES y EN. Coincide con el nombre del archivo (sin extensión).
- **`image`**: empieza por `assets/` (sin `src/` delante). **⛔ Nunca pongas la extensión** (`.webp`, `.jpg`, etc.). El CI/CD optimiza y renombra las imágenes automáticamente; si pones extensión, el enlace quedará roto.
- **`location`**: siempre array, aunque haya un solo lugar.
- Si no hay imagen, **omite la línea `image:` por completo**. No pongas `image: ""`.

---

## 5. Cuerpo del post

- Usa **negritas** para conceptos clave, nombres de lugares importantes, datos relevantes.
- Usa *cursivas* para palabras en otro idioma o matices.
- Usa títulos `##` / `###` **solo si el post es largo** y tiene secciones claramente diferenciadas. Para posts cortos, no añadas títulos.
- Tono: cercano y narrativo, como si le contaras el viaje a un amigo.

### Imágenes en el cuerpo

⛔ **NUNCA** uses rutas relativas (`../../../`) ni extensiones de archivo en las imágenes del markdown.

```markdown
✅ ![Alt texto](assets/continente/pais/ciudad/nombre)
❌ ![Alt texto](../../../assets/continente/pais/ciudad/nombre.jpg)
❌ ![Alt texto](assets/continente/pais/ciudad/nombre.webp)
```

Mismo formato que en el frontmatter: `assets/` + ruta relativa + sin extensión. El pipeline de CI/CD y Astro resuelven la extensión automáticamente.

---

## 6. Dos archivos, mismo nombre

Crea siempre **ambos archivos** con el **mismo nombre de archivo**:

```
src/content/blog/es/{slug}.md   ← source of truth, créalo primero
src/content/blog/en/{slug}.md   ← traducción, créalo a partir del español
```

Qué se traduce en la versión EN:

| Campo | ¿Traducir? |
|---|---|
| `id` | ❌ Igual en ambos |
| `title` | ✅ |
| `description` | ✅ |
| `date` | ❌ Igual en ambos |
| `image` | ❌ Ruta idéntica, sin extensión |
| `tags` | ✅ Equivalentes en inglés |
| `location` | ✅ Nombres en inglés, mismo formato |
| Cuerpo | ✅ Traducción completa |

---

## 7. Commit, push y PR

```bash
git add .
git commit -m "feat(blog): add post '{título en español}'"
git push origin blog/{slug}
```

Luego crea la PR de `blog/{slug}` → `main`.

> `git add .` siempre, para asegurarte de que la imagen va incluida en el commit.