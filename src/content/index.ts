import { detectWiki } from '../adapters/index';
import { hostFromUrl, isExplicitAllow, resolveSiteEnabled } from '../shared/domain-rules';
import {
  BOOKMARKS_KEY,
  HIGHLIGHTS_KEY,
  bookmarkedSectionIdsForPage,
  pageUrlNoHash,
  recordWikiVisit,
  toggleSectionBookmark,
} from '../shared/library';
import { loadSettings, saveSettings } from '../shared/storage';
import type { UserSettings } from '../shared/types';
import { getFallbackContentRoot } from './fallback';
import {
  applyHighlightsForCurrentPage,
  clearHighlightsInRoot,
  createHighlightFromSelection,
  injectHighlightStyles,
} from './highlights';
import { buildOutline } from './outline';
import { applyPageShift, clearLayout, reducedMotion } from './layout';
import {
  applyReadingMode,
  isReadingModeSessionActive,
  removeReadingMode,
  setReadingModeSessionActive,
  syncReadingModeVars,
} from './reading-mode';
import { createScrollSpy } from './scrollspy';
import { mountSidebar, type SidebarController } from './sidebar';

const INJECT_FLAG = 'data-miki-injected';
const MIN_CONFIDENCE = 38;

let controller: PageController | null = null;

class PageController {
  private settings: UserSettings;
  private sidebar: SidebarController | null = null;
  private spy: { disconnect: () => void } | null = null;
  private collapsed: boolean;
  private outlineItems: ReturnType<typeof buildOutline>;
  private readonly contentRoot: HTMLElement;
  private storageListener: ((changes: Record<string, chrome.storage.StorageChange>, area: string) => void) | null =
    null;

  constructor(
    settings: UserSettings,
    outlineItems: ReturnType<typeof buildOutline>,
    contentRoot: HTMLElement,
    bookmarkedIds: Set<string>,
  ) {
    this.settings = settings;
    this.collapsed = !settings.sidebarOpen;
    this.outlineItems = outlineItems;
    this.contentRoot = contentRoot;
    this.mount(bookmarkedIds);
  }

  private mount(bookmarkedIds: Set<string>): void {
    injectHighlightStyles();
    applyHighlightsForCurrentPage(location.href, this.contentRoot);

    const readingOn = isReadingModeSessionActive();
    this.sidebar = mountSidebar(this.outlineItems, this.settings, bookmarkedIds, readingOn, {
      onNavigate: (id) => void this.scrollToId(id),
      onToggleCollapse: () => void this.toggleCollapsed(),
      onBookmarkToggle: (sectionId, sectionTitle) => void this.handleBookmarkToggle(sectionId, sectionTitle),
      onScrollTop: () => void this.scrollToTop(),
      onReadingModeToggle: () => void this.toggleReadingMode(),
    });
    this.applyLayout();
    if (readingOn) {
      applyReadingMode(this.contentRoot, this.settings);
      this.sidebar.setReadingModeActive(true);
    }
    this.spy = createScrollSpy(this.outlineItems, (id) => {
      this.sidebar?.setActiveId(id);
    });

    this.storageListener = (changes, area) => {
      if (area !== 'local') return;
      if (changes[BOOKMARKS_KEY]) {
        void bookmarkedSectionIdsForPage(pageUrlNoHash(location.href)).then((ids) => {
          this.sidebar?.setBookmarkedIds(ids);
        });
      }
      if (changes[HIGHLIGHTS_KEY]) {
        clearHighlightsInRoot(this.contentRoot);
        injectHighlightStyles();
        applyHighlightsForCurrentPage(location.href, this.contentRoot);
      }
    };
    chrome.storage.onChanged.addListener(this.storageListener);
  }

  private async handleBookmarkToggle(sectionId: string, sectionTitle: string): Promise<void> {
    const pu = pageUrlNoHash(location.href);
    const href = `${pu}#${encodeURIComponent(sectionId)}`;
    await toggleSectionBookmark(pu, href, sectionId, sectionTitle, document.title);
    const ids = await bookmarkedSectionIdsForPage(pu);
    this.sidebar?.setBookmarkedIds(ids);
  }

  private scrollToTop(): void {
    const smooth = this.settings.smoothScroll && !reducedMotion();
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  }

  toggleReadingMode(): void {
    const next = !isReadingModeSessionActive();
    setReadingModeSessionActive(next);
    if (next) {
      applyReadingMode(this.contentRoot, this.settings);
      this.sidebar?.setReadingModeActive(true);
    } else {
      removeReadingMode(this.contentRoot);
      this.sidebar?.setReadingModeActive(false);
    }
  }

  toggle(): void {
    if (!this.sidebar) return;
    this.collapsed = !this.collapsed;
    this.sidebar.setCollapsed(this.collapsed);
    this.applyLayout();
    void saveSettings({ sidebarOpen: !this.collapsed });
  }

  private toggleCollapsed(): void {
    this.toggle();
  }

  private applyLayout(): void {
    if (!this.sidebar) return;
    const expanded = this.settings.enabled && !this.collapsed;
    applyPageShift(this.settings, expanded);
    if (isReadingModeSessionActive()) {
      syncReadingModeVars(this.settings);
    }
  }

  private scrollToId(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    const smooth = this.settings.smoothScroll && !reducedMotion();
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    if (this.settings.updateHash) {
      try {
        history.replaceState(null, '', `#${encodeURIComponent(id)}`);
      } catch {
        /* ignore */
      }
    }
  }

  applySidebarOpenFromStorage(open: boolean): void {
    this.settings = { ...this.settings, sidebarOpen: open };
    this.collapsed = !open;
    this.sidebar?.setCollapsed(this.collapsed);
    this.applyLayout();
  }

  destroy(): void {
    if (this.storageListener) {
      chrome.storage.onChanged.removeListener(this.storageListener);
      this.storageListener = null;
    }
    this.spy?.disconnect();
    this.spy = null;
    this.sidebar?.destroy();
    this.sidebar = null;
    if (isReadingModeSessionActive()) {
      removeReadingMode(this.contentRoot);
    }
    clearLayout();
  }
}

function injectPrintStyles(): void {
  if (document.getElementById('miki-print-style')) return;
  const s = document.createElement('style');
  s.id = 'miki-print-style';
  s.textContent = `
    @media print {
      #miki-sidebar-host { display: none !important; }
      html[data-miki-layout] { padding-left: 0 !important; padding-right: 0 !important; }
    }
  `;
  document.documentElement.appendChild(s);
}

function teardown(): void {
  controller?.destroy();
  controller = null;
  document.documentElement.removeAttribute(INJECT_FLAG);
}

async function evaluateAndMount(settings: UserSettings): Promise<void> {
  teardown();

  if (window !== window.top) return;
  if (!settings.enabled) return;

  const host = hostFromUrl(location.href);
  const site = resolveSiteEnabled(host, settings);

  if (site === false) return;

  const detected = detectWiki(document, location.href);
  const okAuto = detected !== null && detected.confidence >= MIN_CONFIDENCE;
  const allowlisted = isExplicitAllow(host, settings);

  let contentRoot: HTMLElement | null = null;
  if (allowlisted) {
    contentRoot = detected?.contentRoot ?? getFallbackContentRoot(document);
  } else if (site === 'auto' || site === true) {
    if (!okAuto || !detected) return;
    contentRoot = detected.contentRoot;
  }

  if (!contentRoot) return;

  const outlineItems = buildOutline(contentRoot);
  if (outlineItems.length < 2) return;

  document.documentElement.setAttribute(INJECT_FLAG, '1');
  injectPrintStyles();

  void recordWikiVisit(host, document.title, location.href);

  const pu = pageUrlNoHash(location.href);
  const bookmarked = await bookmarkedSectionIdsForPage(pu);

  controller = new PageController(settings, outlineItems, contentRoot, bookmarked);
}

async function bootstrap(): Promise<void> {
  if (document.documentElement.getAttribute(INJECT_FLAG)) return;
  const settings = await loadSettings();
  await evaluateAndMount(settings);
}

void bootstrap();

chrome.runtime.onMessage.addListener(
  (msg: {
    type: string;
    settings?: UserSettings;
    open?: boolean;
  }) => {
    if (msg.type === 'TOGGLE_SIDEBAR') {
      controller?.toggle();
      return;
    }
    if (msg.type === 'SCROLL_TO_TOP') {
      void loadSettings().then((s) => {
        const smooth = s.smoothScroll && !reducedMotion();
        window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      });
      return;
    }
    if (msg.type === 'HIGHLIGHT_SELECTION') {
      void createHighlightFromSelection();
      return;
    }
    if (msg.type === 'SIDEBAR_OPEN_STATE' && typeof msg.open === 'boolean') {
      controller?.applySidebarOpenFromStorage(msg.open);
      return;
    }
    if (msg.type === 'TOGGLE_READING_MODE') {
      controller?.toggleReadingMode();
      return;
    }
    if (msg.type === 'SETTINGS_UPDATED' && msg.settings) {
      void evaluateAndMount(msg.settings);
    }
  },
);
