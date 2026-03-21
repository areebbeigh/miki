import type { UserSettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from './constants';

function mergeSettings(base: UserSettings, patch: Partial<UserSettings> | undefined): UserSettings {
  if (!patch) return { ...base };
  return {
    ...base,
    ...patch,
    domainRules: patch.domainRules ?? base.domainRules,
  };
}

/** Copy `modernwiki_settings` → `miki_settings` in each storage area once. */
function migrateLegacySettings(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY, LEGACY_STORAGE_KEY], (loc) => {
      const finishLocal = (): void => {
        chrome.storage.sync.get([STORAGE_KEY, LEGACY_STORAGE_KEY], (sync) => {
          if (sync[LEGACY_STORAGE_KEY] !== undefined && sync[STORAGE_KEY] === undefined) {
            chrome.storage.sync.set({ [STORAGE_KEY]: sync[LEGACY_STORAGE_KEY] }, () => {
              chrome.storage.sync.remove(LEGACY_STORAGE_KEY, () => resolve());
            });
          } else resolve();
        });
      };
      if (loc[LEGACY_STORAGE_KEY] !== undefined && loc[STORAGE_KEY] === undefined) {
        chrome.storage.local.set({ [STORAGE_KEY]: loc[LEGACY_STORAGE_KEY] }, () => {
          chrome.storage.local.remove(LEGACY_STORAGE_KEY, finishLocal);
        });
      } else finishLocal();
    });
  });
}

export async function loadSettings(): Promise<UserSettings> {
  await migrateLegacySettings();
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (local) => {
      chrome.storage.sync.get(STORAGE_KEY, (sync) => {
        const L = local[STORAGE_KEY] as Partial<UserSettings> | undefined;
        const S = sync[STORAGE_KEY] as Partial<UserSettings> | undefined;
        const useSync = S?.useSyncStorage ?? L?.useSyncStorage ?? DEFAULT_SETTINGS.useSyncStorage;
        const raw = useSync ? { ...L, ...S } : { ...S, ...L };
        resolve(mergeSettings(DEFAULT_SETTINGS, raw));
      });
    });
  });
}

export async function saveSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  const current = await loadSettings();
  const next = mergeSettings(current, partial);
  const primary = next.useSyncStorage ? chrome.storage.sync : chrome.storage.local;
  const secondary = next.useSyncStorage ? chrome.storage.local : chrome.storage.sync;
  await new Promise<void>((resolve, reject) => {
    primary.set({ [STORAGE_KEY]: next }, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });
  await new Promise<void>((resolve) => {
    secondary.remove(STORAGE_KEY, () => resolve());
  });
  return next;
}
