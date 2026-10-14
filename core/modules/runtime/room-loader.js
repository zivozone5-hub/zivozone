/* ZIVOZONE V1230.71 — generic lazy-loader for signature-room game modules.

   WHY: horror-room.js, puzzle-room.js, beauty-room.js, rooms.js (story+health) and football-room.js
   together are 150KB+ of JavaScript that used to ship in the eager app.bundle.js to EVERY visitor,
   even the ones who never open a single room. forensic-case-core.js (1.3MB) was already carved out
   this way in V1230.67 (see challenges.js's loadForensicCore()); this generalizes that exact same
   pattern — dynamic <script> injection, cached-by-key promise, version-stamped URL, toast on
   prepare/fail — to the other five rooms instead of re-solving the same problem five times inline.
   forensic-case-core.js keeps its own existing wiring in challenges.js untouched (it's bound to that
   file's 'forensic' challenge-id switch and already works); this module is for the five rooms that
   were still fully eager.

   CONTRACT: each lazy room file is COMPLETELY UNCHANGED — still a self-contained IIFE that, once it
   runs, both sets its own `window.ZIVOZONE.<Thing>` object AND registers its own normal (bubble-
   phase) document click listener for its own data-attribute, exactly as it always did. This loader
   only solves the chicken-and-egg problem of "the room's own click listener doesn't exist yet the
   first time someone clicks its trigger, because the file hasn't loaded" — it does nothing else, and
   steps out of the way permanently once a room has loaded (see handle() below).

   window.ZIVOZONE_ROOM_LOADER.ensure(key) is also the one bit of public API other code can call
   directly for a trigger that isn't a plain click on the room's own card — challenges.js's Dark Room
   quiz "bonus" button (which opens Light Escape straight from the quiz result screen, bypassing the
   card entirely) uses exactly this instead of assuming HorrorRoom is already loaded.
*/
(() => {
  "use strict";
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  // Same #toast-container contract as router.js/challenges.js's own toast() helpers — one shared
  // element, not a third toast system.
  function toast(message, type = "info") {
    let box = document.getElementById("toast-container");
    if (!box) { box = document.createElement("div"); box.id = "toast-container"; box.className = "toast-container"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const node = document.createElement("div"); node.className = `toast ${type}`; node.textContent = message; box.appendChild(node);
    setTimeout(() => node.remove(), 3600);
  }

  // V1230.83 — each room's CSS now travels with its JS instead of loading eagerly on every page
  // (see index.html's V1230.83 comment for the ~290KB this removes from first paint). loadCss() is
  // fire-and-forget and dedupes by href, so a second ensure() of an already-loading room never
  // injects a duplicate <link>.
  function loadCss(href) {
    if (!href || document.querySelector(`link[data-room-css="${href}"]`)) return;
    const v = window.ZIVOZONE_CONFIG?.APP_VERSION || Date.now();
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = `${href}?v=${v}`;
    l.setAttribute("data-room-css", href);
    document.head.appendChild(l);
  }

  const ROOMS = {
    horror: { src: "dist/lazy/horror-room.js", css: "dist/styles/horror-room.css", check: () => window.ZIVOZONE?.HorrorRoom },
    puzzle: { src: "dist/lazy/puzzle-room.js", css: "dist/styles/puzzle-room.css", check: () => window.ZIVOZONE?.PuzzleRoom },
    beauty: { src: "dist/lazy/beauty-room.js", css: "dist/styles/beauty-room.css", check: () => window.ZIVOZONE?.BeautyRoom },
    rooms: { src: "dist/lazy/rooms.js", css: "dist/styles/rooms.css", check: () => window.ZIVOZONE?.RealRooms },
    football: { src: "dist/lazy/football-room.js", css: "dist/styles/football-room.css", check: () => window.ZIVOZONE?.FootballRoom }
  };
  const pending = {};

  function ensure(key) {
    const def = ROOMS[key];
    if (!def) return Promise.reject(new Error("ZIVOZONE room-loader: unknown room key " + key));
    const already = def.check();
    if (already) return Promise.resolve(already);
    if (pending[key]) return pending[key];
    loadCss(def.css);
    pending[key] = new Promise((resolve, reject) => {
      const v = window.ZIVOZONE_CONFIG?.APP_VERSION || Date.now();
      const s = document.createElement("script");
      s.src = `${def.src}?v=${v}`;
      s.onload = () => { const api = def.check(); api ? resolve(api) : reject(new Error(key + "-missing-after-load")); };
      s.onerror = () => reject(new Error(key + "-network-error"));
      document.head.appendChild(s);
    }).catch(e => { delete pending[key]; throw e; });
    return pending[key];
  }

  // Trigger table: which selector maps to which lazy room, and how to actually open it once loaded.
  const TRIGGERS = [
    { sel: "[data-horror-room]", key: "horror", invoke: api => api.start() },
    { sel: "[data-puzzle-room]", key: "puzzle", invoke: api => api.start() },
    { sel: "[data-beauty-room]", key: "beauty", invoke: api => api.start() },
    { sel: "[data-zivo-story-room]", key: "rooms", invoke: api => api.enter("stories") },
    { sel: "[data-zivo-health-room]", key: "rooms", invoke: api => api.enter("health") },
    { sel: "[data-football-room]", key: "football", invoke: api => api.start() }
  ];

  function handle(e) {
    for (const trig of TRIGGERS) {
      const el = e.target.closest && e.target.closest(trig.sel);
      if (!el) continue;
      // Already loaded: this click-capture listener steps aside completely and lets the room's own
      // (bubble-phase, or for rooms.js capture-phase-with-stopImmediatePropagation) listener handle
      // it, exactly as if this loader never existed — prevents ever double-invoking start()/enter().
      if (ROOMS[trig.key].check()) return;
      e.preventDefault();
      toast(t("roomLoading"), "info");
      ensure(trig.key).then(api => trig.invoke(api)).catch(err => {
        console.warn("ZIVOZONE room lazy-load failed:", trig.key, err);
        toast(t("roomLoadFailed"), "error");
      });
      return;
    }
  }
  // Capture phase, deliberately: it must see the click BEFORE any bubble-phase listener a not-yet-
  // loaded room would have registered (it hasn't loaded, so there is none yet) — and once a room HAS
  // loaded, this same capture-phase check above is what lets it get out of that room's way instead of
  // double-firing. rooms.js's OWN listener also uses capture + stopImmediatePropagation; because this
  // loader returns without calling preventDefault/stopImmediatePropagation once a room is loaded, that
  // listener still runs normally afterward, unaffected.
  document.addEventListener("click", handle, true);
  document.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") handle(e); }, true);

  window.ZIVOZONE_ROOM_LOADER = Object.freeze({ ensure });
})();
