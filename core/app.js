/* ZIVOZONE V1180 — CANONICAL APPLICATION CORE */
(() => {
  'use strict';
  window.ZIVOZONE = window.ZIVOZONE || {};
  // V1230.30 — 'Progress' removed from this descriptive list: window.ZIVOZONE.Progress itself was
  // deleted in 1230.19 (dead alias, zero callers) but this metadata array was never updated to match,
  // so it was documenting a module that no longer exists.
  const modules = ['Auth','Player','Economy','Challenges','Cloud','Achievements','Daily','Competition','Missions','PlayerHub','News','Admin','UI','Sports','Forensic','Router','SEO','Share','Audio'];
  window.ZIVOZONE.Core = Object.freeze({
    version: '1228',
    architecture: 'single-canonical-core',
    modules: Object.freeze(modules),
    principles: Object.freeze(['one-owner-per-domain','no-duplicate-ui','event-driven-integration','free-plan-compatible','mobile-first'])
  });
  document.documentElement.dataset.zivoArchitecture = '1225';
  window.dispatchEvent(new CustomEvent('zivozone:architecture-ready',{detail:window.ZIVOZONE.Core}));
})();
