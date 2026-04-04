import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	// Get only Spanish blog posts
	const posts = await getCollection('blog', ({ id }) => id.startsWith('es/'));

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => {
			const [_, ...slugParts] = post.id.split('/');
			const slug = slugParts.join('/');
			return {
				...post.data,
				link: `/blog/${slug}/`,
			};
		}),
		customData: `<language>es</language>`,
	});
}
