/* ZIVOZONE CLEAN CORE — centralized runtime configuration */
(() => {
  'use strict';
  const existing = window.ZIVOZONE_CONFIG || {};
  window.ZIVOZONE_CONFIG = Object.freeze({
    ...existing,
    APP_NAME: 'ZIVOZONE',
    APP_VERSION: '1230.112',
    CORE_VERSION: '1230.112-clean-core',
    ADMIN_EMAIL: 'raefalbtish@gmail.com',
    ADMIN_EMAIL_NORMALIZED: 'raefalbtish@gmail.com',
    FREE_FIRST: true,
    MIN_AGE: 13,
    TERMS_VERSION: 'ZIVO-TERMS-2026.10.1',
    PRIVACY_VERSION: 'ZIVO-PRIVACY-2026.09.2',
    MINING_COOLDOWN_MS: 24 * 60 * 60 * 1000,
    SPORTS_API_BASE: 'https://site.api.espn.com/apis/site/v2/sports/soccer/',
    SPORTS_STATIC_BASE: './data/matches/',
    SPORTS_FREE_DB_BASE: 'https://www.thesportsdb.com/api/v1/json/123/',
    /* V1229.13 — AdSense. ADSENSE_PUBLISHER_ID must be replaced with the real "ca-pub-XXXXXXXXXXXXXXXX"
       from your AdSense account before ads will actually serve; until then, ads.js safely no-ops (it
       checks for this exact placeholder and skips loading the AdSense script). Each ad slot's real
       "data-ad-slot" ID (assigned per ad unit in the AdSense dashboard) goes in ADSENSE_SLOT_IDS below,
       keyed by the same names already used in index.html's data-ad-slot attributes. AUTO_ADS, on by
       default, fills the mobile gap the manual slots leave (see ZIVOZONE_ADS_SETUP.md). Set it to
       false to disable and rely only on the manual slots once real AdSense IDs are in place. */
    ADSENSE_PUBLISHER_ID: 'ca-pub-0000000000000000',
    ADSENSE_SLOT_IDS: { top: '0000000001', bottom: '0000000002', 'left-1': '0000000003', 'left-2': '0000000004', 'right-1': '0000000005', 'right-2': '0000000006' },
    ADSENSE_AUTO_ADS: true,
    /* V1230 — rights protection: hostnames authorized to serve this build. Not a security boundary
       (any client-side check can be bypassed by someone editing the code directly) — this is a
       deterrent against the common case of a clone that copies the files as-is onto another domain
       and never touches the JS. zivozone-fc6ed.web.app / .firebaseapp.com are this project's own
       Firebase Hosting domains (including preview-channel subdomains, which share the project-id
       prefix), so they're allowed alongside the real zivozone.com and local dev hosts. */
    ALLOWED_HOSTS: ['zivozone.com', 'www.zivozone.com', 'localhost', '127.0.0.1', '']
  });
  try {
    const h = String(location.hostname || '').toLowerCase();
    const cfg = window.ZIVOZONE_CONFIG;
    const projectPrefix = 'zivozone-fc6ed';
    const authorized = cfg.ALLOWED_HOSTS.includes(h) || h.endsWith('.' + projectPrefix + '.web.app') ||
      h === projectPrefix + '.web.app' || h.endsWith('.' + projectPrefix + '.firebaseapp.com') ||
      h === projectPrefix + '.firebaseapp.com' || h.startsWith(projectPrefix + '--');
    if (!authorized) window.__ZIVOZONE_UNAUTHORIZED_HOST__ = true;
  } catch (_) {}
})();
