import { getCollection, type CollectionEntry } from "astro:content";

type ValidCollection = "blog" | "groups" | "offers";

export async function getPostNavigation(
    collectionName: ValidCollection,
    currentPostId: string,
    lang: string
) {
    const allPosts = await getCollection(collectionName, ({ id }) => id.startsWith(`${lang}/`));

    // Sort by pubDate descending (newest first)
    allPosts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    const currentIndex = allPosts.findIndex(p => p.id === currentPostId);

    if (currentIndex === -1) {
        return { nextPost: null, prevPost: null };
    }

    // Previous post is chronologically older (higher index)
    const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    // Next post is chronologically newer (lower index)
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

    return { nextPost, prevPost };
}

export async function getRelatedPosts(
    collectionName: ValidCollection,
    currentPost: CollectionEntry<ValidCollection>,
    lang: string,
    maxCount: number = 3
) {
    const allPosts = await getCollection(collectionName, ({ id }) => id.startsWith(`${lang}/`));

    const tags = currentPost.data.tags || [];

    // Filter out current post
    const otherPosts = allPosts.filter(p => p.id !== currentPost.id);

    // Score posts by tag intersection
    const scoredPosts = otherPosts.map(p => {
        const postTags = p.data.tags || [];
        const intersection = postTags.filter(t => tags.includes(t)).length;
        return { post: p, score: intersection };
    });

    // Sort by score descending, then by date descending
    scoredPosts.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
    });

    return scoredPosts.slice(0, maxCount).map(sp => sp.post);
}

export function getPostUrl(collection: ValidCollection, id: string) {
    const [lang, ...idParts] = id.split("/");
    const slug = idParts.join("/");
    const root = lang === "es" ? "" : `/${lang}`;

    switch (collection) {
        case "blog":
            return `${root}/blog/${slug}/`;
        case "groups":
            return `${root}/viajes-en-grupo/${slug}/`;
        case "offers":
            return `${root}/ofertas/${slug}/`;
        default:
            return `${root}/${slug}/`;
    }
}
