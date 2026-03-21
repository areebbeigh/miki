import type { WikiAdapter } from './types';

/** GitHub / GitLab / Gitea wiki and repo markdown views (heuristic). */
export const gitWikiAdapter: WikiAdapter = {
  id: 'git-wiki',
  priority: 40,
  matchesLocation(href: string): boolean {
    try {
      const u = new URL(href);
      const p = u.pathname.toLowerCase();
      if (u.hostname === 'github.com' && (p.includes('/wiki') || p.endsWith('.md'))) return true;
      if (/^(gitlab\.com|codeberg\.org|gitea\.|forgejo\.)/i.test(u.hostname) && p.includes('/wiki')) return true;
      if (u.hostname.endsWith('github.io') && p.includes('wiki')) return true;
      return false;
    } catch {
      return false;
    }
  },
  matchesDocument(doc: Document): boolean {
    return !!(
      doc.querySelector('.markdown-body, .wiki-body, #wiki-wrapper') ||
      doc.querySelector('[data-testid="wiki-content"]')
    );
  },
  getContentRoot(doc: Document): HTMLElement | null {
    const sel = [
      '.markdown-body',
      '.wiki-body article',
      '.wiki-body',
      '#wiki-body .markdown-body',
      '#wiki-wrapper .wiki-content',
      '[data-testid="wiki-content"]',
    ];
    for (const s of sel) {
      const el = doc.querySelector(s) as HTMLElement | null;
      if (el) return el;
    }
    return null;
  },
};
