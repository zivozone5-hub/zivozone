/* ============================================================
   ZIVOZONE V48 — GLOBAL HARDENING + COMPATIBILITY CORE
   Additive production layer. Preserves existing Firebase/cloud,
   challenge content, visual identity and legacy compatibility.
============================================================ */
(() => {
  'use strict';

  const ready = () => document.documentElement.classList.add('zivo-v48-ready');
  const localDate = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  /* ---- Challenge compatibility bridge -------------------------------- */
  function normalizeQuestion(q, index, bankId) {
    if (!q) return null;
    const x = { ...q };
    x.id = String(x.id || `${bankId}-${index + 1}`);
    x.type = x.type === 'numeric' ? 'number' : (x.type || (x.options ? 'choice' : 'choice'));
    x.d = Number(x.d ?? x.difficulty ?? index + 1) || index + 1;
    if (!x.q && x.question) x.q = x.question;
    if (!x.a && Array.isArray(x.answers)) x.a = x.answers;
    if (!x.a && Array.isArray(x.options)) x.a = x.options;
    if (x.type === 'number' && x.answer == null && x.extra?.answer != null) x.answer = x.extra.answer;
    if (x.type === 'number' && x.answer == null && typeof x.c !== 'object' && x.c != null) x.answer = x.c;
    return x;
  }

  function collectBanks() {
    const C = window.ZIVOZONE_CHALLENGES || {};
    const banks = [];
    const add = (b) => {
      if (!b || !b.id || !Array.isArray(b.questions)) return;
      banks.push({ ...b, questions: b.questions.map((q, i) => normalizeQuestion(q, i, b.id)).filter(Boolean) });
    };
    Object.values(C).forEach(add);
    Object.values(window.ZIVOZONE_V18_BANK || {}).forEach(add);
    Object.values(window.ZIVOZONE_V40_BANK || {}).forEach(add);
    Object.values(window.ZIVOZONE_V22_BANK || {}).forEach(add);
    return banks;
  }

  function patchChallengeAPI() {
    const C = window.ZIVOZONE_CHALLENGES;
    if (!C) return;
    const map = new Map(collectBanks().map(b => [b.id, b]));
    C.get = (id) => {
      const b = map.get(id);
      return b ? JSON.parse(JSON.stringify(b)) : null;
    };
    C.getAll = () => [...map.values()].map(b => JSON.parse(JSON.stringify(b)));
    window.ZIVOZONE_V48 = window.ZIVOZONE_V48 || {};
    window.ZIVOZONE_V48.challengeCount = map.size;
  }

  /* ---- Navigation / accessibility ------------------------------------ */
  function bindNavigation() {
    const links = [...document.querySelectorAll('.main-nav a[href^="#"]')];
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const update = () => {
      const y = window.scrollY + 140;
      let active = sections[0];
      sections.forEach(s => { if (s.offsetTop <= y) active = s; });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active?.id));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    links.forEach(a => a.addEventListener('click', () => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  function bindGlobalUX() {
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const root = document.getElementById('modal-root');
      if (root?.getAttribute('aria-hidden') === 'false') {
        const close = root.querySelector('[data-close]');
        if (close) close.click();
      }
    });

    window.addEventListener('online', () => {
      document.documentElement.classList.remove('zivo-offline');
      window.ZIVOZONE_V46?.flush?.();
    });
    window.addEventListener('offline', () => document.documentElement.classList.add('zivo-offline'));
    if (!navigator.onLine) document.documentElement.classList.add('zivo-offline');

    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      history.replaceState(null, '', a.getAttribute('href'));
    });
  }

  /* ---- Runtime diagnostics ------------------------------------------- */
  function diagnostics() {
    const required = ['app-loader','modal-root','toast-container','challenge-list','ai-form','profile'];
    const missing = required.filter(id => !document.getElementById(id));
    window.ZIVOZONE_V48 = Object.assign(window.ZIVOZONE_V48 || {}, {
      version: '48.0',
      localDate,
      diagnostics: () => ({
        version: '48.0',
        online: navigator.onLine,
        firebase: !!window.firebase?.apps?.length,
        missing,
        buttons: document.querySelectorAll('button').length,
        challenges: window.ZIVOZONE_V48?.challengeCount || 0
      })
    });
    if (missing.length) console.warn('ZIVOZONE V48 missing UI nodes:', missing);
  }

  // Patch immediately because app.js registers its DOMContentLoaded handler earlier.
  patchChallengeAPI();

  function boot() {
    bindNavigation();
    bindGlobalUX();
    diagnostics();
    ready();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
