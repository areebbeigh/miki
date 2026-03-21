# Privacy policy — Miki

**Last updated:** 22 March 2026

This policy describes how the **Miki** browser extension (“Miki”, “the extension”) handles information when you use it in Google Chrome or other Chromium-based browsers that support Chrome extensions.

Miki is developed as an open-source project. **The extension does not send your reading activity, page content, bookmarks, or highlights to servers operated by the developer.** There is no analytics, advertising, or remote account system built into Miki.

## Who we are

**Data controller / contact:** *[Replace with your name or legal entity and a working email address, e.g. you@example.com]*

**Project repository:** *[Replace with your public repo URL, e.g. `https://github.com/yourusername/miki`]*

For privacy questions about this policy, contact us at the email above.

## What Miki does

Miki adds an outline sidebar, scrollspy, optional focused reading mode, local text highlights, section bookmarks, and a small library UI on pages where it is enabled. It uses the browser’s extension APIs to read and adjust the **open web pages you visit** only as needed for those features.

## Information stored on your device

### Settings

Miki stores **settings** (for example: sidebar position, width, layout mode, scrolling options, site allow/deny rules, and focused-reading appearance) using Chrome’s **`chrome.storage`** API.

- By default, settings are kept in **`chrome.storage.local`** on your device.
- If you turn on **“Sync settings across signed-in Chrome profiles”** in Options, Miki saves settings to **`chrome.storage.sync`**. That uses Google’s sync infrastructure tied to your Google account and Chrome sync settings. Miki does not control Google’s systems; see [Google’s Chrome Privacy Whitepaper](https://www.google.com/chrome/privacy/whitepaper.html) for how Chrome handles synced data.

### Library data (bookmarks, highlights, wiki directory)

Section bookmarks, saved highlight snippets, and the wiki visit directory are stored in **`chrome.storage.local`** only. **They are not synced** to the developer and are **not** written to `chrome.storage.sync` by Miki.

### Legacy migration

If you previously used the extension under the **ModernWiki** name, Miki may **one-time** read legacy `modernwiki_*` keys in storage to migrate your data to new keys. That happens locally in the browser.

## Permissions and why they exist

| Permission / access | Why Miki uses it |
|---------------------|------------------|
| **`storage`** | Save settings and library data as described above. |
| **`activeTab`** | When you use the toolbar popup or extension keyboard shortcuts, Miki talks to the **currently active tab** to toggle the sidebar, scroll to top, create a highlight from your selection, or toggle focused reading. |
| **Host access (`http://*/*`, `https://*/*`)** | Injects a **content script** on web pages so the outline, layout adjustments, highlights, and detection logic can run. Miki is intended for wiki-style sites; you can limit behavior using Options (including site rules). |

Miki **does not** use this access to run unrelated code, inject ads, or modify pages outside the features described in the listing.

## Remote code

Miki is distributed as a **Manifest V3** package. **All executable code is bundled inside the extension.** Miki does **not** download or execute remote code from the network.

## Data we do not collect

- No account registration with the developer.
- No sale of personal data.
- No tracking pixels or third-party analytics SDKs in the extension.
- No transmission of full page HTML or your browsing history to developer-operated servers.

## Third parties

- **Google / Chrome:** The browser and, if you use it, Chrome sync process extension data according to Google’s policies.
- **Websites you visit:** Miki runs in the context of pages you open; those sites have their own privacy practices unrelated to this extension.

## Children’s privacy

Miki is not directed at children under 13, and we do not knowingly collect personal information from children.

## Changes to this policy

We may update this policy when the extension or legal requirements change. The **“Last updated”** date at the top will be revised. Continued use of Miki after changes means you accept the updated policy.

## Your choices

- Disable or remove the extension at any time via the browser’s extension management page.
- Turn off **sync** for Miki settings in Options if you do not want settings in `chrome.storage.sync`.
- Use **site rules** in Options to reduce where Miki runs.

---

*This document is provided for convenience. If you publish Miki, replace bracketed placeholders with your real contact details and repository link, and adjust the “Last updated” date when you change the policy.*
