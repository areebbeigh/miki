/** Injected into Shadow DOM — self-contained, prefers system dark mode. */
export const SIDEBAR_STYLES = `
:host {
  all: initial;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 13px;
}

* {
  box-sizing: border-box;
}

.shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fb;
  color: #111318;
  border-inline-end: 1px solid #e2e5eb;
  transition: width 0.2s ease, opacity 0.15s ease;
}

@media (prefers-color-scheme: dark) {
  .shell {
    background: #14161a;
    color: #e8eaef;
    border-inline-end-color: #2a2f38;
  }
}

.shell[data-position="right"] {
  border-inline-end: none;
  border-inline-start: 1px solid #e2e5eb;
}

@media (prefers-color-scheme: dark) {
  .shell[data-position="right"] {
    border-inline-start-color: #2a2f38;
  }
}

.shell[data-collapsed="true"] {
  width: 44px !important;
  min-width: 44px;
}

.shell[data-collapsed="true"] .outline,
.shell[data-collapsed="true"] .header-title {
  opacity: 0;
  pointer-events: none;
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.shell[data-collapsed="true"] .outline-row {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 10px 8px;
  border-bottom: 1px solid #e2e5eb;
  flex-shrink: 0;
}

@media (prefers-color-scheme: dark) {
  .header {
    border-bottom-color: #2a2f38;
  }
}

.header-title {
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  opacity: 0.85;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: #e8ecf4;
}

@media (prefers-color-scheme: dark) {
  .icon-btn:hover {
    background: #252a33;
  }
}

.icon-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.outline {
  flex: 1;
  overflow: auto;
  padding: 8px 6px 4px;
  scrollbar-width: thin;
}

.outline-row {
  display: flex;
  align-items: stretch;
  gap: 2px;
  margin-bottom: 2px;
}

.bookmark-btn {
  flex: 0 0 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  opacity: 0.45;
}

.bookmark-btn:hover {
  opacity: 1;
  background: #e8ecf4;
}

@media (prefers-color-scheme: dark) {
  .bookmark-btn:hover {
    background: #252a33;
  }
}

.bookmark-btn[data-on="true"] {
  opacity: 1;
  color: #ca8a04;
}

.bookmark-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 0;
}

.item {
  display: block;
  flex: 1;
  min-width: 0;
  text-align: start;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 6px 8px;
  margin: 0;
  border-radius: 6px;
  line-height: 1.35;
  font: inherit;
}

.item:hover {
  background: #eef1f7;
}

@media (prefers-color-scheme: dark) {
  .item:hover {
    background: #1e232c;
  }
}

.item[data-active="true"] {
  background: #dbeafe;
  color: #1d4ed8;
}

@media (prefers-color-scheme: dark) {
  .item[data-active="true"] {
    background: #1e3a5f;
    color: #93c5fd;
  }
}

.item:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 0;
}

.indent-1 { padding-inline-start: 4px; }
.indent-2 { padding-inline-start: 10px; }
.indent-3 { padding-inline-start: 16px; }
.indent-4 { padding-inline-start: 22px; }
.indent-5 { padding-inline-start: 28px; }
.indent-6 { padding-inline-start: 34px; }

.footer {
  flex-shrink: 0;
  padding: 8px 10px 10px;
  border-top: 1px solid #e2e5eb;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (prefers-color-scheme: dark) {
  .footer {
    border-top-color: #2a2f38;
  }
}

.scroll-top-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: #eef1f7;
  color: inherit;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .scroll-top-btn {
    background: #1e232c;
  }
}

.scroll-top-btn:hover {
  filter: brightness(0.98);
}

.scroll-top-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.reading-mode-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: #e0e7ff;
  color: #1e3a8a;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

@media (prefers-color-scheme: dark) {
  .reading-mode-btn {
    background: #1e3a5f;
    color: #bfdbfe;
  }
}

.reading-mode-btn[data-on="true"] {
  background: #312e81;
  color: #e0e7ff;
}

@media (prefers-color-scheme: dark) {
  .reading-mode-btn[data-on="true"] {
    background: #4338ca;
    color: #fff;
  }
}

.reading-mode-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.brand {
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.06em;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  margin: auto;
  padding: 8px 0;
  opacity: 0.75;
}

.shell[data-collapsed="false"] .brand {
  display: none;
}

.shell[data-collapsed="true"] .footer {
  padding: 6px 4px;
}

.shell[data-collapsed="true"] .scroll-top-btn span:not(.ico) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.shell[data-collapsed="true"] .scroll-top-btn,
.shell[data-collapsed="true"] .reading-mode-btn {
  padding: 8px 4px;
}

.shell[data-collapsed="true"] .reading-mode-btn span:not(.ico) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
`;
