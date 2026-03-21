/** When user forces site "on" but no adapter matched. */
export function getFallbackContentRoot(doc: Document): HTMLElement | null {
  return (
    (doc.querySelector('main') as HTMLElement | null) ||
    (doc.querySelector('[role="main"]') as HTMLElement | null) ||
    (doc.querySelector('article') as HTMLElement | null) ||
    (doc.querySelector('#content, .content') as HTMLElement | null) ||
    (doc.body as HTMLElement | null)
  );
}
