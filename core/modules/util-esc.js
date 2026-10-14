/* ZIVOZONE V1229.6 — shared HTML-escaping utility
   The same one-line HTML escaper existed as a private copy in 13 files (admin.js, beauty-room.js,
   challenges.js, chat.js, economy.js, exit-guard.js, forensic-case-core.js, match-center.js, news.js,
   player-hub.js, puzzle-room.js, rooms.js, runtime/app-shell.js) — all with the exact same behavior
   (escape & < > " '), just copy-pasted with slightly different formatting each time. This is now the
   one implementation; every file above keeps its own local `esc` name (so no call site anywhere had
   to change) but points it at this shared function: `const esc = window.ZIVOZONE_ESC;`.
   Loads early in the bundle (right after core/config.js) so every consumer can rely on it existing.
*/
(() => {
  'use strict';
  const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  window.ZIVOZONE_ESC = v => String(v ?? '').replace(/[&<>"']/g, m => MAP[m]);
})();
