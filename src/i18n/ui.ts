export const languages = {
    es: 'Español',
    en: 'English',
};

export const defaultLang = 'es';

export const ui = {
    es: {
        nav: {
            home: 'Inicio',
            blog: 'Blog',
            trips: 'Viajes en Grupo',
            offers: 'Ofertas',
            contact: 'Contacto',
        },
        blog: {
            lastUpdated: 'Última actualización el',
            published: 'Publicado el',
        },
        tags: {
            title: 'Etiquetas',
            all: 'Explorar por Etiquetas',
            results: 'resultados encontrados',
            intro: 'Contenido etiquetado como',
            tag: 'Etiqueta',
        },
        search: {
            placeholder: 'Buscar...',
        },
        footer: {
            rights: 'Todos los derechos reservados.',
        },
        content: {
            notAvailable: 'Este contenido no está disponible en español.',
            viewInEnglish: 'Ver en inglés',
        },
    },
    en: {
        nav: {
            home: 'Home',
            blog: 'Blog',
            trips: 'Group Trips',
            offers: 'Offers',
            contact: 'Contact',
        },
        blog: {
            lastUpdated: 'Last updated on',
            published: 'Published on',
        },
        tags: {
            title: 'Tags',
            all: 'Explore by Tags',
            results: 'results found',
            intro: 'Content tagged with',
            tag: 'Tag',
        },
        search: {
            placeholder: 'Search...',
        },
        footer: {
            rights: 'All rights reserved.',
        },
        content: {
            notAvailable: 'This content is not available in English.',
            viewInSpanish: 'View in Spanish',
        },
    },
} as const;
