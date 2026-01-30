import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
    const [, lang] = url.pathname.split('/');
    if (lang in ui) return lang as keyof typeof ui;
    return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
    return function t(key: string) {
        // Split the key by dots to navigate nested structure
        const keys = key.split('.');
        let value: any = ui[lang];

        for (const k of keys) {
            value = value?.[k];
        }

        // Fallback to default language if translation not found
        if (value === undefined) {
            let fallback: any = ui[defaultLang];
            for (const k of keys) {
                fallback = fallback?.[k];
            }
            return fallback || key;
        }

        return value as string;
    };
}

export function useTranslatedPath(lang: keyof typeof ui) {
    return function translatePath(path: string, l: string = lang) {
        const isDefault = l === defaultLang;
        const pathClean = path.startsWith('/') ? path : `/${path}`;
        return isDefault ? pathClean : `/${l}${pathClean}`;
    };
}

/**
 * Generates translated paths for all supported languages based on the current URL path.
 * @param currentPath - The current URL pathname (e.g., '/blog/my-post' or '/en/blog/my-post')
 * @returns An object mapping language codes to their respective paths
 */
export function getTranslatedPaths(currentPath: string): Record<string, string> {
    // Remove language prefix from path if present
    const pathWithoutLang = currentPath.replace(/^\/(en|es)/, '') || '/';

    return {
        es: pathWithoutLang === '/' ? '/' : pathWithoutLang,
        en: pathWithoutLang === '/' ? '/en' : `/en${pathWithoutLang}`,
    };
}
