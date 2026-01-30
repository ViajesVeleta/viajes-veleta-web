import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';

export async function GET(context) {
    // Get only English blog posts
    const posts = await getCollection('blog', ({ id }) => id.startsWith('en/'));

    return rss({
        title: `${SITE_TITLE} - English`,
        description: SITE_DESCRIPTION,
        site: context.site,
        items: posts.map((post) => {
            const [_, ...slugParts] = post.id.split('/');
            const slug = slugParts.join('/');
            return {
                ...post.data,
                link: `/en/blog/${slug}/`,
            };
        }),
        customData: `<language>en</language>`,
    });
}
