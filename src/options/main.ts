import { parseRulesText, rulesToText } from '../shared/domain-rules';
import { loadSettings, saveSettings } from '../shared/storage';
import { DEFAULT_SETTINGS, type UserSettings } from '../shared/types';

const FONT_PRESETS: Record<string, string> = {
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  literata: '"Literata", "Libre Baskerville", Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

function el<T extends HTMLElement>(id: string): T {
  const n = document.getElementById(id);
  if (!n) throw new Error(`Missing #${id}`);
  return n as T;
}

function normalizeHex(v: string, fallback: string): string {
  const t = v.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(t)) return t;
  return fallback;
}

function guessPresetFromFont(font: string): string {
  const t = font.trim();
  for (const [k, v] of Object.entries(FONT_PRESETS)) {
    if (v === t) return k;
  }
  return 'custom';
}

function resolveFontFamily(preset: string, custom: string): string {
  if (preset === 'custom') {
    const c = custom.trim();
    return c || DEFAULT_SETTINGS.readingFontFamily;
  }
  return FONT_PRESETS[preset] ?? DEFAULT_SETTINGS.readingFontFamily;
}

function readForm(): UserSettings {
  const domainRules = parseRulesText(el<HTMLTextAreaElement>('domainRules').value);
  const preset = el<HTMLSelectElement>('readingFontPreset').value;
  return {
    enabled: el<HTMLInputElement>('enabled').checked,
    defaultWikiMode: el<HTMLSelectElement>('defaultWikiMode').value as UserSettings['defaultWikiMode'],
    sidebarOpen: el<HTMLInputElement>('sidebarOpen').checked,
    sidebarPosition: el<HTMLSelectElement>('sidebarPosition').value as UserSettings['sidebarPosition'],
    sidebarWidthPx: Number(el<HTMLInputElement>('sidebarWidthPx').value),
    layoutMode: el<HTMLSelectElement>('layoutMode').value as UserSettings['layoutMode'],
    smoothScroll: el<HTMLInputElement>('smoothScroll').checked,
    updateHash: el<HTMLInputElement>('updateHash').checked,
    useSyncStorage: el<HTMLInputElement>('useSyncStorage').checked,
    domainRules,
    readingBackground: normalizeHex(
      el<HTMLInputElement>('readingBackground').value,
      DEFAULT_SETTINGS.readingBackground,
    ),
    readingTextColor: normalizeHex(el<HTMLInputElement>('readingTextColor').value, DEFAULT_SETTINGS.readingTextColor),
    readingLinkColor: normalizeHex(el<HTMLInputElement>('readingLinkColor').value, DEFAULT_SETTINGS.readingLinkColor),
    readingFontSizePx: Math.min(
      32,
      Math.max(12, Number(el<HTMLInputElement>('readingFontSizePx').value) || DEFAULT_SETTINGS.readingFontSizePx),
    ),
    readingLineHeight: Math.min(
      2.5,
      Math.max(1, Number(el<HTMLInputElement>('readingLineHeight').value) || DEFAULT_SETTINGS.readingLineHeight),
    ),
    readingFontFamily: resolveFontFamily(preset, el<HTMLInputElement>('readingFontFamily').value),
    readingMaxWidth: el<HTMLInputElement>('readingMaxWidth').value.trim() || DEFAULT_SETTINGS.readingMaxWidth,
    readingPagePaddingPx: Math.min(
      80,
      Math.max(8, Number(el<HTMLInputElement>('readingPagePaddingPx').value) || DEFAULT_SETTINGS.readingPagePaddingPx),
    ),
  };
}

function applyToForm(s: UserSettings): void {
  el<HTMLInputElement>('enabled').checked = s.enabled;
  el<HTMLSelectElement>('defaultWikiMode').value = s.defaultWikiMode;
  el<HTMLInputElement>('sidebarOpen').checked = s.sidebarOpen;
  el<HTMLSelectElement>('sidebarPosition').value = s.sidebarPosition;
  el<HTMLInputElement>('sidebarWidthPx').value = String(s.sidebarWidthPx);
  el<HTMLSelectElement>('layoutMode').value = s.layoutMode;
  el<HTMLInputElement>('smoothScroll').checked = s.smoothScroll;
  el<HTMLInputElement>('updateHash').checked = s.updateHash;
  el<HTMLInputElement>('useSyncStorage').checked = s.useSyncStorage;
  el<HTMLTextAreaElement>('domainRules').value = rulesToText(s.domainRules);
  el<HTMLOutputElement>('sidebarWidthOut').textContent = String(s.sidebarWidthPx);

  el<HTMLInputElement>('readingBackground').value = normalizeHex(
    s.readingBackground,
    DEFAULT_SETTINGS.readingBackground,
  );
  el<HTMLInputElement>('readingBackgroundHex').value = normalizeHex(
    s.readingBackground,
    DEFAULT_SETTINGS.readingBackground,
  );
  el<HTMLInputElement>('readingTextColor').value = normalizeHex(s.readingTextColor, DEFAULT_SETTINGS.readingTextColor);
  el<HTMLInputElement>('readingTextHex').value = normalizeHex(s.readingTextColor, DEFAULT_SETTINGS.readingTextColor);
  el<HTMLInputElement>('readingLinkColor').value = normalizeHex(s.readingLinkColor, DEFAULT_SETTINGS.readingLinkColor);
  el<HTMLInputElement>('readingLinkHex').value = normalizeHex(s.readingLinkColor, DEFAULT_SETTINGS.readingLinkColor);
  el<HTMLInputElement>('readingFontSizePx').value = String(s.readingFontSizePx);
  el<HTMLInputElement>('readingLineHeight').value = String(s.readingLineHeight);
  el<HTMLSelectElement>('readingFontPreset').value = guessPresetFromFont(s.readingFontFamily);
  el<HTMLInputElement>('readingFontFamily').value = s.readingFontFamily;
  el<HTMLInputElement>('readingMaxWidth').value = s.readingMaxWidth;
  el<HTMLInputElement>('readingPagePaddingPx').value = String(s.readingPagePaddingPx);
}

function bindColorPair(colorId: string, hexId: string): void {
  const c = el<HTMLInputElement>(colorId);
  const h = el<HTMLInputElement>(hexId);
  c.addEventListener('input', () => {
    h.value = c.value;
  });
  h.addEventListener('change', () => {
    const v = h.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      c.value = v;
    }
  });
}

async function init(): Promise<void> {
  const s = await loadSettings();
  applyToForm(s);

  document.getElementById('open-library')?.addEventListener('click', () => {
    const url = chrome.runtime.getURL('src/dashboard/index.html');
    void chrome.tabs.create({ url });
  });

  bindColorPair('readingBackground', 'readingBackgroundHex');
  bindColorPair('readingTextColor', 'readingTextHex');
  bindColorPair('readingLinkColor', 'readingLinkHex');

  el<HTMLSelectElement>('readingFontPreset').addEventListener('change', () => {
    const preset = el<HTMLSelectElement>('readingFontPreset').value;
    if (preset !== 'custom') {
      el<HTMLInputElement>('readingFontFamily').value = FONT_PRESETS[preset] ?? '';
    }
  });

  const range = el<HTMLInputElement>('sidebarWidthPx');
  const out = el<HTMLOutputElement>('sidebarWidthOut');
  range.addEventListener('input', () => {
    out.textContent = range.value;
  });

  el<HTMLFormElement>('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = el<HTMLSpanElement>('status');
    status.textContent = 'Saving…';
    try {
      await saveSettings(readForm());
      status.textContent = 'Saved.';
      window.setTimeout(() => {
        status.textContent = '';
      }, 2500);
    } catch (err) {
      status.textContent = `Save failed: ${err instanceof Error ? err.message : String(err)}`;
    }
  });
}

void init().catch(() => {
  applyToForm(DEFAULT_SETTINGS);
});
