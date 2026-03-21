import type { OutlineItem } from '../shared/types';

export interface ScrollSpyHandle {
  disconnect: () => void;
}

/**
 * Tracks which heading is most visible in the viewport and reports its id.
 */
export function createScrollSpy(
  items: OutlineItem[],
  onActiveChange: (id: string | null) => void,
): ScrollSpyHandle {
  if (items.length === 0) {
    return { disconnect: () => {} };
  }

  const elements = items.map((i) => i.element);
  let activeId: string | null = null;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
      if (visible.length === 0) return;
      const top = visible[0].target as HTMLElement;
      const id = top.id || null;
      if (id && id !== activeId) {
        activeId = id;
        onActiveChange(id);
      }
    },
    {
      root: null,
      rootMargin: '-45% 0px -45% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    },
  );

  for (const el of elements) {
    observer.observe(el);
  }

  const onScroll = (): void => {
    let best: { id: string; ratio: number } | null = null;
    const vh = window.innerHeight || 1;
    for (const item of items) {
      const r = item.element.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const ratio = visible / Math.min(vh, r.height || 1);
      if (!best || ratio > best.ratio) best = { id: item.id, ratio };
    }
    if (best && best.id !== activeId) {
      activeId = best.id;
      onActiveChange(best.id);
    }
  };

  let scrollScheduled = false;
  const scrollHandler = (): void => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      onScroll();
    });
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
  onScroll();

  return {
    disconnect: () => {
      observer.disconnect();
      window.removeEventListener('scroll', scrollHandler);
    },
  };
}
