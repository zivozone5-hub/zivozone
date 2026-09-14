/*
 * ZIVOZONE V1089 — CLEAN CORE ORCHESTRATOR
 * Purpose: one authoritative integration contract over the retained V1088 engine.
 * This file does NOT add another feature layer. It enforces ownership, synchronization,
 * duplicate-control cleanup, and runtime diagnostics.
 */
(() => {
  'use strict';
  const VERSION = 'V1089-CLEAN-CORE';
  const ADMIN_EMAIL = 'raefalbtish@gmail.com';
  const idsToRemove = [
    'zivo-v85-open','zivo-v85-economy','zivo-v81-open','zivo-v81-economy',
    'zivo-v80-open','zivo-v87-quickdock','z80-admin-open','mobile-more','mobile-tools'
  ];

  function isAdmin() {
    const u = window.ZIVOZONE_AUTH?.getUser?.() || window.ZIVOZONE_AUTH?.user;
    return String(u?.email || '').trim().toLowerCase() === ADMIN_EMAIL;
  }

  function cleanupLegacyUi() {
    idsToRemove.forEach(id => document.getElementById(id)?.remove());
    document.querySelectorAll('[data-legacy-zivo],[data-v80],[data-v81],[data-v85]').forEach(el => el.remove());
  }

  function installEconomyContract() {
    const economy = window.ZIVOZONE_ECONOMY;
    if (!economy) return false;
    const original = economy.getWallet;
    economy.getWallet = () => {
      const w = original?.() || {};
      const zivo = Number(w.zivo || 0);
      return Object.freeze({ ...w, zivo, coins: zivo });
    };
    window.ZIVOZONE_CORE = window.ZIVOZONE_CORE || {};
    window.ZIVOZONE_CORE.economy = economy;
    return true;
  }

  function installCardClickContract() {
    // Guarantee that challenge/game cards are actionable from any child element.
    document.addEventListener('click', event => {
      const card = event.target.closest?.('[data-challenge],[data-game]');
      if (!card || card.closest('button,a,input,select,textarea,form')) return;
      const target = card.querySelector?.('button[data-challenge],button[data-game],a[data-challenge],a[data-game]');
      if (target && target !== event.target) target.click();
    }, { capture: false });
  }

  function diagnostics() {
    const required = ['ZIVOZONE_AUTH','ZIVOZONE_ECONOMY'];
    const missing = required.filter(k => !window[k]);
    window.ZIVOZONE_CORE_DIAGNOSTICS = {
      version: VERSION,
      missing,
      firebase: !!window.firebase,
      economy: !!window.ZIVOZONE_ECONOMY,
      auth: !!window.ZIVOZONE_AUTH,
      adminMode: isAdmin(),
      timestamp: new Date().toISOString()
    };
    if (missing.length) console.warn('[ZIVOZONE CORE] missing contracts:', missing);
  }

  function boot() {
    cleanupLegacyUi();
    installEconomyContract();
    installCardClickContract();
    diagnostics();
    document.documentElement.dataset.zivoCore = VERSION;
    console.info(`[ZIVOZONE] ${VERSION} active — single integration contract`);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
