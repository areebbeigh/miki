/** Bookmarks, highlights, and wiki directory — stored in chrome.storage.local (larger quota than sync). */

export interface SectionBookmark {
  id: string;
  /** Canonical page URL without hash */
  pageUrl: string;
  /** Full URL including hash to section */
  href: string;
  sectionId: string;
  sectionTitle: string;
  pageTitle: string;
  createdAt: number;
}

export interface PageHighlight {
  id: string;
  /** Page URL without hash */
  pageUrl: string;
  /** Selected text */
  text: string;
  /** Hex color */
  color: string;
  createdAt: number;
}

export interface WikiSiteEntry {
  hostname: string;
  firstSeen: number;
  lastSeen: number;
  visitCount: number;
  lastTitle: string;
  lastUrl: string;
}

export const BOOKMARKS_KEY = 'miki_bookmarks';
export const HIGHLIGHTS_KEY = 'miki_highlights';
export const WIKI_DIR_KEY = 'miki_wiki_directory';

const LEGACY_BOOKMARKS_KEY = 'modernwiki_bookmarks';
const LEGACY_HIGHLIGHTS_KEY = 'modernwiki_highlights';
const LEGACY_WIKI_DIR_KEY = 'modernwiki_wiki_directory';

export function pageUrlNoHash(href: string): string {
  try {
    const u = new URL(href);
    u.hash = '';
    return u.toString();
  } catch {
    return href.split('#')[0] ?? href;
  }
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `miki-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function migrateLocalRecord<T>(newKey: string, legacyKey: string, done: (value: T | undefined) => void): void {
  chrome.storage.local.get([newKey, legacyKey], (r) => {
    let v = r[newKey] as T | undefined;
    const old = r[legacyKey] as T | undefined;
    if (v === undefined && old !== undefined) {
      v = old;
      chrome.storage.local.set({ [newKey]: v }, () => {
        chrome.storage.local.remove(legacyKey, () => done(v));
      });
      return;
    }
    if (v !== undefined && old !== undefined) {
      chrome.storage.local.remove(legacyKey, () => done(v));
      return;
    }
    done(v);
  });
}

export async function loadBookmarks(): Promise<SectionBookmark[]> {
  return new Promise((resolve) => {
    migrateLocalRecord<SectionBookmark[]>(BOOKMARKS_KEY, LEGACY_BOOKMARKS_KEY, (v) => {
      resolve(Array.isArray(v) ? v : []);
    });
  });
}

export async function saveBookmarks(list: SectionBookmark[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [BOOKMARKS_KEY]: list }, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function toggleSectionBookmark(
  pageUrl: string,
  href: string,
  sectionId: string,
  sectionTitle: string,
  pageTitle: string,
): Promise<boolean> {
  const list = await loadBookmarks();
  const idx = list.findIndex((b) => b.pageUrl === pageUrl && b.sectionId === sectionId);
  if (idx >= 0) {
    list.splice(idx, 1);
    await saveBookmarks(list);
    return false;
  }
  list.push({
    id: generateId(),
    pageUrl,
    href,
    sectionId,
    sectionTitle,
    pageTitle,
    createdAt: Date.now(),
  });
  await saveBookmarks(list);
  return true;
}

export async function bookmarkedSectionIdsForPage(pageUrl: string): Promise<Set<string>> {
  const list = await loadBookmarks();
  const set = new Set<string>();
  for (const b of list) {
    if (b.pageUrl === pageUrl) set.add(b.sectionId);
  }
  return set;
}

export async function removeBookmark(id: string): Promise<void> {
  const list = (await loadBookmarks()).filter((b) => b.id !== id);
  await saveBookmarks(list);
}

export async function loadHighlights(): Promise<PageHighlight[]> {
  return new Promise((resolve) => {
    migrateLocalRecord<PageHighlight[]>(HIGHLIGHTS_KEY, LEGACY_HIGHLIGHTS_KEY, (v) => {
      resolve(Array.isArray(v) ? v : []);
    });
  });
}

export async function saveHighlights(list: PageHighlight[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [HIGHLIGHTS_KEY]: list }, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function addHighlight(h: PageHighlight): Promise<void> {
  const list = await loadHighlights();
  list.push(h);
  await saveHighlights(list);
}

export async function removeHighlight(id: string): Promise<void> {
  const list = (await loadHighlights()).filter((h) => h.id !== id);
  await saveHighlights(list);
}

export async function loadWikiDirectory(): Promise<WikiSiteEntry[]> {
  return new Promise((resolve) => {
    migrateLocalRecord<WikiSiteEntry[]>(WIKI_DIR_KEY, LEGACY_WIKI_DIR_KEY, (v) => {
      resolve(Array.isArray(v) ? v : []);
    });
  });
}

export async function saveWikiDirectory(list: WikiSiteEntry[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [WIKI_DIR_KEY]: list }, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function recordWikiVisit(hostname: string, title: string, url: string): Promise<void> {
  const list = await loadWikiDirectory();
  const now = Date.now();
  const i = list.findIndex((e) => e.hostname === hostname);
  if (i < 0) {
    list.push({
      hostname,
      firstSeen: now,
      lastSeen: now,
      visitCount: 1,
      lastTitle: title,
      lastUrl: url,
    });
  } else {
    const e = list[i];
    list[i] = {
      ...e,
      lastSeen: now,
      visitCount: e.visitCount + 1,
      lastTitle: title,
      lastUrl: url,
    };
  }
  await saveWikiDirectory(list);
}
