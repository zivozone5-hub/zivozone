/* ZIVOZONE V1230.87 — public leaderboard (top players by XP).
   Reads the narrow, public-safe `leaderboard/{uid}` projection (name/level/xp/streak only — NEVER
   email or any other private players/{uid} field) that auth.js's syncProgress() keeps in sync every
   time a signed-in player's progress changes. Guests and signed-out visitors can read this fine
   (firestore.rules: `allow read: if true`) — they just have no row of their own until they create
   an account and play, same spirit as every other ZIVO feature that rewards an account. */
(() => {
  'use strict';
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  function db() { try { return (window.firebase?.apps?.length) ? firebase.firestore() : null; } catch (_) { return null; } }

  async function fetchTop(n = 20) {
    const d = db();
    if (!d) return null; // null = couldn't even try (no Firebase) — distinct from [] = tried, zero rows
    try {
      const snap = await d.collection('leaderboard').orderBy('xp', 'desc').limit(n).get();
      return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (e) { console.warn('Leaderboard fetch:', e); return null; }
  }

  // V1230.129 — the leaderboard/{uid} projection now optionally carries an `avatar` id (see
  // auth.js's syncProgress() and firestore.rules' validLeaderboardEntry()); avatar.js's chip()
  // already falls back to the default avatar for any id it doesn't recognize (including an empty
  // string from rows written before this change), so this never breaks on old data.
  function row(entry, rank, isYou) {
    // Pass an explicit fallback id ('z1'), never a falsy value — chip(id) with no id defaults to
    // the CURRENT signed-in player's own avatar (right for player-hub.js's own header), which would
    // be wrong here: every other row without stored avatar data would wrongly show the viewer's own.
    const chip = window.ZIVOZONE?.Avatar?.chip?.(entry.avatar || 'z1', 30) || '';
    return `<div class="zlb-row${isYou ? ' zlb-you' : ''}"><span class="zlb-rank">#${rank}</span>${chip}<span class="zlb-name">${esc(entry.name || '—')}${isYou ? ` <small>(${esc(t('lbYouLabel'))})</small>` : ''}</span><span class="zlb-level">${esc(t('level'))} ${Math.max(1, Number(entry.level) || 1)}</span><b class="zlb-xp">${Math.max(0, Number(entry.xp) || 0)} ${esc(t('xp'))}</b></div>`;
  }

  async function render() {
    const list = document.getElementById('zlb-list');
    if (!list) return;
    list.innerHTML = `<p class="zlb-state">${esc(t('lbLoading'))}</p>`;
    const entries = await fetchTop(20);
    if (!entries || !entries.length) { list.innerHTML = `<p class="zlb-state">${esc(t('lbEmpty'))}</p>`; return; }
    const myUid = window.ZIVOZONE?.Auth?.getUser?.()?.uid || null;
    list.innerHTML = entries.map((e, i) => row(e, i + 1, !!myUid && e.uid === myUid)).join('');
    const guestNote = document.getElementById('zlb-guest-note');
    if (guestNote) guestNote.style.display = myUid ? 'none' : '';
  }

  function open() {
    let o = document.getElementById('zivo-leaderboard');
    if (!o) {
      o = document.createElement('div'); o.id = 'zivo-leaderboard'; o.className = 'z101-overlay';
      document.body.appendChild(o);
      o.addEventListener('click', e => { if (e.target === o) { o.classList.remove('open'); window.ZIVOZONE_AUDIO?.menuClose?.(); } });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && o.classList.contains('open')) { o.classList.remove('open'); window.ZIVOZONE_AUDIO?.menuClose?.(); } });
    }
    o.innerHTML = `<div class="z101-modal zlb-modal" dir="${document.documentElement.dir || 'rtl'}">
      <div class="z101-modal-head"><div><div class="z101-label">ZIVO HUB</div><h2>🥇 ${esc(t('topPlayersLabel'))}</h2></div><button class="z101-modal-close" aria-label="${esc(t('close'))}">×</button></div>
      <div id="zlb-list" class="zlb-list"></div>
      <p id="zlb-guest-note" class="z101-note">${esc(t('lbGuestNote'))}</p>
    </div>`;
    o.querySelector('.z101-modal-close').onclick = () => { o.classList.remove('open'); window.ZIVOZONE_AUDIO?.menuClose?.(); };
    o.classList.add('open');
    window.ZIVOZONE_AUDIO?.menuOpen?.();
    render();
  }

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.Leaderboard = Object.freeze({ open, render });
  window.addEventListener('zivozone-language', () => { const o = document.getElementById('zivo-leaderboard'); if (o && o.classList.contains('open')) open(); });
})();
