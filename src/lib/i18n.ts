export type Lang = 'en' | 'hi';
export type Bilingual = { en: string; hi: string };

export const LANGS: Lang[] = ['en', 'hi'];

export const t = (v: Bilingual, lang: Lang): string => v[lang];

/** Build a site URL that respects the GitHub Pages base path. */
export const url = (path = ''): string => {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.replace(/^\/+/, '');
  if (!clean) return `${base}/`;
  return `${base}/${clean}${clean.endsWith('/') || clean.includes('.') ? '' : '/'}`;
};

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'hi' : 'en');
