/* ZIVOZONE V1082 — centralized application configuration */
(() => {
  'use strict';
  const existing = window.ZIVOZONE_CONFIG || {};
  window.ZIVOZONE_CONFIG = Object.freeze({
    ...existing,
    APP_VERSION: '1082.0',
    ADMIN_EMAIL: 'raefalbtish@gmail.com',
    ADMIN_NAME: 'رائف البطوش'
  });
})();
