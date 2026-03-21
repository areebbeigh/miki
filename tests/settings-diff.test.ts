import { describe, expect, it } from 'vitest';
import { changedSettingKeys } from '../src/background/settings-diff';
import { DEFAULT_SETTINGS, type UserSettings } from '../src/shared/types';

describe('changedSettingKeys', () => {
  it('detects only sidebarOpen change', () => {
    const a: UserSettings = { ...DEFAULT_SETTINGS, sidebarOpen: true };
    const b: UserSettings = { ...DEFAULT_SETTINGS, sidebarOpen: false };
    expect(changedSettingKeys(a, b)).toEqual(['sidebarOpen']);
  });

  it('detects domainRules change', () => {
    const a: UserSettings = { ...DEFAULT_SETTINGS, domainRules: [] };
    const b: UserSettings = {
      ...DEFAULT_SETTINGS,
      domainRules: [{ pattern: 'wiki.example.com', mode: 'allow' }],
    };
    expect(changedSettingKeys(a, b)).toEqual(['domainRules']);
  });
});
