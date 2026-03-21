import {
  BOOKMARKS_KEY,
  HIGHLIGHTS_KEY,
  WIKI_DIR_KEY,
  loadBookmarks,
  loadHighlights,
  loadWikiDirectory,
  removeBookmark,
  removeHighlight,
} from '../shared/library';

function el<T extends HTMLElement>(id: string): T {
  const n = document.getElementById(id);
  if (!n) throw new Error(`Missing #${id}`);
  return n as T;
}

function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

function openUrl(url: string): void {
  void chrome.tabs.create({ url });
}

async function renderBookmarks(): Promise<void> {
  const list = el<HTMLUListElement>('list-bookmarks');
  const empty = el<HTMLParagraphElement>('empty-bookmarks');
  const items = await loadBookmarks();
  items.sort((a, b) => b.createdAt - a.createdAt);
  list.replaceChildren();
  if (items.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  for (const b of items) {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      <p class="card-title"></p>
      <p class="card-meta"></p>
      <div class="card-actions">
        <button type="button" class="btn open">Open</button>
        <button type="button" class="btn danger del">Remove</button>
      </div>
    `;
    li.querySelector('.card-title')!.textContent = b.sectionTitle || '(section)';
    li.querySelector('.card-meta')!.textContent = `${b.pageTitle} · ${b.href}`;
    li.querySelector('.open')!.addEventListener('click', () => openUrl(b.href));
    li.querySelector('.del')!.addEventListener('click', async () => {
      await removeBookmark(b.id);
      await renderBookmarks();
    });
    list.appendChild(li);
  }
}

async function renderHighlights(): Promise<void> {
  const list = el<HTMLUListElement>('list-highlights');
  const empty = el<HTMLParagraphElement>('empty-highlights');
  const items = await loadHighlights();
  items.sort((a, b) => b.createdAt - a.createdAt);
  list.replaceChildren();
  if (items.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  for (const h of items) {
    const li = document.createElement('li');
    li.className = 'card';
    const swatch = h.color || '#fde047';
    li.innerHTML = `
      <p class="card-title"></p>
      <p class="card-meta"></p>
      <p class="hl-text"></p>
      <div class="card-actions">
        <button type="button" class="btn open">Open page</button>
        <button type="button" class="btn danger del">Delete</button>
      </div>
    `;
    li.querySelector('.card-title')!.textContent = 'Highlight';
    li.querySelector('.card-meta')!.textContent = `${fmtTime(h.createdAt)} · ${h.pageUrl}`;
    const ht = li.querySelector('.hl-text') as HTMLElement;
    ht.textContent = h.text;
    ht.style.backgroundColor = swatch;
    ht.style.color = '#0a0a0a';
    li.querySelector('.open')!.addEventListener('click', () => openUrl(h.pageUrl));
    li.querySelector('.del')!.addEventListener('click', async () => {
      await removeHighlight(h.id);
      await renderHighlights();
    });
    list.appendChild(li);
  }
}

async function renderWikis(): Promise<void> {
  const list = el<HTMLUListElement>('list-wikis');
  const empty = el<HTMLParagraphElement>('empty-wikis');
  const items = await loadWikiDirectory();
  items.sort((a, b) => b.lastSeen - a.lastSeen);
  list.replaceChildren();
  if (items.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  for (const w of items) {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      <p class="card-title"></p>
      <p class="card-meta"></p>
      <div class="card-actions">
        <button type="button" class="btn open">Open last URL</button>
      </div>
    `;
    li.querySelector('.card-title')!.textContent = w.hostname;
    li.querySelector('.card-meta')!.textContent = `Visits: ${w.visitCount} · Last: ${fmtTime(w.lastSeen)} · ${w.lastTitle}`;
    li.querySelector('.open')!.addEventListener('click', () => openUrl(w.lastUrl));
    list.appendChild(li);
  }
}

function setTab(name: 'bookmarks' | 'highlights' | 'wikis'): void {
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', (t as HTMLElement).dataset.tab === name);
  });
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.toggle('active', p.id === `panel-${name}`);
  });
}

async function init(): Promise<void> {
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = (btn as HTMLElement).dataset.tab as 'bookmarks' | 'highlights' | 'wikis' | undefined;
      if (name) setTab(name);
    });
  });

  await Promise.all([renderBookmarks(), renderHighlights(), renderWikis()]);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[BOOKMARKS_KEY]) void renderBookmarks();
    if (changes[HIGHLIGHTS_KEY]) void renderHighlights();
    if (changes[WIKI_DIR_KEY]) void renderWikis();
  });
}

void init().catch(console.error);
