import type { WikiAdapter } from './types';

function scoreMainCandidate(root: HTMLElement): number {
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let score = headings.length * 3;
  const textLen = root.textContent?.length ?? 0;
  score += Math.min(40, Math.floor(textLen / 800));
  return score;
}

export const genericAdapter: WikiAdapter = {
  id: 'generic',
  priority: 10,
  matchesLocation(): boolean {
    return true;
  },
  matchesDocument(doc: Document): boolean {
    const main =
      (doc.querySelector('main') as HTMLElement | null) ||
      (doc.querySelector('[role="main"]') as HTMLElement | null) ||
      (doc.querySelector('article') as HTMLElement | null);
    if (!main) return false;
    const headings = main.querySelectorAll('h1, h2, h3, h4, h5, h6');
    return headings.length >= 2;
  },
  getContentRoot(doc: Document): HTMLElement | null {
    const candidates: HTMLElement[] = [];
    const selectors = ['main', '[role="main"]', 'article', '#content', '.content', '#main-content'];
    for (const s of selectors) {
      const el = doc.querySelector(s) as HTMLElement | null;
      if (el) candidates.push(el);
    }
    if (candidates.length === 0) return (doc.body as HTMLElement) ?? null;
    let best = candidates[0];
    let bestScore = scoreMainCandidate(best);
    for (const c of candidates.slice(1)) {
      const sc = scoreMainCandidate(c);
      if (sc > bestScore) {
        best = c;
        bestScore = sc;
      }
    }
    return bestScore >= 6 ? best : null;
  },
};
