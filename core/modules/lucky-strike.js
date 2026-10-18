/* ZIVOZONE V1230.131 — "Lucky Strike"
   A sitewide, SHARED counter (not per-user): one luxurious floating button, available once a day per
   signed-in player, that advances a single global Firestore document (publicState/luckyStrike) every
   time anyone anywhere presses it. Whoever's press lands exactly on #1000 (the counter rolling from
   999 back to 0) wins a 50 ZIVO jackpot, with a full-screen celebration for the winner and a
   confetti+toast broadcast to every other visitor currently on the site. The actual race/anti-forgery
   logic (same-uid-can't-press-twice-in-a-row, once-per-day gate, the reward crosscheck against the
   real recorded winner) all lives server-side in economy.js's pressLuckyStrike() and firestore.rules'
   validLuckyStrikeState()/validLuckyStrikeDaily()/validRewardClaim() — this module is UI only: it
   renders the button, shows the live "x/999" progress via a single onSnapshot listener, and plays the
   celebration. Entirely ZIVO-denominated, per the user's explicit request — no real-money element.

   Cost note: unlike chat.js (which defers its Firebase listeners until someone actually opens the
   panel, see that file's V1229.10 note), this module opens its one onSnapshot listener on EVERY page
   load, signed in or not — rules allow anonymous reads of this doc on purpose, because the whole
   point is a live, shared "x/999" ticker everyone can see without having to press anything. That's a
   deliberate trade-off: one extra listener on one small, rarely-written document (it only changes on
   an actual press, far less often than a chat message), accepted for the "race, together" feeling the
   feature is built around.
*/
(() => {
  'use strict';
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const esc = window.ZIVOZONE_ESC || (s => String(s == null ? '' : s));
  const F = () => window.firebase;
  const db = () => { try { return F()?.firestore?.() || null; } catch (_) { return null; } };
  const LIMIT = 999;
  const LOCAL_KEY = 'zivozone_luckystrike_last_press';

  let lastSeenRound = -1, unsub = null, pressing = false;

  function toast(msg) {
    let x = document.getElementById('zivo-economy-toast');
    if (!x) { x = document.createElement('div'); x.id = 'zivo-economy-toast'; x.className = 'z101-toast'; document.body.appendChild(x); }
    x.textContent = msg;
    x.classList.add('show');
    clearTimeout(x._timer);
    x._timer = setTimeout(() => x.classList.remove('show'), 3200);
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function localDoneToday() { try { return localStorage.getItem(LOCAL_KEY) === today(); } catch (_) { return false; } }
  function markLocalDoneToday() { try { localStorage.setItem(LOCAL_KEY, today()); } catch (_) {} }

  function root() {
    let o = document.getElementById('zivo-lucky-strike');
    if (!o) {
      o = document.createElement('div');
      o.id = 'zivo-lucky-strike';
      o.className = 'zls-widget';
      o.innerHTML = `<button id="zls-btn" class="zls-btn" type="button" aria-label="${esc(t('lsBtn'))}">
        <span class="zls-icon" aria-hidden="true">🍀</span>
        <span class="zls-text"><b id="zls-label">${esc(t('lsBtn'))}</b><small id="zls-progress">…</small></span>
      </button>`;
      document.body.appendChild(o);
      o.querySelector('#zls-btn').addEventListener('click', onPress);
    }
    return o;
  }

  function setProgress(count) {
    const el = document.getElementById('zls-progress');
    if (el) el.textContent = `${Math.min(Number(count) || 0, LIMIT)} / ${LIMIT}`;
  }

  function setDoneToday(done) {
    const btn = document.getElementById('zls-btn'), label = document.getElementById('zls-label');
    if (!btn || !label) return;
    btn.classList.toggle('zls-done', !!done);
    label.textContent = done ? t('lsDoneTodayBtn') : t('lsBtn');
  }

  function burstConfetti(anchor, n = 24) {
    try {
      const rect = anchor?.getBoundingClientRect?.() || { left: window.innerWidth - 60, top: window.innerHeight / 2, width: 40, height: 40 };
      const layer = document.createElement('div');
      layer.className = 'zls-confetti-layer';
      const colors = ['#ffd36b', '#ffe9ad', '#6ff0a6', '#73dfff', '#ff9ad1'];
      for (let i = 0; i < n; i++) {
        const p = document.createElement('span');
        p.className = 'zls-confetti-piece';
        p.style.left = `${rect.left + rect.width / 2}px`;
        p.style.top = `${rect.top + rect.height / 2}px`;
        p.style.background = colors[i % colors.length];
        p.style.setProperty('--dx', `${(Math.random() - 0.5) * 240}px`);
        p.style.setProperty('--dy', `${-(Math.random() * 180 + 60)}px`);
        p.style.setProperty('--rot', `${Math.random() * 540 - 270}deg`);
        p.style.animationDelay = `${Math.random() * 120}ms`;
        layer.appendChild(p);
      }
      document.body.appendChild(layer);
      setTimeout(() => layer.remove(), 1700);
    } catch (_) {}
  }

  function fullscreenCelebration() {
    try {
      const layer = document.createElement('div');
      layer.className = 'zls-confetti-layer zls-confetti-full';
      const colors = ['#ffd36b', '#ffe9ad', '#6ff0a6', '#73dfff', '#ff9ad1', '#fff'];
      for (let i = 0; i < 90; i++) {
        const p = document.createElement('span');
        p.className = 'zls-confetti-piece zls-confetti-fall';
        p.style.left = `${Math.random() * 100}vw`;
        p.style.background = colors[i % colors.length];
        p.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
        p.style.setProperty('--dur', `${2.4 + Math.random() * 1.6}s`);
        p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
        p.style.animationDelay = `${Math.random() * 500}ms`;
        layer.appendChild(p);
      }
      document.body.appendChild(layer);
      setTimeout(() => layer.remove(), 4600);
    } catch (_) {}
  }

  function celebrateSelf() {
    window.ZIVOZONE_AUDIO?.challengeWin?.();
    fullscreenCelebration();
    let o = document.getElementById('zls-win-modal');
    if (!o) {
      o = document.createElement('div');
      o.id = 'zls-win-modal';
      o.className = 'zls-win-overlay';
      document.body.appendChild(o);
    }
    o.innerHTML = `<div class="zls-win-card" dir="${document.documentElement.dir || 'rtl'}">
      <div class="zls-win-trophy" aria-hidden="true">🏆</div>
      <h2>${esc(t('lsWinTitleSelf'))}</h2>
      <p>${esc(t('lsWinBodySelf'))}</p>
      <button id="zls-win-close" class="zls-win-close">${esc(t('lsWinClose'))}</button>
    </div>`;
    o.classList.add('open');
    o.querySelector('#zls-win-close').onclick = () => o.classList.remove('open');
  }

  function announceOtherWin(name) {
    window.ZIVOZONE_AUDIO?.challengeWin?.();
    burstConfetti(document.getElementById('zls-btn'), 30);
    toast(t('lsWinBroadcast').replace('{name}', name || t('chatGuestName')));
  }

  async function onPress() {
    if (pressing) return;
    const u = F()?.auth?.()?.currentUser;
    if (!u) { document.getElementById('login-btn')?.click(); toast(t('lsSignInRequired')); return; }
    if (localDoneToday()) { setDoneToday(true); toast(t('lsAlreadyToday')); return; }
    pressing = true;
    const btn = document.getElementById('zls-btn');
    if (btn) btn.classList.add('zls-pending');
    try {
      const outcome = await window.ZIVOZONE?.Economy?.pressLuckyStrike?.();
      if (!outcome) { toast(t('lsErrorGeneric')); return; }
      if (outcome.ok && outcome.win) {
        markLocalDoneToday(); setDoneToday(true);
        lastSeenRound = outcome.round;
        celebrateSelf();
      } else if (outcome.ok) {
        markLocalDoneToday(); setDoneToday(true);
        burstConfetti(btn, 14);
        window.ZIVOZONE_AUDIO?.successCoin?.();
        toast(t('lsPressToast').replace('{n}', outcome.count));
      } else if (outcome.reason === 'already-today') {
        markLocalDoneToday(); setDoneToday(true); toast(t('lsAlreadyToday'));
      } else if (outcome.reason === 'same-user') {
        toast(t('lsSameUserBlocked'));
      } else if (outcome.reason === 'signed-out') {
        document.getElementById('login-btn')?.click(); toast(t('lsSignInRequired'));
      } else if (outcome.reason !== 'admin') {
        toast(t('lsErrorGeneric'));
      }
    } catch (_) {
      toast(t('lsErrorGeneric'));
    } finally {
      pressing = false;
      const b = document.getElementById('zls-btn');
      if (b) b.classList.remove('zls-pending');
    }
  }

  function watch() {
    const d = db();
    if (!d || unsub) return;
    try {
      unsub = d.collection('publicState').doc('luckyStrike').onSnapshot(snap => {
        const data = snap.data();
        if (!data) { setProgress(0); return; }
        setProgress(data.count);
        const round = Number(data.lastWinRound) || 0;
        if (lastSeenRound === -1) { lastSeenRound = round; return; } // first tick: just sync silently
        if (round > lastSeenRound) {
          lastSeenRound = round;
          const myUid = F()?.auth?.()?.currentUser?.uid;
          if (!myUid || data.lastWinnerUid !== myUid) announceOtherWin(data.lastWinnerName);
        }
      }, () => {});
    } catch (_) {}
  }

  function mount() {
    root();
    setDoneToday(localDoneToday());
    watch();
  }

  window.addEventListener('zivozone-language', () => {
    const label = document.getElementById('zls-label');
    if (label) label.textContent = localDoneToday() ? t('lsDoneTodayBtn') : t('lsBtn');
    const btn = document.getElementById('zls-btn');
    if (btn) btn.setAttribute('aria-label', t('lsBtn'));
  });

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.LuckyStrike = Object.freeze({ press: onPress });
  window.addEventListener('load', () => setTimeout(mount, 600));
})();
