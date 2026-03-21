import type { WikiAdapter } from './types';

export const mediaWikiAdapter: WikiAdapter = {
  id: 'mediawiki',
  priority: 50,
  matchesLocation(href: string): boolean {
    try {
      const u = new URL(href);
      return /wik(i|ipedia)|mediawiki|fandom\.com|wiktionary|wikimedia/i.test(u.hostname + u.pathname);
    } catch {
      return false;
    }
  },
  matchesDocument(doc: Document): boolean {
    return !!(
      doc.querySelector('#mw-content-text, .mw-parser-output') ||
      doc.querySelector('body.mw-body') ||
      doc.documentElement?.classList.contains('client-js')
    );
  },
  getContentRoot(doc: Document): HTMLElement | null {
    const mw = doc.querySelector('#mw-content-text') as HTMLElement | null;
    if (mw) return mw;
    const parser = doc.querySelector('.mw-parser-output') as HTMLElement | null;
    if (parser) return parser;
    const article = doc.querySelector('article.mw-body-content') as HTMLElement | null;
    return article;
  },
};
