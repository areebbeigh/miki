export interface WikiAdapter {
  id: string;
  /** Higher = tried first when selectors match */
  priority: number;
  /** Quick check without full DOM walk */
  matchesLocation(href: string): boolean;
  /** Whether this page looks like a readable article */
  matchesDocument(doc: Document): boolean;
  /** Root element that contains article body + headings */
  getContentRoot(doc: Document): HTMLElement | null;
}
