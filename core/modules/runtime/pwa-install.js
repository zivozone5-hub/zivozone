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
  let autoHideTimer = null;

  // V1230.122 — the user asked for this to behave like a one-time soft nudge (appear on the
  // visitor's first time opening the site, then go away on its own) instead of sitting in the top
  // bar permanently until installed or manually dismissed. SEEN_KEY makes the auto-show part
  // one-time-ever per browser; the auto-hide timer (AUTO_HIDE_MS) is what makes it "then disappear"
  // even on that first visit, so it never lingers as permanent chrome.
  const SEEN_KEY = 'zivozone_pwa_install_seen_v1';
  const AUTO_HIDE_MS = 9000;
  const hasSeenBefore = () => { try { return !!localStorage.getItem(SEEN_KEY); } catch (_) { return false; } };
  const markSeen = () => { try { localStorage.setItem(SEEN_KEY, '1'); } catch (_) {} };

  const isStandalone = () =>
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

  function show() {
    const b = btn();
    if (!b || isStandalone()) return;
    // Not the visitor's first time: keep the button out of the permanent top-bar chrome. The
    // install option is still reachable from the browser's own menu, same as before this version.
    if (hasSeenBefore()) return;
    b.hidden = false;
    b.classList.remove('pwa-install-fading');
    markSeen();
    clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(fadeOut, AUTO_HIDE_MS);
  }
  function fadeOut() {
    const b = btn();
    if (!b || b.hidden) return;
    b.classList.add('pwa-install-fading');
    setTimeout(hide, 320);
  }
  function hide() {
    const b = btn();
    if (b) { b.hidden = true; b.classList.remove('pwa-install-fading'); }
    clearTimeout(autoHideTimer);
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
