# PRD: Miki Chrome Extension

**Status:** Draft  
**Last updated:** 2025-03-20

## 1. Overview

**Problem:** Many wikis (MediaWiki, DokuWiki, Git wikis, internal documentation wikis, etc.) expose a long table of contents or page index inline. It scrolls away, uses dated typography and layout, and is awkward on wide monitors or when jumping between sections.

**Product:** A Chrome extension that detects wiki-like pages and provides a **modern reading shell**: a **pinned, collapsible sidebar** for the page index / outline, plus optional UI improvements—without replacing the host site’s content or requiring server-side changes.

**Success:** Users navigate long wiki articles faster, with less scrolling to recover the outline, and a clearer focus on content.

---

## 2. Goals

| ID | Goal | Description |
|----|------|-------------|
| G1 | Persistent outline | Surface **H1–H6** (or a wiki-provided TOC) in a **left or right sidebar** that stays visible while scrolling. |
| G2 | Collapsible chrome | Sidebar is **collapsible** (e.g. to an icon strip or fully hidden) and **remembers state** per site or globally. |
| G3 | Section navigation | **Clicking an outline entry** scrolls to the corresponding section; optional smooth scroll. |
| G4 | Active section | **Highlight the current section** in the outline while scrolling (scrollspy). |
| G5 | Broad wiki support | Work across **common wiki engines** via heuristics and engine-specific adapters, without breaking non-wiki pages. |

---

## 3. Non-goals (v1)

- Replacing the site’s HTML/CSS wholesale or acting as a universal theme engine for every wiki skin.
- Offline editing, sync, or account integration with the wiki host.
- Guaranteed support for every custom corporate wiki without configuration or community “site packs.”

---

## 4. User stories (representative)

1. As a reader, I want the **TOC always visible** so I can jump between sections without scrolling back to the top.
2. As a reader, I want to **collapse the sidebar** so it does not narrow content on small screens.
3. As a reader, I want **the current section** reflected in the outline as I scroll.
4. As a power user, I want to **toggle behavior per domain** so internal wikis get the shell and public sites can stay unchanged (or the reverse).

---

## 5. Functional requirements

### 5.1 Detection and activation

| ID | Requirement |
|----|-------------|
| FR-1 | Detect wiki-like pages using signals: URL patterns, DOM markers (e.g. `#mw-content-text`, `.wiki`, `article`), and/or a cluster of heading anchors in a main content region. |
| FR-2 | Provide **per-tab** enable/disable and **per-domain** defaults (allowlist / denylist). |
| FR-3 | If the page exposes no reliable TOC, **derive the outline from headings** in the inferred main content area, excluding global nav/footer where possible. |

### 5.2 Sidebar and outline

| ID | Requirement |
|----|-------------|
| FR-4 | Render the outline in an injected **sidebar** (prefer **Shadow DOM** or an isolated frame) listing items in **hierarchy** (indent by heading level). |
| FR-5 | Sidebar supports **collapse**; minimum collapsed state should remain **discoverable** (e.g. toggle affordance). |
| FR-6 | **Persist** sidebar open/closed (and related prefs) via `chrome.storage` (local vs sync as a user-facing option). |
| FR-7 | Outline click **scrolls** to the target; optional **hash update** for deep linking without breaking history—**user-configurable**. |

### 5.3 Scrollspy and highlighting

| ID | Requirement |
|----|-------------|
| FR-8 | While scrolling, **highlight** the active outline entry (e.g. **Intersection Observer**). |
| FR-9 | Throttle/debounce updates for performance on long pages and many headings. |

### 5.4 Layout integration

| ID | Requirement |
|----|-------------|
| FR-10 | Avoid obscuring main content: use **push layout** or configurable **overlay** mode. |
| FR-11 | Respect **`prefers-reduced-motion`** for animated scrolling. |

### 5.5 Settings

| ID | Requirement |
|----|-------------|
| FR-12 | **Options** page: global on/off, default sidebar state, **position** (left/right), domain rules. |
| FR-13 | **Keyboard shortcut** to toggle the sidebar (`chrome.commands`). |

### 5.6 Privacy and security

| ID | Requirement |
|----|-------------|
| FR-14 | **No** exfiltration of page content or browsing history to third parties; core processing is **local-only** unless a future feature explicitly states otherwise and is opt-in. |
| FR-15 | Request **minimal permissions**; prefer **`activeTab`** and explicit site access patterns over blanket `<all_urls>` unless justified. |
| FR-16 | Comply with typical **CSP** constraints; avoid patterns that break under strict policies. |

---

## 6. Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Performance:** Avoid noticeable jank on long articles; defer non-critical work. |
| NFR-2 | **Accessibility:** Sidebar operable via keyboard, visible focus, sensible default contrast. |
| NFR-3 | **Compatibility:** Target **Manifest V3**; degrade gracefully when APIs are unavailable. |
| NFR-4 | **Maintainability:** **Pluggable adapters** per wiki engine behind a shared interface (e.g. MediaWiki first). |

---

## 7. Suggested milestones

1. **MVP:** Heading-derived outline + collapsible sidebar + scrollspy + domain toggle + options skeleton.  
2. **v1.1:** MediaWiki-focused adapter, optional sidebar resize, light/dark theme aligned with `prefers-color-scheme`.  
3. **v1.2:** Optional reading-width and typography controls (local only).

---

## 8. Additional product ideas (post-MVP)

- **Reading column:** Optional max-width and line-height for long articles (toggle).  
- **Copy section link:** From outline, copy URL with hash when anchors exist.  
- **Filter outline:** Quick filter for pages with very long TOCs.  
- **Back to top** when the sidebar is collapsed.  
- **Print / PDF:** Hide injected UI under `@media print`.  
- **Stability:** Detect unstable DOM (edit mode, heavy SPAs); pause or soften injection with a small in-page notice.  
- **Site packs:** Community-maintained selector presets for popular wikis to improve accuracy.

---

## 9. Open questions

- Default stance on **Wikipedia**: on by default vs opt-in per domain?  
- **Right-to-left** languages: sidebar mirroring and outline order.  
- Collaboration with **Firefox** (future): shared core package vs Chrome-only v1.

---

## 10. References (in-repo)

| Doc / path | Purpose |
|------------|---------|
| [`README.md`](../README.md) | Build, load unpacked, layout overview |
| [`manifest.json`](../manifest.json) | MV3 manifest (copied to `dist/` on build) |
| [`src/adapters/`](../src/adapters/) | Pluggable wiki detection (`mediawiki`, `git-wiki`, `generic`) |
| [`src/content/sidebar.ts`](../src/content/sidebar.ts) | Shadow DOM sidebar host |
| [`src/options/`](../src/options/) | Options page (settings UI) |
| [`src/popup/`](../src/popup/) | Toolbar popup (quick actions) |
| [`src/dashboard/`](../src/dashboard/) | Library: bookmarks, highlights, wiki directory |
| [`src/shared/library.ts`](../src/shared/library.ts) | Local storage for bookmarks, highlights, wiki visit log |
| [`src/content/reading-mode.ts`](../src/content/reading-mode.ts) | Focused reading mode (hide site chrome, typography vars, sidebar-aware width) |
