# Guide: Creating Multilanguage Content

This guide explains how to create blog posts, group trips, and offers in multiple languages.

---

## 🌍 Supported Languages

- **Spanish (es)** - Default language
- **English (en)** - Secondary language

---

## 📝 Creating a Blog Post in Multiple Languages

### Step 1: Create the Spanish Version (Default)

1. Navigate to `src/content/blog/es/`
2. Create a new `.md` or `.mdx` file (e.g., `my-amazing-trip.md`)
3. Add the frontmatter with a unique `id`:

```markdown
---
id: "my-amazing-trip"
title: "Mi increíble viaje a los Alpes"
description: "Una experiencia única en las montañas"
pubDate: "2026-01-30"
heroImage: "../../assets/trip-alps"
tags: ["viajes", "montaña", "aventura"]
---

Aquí va el contenido de tu post en español...
```

**Important:** The `id` field is crucial for linking translations together!

### Step 2: Create the English Translation

1. Navigate to `src/content/blog/en/`
2. Create a file with the **same filename** (e.g., `my-amazing-trip.md`)
3. Use the **same `id`** but translate the content:

```markdown
---
id: "my-amazing-trip"
title: "My Amazing Trip to the Alps"
description: "A unique experience in the mountains"
pubDate: "2026-01-30"
heroImage: "../../assets/trip-alps"
tags: ["travel", "mountain", "adventure"]
---

Here goes your post content in English...
```

**Key Points:**
- ✅ Same `id` in both files
- ✅ Same filename recommended (not required)
- ✅ Can use same `heroImage` or different ones
- ✅ Translate title, description, and tags
- ✅ Same or different `pubDate` (your choice)

---

## 🚌 Creating Group Trips in Multiple Languages

### Spanish Version (Default)

File: `src/content/groups/es/my-trip-name.md`

```markdown
---
id: "alps-adventure-2026"
title: "Aventura en los Alpes 2026"
description: "Viaje organizado de 7 días"
pubDate: "2026-01-15"
startDate: "2026-08-01"
endDate: "2026-08-07"
price: 1200
heroImage: "../../assets/alps-hero"
---

Descripción completa del viaje...
```

### English Translation

File: `src/content/groups/en/my-trip-name.md`

```markdown
---
id: "alps-adventure-2026"
title: "Alps Adventure 2026"
description: "7-day organized trip"
pubDate: "2026-01-15"
startDate: "2026-08-01"
endDate: "2026-08-07"
price: 1200
heroImage: "../../assets/alps-hero"
---

Full trip description...
```

---

## 💰 Creating Offers in Multiple Languages

Same process as blog posts and trips - just use the `src/content/offers/` directory:

- **Spanish:** `src/content/offers/es/summer-deal.md`
- **English:** `src/content/offers/en/summer-deal.md`

Both must have the same `id` field.

---

## 🎯 Quick Checklist

When creating multilanguage content:

- [ ] Both files have the **same `id`** in frontmatter
- [ ] Files are in correct language folders (`es/` and `en/`)
- [ ] Titles, descriptions, and content are translated
- [ ] Tags are translated (optional but recommended)
- [ ] Images are specified (can be same or different per language)

---

## 🔍 What Happens Behind the Scenes

When you create content with the same `id` in multiple languages:

1. **URLs are generated:**
   - Spanish: `https://yoursite.com/blog/my-amazing-trip/`
   - English: `https://yoursite.com/en/blog/my-amazing-trip/`

2. **Language switcher works automatically:**
   - Visitors can switch between Spanish and English versions
   - The site remembers which version they prefer

3. **RSS feeds are separated:**
   - Spanish posts: `https://yoursite.com/rss.xml`
   - English posts: `https://yoursite.com/en/rss.xml`

4. **Search engines understand:**
   - Proper `hreflang` tags tell Google about translations
   - Better SEO for international audiences

---

## ❓ Frequently Asked Questions

### Do I need to translate every post?

**No!** You can create content in one language only. The system will:
- Show Spanish content to Spanish visitors
- Show English content to English visitors
- Show a "view in other language" notice if content doesn't exist in their preferred language

### What if I use a different filename?

Filenames don't need to match - only the `id` field matters. But using the same filename makes it easier to manage.

### Can I have different publication dates?

Yes! You can publish the Spanish version first and translate later. Use different `pubDate` values if needed.

### What about images?

You can:
- Use the **same image** for both languages (easiest)
- Use **different images** with language-specific text
- The system supports both approaches

### How do I delete a translation?

Simply delete the file from the language folder. If only one translation exists, visitors will see that version with a notice.

---

## 💡 Pro Tips

1. **Keep IDs simple and consistent:**
   - ✅ `"alps-trip-2026"`
   - ❌ `"viaje-alpes-2026"` (Spanish) and `"alps-trip-2026"` (English)

2. **Use descriptive filenames:**
   - Makes it easier to find and manage content
   - Keep them short and URL-friendly

3. **Translate tags thoughtfully:**
   - Spanish: `["viajes", "aventura", "montaña"]`
   - English: `["travel", "adventure", "mountain"]`
   - Helps with SEO in each language

4. **Don't forget meta descriptions:**
   - They appear in search results
   - Should be compelling in both languages

5. **Preview before publishing:**
   - Check `http://localhost:4321/blog/your-post/` (Spanish)
   - Check `http://localhost:4321/en/blog/your-post/` (English)

---

## 🆘 Troubleshooting

### Language switcher doesn't work

**Problem:** Can't switch between languages on a post.

**Solution:** Make sure both files have the **exact same `id`** in frontmatter.

### Post shows in wrong language

**Problem:** Spanish post appears in English section (or vice versa).

**Solution:** Check that the file is in the correct folder:
- Spanish: `src/content/blog/es/`
- English: `src/content/blog/en/`

### Image not showing

**Problem:** Hero image doesn't display.

**Solution:** Check the image path. Use `../../assets/` for images in the assets folder:
```markdown
heroImage: "../../assets/my-image"
```

---

## 📞 Need Help?

If you encounter issues:
1. Check that your frontmatter syntax is correct (valid YAML)
2. Ensure the `id` field matches across translations
3. Verify files are in the correct language folders
4. Restart the dev server: `npm run dev`

---

**Happy writing! 🚀**
