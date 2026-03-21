import type { WikiAdapter } from './types';
import { gitWikiAdapter } from './git-wiki';
import { mediaWikiAdapter } from './mediawiki';
import { genericAdapter } from './generic';

const adapters: WikiAdapter[] = [mediaWikiAdapter, gitWikiAdapter, genericAdapter].sort(
  (a, b) => b.priority - a.priority,
);

export interface DetectResult {
  engine: string;
  confidence: number;
  contentRoot: HTMLElement;
}

/**
 * Pick best adapter and compute a rough confidence for auto mode.
 */
export function detectWiki(doc: Document, href: string): DetectResult | null {
  const scored: { adapter: WikiAdapter; score: number }[] = [];

  for (const adapter of adapters) {
    if (!adapter.matchesLocation(href)) continue;
    if (!adapter.matchesDocument(doc)) continue;
    const root = adapter.getContentRoot(doc);
    if (!root) continue;
    const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length < 2) continue;

    let score = adapter.priority;
    if (adapter.id === 'mediawiki' && doc.querySelector('#mw-content-text')) score += 30;
    if (adapter.id === 'git-wiki') score += 15;
    score += Math.min(25, headings.length * 2);

    scored.push({ adapter, score });
  }

  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const confidence = Math.min(100, Math.round((best.score / 120) * 100));

  return {
    engine: best.adapter.id,
    confidence,
    contentRoot: best.adapter.getContentRoot(doc)!,
  };
}
