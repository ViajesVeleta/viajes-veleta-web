// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

import pagefind from 'astro-pagefind';

// https://astro.build/config
/** @returns {import('astro').AstroIntegration} */
function styleGuideToolbar() {
    return {
        name: "style-guide-toolbar",
        hooks: {
            "astro:config:setup": ({ addDevToolbarApp }) => {
                addDevToolbarApp({
                    id: "style-guide",
                    name: "Style Guide",
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
                    entrypoint: "./src/toolbar/style-guide-app.ts",
                });
            },
        },
    };
}

export default defineConfig({
    adapter: node({
        mode: 'standalone',
    }),
    site: 'https://example.com',
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'viewport',
    },
    image: {
        // Use Sharp for image optimization (already installed)
        service: {
            entrypoint: 'astro/assets/services/sharp',
            config: {
                limitInputPixels: false,
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
            i18n: {
                defaultLocale: 'es',
                locales: {
                    es: 'es-ES',
                    en: 'en-US',
                },
            },
        }),
        styleGuideToolbar(),
        pagefind(),
    ],
});