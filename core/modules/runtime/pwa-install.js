/* ZIVOZONE V1230.83 — PWA "install app" button.
   manifest.webmanifest + sw.js were already fully wired (installable in principle), but nothing in
   the UI ever surfaced the install option — Chrome/Edge/Android only ever offer it through their own
   buried browser menu unless a site adds its own button. This module is that missing button: it
   captures the browser's `beforeinstallprompt` event (fired only when the browser itself has decided
   the site is installable), reveals #pwa-install-btn only then, and triggers the native install
   prompt on click. iOS Safari has no such event at all (Apple requires manual "Add to Home Screen"
   from the share sheet) — the button simply never appears there, which is correct: a button that
   can't do anything on click would be worse than no button.
*/
(() => {
  'use strict';
  const btn = () => document.getElementById('pwa-install-btn');
  let deferredEvent = null;

  const isStandalone = () =>
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

  function show() {
    const b = btn();
    if (b && !isStandalone()) b.hidden = false;
  }
  function hide() {
    const b = btn();
    if (b) b.hidden = true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredEvent = e;
    show();
  });

  window.addEventListener('appinstalled', () => {
    deferredEvent = null;
    hide();
  });

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('#pwa-install-btn');
    if (!b || !deferredEvent) return;
    e.preventDefault();
    b.disabled = true;
    try {
      deferredEvent.prompt();
      await deferredEvent.userChoice;
    } catch (err) {
      console.warn('PWA install:', err);
    } finally {
      deferredEvent = null;
      hide();
      b.disabled = false;
    }
  }, true);

  // Already running installed (standalone) — never show the button, regardless of whether the
  // browser still fires beforeinstallprompt in that state.
  if (isStandalone()) hide();
})();
