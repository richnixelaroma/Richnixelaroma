export function initAdmin() {
  const tabs = [...document.querySelectorAll('[data-admin-tab]')];
  const panels = [...document.querySelectorAll('[data-admin-panel]')];
  if (!tabs.length || !panels.length) return;
  function activate(section, updateUrl = false) {
    const key = panels.some((panel) => panel.dataset.adminPanel === section) ? section : 'overview';
    tabs.forEach((tab) => {
      const selected = tab.dataset.adminTab === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.adminPanel !== key; });
    if (updateUrl) history.replaceState(null, '', `?section=${encodeURIComponent(key)}`);
  }
  tabs.forEach((tab) => tab.addEventListener('click', () => activate(tab.dataset.adminTab, true)));
  const initial = new URLSearchParams(location.search).get('section') || 'overview';
  activate(initial);
  document.querySelectorAll('[data-confirm]').forEach((form) => form.addEventListener('submit', (event) => {
    if (!window.confirm(form.dataset.confirm || 'Are you sure you want to continue?')) event.preventDefault();
  }));
}
