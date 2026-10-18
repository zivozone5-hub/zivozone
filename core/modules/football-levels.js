/* ZIVOZONE V1230.130 — "Football Journey": a 20-level, 10-question-per-level progression layered
   on top of the existing football question bank (now 200+ real questions, question-bank.js). This
   is a NEW, separate system from challenges.js's chooseQuestions()/runner — that engine is a
   continuous 1..10 adaptive-difficulty rotation with no notion of "levels" or pass/fail gating, and
   bolting level semantics onto it would have meant reaching deep into its cinema/duel-intro/sync
   internals for a shape it was never built to carry. This module owns its own compact quiz UI
   instead (reusing the .v31-overlay/.v31-card look other panels already use), its own question
   picker (plain difficulty-tier filtering + a light per-tier "don't repeat too soon" rotation; the
   bank doesn't need challenges.js's full LRU/adaptive machinery at this pool size), and its own
   progress state.

   Progression rules (confirmed with the player before building this):
     - 20 levels, 10 questions each. tierForLevel(level) = ceil(level/2), so two levels share each
       difficulty tier 1..10 — a smooth ramp across the whole bank.
     - Clearing a level requires a perfect 10/10. Clearing it for the FIRST time ever advances
       highestCleared (the permanent floor — already-cleared levels stay freely replayable for fun,
       no stakes) and pays a one-time +2 ZIVO (football_level_reward, claimId keyed by level number,
       so replaying an old level never re-pays it — see economy.js's credit() switch).
     - currentTarget is the one level with real stakes: the next level the player must clear to keep
       advancing. Clearing it: highestCleared=max(highestCleared,currentTarget), currentTarget+=1.
       FAILING it (not 10/10) WITHOUT a protection card: currentTarget regresses to
       max(1,highestCleared) — i.e. "back to the last level you successfully cleared" (the player's
       own confirmed choice, softer than a full reset to level 1, but a real, tangible setback: they
       must re-clear that level once more before the failed one reopens). Failing WITH a card: the
       player may spend 1 card to retry the SAME level immediately, no regression at all — this is
       the entire value proposition of the card.
     - Protection cards cost 15 ZIVO (economy.js's new spend() — the first real deduction path in
       the economy; see that file's V1230.130 note). Real-money purchase was explicitly discussed
       and deferred: this project has zero payment-processor integration and is on Firebase's free
       Spark plan (no Cloud Functions to verify a webhook server-side), so a ZIVO-priced card is the
       buildable version; a real-money tier is a future upgrade once that infrastructure exists.
*/
(() => {
  'use strict';
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const esc = window.ZIVOZONE_ESC || (s => String(s));
  const text = v => { if (typeof v === 'string') return v; if (v && typeof v === 'object') return v[document.documentElement.lang] || v.ar || v.en || Object.values(v)[0] || ''; return String(v ?? ''); };

  const LEVELS = 20, PER_LEVEL = 10, CARD_PRICE = 15, LEVEL_REWARD = 2;
  const KEY = 'zivozone_v1230_football_levels';
  const tierForLevel = lvl => Math.max(1, Math.min(10, Math.ceil(lvl / 2)));

  function readState() {
    let s; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { s = null; }
    if (!s || typeof s !== 'object') s = {};
    const highestCleared = Math.max(0, Math.min(LEVELS, Number(s.highestCleared) || 0));
    return {
      highestCleared,
      currentTarget: Math.max(1, Math.min(LEVELS, Number(s.currentTarget) || (highestCleared + 1))),
      cards: Math.max(0, Number(s.cards) || 0),
      recentByTier: s.recentByTier && typeof s.recentByTier === 'object' ? s.recentByTier : {}
    };
  }
  function writeState(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {}
    try { window.ZIVOZONE?.Player?.setFootballLevel?.(s.highestCleared); } catch (_) {}
    try { window.ZIVOZONE?.Player?.setFootballCards?.(s.cards); } catch (_) {}
  }

  // Light per-tier rotation: remembers the last ~20 question ids served from each tier so a
  // replay doesn't immediately re-serve the exact same 10 — not the full LRU engine challenges.js
  // runs (this bank is comfortably large enough per tier that a simple recency list is enough).
  function pickQuestions(tier, s) {
    const bank = window.ZIVOZONE_CHALLENGES?.football;
    const all = (bank?.questions || []).filter(q => q.type === 'choice');
    let pool = all.filter(q => Number(q.d) === tier);
    if (pool.length < PER_LEVEL) { // widen to the neighboring tier if a tier is thin
      pool = all.filter(q => Math.abs(Number(q.d) - tier) <= 1);
    }
    if (pool.length < PER_LEVEL) pool = all.slice(); // last resort: whole bank
    const recent = new Set(s.recentByTier[tier] || []);
    const fresh = pool.filter(q => !recent.has(q.id));
    const ordered = fresh.length >= PER_LEVEL ? fresh : fresh.concat(pool.filter(q => recent.has(q.id)));
    const shuffled = ordered.slice().sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, PER_LEVEL);
    s.recentByTier[tier] = picked.map(q => q.id).concat(s.recentByTier[tier] || []).slice(0, 20);
    return picked;
  }

  function zivoBalance() { try { return Number(window.ZIVOZONE?.Player?.get?.()?.balance) || 0; } catch (_) { return 0; } }

  function root() {
    let o = document.getElementById('zivo-football-levels');
    if (!o) { o = document.createElement('div'); o.id = 'zivo-football-levels'; o.className = 'v31-overlay zfl-overlay'; document.body.appendChild(o); }
    return o;
  }
  function close() { const o = document.getElementById('zivo-football-levels'); if (o) o.classList.remove('open'); }

  function levelNodeClass(n, s) {
    if (n <= s.highestCleared) return 'cleared';
    if (n === s.currentTarget) return 'current';
    return 'locked';
  }

  function renderMap() {
    const o = root(), s = readState();
    const nodes = Array.from({ length: LEVELS }, (_, i) => i + 1).map(n => {
      const cls = levelNodeClass(n, s);
      const label = cls === 'cleared' ? '✓' : cls === 'locked' ? '🔒' : n;
      return `<button type="button" class="zfl-node zfl-${cls}" data-level="${n}" ${cls === 'locked' ? 'disabled' : ''} title="${esc(t('flvLevelWord'))} ${n}">${label}</button>`;
    }).join('');
    o.innerHTML = `<div class="v31-card zfl-card">
      <button class="v31-close">×</button>
      <div class="v31-head"><div class="v31-emblem">⚽</div><div><small>FOOTBALL JOURNEY</small><h2>${esc(t('flvTitle'))}</h2><span>${esc(t('flvSub'))}</span></div></div>
      <div class="zfl-grid">${nodes}</div>
      <div class="zfl-cardbar">
        <span>${esc(t('flvCardsLabel'))} <b data-cards>${s.cards}</b> 🛡️</span>
        <button type="button" class="zfl-buycard" data-buy>${esc(t('flvBuyCard'))}</button>
      </div>
      <p class="zfl-note">${esc(t('flvRewardNote'))}</p>
    </div>`;
    o.querySelector('.v31-close').onclick = close;
    o.querySelectorAll('[data-level]').forEach(btn => {
      btn.addEventListener('click', () => startLevel(Number(btn.dataset.level)));
    });
    o.querySelector('[data-buy]').addEventListener('click', buyCard);
    o.classList.add('open');
  }

  async function buyCard() {
    const o = root();
    if (zivoBalance() < CARD_PRICE) { flashNote(o, t('flvBuyCardLow'), true); return; }
    const res = await window.ZIVOZONE?.Economy?.spend?.(CARD_PRICE, { type: 'protection_card_purchase', source: 'football_levels', claimId: `protection_card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, label: t('flvBuyCard') });
    if (res?.ok) {
      const s = readState(); s.cards += 1; writeState(s);
      flashNote(o, t('flvBuyCardOk'), false);
      renderMap();
    } else if (res?.reason === 'insufficient') {
      flashNote(o, t('flvBuyCardLow'), true);
    }
  }
  function flashNote(o, msg, bad) {
    const n = o.querySelector('.zfl-note'); if (!n) return;
    n.textContent = msg; n.classList.toggle('zfl-note-bad', !!bad);
    setTimeout(() => { try { n.textContent = text(t('flvRewardNote')); n.classList.remove('zfl-note-bad'); } catch (_) {} }, 2600);
  }

  let run = null; // { level, tier, questions, idx, correct, usedCard }

  function startLevel(level) {
    const s = readState();
    if (level > s.highestCleared + 1 && level !== s.currentTarget) return; // guard: only the current target or an already-cleared level is playable
    const tier = tierForLevel(level);
    const questions = pickQuestions(tier, s);
    writeState(s); // persists the recentByTier rotation bump from pickQuestions
    run = { level, tier, questions, idx: 0, correct: 0 };
    renderQuestion();
  }

  function renderQuestion() {
    const o = root(), q = run.questions[run.idx];
    if (!q) return renderResult();
    const opts = (q.a || []).map((opt, i) => `<button type="button" class="zfl-opt" data-i="${i}">${esc(text(opt))}</button>`).join('');
    o.innerHTML = `<div class="v31-card zfl-card zfl-quiz">
      <button class="v31-close">×</button>
      <div class="zfl-qhead"><span>${esc(t('flvLevelWord'))} ${run.level}</span><b>${esc(t('flvQuestionLabel'))} ${run.idx + 1}/${PER_LEVEL}</b></div>
      <div class="zfl-qbar"><i style="width:${(run.idx / PER_LEVEL) * 100}%"></i></div>
      <p class="zfl-qtext">${esc(text(q.q))}</p>
      <div class="zfl-opts">${opts}</div>
    </div>`;
    o.querySelector('.v31-close').onclick = () => { run = null; renderMap(); };
    const buttons = [...o.querySelectorAll('.zfl-opt')];
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.disabled = true);
        const i = Number(btn.dataset.i), isCorrect = i === Number(q.c);
        btn.classList.add(isCorrect ? 'zfl-right' : 'zfl-wrong');
        if (!isCorrect) { const rightBtn = buttons[Number(q.c)]; if (rightBtn) rightBtn.classList.add('zfl-right'); }
        if (isCorrect) run.correct++;
        setTimeout(() => { run.idx++; renderQuestion(); }, 850);
      });
    });
  }

  function renderResult() {
    const o = root(), s = readState();
    const passed = run.correct === PER_LEVEL;
    let bodyHtml, actionsHtml;
    if (passed) {
      const firstClear = run.level > s.highestCleared;
      if (firstClear) {
        s.highestCleared = run.level;
        if (window.ZIVOZONE?.Economy?.credit) {
          window.ZIVOZONE.Economy.credit(LEVEL_REWARD, { type: 'football_level_reward', source: 'football_levels', claimId: `football_level_${run.level}`, label: `${t('flvLevelWord')} ${run.level}` }).catch(() => {});
        }
      }
      if (run.level === s.currentTarget) s.currentTarget = Math.min(LEVELS + 1, s.currentTarget + 1);
      writeState(s);
      const allClear = s.highestCleared >= LEVELS;
      bodyHtml = `<h2>${esc(t('flvPassTitle'))}</h2><p>${esc(allClear ? t('flvAllClear') : t('flvPassBody'))}</p>`;
      actionsHtml = allClear
        ? `<button type="button" class="zfl-primary" data-map>${esc(t('flvBackToMap'))}</button>`
        : `<button type="button" class="zfl-primary" data-next>${esc(t('flvContinueBtn'))}</button><button type="button" class="zfl-secondary" data-map>${esc(t('flvBackToMap'))}</button>`;
    } else {
      // Regress immediately — but remember the pre-fail target so a card purchase+use (below) can
      // undo the regression instead of merely retrying an already-regressed state.
      run.targetBeforeFail = s.currentTarget;
      if (run.level === s.currentTarget) {
        s.currentTarget = Math.max(1, s.highestCleared);
        writeState(s);
      }
      bodyHtml = `<h2>${esc(t('flvFailTitle'))}</h2><p>${esc(s.cards > 0 ? t('flvFailBodyCard') : t('flvFailBodyNoCard'))}</p>`;
      actionsHtml = `${s.cards > 0 ? `<button type="button" class="zfl-primary" data-usecard>${esc(t('flvUseCard'))} (${s.cards} 🛡️)</button>` : ''}<button type="button" class="zfl-secondary" data-retry>${esc(t('flvRetry'))}</button><button type="button" class="zfl-secondary" data-map>${esc(t('flvBackToMap'))}</button>`;
    }
    o.innerHTML = `<div class="v31-card zfl-card zfl-result ${passed ? 'zfl-result-pass' : 'zfl-result-fail'}">
      <button class="v31-close">×</button>
      <div class="zfl-resulticon">${passed ? '🎉' : '😕'}</div>
      ${bodyHtml}
      <div class="zfl-actions">${actionsHtml}</div>
    </div>`;
    o.querySelector('.v31-close').onclick = () => { run = null; renderMap(); };
    o.querySelector('[data-map]')?.addEventListener('click', () => { run = null; renderMap(); });
    o.querySelector('[data-retry]')?.addEventListener('click', () => startLevel(run.level));
    o.querySelector('[data-next]')?.addEventListener('click', () => { const lvl = run.level + 1; run = null; if (lvl <= LEVELS) startLevel(lvl); else renderMap(); });
    o.querySelector('[data-usecard]')?.addEventListener('click', () => {
      const cur = readState(); if (cur.cards <= 0) return;
      cur.cards -= 1;
      // Undo the regression applied when the fail result was computed above — the card's whole
      // value is that this retry costs nothing but the card itself.
      if (run.targetBeforeFail) cur.currentTarget = run.targetBeforeFail;
      writeState(cur);
      const lvl = run.level; run = null; startLevel(lvl);
    });
    try { window.ZIVOZONE?.Events?.emit?.('FOOTBALL_LEVEL_RESULT', { level: run.level, passed, correct: run.correct }); } catch (_) {}
  }

  function open() { renderMap(); }

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.FootballLevels = Object.freeze({ open, state: readState });
})();
