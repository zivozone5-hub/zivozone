/* ZIVOZONE V1230.68 — zero-cost client-side error tracking (Firestore, Spark/free-plan only).
   No third-party account, no SDK, no new dependency: reuses the Firestore connection economy.js/
   auth.js already open, and the same anonymous-write + admin-only-read pattern ui.js's visitor
   telemetry already uses for core/modules/runtime's siteStats writes (see ui.js's track()) — this
   is the same shape of thing (a lightweight, schema-limited, write-only telemetry document), not a
   new kind of system.

   Why this exists: V1230.68's reward-crediting bug (see V1229_PHASE1_NOTES.md "## 1230.68") threw a
   real TypeError on every single reward claim, for a long time, and nothing surfaced it anywhere a
   human could see — it was caught by a try/catch and logged to a browser console nobody was
   watching. This module is the fix for THAT class of problem: every uncaught error and unhandled
   promise rejection in a real visitor's browser gets written to Firestore (best-effort, heavily
   capped) so the admin panel can show "what's actually breaking for real users," without needing a
   paid error-tracking service.

   Design notes:
   - Writes are anonymous-write-friendly (no sign-in required), just like siteStats/visitors — most
     runtime errors happen before/without a signed-in user.
   - Hard client-side caps keep this firmly inside the free Spark plan's write quota even under a
     pathological error loop: at most MAX_PER_SESSION reports per page load, de-duplicated by a
     simple content hash so the same recurring error only costs one write, not one per occurrence.
   - Only a fixed, size-capped field set is ever sent (enforced again server-side by firestore.rules'
     validErrorLogKeys()/validErrorLog(), the same belt-and-suspenders pattern as every other
     write path in this project) — never arbitrary objects, DOM nodes, or full page HTML.
   - Resource-load failures (a blocked image/ad/script) fire a plain 'error' event with no .error and
     no useful .message — these are filtered out; they're noise, not application bugs.
   - Never reports its own write failures (would be a direct feedback loop).
*/
(() => {
  'use strict';

  const MAX_PER_SESSION = 15;
  const MAX_MESSAGE = 500, MAX_STACK = 3000, MAX_URL = 200, MAX_UA = 300;

  const seen = new Set();
  let sentCount = 0;

  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return String(h);
  }

  function isNoise(message, filename) {
    const s = `${message || ''} ${filename || ''}`;
    // Cross-origin "Script error." carries zero diagnostic value by design (browser security), and
    // third-party ad/analytics network failures aren't this site's bug to track.
    return /^Script error\.?$/i.test(String(message || '').trim())
      || /googleapis|accounts\.google|gstatic\.com|googletagmanager|doubleclick|googlesyndication/i.test(s);
  }

  function truncate(s, max) { s = String(s == null ? '' : s); return s.length > max ? s.slice(0, max) : s; }

  async function send(entry) {
    if (sentCount >= MAX_PER_SESSION) return;
    const key = hash(entry.type + '|' + entry.message + '|' + entry.stack.slice(0, 200));
    if (seen.has(key)) return;
    seen.add(key);
    sentCount++;
    try {
      const f = window.firebase?.firestore?.();
      if (!f) return;
      const u = window.firebase?.auth?.()?.currentUser || null;
      const stamp = window.firebase.firestore.FieldValue.serverTimestamp();
      const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman' }).format(new Date());
      const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      await f.collection('errorLogs').doc(id).set({
        type: entry.type,
        message: truncate(entry.message, MAX_MESSAGE),
        stack: truncate(entry.stack, MAX_STACK),
        url: truncate(entry.url, MAX_URL),
        userAgent: truncate(navigator.userAgent, MAX_UA),
        lang: truncate(document.documentElement.lang || 'ar', 10),
        appVersion: truncate(window.ZIVOZONE_CONFIG?.APP_VERSION || '', 20),
        uid: u ? u.uid : null,
        day,
        createdAt: stamp
      });
    } catch (_) {
      // Deliberately silent: a failed error-report must never itself throw or recurse.
    }
  }

  window.addEventListener('error', (e) => {
    const message = e?.error?.message || e?.message || '';
    const filename = e?.filename || '';
    if (!message && !e?.error) return; // resource-load failure (img/script/link), not a JS error
    if (isNoise(message, filename)) return;
    send({
      type: 'error',
      message: message || 'Unknown error',
      stack: e?.error?.stack || `${filename}:${e?.lineno || 0}:${e?.colno || 0}`,
      url: location.pathname + location.hash
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e?.reason;
    const message = (reason && (reason.message || String(reason))) || 'Unhandled promise rejection';
    if (isNoise(message, '')) return;
    send({
      type: 'unhandledrejection',
      message,
      stack: reason?.stack || '',
      url: location.pathname + location.hash
    });
  });

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.ErrorTracker = Object.freeze({
    version: '1230.68',
    // Exposed for other modules that already catch-and-log their own errors (e.g. economy.js's
    // console.warn paths) to also report them here deliberately, without waiting for a second,
    // separate uncaught throw. Optional — nothing is required to call this.
    report: (message, extra = {}) => send({ type: 'manual', message: String(message || ''), stack: String(extra.stack || ''), url: location.pathname + location.hash }),
    sentCount: () => sentCount
  });
})();
