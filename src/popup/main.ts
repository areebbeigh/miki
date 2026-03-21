async function activeTabId(): Promise<number | undefined> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id;
}

async function sendToActive(msg: object): Promise<void> {
  const id = await activeTabId();
  if (id == null) return;
  await chrome.tabs.sendMessage(id, msg).catch(() => {});
}

function openExtensionPage(path: string): void {
  const url = chrome.runtime.getURL(path);
  void chrome.tabs.create({ url });
}

document.getElementById('btn-toggle')?.addEventListener('click', () => {
  void sendToActive({ type: 'TOGGLE_SIDEBAR' });
});

document.getElementById('btn-top')?.addEventListener('click', () => {
  void sendToActive({ type: 'SCROLL_TO_TOP' });
});

document.getElementById('btn-hl-now')?.addEventListener('click', () => {
  void sendToActive({ type: 'HIGHLIGHT_SELECTION' });
});

document.getElementById('btn-reading')?.addEventListener('click', () => {
  void sendToActive({ type: 'TOGGLE_READING_MODE' });
});

document.getElementById('btn-dashboard')?.addEventListener('click', () => {
  openExtensionPage('src/dashboard/index.html');
});

document.getElementById('btn-options')?.addEventListener('click', () => {
  void chrome.runtime.openOptionsPage();
});
