/* ZIVOZONE V1230.129 — "Legend Journey": 5 major milestones that span everything
   a player already does on the site, rewarding genuine breadth and mastery rather than one single
   grind. Completing all 5 unlocks the exclusive "Legendary" avatar (avatar.js) plus a one-time
   bonus reward (legend_reward, mirrored in economy.js + firestore.rules in this same change).

   Three of the five milestones are entirely free — derived from stats player.js already tracks
   and syncs (challengeStats/streak/level), the same trust model achievements.js's badges already
   use (pure functions of already-synced stats, re-derived on every load instead of a sticky flag,
   which is also what avoids any cross-device sync problem for "did they complete this"). Only the
   "Spread" milestone needed a genuinely new counter: it listens to the existing SHARE_RESULT event
   (already emitted by share.js's afterShareSuccess() for every successful share sitewide, since
   V1230.128) and keeps a simple local tally — no new share-tracking plumbing anywhere else.
*/
(() => {
  'use strict';
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const esc = window.ZIVOZONE_ESC || (s => String(s));
  const KEY = 'zivozone_v1230_legend_shares';
  const readShares = () => { try { return Math.max(0, Number(JSON.parse(localStorage.getItem(KEY) || '0')) || 0); } catch (_) { return 0; } };
  const writeShares = n => { try { localStorage.setItem(KEY, JSON.stringify(Math.max(0, n))); } catch (_) {} };

  const DEFS = [
    ['variety', 'legendVarietyName', 'legendVarietyDesc', '🗺️',
      s => Object.keys(s.challengeStats || {}).length >= 5,
      s => `${Math.min(5, Object.keys(s.challengeStats || {}).length)}/5`],
    ['precision', 'legendPrecisionName', 'legendPrecisionDesc', '🎯',
      s => Object.values(s.challengeStats || {}).filter(v => Number(v.best) >= 100).length >= 3,
      s => `${Math.min(3, Object.values(s.challengeStats || {}).filter(v => Number(v.best) >= 100).length)}/3`],
    ['persistence', 'legendPersistenceName', 'legendPersistenceDesc', '🔥',
      s => Number(s.streak) >= 3,
      s => `${Math.min(3, Number(s.streak) || 0)}/3`],
    ['spread', 'legendSpreadName', 'legendSpreadDesc', '📣',
      () => readShares() >= 5,
      () => `${Math.min(5, readShares())}/5`],
    ['mastery', 'legendMasteryName', 'legendMasteryDesc', '👑',
      s => Number(s.level) >= 10,
      s => `${Math.min(10, Number(s.level) || 0)}/10`]
  ];

  function statusList() {
    const s = window.ZIVOZONE?.Player?.get?.() || {};
    return DEFS.map(d => ({ id: d[0], name: d[1], desc: d[2], icon: d[3], done: !!d[4](s), progress: d[5](s) }));
  }
  function isComplete() { return statusList().every(x => x.done); }

  async function grantIfComplete() {
    if (!isComplete()) return;
    try {
      const ok = await window.ZIVOZONE?.Economy?.credit?.(5, { type: 'legend_reward', source: 'legend_journey', claimId: 'legend_journey_complete' });
      if (ok) {
        try { await window.ZIVOZONE?.Economy?.addXP?.(80); } catch (_) {}
        window.dispatchEvent(new CustomEvent('zivozone-legend-complete'));
        window.dispatchEvent(new CustomEvent('zivozone-reward', { detail: { xp: 80, zivo: 5, source: 'legend_journey' } }));
      }
    } catch (_) {}
  }

  function onShareResult() { writeShares(readShares() + 1); render(); grantIfComplete(); }
  try { window.ZIVOZONE?.Events?.on?.('SHARE_RESULT', onShareResult); } catch (_) {}

  function root() {
    let o = document.getElementById('zivo-legend-journey');
    if (!o) { o = document.createElement('div'); o.id = 'zivo-legend-journey'; o.className = 'v31-overlay'; document.body.appendChild(o); }
    return o;
  }
  function render() {
    const o = document.getElementById('zivo-legend-journey'); if (!o) return;
    const items = statusList(), doneCount = items.filter(x => x.done).length;
    const list = o.querySelector('.v31-list'); if (!list) return;
    list.innerHTML = items.map(d => `<div class="v31-badge ${d.done ? 'on' : 'off'}"><i>${d.icon}</i><div><b>${esc(t(d.name))}</b><span>${esc(t(d.desc))}</span><small class="v31-reward">${esc(d.progress)}</small></div><strong>${d.done ? '✓' : '?'}</strong></div>`).join('');
    const count = o.querySelector('.v31-count'); if (count) count.textContent = `${doneCount}/${items.length}`;
    const unlockNote = o.querySelector('.zlj-unlock'); if (unlockNote) unlockNote.hidden = !isComplete();
  }
  function open() {
    const o = root();
    if (!o.querySelector('.v31-card')) {
      o.innerHTML = `<div class="v31-card"><button class="v31-close">×</button><div class="v31-head"><div class="v31-emblem">🏅</div><div><small>LEGEND JOURNEY</small><h2>${esc(t('legendJourneyTitle'))}</h2><span><b class="v31-count">0/5</b></span></div></div><p class="zlj-intro">${esc(t('legendJourneyIntro'))}</p><div class="v31-list"></div><p class="zlj-unlock" hidden>${esc(t('legendJourneyUnlocked'))}</p></div>`;
      o.querySelector('.v31-close').onclick = () => o.classList.remove('open');
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && o.classList.contains('open')) o.classList.remove('open'); });
    }
    render();
    grantIfComplete();
    o.classList.add('open');
  }

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.LegendJourney = Object.freeze({ open, isComplete, statusList, sharesCount: readShares });
  window.addEventListener('zivozone-progress', () => { try { render(); grantIfComplete(); } catch (_) {} });
})();
