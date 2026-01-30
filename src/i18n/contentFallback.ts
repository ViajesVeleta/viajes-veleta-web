import { getCollection } from 'astro:content';

/**
 * Checks if content exists in a specific language
 * @param collection - The collection name ('blog', 'groups', 'offers')
 * @param id - The content ID without language prefix
 * @param lang - The language code to check
 * @returns True if content exists in that language
 */
export async function contentExistsInLang(
    collection: 'blog' | 'groups' | 'offers',
    id: string,
    lang: string
): Promise<boolean> {
    const allContent = await getCollection(collection);
    const fullId = `${lang}/${id}`;
    return allContent.some(item => item.id === fullId);
}

/**
 * Gets the fallback language for content if it doesn't exist in requested language
 * @param collection - The collection name
 * @param id - The content ID without language prefix
 * @param requestedLang - The originally requested language
 * @returns Object with available language and whether content exists
 */
export async function getContentFallback(
    collection: 'blog' | 'groups' | 'offers',
    id: string,
    requestedLang: string
): Promise<{ exists: boolean; lang: string | null }> {
    // Check if content exists in requested language
    const existsInRequested = await contentExistsInLang(collection, id, requestedLang);

    if (existsInRequested) {
        return { exists: true, lang: requestedLang };
    }

    // Try fallback languages
    const fallbackLangs = requestedLang === 'es' ? ['en'] : ['es'];

    for (const fallbackLang of fallbackLangs) {
        const existsInFallback = await contentExistsInLang(collection, id, fallbackLang);
        if (existsInFallback) {
            return { exists: true, lang: fallbackLang };
        }
    }

    return { exists: false, lang: null };
}

/**
 * Gets all available translations for a piece of content
 * @param collection - The collection name
 * @param contentId - The unique content ID (from frontmatter)
 * @returns Array of objects with language code and path
 */
export async function getAvailableTranslations(
    collection: 'blog' | 'groups' | 'offers',
    contentId: string
): Promise<Array<{ lang: string; id: string; slug: string }>> {
    const allContent = await getCollection(collection);

    return allContent
        .filter(item => item.data.id === contentId)
        .map(item => {
            const [lang, ...slugParts] = item.id.split('/');
            const slug = slugParts.join('/');
            return { lang, id: item.id, slug };
        });
}
