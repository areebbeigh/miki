import { loadSettings } from '../shared/storage';
import { STORAGE_KEY } from '../shared/constants';
import type { UserSettings } from '../shared/types';
import { changedSettingKeys } from './settings-diff';

function broadcast(message: Record<string, unknown>): void {
  void chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id == null) continue;
      chrome.tabs.sendMessage(tab.id, message).catch(() => {
        /* tab may have no content script */
      });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  void loadSettings();
});

chrome.commands.onCommand.addListener((command) => {
  void chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const id = tabs[0]?.id;
    if (id == null) return;
    if (command === 'toggle-sidebar') {
      chrome.tabs.sendMessage(id, { type: 'TOGGLE_SIDEBAR' }).catch(() => {});
      return;
    }
    if (command === 'scroll-top') {
      chrome.tabs.sendMessage(id, { type: 'SCROLL_TO_TOP' }).catch(() => {});
      return;
    }
    if (command === 'highlight-selection') {
      chrome.tabs.sendMessage(id, { type: 'HIGHLIGHT_SELECTION' }).catch(() => {});
      return;
    }
    if (command === 'reading-mode-toggle') {
      chrome.tabs.sendMessage(id, { type: 'TOGGLE_READING_MODE' }).catch(() => {});
    }
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' && area !== 'sync') return;
  if (!changes[STORAGE_KEY]) return;
  const ch = changes[STORAGE_KEY];
  const oldVal = ch.oldValue as UserSettings | undefined;
  const nv = ch.newValue as UserSettings | undefined;
  if (!nv) return;
  const keys = changedSettingKeys(oldVal, nv);
  if (keys.length === 1 && keys[0] === 'sidebarOpen') {
    broadcast({ type: 'SIDEBAR_OPEN_STATE', open: nv.sidebarOpen });
    return;
  }
  broadcast({ type: 'SETTINGS_UPDATED', settings: nv });
});
