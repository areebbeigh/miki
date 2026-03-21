import type { OutlineItem } from '../shared/types';

function slugify(text: string, used: Set<string>): string {
  let base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  if (!base) base = 'section';
  let id = base;
  let n = 0;
  while (used.has(id) || document.getElementById(id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  used.add(id);
  return id;
}

export function buildOutline(root: HTMLElement): OutlineItem[] {
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const used = new Set<string>();
  const items: OutlineItem[] = [];

  headings.forEach((el, i) => {
    const h = el as HTMLElement;
    const level = Number(h.tagName.charAt(1));
    if (level < 1 || level > 6) return;
    let id = h.id;
    if (!id) {
      id = slugify(h.textContent ?? `section-${i}`, used);
      h.id = id;
    } else {
      used.add(id);
    }
    items.push({
      id,
      level,
      text: (h.textContent ?? '').trim() || '(untitled)',
      element: h,
    });
  });

  return items;
}
