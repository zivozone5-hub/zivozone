/* ============================================================
   ZIVOZONE CHALLENGE PACK COMPATIBILITY LAYER V8
   The complete bank now lives in challenges.js.
   This file intentionally adds nothing, preventing duplicate cards
   or duplicate question pools from older versions.
============================================================ */
(() => {
  'use strict';
  const C=window.ZIVOZONE_CHALLENGES;
  if(!C) return;
  window.ZIVOZONE_CHALLENGE_PACK_VERSION='8.0';
})();
