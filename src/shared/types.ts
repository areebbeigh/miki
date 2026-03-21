export type SidebarPosition = 'left' | 'right';

export type LayoutMode = 'push' | 'overlay';

export type DomainRuleMode = 'allow' | 'deny';

export interface DomainRule {
  /** Hostname pattern: exact host or leading `*.` wildcard */
  pattern: string;
  mode: DomainRuleMode;
}

export interface UserSettings {
  /** Master switch */
  enabled: boolean;
  /** Default for new tabs when auto-detection is inconclusive */
  defaultWikiMode: 'auto' | 'on' | 'off';
  sidebarOpen: boolean;
  sidebarPosition: SidebarPosition;
  sidebarWidthPx: number;
  layoutMode: LayoutMode;
  /** Scroll behavior when clicking outline */
  smoothScroll: boolean;
  /** Update location hash when jumping to a section */
  updateHash: boolean;
  /** Use chrome.storage.sync when true, else local */
  useSyncStorage: boolean;
  /** Per-domain overrides */
  domainRules: DomainRule[];

  /** Focused reading mode appearance (when mode is on for this tab) */
  readingBackground: string;
  readingTextColor: string;
  readingLinkColor: string;
  readingFontSizePx: number;
  readingFontFamily: string;
  readingLineHeight: number;
  /** e.g. 72ch, 900px, min(90vw, 960px) */
  readingMaxWidth: string;
  readingPagePaddingPx: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  enabled: true,
  defaultWikiMode: 'auto',
  sidebarOpen: true,
  sidebarPosition: 'left',
  sidebarWidthPx: 280,
  layoutMode: 'push',
  smoothScroll: true,
  updateHash: false,
  useSyncStorage: false,
  domainRules: [],
  readingBackground: '#faf9f7',
  readingTextColor: '#1c1917',
  readingLinkColor: '#2563eb',
  readingFontSizePx: 18,
  readingFontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  readingLineHeight: 1.65,
  readingMaxWidth: '72ch',
  readingPagePaddingPx: 28,
};

export interface OutlineItem {
  id: string;
  level: number;
  text: string;
  element: HTMLElement;
}

export type MessageToBackground =
  | { type: 'GET_SETTINGS' }
  | { type: 'OPEN_OPTIONS' };

export type MessageToContent =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SCROLL_TO_TOP' }
  | { type: 'HIGHLIGHT_SELECTION' }
  | { type: 'SETTINGS_UPDATED'; settings: UserSettings }
  | { type: 'SIDEBAR_OPEN_STATE'; open: boolean }
  | { type: 'TOGGLE_READING_MODE' };

export type ExtensionMessage = MessageToBackground | MessageToContent;
