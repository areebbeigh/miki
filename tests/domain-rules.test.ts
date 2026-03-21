import { describe, expect, it } from 'vitest';
import { parseRulesText, resolveSiteEnabled, rulesToText } from '../src/shared/domain-rules';
import { DEFAULT_SETTINGS, type UserSettings } from '../src/shared/types';

describe('resolveSiteEnabled', () => {
  it('denies when master switch off', () => {
    const s: UserSettings = { ...DEFAULT_SETTINGS, enabled: false };
    expect(resolveSiteEnabled('wiki.example.com', s)).toBe(false);
  });

  it('deny rule wins over allow', () => {
    const s: UserSettings = {
      ...DEFAULT_SETTINGS,
      domainRules: [
        { pattern: '*.example.com', mode: 'allow' },
        { pattern: 'mail.example.com', mode: 'deny' },
      ],
    };
    expect(resolveSiteEnabled('mail.example.com', s)).toBe(false);
  });

  it('explicit allow returns true', () => {
    const s: UserSettings = {
      ...DEFAULT_SETTINGS,
      defaultWikiMode: 'off',
      domainRules: [{ pattern: 'wiki.internal', mode: 'allow' }],
    };
    expect(resolveSiteEnabled('wiki.internal', s)).toBe(true);
  });

  it('returns auto when default is auto and no rules', () => {
    expect(resolveSiteEnabled('anything.test', DEFAULT_SETTINGS)).toBe('auto');
  });
});

describe('parseRulesText / rulesToText', () => {
  it('round-trips simple rules', () => {
    const text = 'wiki.example.com\n!mail.google.com';
    const rules = parseRulesText(text);
    expect(rules).toEqual([
      { pattern: 'wiki.example.com', mode: 'allow' },
      { pattern: 'mail.google.com', mode: 'deny' },
    ]);
    expect(rulesToText(rules)).toBe(text);
  });
});
