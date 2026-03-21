import type { PageHighlight } from '../shared/library';
import { addHighlight, generateId, loadHighlights, pageUrlNoHash, saveHighlights } from '../shared/library';

const STYLE_ID = 'miki-highlight-style';
export const HIGHLIGHT_MARK_CLASS = 'miki-highlight-mark';

export const DEFAULT_HIGHLIGHT_COLOR = '#fde047';
/** Foreground on highlighted spans (wiki/reading mode often forces light text on the article root). */
export const HIGHLIGHT_TEXT_COLOR = '#0a0a0a';

export function injectHighlightStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    .${HIGHLIGHT_MARK_CLASS} {
      border-radius: 2px;
      padding: 0 1px;
      color: ${HIGHLIGHT_TEXT_COLOR} !important;
      -webkit-text-fill-color: ${HIGHLIGHT_TEXT_COLOR} !important;
    }
    @media print {
      .${HIGHLIGHT_MARK_CLASS} { background: transparent !important; box-shadow: none !important; }
    }
  `;
  document.documentElement.appendChild(s);
}

function findTextInRoot(root: Node, search: string): { node: Text; start: number } | null {
  if (!search.trim()) return null;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest('#miki-sidebar-host')) return NodeFilter.FILTER_REJECT;
      if (p.closest(`.${HIGHLIGHT_MARK_CLASS}`)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    const val = t.nodeValue ?? '';
    const idx = val.indexOf(search);
    if (idx >= 0) return { node: t, start: idx };
  }
  return null;
}

function wrapTextNodeSlice(node: Text, start: number, len: number, color: string, id: string): void {
  const full = node.nodeValue ?? '';
  const before = full.slice(0, start);
  const mid = full.slice(start, start + len);
  const after = full.slice(start + len);
  const mark = document.createElement('mark');
  mark.className = HIGHLIGHT_MARK_CLASS;
  mark.dataset.mikiHlId = id;
  mark.style.backgroundColor = color;
  mark.style.color = HIGHLIGHT_TEXT_COLOR;
  mark.style.boxDecorationBreak = 'clone';
  mark.appendChild(document.createTextNode(mid));
  const parent = node.parentNode;
  if (!parent) return;
  if (before) parent.insertBefore(document.createTextNode(before), node);
  parent.insertBefore(mark, node);
  if (after) parent.insertBefore(document.createTextNode(after), node);
  parent.removeChild(node);
}

/** Re-apply stored highlights for the current page URL (first occurrence of each text). */
export function applyHighlightsForCurrentPage(url: string, root: HTMLElement = document.body): void {
  const page = pageUrlNoHash(url);
  void loadHighlights().then((all) => {
    const mine = all.filter((h) => h.pageUrl === page);
    for (const h of mine) {
      if (document.querySelector(`mark[data-miki-hl-id="${cssEscapeAttr(h.id)}"]`)) continue;
      const found = findTextInRoot(root, h.text);
      if (!found) continue;
      const { node, start } = found;
      const text = node.nodeValue ?? '';
      if (start + h.text.length > text.length) continue;
      wrapTextNodeSlice(node, start, h.text.length, h.color, h.id);
    }
  });
}

function cssEscapeAttr(s: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
  return s.replace(/["\\]/g, '\\$&');
}

/**
 * Wrap current selection in a highlight mark and persist.
 * Returns null if selection empty or not wrappable.
 */
export function createHighlightFromSelection(color: string = DEFAULT_HIGHLIGHT_COLOR): PageHighlight | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  const text = sel.toString().trim();
  if (!text || text.length > 8000) return null;

  const id = generateId();
  const mark = document.createElement('mark');
  mark.className = HIGHLIGHT_MARK_CLASS;
  mark.dataset.mikiHlId = id;
  mark.style.backgroundColor = color;
  mark.style.color = HIGHLIGHT_TEXT_COLOR;
  mark.style.boxDecorationBreak = 'clone';

  try {
    range.surroundContents(mark);
  } catch {
    try {
      const frag = range.extractContents();
      mark.appendChild(frag);
      range.insertNode(mark);
    } catch {
      return null;
    }
  }

  sel.removeAllRanges();

  const pageUrl = pageUrlNoHash(location.href);
  const entry: PageHighlight = {
    id,
    pageUrl,
    text,
    color,
    createdAt: Date.now(),
  };
  void addHighlight(entry);
  return entry;
}

export function clearHighlightsInRoot(root: HTMLElement): void {
  root.querySelectorAll(`mark.${HIGHLIGHT_MARK_CLASS}`).forEach((m) => {
    const parent = m.parentNode;
    if (!parent) return;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
  });
  root.normalize();
}

export async function removeHighlightFromDom(id: string): Promise<void> {
  const el = document.querySelector(`mark[data-miki-hl-id="${cssEscapeAttr(id)}"]`);
  if (!el?.parentNode) return;
  const parent = el.parentNode;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
  parent.normalize();

  const all = await loadHighlights();
  await saveHighlights(all.filter((h) => h.id !== id));
}
