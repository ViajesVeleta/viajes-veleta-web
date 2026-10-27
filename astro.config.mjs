// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';
import path from 'path';

import { remarkResolveAssets } from './src/plugins/remark-resolve-assets.mjs';
import { rehypeResolveMdxImgSrc } from './src/plugins/rehype-resolve-mdx-img-src.mjs';

import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
    adapter: cloudflare({
        imageService: 'passthrough',
    }),
    site: 'https://viajesveleta.es',
    trailingSlash: 'always',
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'viewport',
    },
    markdown: {
        remarkPlugins: [remarkResolveAssets],
        rehypePlugins: [rehypeResolveMdxImgSrc],
    },
    vite: {
        resolve: {
            alias: {
                assets: path.resolve('./src/assets'),
            },
        },
    },

    build: {
        // Enable CSS inlining for critical CSS
        inlineStylesheets: 'auto',
    },
    compressHTML: true,
    i18n: {
        defaultLocale: 'es',
        locales: ['es', 'en'],
        routing: {
            prefixDefaultLocale: false,
        },
    },
    integrations: [
        mdx(),
        sitemap({
            filter: (page) => !/\/(tags|404)(\/|$)/.test(new URL(page).pathname),
            i18n: {
                defaultLocale: 'es',
                locales: {
                    es: 'es-ES',
                    en: 'en-US',
                },
            },
        }),
        pagefind(),
    ],
});
