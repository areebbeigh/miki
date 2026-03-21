import type { OutlineItem, UserSettings } from '../shared/types';
import { SIDEBAR_STYLES } from './sidebar.css';

const HOST_ID = 'miki-sidebar-host';

export interface SidebarController {
  root: HTMLElement;
  setCollapsed: (v: boolean) => void;
  setActiveId: (id: string | null) => void;
  setBookmarkedIds: (ids: Set<string>) => void;
  setReadingModeActive: (v: boolean) => void;
  destroy: () => void;
}

function indentClass(level: number): string {
  const d = Math.min(6, Math.max(1, level)) as 1 | 2 | 3 | 4 | 5 | 6;
  return `indent-${d}`;
}

export function mountSidebar(
  items: OutlineItem[],
  settings: UserSettings,
  bookmarkedIds: Set<string>,
  readingModeActive: boolean,
  opts: {
    onNavigate: (id: string) => void;
    onToggleCollapse: () => void;
    onBookmarkToggle: (sectionId: string, sectionTitle: string) => void;
    onScrollTop: () => void;
    onReadingModeToggle: () => void;
  },
): SidebarController {
  let existing = document.getElementById(HOST_ID);
  if (existing) existing.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('data-miki', 'sidebar');

  const shadow = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = SIDEBAR_STYLES;
  shadow.appendChild(style);

  const shell = document.createElement('div');
  shell.className = 'shell';
  shell.dataset.position = settings.sidebarPosition;
  shell.dataset.collapsed = String(!settings.sidebarOpen);
  shell.style.width = `${settings.sidebarWidthPx}px`;
  shell.style.minWidth = settings.sidebarOpen ? `${settings.sidebarWidthPx}px` : '44px';

  const header = document.createElement('div');
  header.className = 'header';

  const title = document.createElement('div');
  title.className = 'header-title';
  title.textContent = 'On this page';

  const collapseBtn = document.createElement('button');
  collapseBtn.type = 'button';
  collapseBtn.className = 'icon-btn';
  collapseBtn.title = settings.sidebarOpen ? 'Collapse outline' : 'Expand outline';
  collapseBtn.setAttribute('aria-expanded', String(settings.sidebarOpen));
  collapseBtn.innerHTML = settings.sidebarOpen
    ? '<span aria-hidden="true">⟨</span>'
    : '<span aria-hidden="true">⟩</span>';
  collapseBtn.addEventListener('click', () => opts.onToggleCollapse());

  header.appendChild(title);
  header.appendChild(collapseBtn);

  const brand = document.createElement('div');
  brand.className = 'brand';
  brand.textContent = 'Mi';

  const outline = document.createElement('nav');
  outline.className = 'outline';
  outline.setAttribute('aria-label', 'Page outline');

  const bookmarkButtons = new Map<string, HTMLButtonElement>();

  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'outline-row';

    const bm = document.createElement('button');
    bm.type = 'button';
    bm.className = 'bookmark-btn';
    bm.dataset.sectionId = item.id;
    bm.dataset.on = bookmarkedIds.has(item.id) ? 'true' : 'false';
    bm.title = bookmarkedIds.has(item.id) ? 'Remove bookmark' : 'Bookmark section';
    bm.setAttribute('aria-label', bm.title);
    bm.innerHTML = bookmarkedIds.has(item.id) ? '★' : '☆';
    bm.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      opts.onBookmarkToggle(item.id, item.text);
    });
    bookmarkButtons.set(item.id, bm);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `item ${indentClass(item.level)}`;
    btn.dataset.targetId = item.id;
    btn.textContent = item.text;
    btn.addEventListener('click', () => opts.onNavigate(item.id));

    row.appendChild(bm);
    row.appendChild(btn);
    outline.appendChild(row);
  }

  const footer = document.createElement('div');
  footer.className = 'footer';
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.type = 'button';
  scrollTopBtn.className = 'scroll-top-btn';
  scrollTopBtn.title = 'Scroll back to top';
  scrollTopBtn.innerHTML = '<span class="ico" aria-hidden="true">↑</span><span>Back to top</span>';
  scrollTopBtn.addEventListener('click', () => opts.onScrollTop());

  const readingBtn = document.createElement('button');
  readingBtn.type = 'button';
  readingBtn.className = 'reading-mode-btn';
  readingBtn.dataset.on = readingModeActive ? 'true' : 'false';
  readingBtn.title = readingModeActive ? 'Exit focused reading mode' : 'Focused reading (hide site chrome)';
  readingBtn.setAttribute('aria-pressed', readingModeActive ? 'true' : 'false');
  readingBtn.innerHTML = readingModeActive
    ? '<span class="ico" aria-hidden="true">◉</span><span>Exit focus</span>'
    : '<span class="ico" aria-hidden="true">◐</span><span>Focus read</span>';
  readingBtn.addEventListener('click', () => opts.onReadingModeToggle());
  footer.appendChild(scrollTopBtn);
  footer.appendChild(readingBtn);

  shell.appendChild(header);
  shell.appendChild(brand);
  shell.appendChild(outline);
  shell.appendChild(footer);

  shadow.appendChild(shell);

  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.height = '100vh';
  host.style.zIndex = '2147483646';
  host.style.pointerEvents = 'auto';
  if (settings.sidebarPosition === 'left') {
    host.style.left = '0';
    host.style.right = 'auto';
  } else {
    host.style.right = '0';
    host.style.left = 'auto';
  }

  document.documentElement.appendChild(host);

  return {
    root: host,
    setCollapsed(v: boolean) {
      shell.dataset.collapsed = String(v);
      shell.style.width = v ? '44px' : `${settings.sidebarWidthPx}px`;
      shell.style.minWidth = v ? '44px' : `${settings.sidebarWidthPx}px`;
      collapseBtn.setAttribute('aria-expanded', String(!v));
      collapseBtn.title = v ? 'Expand outline' : 'Collapse outline';
      collapseBtn.innerHTML = v ? '<span aria-hidden="true">⟩</span>' : '<span aria-hidden="true">⟨</span>';
    },
    setActiveId(id: string | null) {
      outline.querySelectorAll('.item[data-active="true"]').forEach((el) => {
        (el as HTMLElement).dataset.active = 'false';
      });
      if (!id) return;
      const btn = outline.querySelector(`[data-target-id="${cssEscape(id)}"]`) as HTMLElement | null;
      if (btn) {
        btn.dataset.active = 'true';
        btn.scrollIntoView({ block: 'nearest' });
      }
    },
    setBookmarkedIds(ids: Set<string>) {
      for (const [sid, b] of bookmarkButtons) {
        const on = ids.has(sid);
        b.dataset.on = on ? 'true' : 'false';
        b.innerHTML = on ? '★' : '☆';
        b.title = on ? 'Remove bookmark' : 'Bookmark section';
        b.setAttribute('aria-label', b.title);
      }
    },
    setReadingModeActive(v: boolean) {
      readingBtn.dataset.on = v ? 'true' : 'false';
      readingBtn.title = v ? 'Exit focused reading mode' : 'Focused reading (hide site chrome)';
      readingBtn.setAttribute('aria-pressed', v ? 'true' : 'false');
      readingBtn.innerHTML = v
        ? '<span class="ico" aria-hidden="true">◉</span><span>Exit focus</span>'
        : '<span class="ico" aria-hidden="true">◐</span><span>Focus read</span>';
    },
    destroy() {
      host.remove();
    },
  };
}

function cssEscape(s: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
  return s.replace(/["\\]/g, '\\$&');
}
