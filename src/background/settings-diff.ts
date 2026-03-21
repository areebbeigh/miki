import type { UserSettings } from '../shared/types';

export function changedSettingKeys(
  prev: UserSettings | undefined,
  next: UserSettings | undefined,
): string[] {
  if (!prev || !next) return ['*'];
  const keys = new Set<string>([
    ...Object.keys(prev as object),
    ...Object.keys(next as object),
  ]);
  const out: string[] = [];
  for (const k of keys) {
    if (k === 'domainRules') {
      if (JSON.stringify(prev.domainRules) !== JSON.stringify(next.domainRules)) {
        out.push(k);
      }
      continue;
    }
    const pk = (prev as unknown as Record<string, unknown>)[k];
    const nk = (next as unknown as Record<string, unknown>)[k];
    if (pk !== nk) {
      out.push(k);
    }
  }
  return out;
}
