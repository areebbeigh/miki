import type { UserSettings } from '../shared/types';
import { HIGHLIGHT_MARK_CLASS } from './highlights';

export const READING_SESSION_KEY = 'miki-reading-active';
const LEGACY_READING_SESSION_KEY = 'modernwiki-reading-active';

const STYLE_ID = 'miki-reading-style';

let chainMarked: HTMLElement[] = [];
let resizeHandler: (() => void) | null = null;

export function isReadingModeSessionActive(): boolean {
  try {
    if (sessionStorage.getItem(READING_SESSION_KEY) === '1') return true;
    if (sessionStorage.getItem(LEGACY_READING_SESSION_KEY) === '1') {
      sessionStorage.setItem(READING_SESSION_KEY, '1');
      sessionStorage.removeItem(LEGACY_READING_SESSION_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function setReadingModeSessionActive(active: boolean): void {
  try {
    sessionStorage.removeItem(LEGACY_READING_SESSION_KEY);
    if (active) sessionStorage.setItem(READING_SESSION_KEY, '1');
    else sessionStorage.removeItem(READING_SESSION_KEY);
  } catch {
    /* private mode */
  }
}

function unmarkChain(): void {
  for (const el of chainMarked) {
    delete el.dataset.mikiReadingChain;
  }
  chainMarked = [];
}

function markChainFromRoot(root: HTMLElement): void {
  unmarkChain();
  let el: HTMLElement | null = root;
  while (el) {
    el.dataset.mikiReadingChain = '1';
    chainMarked.push(el);
    if (el === document.body) break;
    el = el.parentElement;
  }
}

function removeInjectedStyle(): void {
  document.getElementById(STYLE_ID)?.remove();
}

function injectReadingStyle(): void {
  removeInjectedStyle();
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    html[data-miki-reading="1"] body * {
      visibility: hidden !important;
    }
    html[data-miki-reading="1"] body [data-miki-reading-chain="1"],
    html[data-miki-reading="1"] body [data-miki-reading-chain="1"] * {
      visibility: visible !important;
    }
    html[data-miki-reading="1"] #miki-sidebar-host {
      visibility: visible !important;
    }
    /* Large wikis use content-visibility:auto on sections; visibility:hidden breaks
       off-screen paint until scroll. Force the reading subtree to fully render. */
    html[data-miki-reading="1"] body [data-miki-reading-chain="1"],
    html[data-miki-reading="1"] body [data-miki-reading-chain="1"] *,
    html[data-miki-reading="1"] [data-miki-content-root="1"],
    html[data-miki-reading="1"] [data-miki-content-root="1"] * {
      content-visibility: visible !important;
      contain-intrinsic-size: unset !important;
    }
    html[data-miki-reading="1"] {
      background: var(--miki-reading-bg) !important;
      overflow-x: hidden !important;
    }
    html[data-miki-reading="1"] body {
      background: transparent !important;
      margin: 0 !important;
      min-height: 100vh !important;
    }
    html[data-miki-reading="1"] [data-miki-content-root="1"] {
      contain: none !important;
      max-width: min(var(--miki-reading-max), var(--miki-reading-avail-px)) !important;
      width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
      box-sizing: border-box !important;
      padding: var(--miki-reading-pad) !important;
      background: var(--miki-reading-bg) !important;
      color: var(--miki-reading-fg) !important;
      font-size: var(--miki-reading-font-size) !important;
      font-family: var(--miki-reading-font-family) !important;
      line-height: var(--miki-reading-line-height) !important;
    }
    html[data-miki-reading="1"] [data-miki-content-root="1"] a {
      color: var(--miki-reading-link) !important;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    html[data-miki-reading="1"] [data-miki-content-root="1"] mark.${HIGHLIGHT_MARK_CLASS} {
      color: #0a0a0a !important;
      -webkit-text-fill-color: #0a0a0a !important;
    }
    html[data-miki-reading="1"] [data-miki-content-root="1"] img,
    html[data-miki-reading="1"] [data-miki-content-root="1"] video {
      max-width: 100% !important;
      height: auto !important;
    }
    @media print {
      html[data-miki-reading="1"] body * {
        visibility: visible !important;
      }
      html[data-miki-reading="1"] #miki-sidebar-host {
        display: none !important;
      }
    }
  `;
  document.documentElement.appendChild(s);
}

/** Sync CSS variables from settings + available width (respects Miki sidebar padding). */
export function syncReadingModeVars(settings: UserSettings): void {
  const r = document.documentElement;
  const cs = getComputedStyle(r);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pr = parseFloat(cs.paddingRight) || 0;
  const avail = Math.max(0, window.innerWidth - pl - pr);
  r.style.setProperty('--miki-reading-avail-px', `${avail}px`);
  r.style.setProperty('--miki-reading-bg', settings.readingBackground);
  r.style.setProperty('--miki-reading-fg', settings.readingTextColor);
  r.style.setProperty('--miki-reading-link', settings.readingLinkColor);
  r.style.setProperty('--miki-reading-font-size', `${settings.readingFontSizePx}px`);
  r.style.setProperty('--miki-reading-font-family', settings.readingFontFamily);
  r.style.setProperty('--miki-reading-line-height', String(settings.readingLineHeight));
  r.style.setProperty('--miki-reading-max', settings.readingMaxWidth);
  r.style.setProperty('--miki-reading-pad', `${settings.readingPagePaddingPx}px`);
}

export function applyReadingMode(contentRoot: HTMLElement, settings: UserSettings): void {
  removeReadingMode(contentRoot);
  markChainFromRoot(contentRoot);
  contentRoot.dataset.mikiContentRoot = '1';
  document.documentElement.setAttribute('data-miki-reading', '1');
  injectReadingStyle();
  syncReadingModeVars(settings);

  resizeHandler = () => syncReadingModeVars(settings);
  window.addEventListener('resize', resizeHandler);

  requestAnimationFrame(() => {
    void contentRoot.getBoundingClientRect();
    syncReadingModeVars(settings);
  });
}

export function removeReadingMode(contentRoot: HTMLElement): void {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  delete contentRoot.dataset.mikiContentRoot;
  unmarkChain();
  document.documentElement.removeAttribute('data-miki-reading');
  removeInjectedStyle();
  document.documentElement.style.removeProperty('--miki-reading-avail-px');
  document.documentElement.style.removeProperty('--miki-reading-bg');
  document.documentElement.style.removeProperty('--miki-reading-fg');
  document.documentElement.style.removeProperty('--miki-reading-link');
  document.documentElement.style.removeProperty('--miki-reading-font-size');
  document.documentElement.style.removeProperty('--miki-reading-font-family');
  document.documentElement.style.removeProperty('--miki-reading-line-height');
  document.documentElement.style.removeProperty('--miki-reading-max');
  document.documentElement.style.removeProperty('--miki-reading-pad');
}
