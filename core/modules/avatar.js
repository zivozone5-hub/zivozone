/* ZIVOZONE V1230.129 — Avatar system.
   A small set of cosmetic avatars a player can pick for their profile, plus one exclusive
   "Legendary" avatar that stays locked until the Legend Journey (legend-journey.js) is fully
   completed. Storage/trust model mirrors achievements.js's badges: purely cosmetic, re-derived
   client-side rather than cryptographically proven, which is why firestore.rules' validation for
   the `avatar` field (validProfileUpdate()/validLeaderboardEntry()) only size-caps it rather than
   checking "earned" status — same honest trade-off already documented there for other cosmetic
   state on a plan with no server-side Cloud Functions layer.
   Actual persistence goes through player.js's setAvatar() (local ID_KEY store + Auth.update() cloud
   sync) — this module only owns the avatar catalog, the picker UI, and rendering a chip anywhere
   an avatar needs to show (player-hub.js's header, leaderboard.js rows, achievements.js's card).
*/
(() => {
  'use strict';
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const esc = window.ZIVOZONE_ESC || (s => String(s));

  const DEFS = [
    { id: 'z1', emoji: '⚡', g: ['#2f6bff', '#7aa8ff'] },
    { id: 'z2', emoji: '🔥', g: ['#ff6b4a', '#ffb020'] },
    { id: 'z3', emoji: '🧠', g: ['#b34cff', '#6b2fd6'] },
    { id: 'z4', emoji: '🛡️', g: ['#22c55e', '#0ea06b'] },
    { id: 'z5', emoji: '🌙', g: ['#2f3b6b', '#5a4fcf'] },
    { id: 'z6', emoji: '🎯', g: ['#ff4f81', '#ff8fb0'] },
    { id: 'fb1', emoji: '⚽', g: ['#1c7d3c', '#2fbf5e'] },
    { id: 'fb2', emoji: '🥅', g: ['#0b5fa5', '#4fb0e8'] },
    { id: 'fb3', emoji: '🏆', g: ['#c9941f', '#ffd96b'] },
    // Exclusive reward for completing the Legend Journey's all 5 milestones (legend-journey.js).
    { id: 'legend', emoji: '👑', g: ['#ffd96b', '#ff7a3d'], locked: true, legendary: true }
  ];

  function isUnlocked(id) {
    const def = DEFS.find(d => d.id === id);
    if (!def || !def.locked) return true;
    try { return !!window.ZIVOZONE?.LegendJourney?.isComplete?.(); } catch (_) { return false; }
  }
  function list() { return DEFS.map(d => ({ ...d, unlocked: isUnlocked(d.id) })); }
  function defOf(id) { return DEFS.find(d => d.id === id) || DEFS[0]; }
  function current() {
    const p = window.ZIVOZONE?.Player?.get?.() || {};
    const id = p.avatar && DEFS.some(d => d.id === p.avatar) ? p.avatar : 'z1';
    return isUnlocked(id) ? id : 'z1';
  }
  function chip(id, size) {
    const d = defOf(id || current());
    const s = size || 40;
    return `<div class="zav-chip ${d.legendary ? 'zav-legend' : ''}" style="width:${s}px;height:${s}px;background:linear-gradient(135deg,${d.g[0]},${d.g[1]});font-size:${Math.round(s * 0.55)}px">${d.emoji}</div>`;
  }
  function set(id) {
    if (!isUnlocked(id)) return false;
    try { window.ZIVOZONE?.Player?.setAvatar?.(id); } catch (_) {}
    return true;
  }

  function root() {
    let o = document.getElementById('zivo-avatar-picker');
    if (!o) { o = document.createElement('div'); o.id = 'zivo-avatar-picker'; o.className = 'v31-overlay'; document.body.appendChild(o); }
    return o;
  }
  function fillGrid() {
    const o = document.getElementById('zivo-avatar-picker'); if (!o) return;
    const cur = current(), grid = o.querySelector('.zav-grid'); if (!grid) return;
    grid.innerHTML = list().map(d => {
      const locked = d.locked && !d.unlocked;
      const on = d.id === cur;
      return `<button type="button" class="zav-opt ${on ? 'on' : ''} ${locked ? 'locked' : ''}" data-avatar="${d.id}" ${locked ? 'disabled' : ''} title="${locked ? esc(t('avatarLockedHint')) : ''}">
        <div class="zav-opt-chip ${d.legendary ? 'zav-legend' : ''}" style="background:linear-gradient(135deg,${d.g[0]},${d.g[1]})">${locked ? '🔒' : d.emoji}</div>
      </button>`;
    }).join('');
    grid.querySelectorAll('[data-avatar]').forEach(btn => {
      btn.addEventListener('click', () => { if (set(btn.dataset.avatar)) { fillGrid(); try { window.ZIVOZONE?.Player?.render?.(); document.dispatchEvent(new CustomEvent('zivozone-avatar-changed')); } catch (_) {} } });
    });
  }
  function open() {
    const o = root();
    o.innerHTML = `<div class="v31-card zav-card"><button class="v31-close">×</button><div class="v31-head"><div class="v31-emblem">${chip(current(), 56)}</div><div><small>AVATAR</small><h2>${esc(t('avatarPickerTitle'))}</h2><span>${esc(t('avatarPickerSub'))}</span></div></div><div class="zav-grid"></div></div>`;
    o.querySelector('.v31-close').onclick = () => o.classList.remove('open');
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && o.classList.contains('open')) o.classList.remove('open'); });
    fillGrid();
    o.classList.add('open');
  }

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.Avatar = Object.freeze({ list, current, chip, set, open, isUnlocked });
  window.addEventListener('zivozone-legend-complete', () => { try { fillGrid(); } catch (_) {} });
})();
