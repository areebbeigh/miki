import type { DomainRule, UserSettings } from './types';

/** Normalize hostname (no port). */
export function hostFromUrl(href: string): string {
  try {
    return new URL(href).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function matchPattern(host: string, pattern: string): boolean {
  const p = pattern.trim().toLowerCase();
  if (!p) return false;
  if (p.startsWith('*.')) {
    const suffix = p.slice(1);
    return host === p.slice(2) || host.endsWith(suffix);
  }
  return host === p;
}

/**
 * Resolve whether Miki should run for this host.
 * deny wins over allow; first matching rule wins within same tier if we ever split — here deny > allow.
 */
export function isExplicitAllow(host: string, settings: UserSettings): boolean {
  return settings.domainRules.some((r) => r.mode === 'allow' && matchPattern(host, r.pattern));
}

export function resolveSiteEnabled(host: string, settings: UserSettings): boolean | 'auto' {
  if (!settings.enabled) return false;

  const deny = settings.domainRules.filter((r) => r.mode === 'deny');
  const allow = settings.domainRules.filter((r) => r.mode === 'allow');

  for (const r of deny) {
    if (matchPattern(host, r.pattern)) return false;
  }
  for (const r of allow) {
    if (matchPattern(host, r.pattern)) return true;
  }

  if (settings.defaultWikiMode === 'on') return true;
  if (settings.defaultWikiMode === 'off') return false;
  return 'auto';
}

export function parseRulesText(text: string): DomainRule[] {
  const lines = text.split(/\r?\n/);
  const rules: DomainRule[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const deny = t.startsWith('!');
    const body = deny ? t.slice(1).trim() : t;
    if (!body) continue;
    rules.push({ pattern: body, mode: deny ? 'deny' : 'allow' });
  }
  return rules;
}

export function rulesToText(rules: DomainRule[]): string {
  return rules
    .map((r) => (r.mode === 'deny' ? `!${r.pattern}` : r.pattern))
    .join('\n');
}
