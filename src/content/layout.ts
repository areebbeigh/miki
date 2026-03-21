import type { UserSettings } from '../shared/types';

const DATA_ATTR = 'data-miki-layout';

/** `expanded` = sidebar visible and not collapsed; push layout applies padding when true. */
export function applyPageShift(settings: UserSettings, expanded: boolean): void {
  const root = document.documentElement;
  if (!expanded || settings.layoutMode !== 'push') {
    clearLayout(root);
    return;
  }

  const width = settings.sidebarWidthPx;
  const pos = settings.sidebarPosition;

  root.setAttribute(DATA_ATTR, '1');
  if (pos === 'left') {
    root.style.paddingLeft = `${width}px`;
    root.style.paddingRight = '';
  } else {
    root.style.paddingRight = `${width}px`;
    root.style.paddingLeft = '';
  }
}

export function clearLayout(root: HTMLElement = document.documentElement): void {
  root.removeAttribute(DATA_ATTR);
  root.style.paddingLeft = '';
  root.style.paddingRight = '';
}

export function reducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
