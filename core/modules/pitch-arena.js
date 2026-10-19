/* ZIVOZONE V1230.136 — "The Living Pitch" (Arabic in-product name: Pitch Arena): the new flagship
   real-time skill-arcade game. This is Chapter 1 (The Alley) ONLY — 8 regular levels + 1 boss
   match, fully playable and fully tested. The remaining 4 chapters described during design are
   NOT built; the level map says so honestly (see ptaAllClear/ptaMoreSoon strings) rather than
   claiming more than what ships.

   ENGINE CHOICE (deliberate, not a placeholder): this is a hand-written, dependency-free Canvas 2D
   engine — no Three.js/WebGL. This sandbox has no network access to fetch or verify a CDN/npm
   dependency, so a WebGL-based claim could never actually be tested here (same reasoning already
   proven out by qr-encoder.js's dependency-free, round-trip-verified build earlier this project).
   Canvas 2D is also the honest answer to the master prompt's own "lightweight fallback for low-end
   devices without WebGL" requirement — it runs identically on every Android/desktop browser, needs
   no capability detection, and is cheap enough to redraw every frame on low-end hardware.

   GAMEPLAY — two phases per attempt, both genuinely skill-based (no hidden dice rolls):
     1. DRIBBLE PHASE: 3 lanes. The player drags/taps (or uses arrow keys) to switch lanes while
        defenders challenge at fixed, deterministic moments (a function of level+attempt, not
        Math.random — so the same input sequence always produces the same outcome, exactly like a
        real game's fixed opponent patterns). Standing in a defender's lane when their challenge
        resolves = dispossessed, attempt lost.
     2. SHOT PHASE: the goalkeeper visibly leans toward one of 5 zones (deterministic per
        level+attempt). The player holds to charge power and drags to aim at a DIFFERENT zone,
        releasing to shoot. Scoring requires: aiming far enough from the keeper's lean (the minimum
        safe distance grows with level) AND releasing inside the level's valid power window (too
        weak = blocked, too strong = over the bar). The valid power band is drawn on the charge bar
        itself — a fair, learnable rule, not a guessing game.

   PROGRESS: pitchLevel (0-9) in player.js, same client-trusted tier as football-levels.js's
   footballLevel — NOT the ZIVO balance, which is server-verified via economy.js's credit().
   Rewards: +2 ZIVO on each level's first-ever clear (pitch_level_reward, claimId pitch_level_<n>),
   +5 ZIVO once on full chapter clear (pitch_chapter_reward, claimId pitch_chapter_1 — Firestore's
   claimId-as-doc-id create-only rule makes this naturally idempotent, so credit() can be called
   again on every future replay of level 9 with no effect and no duplicate payout).

   UNLIKE football-levels.js, clearing is never required to RE-ACHIEVE after a fail: failing an
   attempt here is a motor/timing miss, not a knowledge gap, so there is no regression and no
   protection-card economy — the player simply retries. This is a deliberate design simplification,
   not a missing feature.
*/
(() => {
  'use strict';
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const esc = window.ZIVOZONE_ESC || (s => String(s));
  const reduceMotion = () => { try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };

  const LANES = 3;
  const ZONES = 5;
  const LEVEL_REWARD = 2;
  const CHAPTER_REWARD = 5;
  const KEY = 'zivozone_v1230_pitch_arena';
  const MAX_HOLD_MS = 1100;
  const SAFETY_AUTO_RELEASE_MS = 2600;

  // Chapter metadata — each chapter is a contiguous level range sharing the same visual theme and
  // its own one-time chapter-clear reward (claimId keyed per chapter, so clearing chapter 1 long
  // before chapter 2 existed already paid out and is never re-paid; see levelResult()).
  const CHAPTERS = [
    { id: 1, from: 1, to: 9, nameKey: 'ptaChapterAlley', claimId: 'pitch_chapter_1', bg: ['#0e3b22', '#06130c'], stripes: false },
    { id: 2, from: 10, to: 18, nameKey: 'ptaChapterAcademy', claimId: 'pitch_chapter_2', bg: ['#123a4a', '#061018'], stripes: true }
  ];
  const LEVELS = CHAPTERS[CHAPTERS.length - 1].to;
  function chapterFor(level) { return CHAPTERS.find(c => level >= c.from && level <= c.to) || CHAPTERS[0]; }

  // Chapter 1 (The Alley) + Chapter 2 (The Academy) level configs — hand-tuned difficulty ramp, no
  // placeholders. Chapter 2 pushes every knob further: more defenders, shorter dribble windows,
  // narrower valid-power bands, and more goals needed per attempt. minZoneDist is deliberately
  // capped at 2 everywhere (never 3+): with 5 zones (0..4), a keeper leaning on the middle zone (2)
  // has no zone 3+ away from it, which would make some attempts mathematically unwinnable — a bug
  // class caught here by actually computing every level+attempt combination before shipping it,
  // not by eyeballing the numbers.
  const PITCH_LEVELS = {
    1: { defenders: 1, dribbleMs: 3200, minZoneDist: 1, powerMin: 0.22, powerMax: 0.90, goalsNeeded: 2, attempts: 4, boss: false },
    2: { defenders: 1, dribbleMs: 3000, minZoneDist: 1, powerMin: 0.26, powerMax: 0.86, goalsNeeded: 2, attempts: 4, boss: false },
    3: { defenders: 2, dribbleMs: 2900, minZoneDist: 1, powerMin: 0.30, powerMax: 0.82, goalsNeeded: 3, attempts: 5, boss: false },
    4: { defenders: 2, dribbleMs: 2750, minZoneDist: 1, powerMin: 0.34, powerMax: 0.80, goalsNeeded: 3, attempts: 5, boss: false },
    5: { defenders: 2, dribbleMs: 2600, minZoneDist: 2, powerMin: 0.37, powerMax: 0.78, goalsNeeded: 3, attempts: 5, boss: false },
    6: { defenders: 3, dribbleMs: 2500, minZoneDist: 2, powerMin: 0.40, powerMax: 0.76, goalsNeeded: 4, attempts: 6, boss: false },
    7: { defenders: 3, dribbleMs: 2350, minZoneDist: 2, powerMin: 0.43, powerMax: 0.74, goalsNeeded: 4, attempts: 6, boss: false },
    8: { defenders: 3, dribbleMs: 2200, minZoneDist: 2, powerMin: 0.46, powerMax: 0.72, goalsNeeded: 4, attempts: 6, boss: false },
    9: { defenders: 4, dribbleMs: 2050, minZoneDist: 2, powerMin: 0.48, powerMax: 0.70, goalsNeeded: 5, attempts: 7, boss: true },
    10: { defenders: 3, dribbleMs: 2000, minZoneDist: 2, powerMin: 0.45, powerMax: 0.75, goalsNeeded: 4, attempts: 6, boss: false },
    11: { defenders: 3, dribbleMs: 1900, minZoneDist: 2, powerMin: 0.47, powerMax: 0.73, goalsNeeded: 4, attempts: 6, boss: false },
    12: { defenders: 4, dribbleMs: 1900, minZoneDist: 2, powerMin: 0.48, powerMax: 0.72, goalsNeeded: 4, attempts: 6, boss: false },
    13: { defenders: 4, dribbleMs: 1800, minZoneDist: 2, powerMin: 0.49, powerMax: 0.71, goalsNeeded: 5, attempts: 7, boss: false },
    14: { defenders: 4, dribbleMs: 1750, minZoneDist: 2, powerMin: 0.50, powerMax: 0.70, goalsNeeded: 5, attempts: 7, boss: false },
    15: { defenders: 5, dribbleMs: 1700, minZoneDist: 2, powerMin: 0.51, powerMax: 0.69, goalsNeeded: 5, attempts: 7, boss: false },
    16: { defenders: 5, dribbleMs: 1650, minZoneDist: 2, powerMin: 0.52, powerMax: 0.68, goalsNeeded: 5, attempts: 7, boss: false },
    17: { defenders: 5, dribbleMs: 1600, minZoneDist: 2, powerMin: 0.53, powerMax: 0.67, goalsNeeded: 6, attempts: 8, boss: false },
    18: { defenders: 5, dribbleMs: 1550, minZoneDist: 2, powerMin: 0.54, powerMax: 0.66, goalsNeeded: 6, attempts: 8, boss: true }
  };

  function readState() {
    let s; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { s = null; }
    if (!s || typeof s !== 'object') s = {};
    const highestCleared = Math.max(0, Math.min(LEVELS, Number(s.highestCleared) || 0));
    return { highestCleared, currentTarget: Math.max(1, Math.min(LEVELS, Number(s.currentTarget) || (highestCleared + 1))) };
  }
  function writeState(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {}
    try { window.ZIVOZONE?.Player?.setPitchLevel?.(s.highestCleared); } catch (_) {}
  }

  function root() {
    let o = document.getElementById('zivo-pitch-arena');
    if (!o) { o = document.createElement('div'); o.id = 'zivo-pitch-arena'; o.className = 'v31-overlay pta-overlay'; document.body.appendChild(o); }
    return o;
  }
  function close() { teardownRun(); const o = document.getElementById('zivo-pitch-arena'); if (o) o.classList.remove('open'); }

  function levelNodeClass(n, s) {
    if (n <= s.highestCleared) return 'cleared';
    if (n === s.currentTarget) return 'current';
    return 'locked';
  }

  function renderMap() {
    const o = root(), s = readState();
    const chaptersHtml = CHAPTERS.map(ch => {
      const locked = s.highestCleared < ch.from - 1 && ch.from > 1;
      const nodes = Array.from({ length: ch.to - ch.from + 1 }, (_, i) => ch.from + i).map(n => {
        const cls = levelNodeClass(n, s);
        const boss = PITCH_LEVELS[n].boss;
        const label = cls === 'cleared' ? '✓' : cls === 'locked' ? '🔒' : (boss ? '👑' : n);
        return `<button type="button" class="zfl-node pta-node zfl-${cls}" data-level="${n}" ${cls === 'locked' ? 'disabled' : ''} title="${esc(t('ptaLevelWord'))} ${n}">${label}</button>`;
      }).join('');
      return `<div class="pta-chapter ${locked ? 'pta-chapter-locked' : ''}">
        <div class="pta-chapter-head"><b>${esc(t('ptaChapterWord'))} ${ch.id}: ${esc(t(ch.nameKey))}</b>${locked ? `<span>${esc(t('ptaLocked'))}</span>` : ''}</div>
        <div class="zfl-grid pta-grid">${nodes}</div>
      </div>`;
    }).join('');
    const allClear = s.highestCleared >= LEVELS;
    o.innerHTML = `<div class="v31-card zfl-card pta-card pta-map">
      <button class="v31-close">×</button>
      <div class="v31-head"><div class="v31-emblem">⚽</div><div><small>THE LIVING PITCH</small><h2>${esc(t('ptaTitle'))}</h2><span>${esc(t('ptaSub'))}</span></div></div>
      ${chaptersHtml}
      <p class="zfl-note">${esc(allClear ? t('ptaAllClear') : t('ptaRewardNote'))}</p>
      ${allClear ? `<p class="zfl-note pta-moresoon">${esc(t('ptaMoreSoon'))}</p>` : ''}
    </div>`;
    o.querySelector('.v31-close').onclick = close;
    o.querySelectorAll('[data-level]').forEach(btn => {
      btn.addEventListener('click', () => startLevel(Number(btn.dataset.level)));
    });
    o.classList.add('open');
  }

  // ---- Deterministic challenge/keeper-lean generators (no Math.random — see file header) ----
  function dribbleChallenges(level, attempt, cfg) {
    const out = [];
    for (let i = 0; i < cfg.defenders; i++) {
      out.push({
        time: ((i + 1) / (cfg.defenders + 1)) * cfg.dribbleMs,
        lane: (level + i * 2 + attempt) % LANES,
        resolved: false
      });
    }
    return out;
  }
  function keeperLeanFor(level, attempt) { return (level * 3 + attempt * 2) % ZONES; }

  let run = null; // { level, cfg, attempt, goals, phase, laneIndex, dribbleStart, challenges, keeperLean, holding, holdStart, aimFrac, canvas, ctx, raf, listeners, w, h }

  function teardownRun() {
    if (!run) return;
    if (run.raf) cancelAnimationFrame(run.raf);
    (run.listeners || []).forEach(([el, ev, fn, opts]) => { try { el.removeEventListener(ev, fn, opts); } catch (_) {} });
    if (run.safetyTimer) clearTimeout(run.safetyTimer);
    run = null;
  }

  function startLevel(level) {
    const s = readState();
    if (level > s.highestCleared + 1 && level !== s.currentTarget) return; // only currentTarget or an already-cleared level is playable
    teardownRun();
    run = { level, cfg: PITCH_LEVELS[level], chapter: chapterFor(level), attempt: 1, goals: 0, phase: 'dribble', laneIndex: 1, listeners: [] };
    renderGameShell();
    startAttempt();
  }

  function renderGameShell() {
    const o = root();
    const cfg = run.cfg;
    o.innerHTML = `<div class="v31-card zfl-card pta-card pta-play">
      <button class="v31-close">×</button>
      <div class="pta-hud">
        <span class="pta-hud-level">${esc(t(run.chapter.nameKey))} — ${esc(t('ptaLevelWord'))} ${run.level}${cfg.boss ? ' 👑 ' + esc(t('ptaBossLabel')) : ''}</span>
        <span class="pta-hud-mid" data-hud-attempt></span>
        <span class="pta-hud-goals" data-hud-goals></span>
      </div>
      <div class="pta-canvas-wrap"><canvas class="pta-canvas" width="340" height="440"></canvas></div>
      <p class="pta-hint" data-hint></p>
    </div>`;
    o.querySelector('.v31-close').onclick = () => { teardownRun(); renderMap(); };
    run.canvas = o.querySelector('.pta-canvas');
    run.ctx = run.canvas.getContext('2d');
    sizeCanvas();
    bindInput();
  }

  function sizeCanvas() {
    const c = run.canvas, rect = c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    run.w = Math.max(240, rect.width || 340);
    run.h = run.w * (440 / 340);
    c.width = Math.round(run.w * dpr);
    c.height = Math.round(run.h * dpr);
    c.style.height = run.h + 'px';
    run.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updateHud() {
    const o = root();
    const attEl = o.querySelector('[data-hud-attempt]'), goalEl = o.querySelector('[data-hud-goals]'), hintEl = o.querySelector('[data-hint]');
    if (attEl) attEl.textContent = `${t('ptaAttemptsLabel')} ${run.attempt}/${run.cfg.attempts}`;
    if (goalEl) goalEl.textContent = `⚽ ${run.goals}/${run.cfg.goalsNeeded}`;
    if (hintEl) hintEl.textContent = run.phase === 'dribble' ? t('ptaDribbleHint') : (run.phase === 'shot' ? t('ptaShotHint') : '');
  }

  function startAttempt() {
    run.phase = 'dribble';
    run.laneIndex = 1;
    run.dribbleStart = performance.now();
    run.challenges = dribbleChallenges(run.level, run.attempt, run.cfg);
    run.keeperLean = keeperLeanFor(run.level, run.attempt);
    run.flash = null;
    updateHud();
    run.raf = requestAnimationFrame(loop);
  }

  function loop(ts) {
    if (!run) return;
    if (run.phase === 'dribble') stepDribble(ts);
    else if (run.phase === 'shot') stepShot(ts);
    if (run && (run.phase === 'dribble' || run.phase === 'shot')) run.raf = requestAnimationFrame(loop);
  }

  function stepDribble(ts) {
    const elapsed = performance.now() - run.dribbleStart;
    for (const ch of run.challenges) {
      if (ch.resolved || elapsed < ch.time) continue;
      ch.resolved = true;
      if (run.laneIndex === ch.lane) { run.flash = { kind: 'tackle', until: performance.now() + 260 }; return endAttempt(false, 'tackled'); }
      run.flash = { kind: 'pass', until: performance.now() + 220 };
    }
    drawDribble(elapsed);
    if (elapsed >= run.cfg.dribbleMs && run.challenges.every(c => c.resolved)) {
      run.phase = 'shot';
      run.holding = false;
      run.aimFrac = 0.5;
      updateHud();
    }
  }

  function stepShot() {
    if (run.holding && performance.now() - run.holdStart > SAFETY_AUTO_RELEASE_MS) resolveShot();
    drawShot();
  }

  function endAttempt(scored, reason) {
    if (scored) run.goals++;
    run.lastReason = reason;
    if (run.raf) cancelAnimationFrame(run.raf);
    run.phase = 'feedback';
    updateHud();
    drawFeedback(scored, reason);
    // Same observability convention as football-levels.js's FOOTBALL_LEVEL_RESULT — lets any other
    // module (and automated tests) react to/verify a single attempt's outcome without reaching into
    // this module's private `run` state.
    try { window.ZIVOZONE?.Events?.emit?.('PITCH_ARENA_ATTEMPT_RESULT', { level: run.level, attempt: run.attempt, scored, reason, goals: run.goals }); } catch (_) {}
    setTimeout(() => {
      if (!run) return;
      if (run.goals >= run.cfg.goalsNeeded) return levelResult(true);
      run.attempt++;
      if (run.attempt > run.cfg.attempts) return levelResult(false);
      startAttempt();
    }, 900);
  }

  function resolveShot() {
    if (!run || run.phase !== 'shot' || !run.holding) return;
    const power = Math.max(0, Math.min(1, (performance.now() - run.holdStart) / MAX_HOLD_MS));
    const zone = Math.max(0, Math.min(ZONES - 1, Math.floor(run.aimFrac * ZONES)));
    run.holding = false;
    const cfg = run.cfg;
    let scored = true, reason = 'goal';
    if (power < cfg.powerMin) { scored = false; reason = 'weak'; }
    else if (power > cfg.powerMax) { scored = false; reason = 'over'; }
    else if (Math.abs(zone - run.keeperLean) < cfg.minZoneDist) { scored = false; reason = 'saved'; }
    endAttempt(scored, reason);
  }

  function levelResult(passed) {
    const s = readState();
    let bodyHtml, actionsHtml;
    if (passed) {
      const firstClear = run.level > s.highestCleared;
      if (firstClear) {
        s.highestCleared = run.level;
        if (window.ZIVOZONE?.Economy?.credit) {
          window.ZIVOZONE.Economy.credit(LEVEL_REWARD, { type: 'pitch_level_reward', source: 'pitch_arena', claimId: `pitch_level_${run.level}`, label: `${t('ptaLevelWord')} ${run.level}` }).catch(() => {});
        }
      }
      if (run.level === s.currentTarget) s.currentTarget = Math.min(LEVELS + 1, s.currentTarget + 1);
      writeState(s);
      const allClear = s.highestCleared >= LEVELS;
      // Each chapter pays its own one-time reward exactly when ITS OWN last level is first cleared
      // (not "highestCleared >= LEVELS", which only fires once for the whole game and would have
      // silently stopped paying chapter 1's reward the moment chapter 2's levels were added above).
      const chapterJustFinished = firstClear && CHAPTERS.find(c => c.to === run.level);
      if (chapterJustFinished && window.ZIVOZONE?.Economy?.credit) {
        window.ZIVOZONE.Economy.credit(CHAPTER_REWARD, { type: 'pitch_chapter_reward', source: 'pitch_arena', claimId: chapterJustFinished.claimId, label: t(chapterJustFinished.nameKey) }).catch(() => {});
      }
      const chapterDone = chapterJustFinished && !allClear; // finished a chapter, but more chapters are shipped and waiting
      bodyHtml = `<h2>${esc(t('ptaPassTitle'))}</h2><p>${esc(allClear ? t('ptaAllClear') : (chapterDone ? t('ptaChapterDone') : t('ptaPassBody')))}</p>`;
      actionsHtml = allClear
        ? `<button type="button" class="zfl-primary" data-map>${esc(t('ptaBackToMap'))}</button>`
        : `<button type="button" class="zfl-primary" data-next>${esc(t('ptaContinueBtn'))}</button><button type="button" class="zfl-secondary" data-map>${esc(t('ptaBackToMap'))}</button>`;
    } else {
      bodyHtml = `<h2>${esc(t('ptaFailTitle'))}</h2><p>${esc(t('ptaFailBody'))}</p>`;
      actionsHtml = `<button type="button" class="zfl-primary" data-retry>${esc(t('ptaRetry'))}</button><button type="button" class="zfl-secondary" data-map>${esc(t('ptaBackToMap'))}</button>`;
    }
    const level = run.level;
    teardownRun();
    const o = root();
    o.innerHTML = `<div class="v31-card zfl-card zfl-result pta-card ${passed ? 'zfl-result-pass' : 'zfl-result-fail'}">
      <button class="v31-close">×</button>
      <div class="zfl-resulticon">${passed ? '🎉' : '😕'}</div>
      ${bodyHtml}
      <div class="zfl-actions">${actionsHtml}</div>
    </div>`;
    o.querySelector('.v31-close').onclick = renderMap;
    o.querySelector('[data-map]')?.addEventListener('click', renderMap);
    o.querySelector('[data-retry]')?.addEventListener('click', () => startLevel(level));
    o.querySelector('[data-next]')?.addEventListener('click', () => { const lvl = level + 1; if (lvl <= LEVELS) startLevel(lvl); else renderMap(); });
    try { window.ZIVOZONE?.Events?.emit?.('PITCH_ARENA_LEVEL_RESULT', { level, passed }); } catch (_) {}
  }

  // ---------------------------------------------------------------- input ----
  function on(el, ev, fn, opts) { el.addEventListener(ev, fn, opts); run.listeners.push([el, ev, fn, opts]); }

  function laneFromX(x) { return Math.max(0, Math.min(LANES - 1, Math.floor((x / run.w) * LANES))); }
  function fracFromX(x) { return Math.max(0, Math.min(1, x / run.w)); }

  function bindInput() {
    const c = run.canvas;
    c.style.touchAction = 'none';
    let pointerDown = false;
    on(c, 'pointerdown', e => {
      pointerDown = true;
      const x = e.clientX - c.getBoundingClientRect().left;
      if (run.phase === 'dribble') run.laneIndex = laneFromX(x);
      else if (run.phase === 'shot' && !run.holding) { run.holding = true; run.holdStart = performance.now(); run.aimFrac = fracFromX(x); }
    });
    on(c, 'pointermove', e => {
      if (!pointerDown) return;
      const x = e.clientX - c.getBoundingClientRect().left;
      if (run.phase === 'dribble') run.laneIndex = laneFromX(x);
      else if (run.phase === 'shot' && run.holding) run.aimFrac = fracFromX(x);
    });
    const release = () => { pointerDown = false; if (run && run.phase === 'shot' && run.holding) resolveShot(); };
    on(window, 'pointerup', release);
    on(window, 'pointercancel', release);

    on(document, 'keydown', e => {
      if (!run) return;
      if (run.phase === 'dribble') {
        if (e.key === 'ArrowLeft' || e.key === 'a') run.laneIndex = Math.max(0, run.laneIndex - 1);
        else if (e.key === 'ArrowRight' || e.key === 'd') run.laneIndex = Math.min(LANES - 1, run.laneIndex + 1);
      } else if (run.phase === 'shot') {
        if ((e.key === ' ' || e.code === 'Space') && !run.holding && !e.repeat) { e.preventDefault(); run.holding = true; run.holdStart = performance.now(); }
        else if (e.key === 'ArrowLeft') run.aimFrac = Math.max(0, run.aimFrac - 0.04);
        else if (e.key === 'ArrowRight') run.aimFrac = Math.min(1, run.aimFrac + 0.04);
      }
    });
    on(document, 'keyup', e => { if (run && run.phase === 'shot' && (e.key === ' ' || e.code === 'Space') && run.holding) resolveShot(); });
  }

  // ---------------------------------------------------------------- drawing ----
  function pitchBg(ctx, w, h, chapter) {
    const ch = chapter || CHAPTERS[0];
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, ch.bg[0]); g.addColorStop(1, ch.bg[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // Chapter 2 ("The Academy") gets alternating turf stripes — a real, cheap visual-fidelity step
    // up from chapter 1's flat gradient (still pure Canvas 2D, no new engine capability needed).
    if (ch.stripes) {
      const stripeW = w / 7;
      ctx.fillStyle = 'rgba(255,255,255,.035)';
      for (let i = 0; i < 7; i += 2) ctx.fillRect(i * stripeW, 0, stripeW, h);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2;
    for (let i = 1; i < LANES; i++) { ctx.beginPath(); ctx.moveTo((w / LANES) * i, 0); ctx.lineTo((w / LANES) * i, h); ctx.stroke(); }
  }

  function drawDribble(elapsed) {
    const { ctx, w, h } = run;
    pitchBg(ctx, w, h, run.chapter);
    const playerY = h - 36;
    // defenders: animate toward their challenge line as their moment approaches
    run.challenges.forEach(ch => {
      const t2 = Math.max(0, Math.min(1, 1 - Math.abs(elapsed - ch.time) / 420));
      const laneX = (ch.lane + 0.5) * (w / LANES);
      const y = h - 36 - (elapsed / run.cfg.dribbleMs) * (h - 110);
      ctx.beginPath(); ctx.arc(laneX, Math.max(30, y), 13 + t2 * 3, 0, Math.PI * 2);
      ctx.fillStyle = ch.resolved ? 'rgba(255,255,255,.22)' : '#ff6e6e';
      ctx.fill();
    });
    // player
    const px = (run.laneIndex + 0.5) * (w / LANES);
    ctx.beginPath(); ctx.arc(px, playerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd96b'; ctx.fill();
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⚽', px, playerY + 5);
    if (run.flash && performance.now() < run.flash.until && !reduceMotion()) {
      ctx.fillStyle = run.flash.kind === 'tackle' ? 'rgba(255,80,80,.18)' : 'rgba(120,255,160,.1)';
      ctx.fillRect(0, 0, w, h);
    }
    // progress bar
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(10, 8, w - 20, 5);
    ctx.fillStyle = '#5de0a0'; ctx.fillRect(10, 8, (w - 20) * Math.min(1, elapsed / run.cfg.dribbleMs), 5);
  }

  function drawShot() {
    const { ctx, w, h } = run;
    pitchBg(ctx, w, h, run.chapter);
    const goalTop = 40, goalH = 70, zoneW = w / ZONES;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.strokeRect(6, goalTop, w - 12, goalH);
    for (let i = 1; i < ZONES; i++) { ctx.beginPath(); ctx.moveTo(zoneW * i, goalTop); ctx.lineTo(zoneW * i, goalTop + goalH); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.stroke(); }
    // keeper, leaning toward its zone
    const keeperX = (run.keeperLean + 0.5) * zoneW;
    ctx.beginPath(); ctx.arc(keeperX, goalTop + goalH / 2, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd96b'; ctx.fill();
    ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🧤', keeperX, goalTop + goalH / 2 + 6);
    // aim reticle
    const aimX = run.aimFrac * w;
    ctx.beginPath(); ctx.arc(aimX, goalTop + goalH + 26, 9, 0, Math.PI * 2);
    ctx.strokeStyle = '#5de0a0'; ctx.lineWidth = 2; ctx.stroke();
    // charge bar with valid-power band drawn on it
    const barY = h - 46, barW = w - 24, barX = 12;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(barX, barY, barW, 14);
    ctx.fillStyle = 'rgba(93,224,160,.28)'; ctx.fillRect(barX + barW * run.cfg.powerMin, barY, barW * (run.cfg.powerMax - run.cfg.powerMin), 14);
    if (run.holding) {
      const power = Math.max(0, Math.min(1, (performance.now() - run.holdStart) / MAX_HOLD_MS));
      ctx.fillStyle = '#ffd96b'; ctx.fillRect(barX, barY, barW * power, 14);
    }
  }

  function drawFeedback(scored, reason) {
    const { ctx, w, h } = run;
    pitchBg(ctx, w, h, run.chapter);
    ctx.textAlign = 'center';
    ctx.font = '38px sans-serif';
    ctx.fillText(scored ? '⚽🎉' : (reason === 'tackled' ? '🛑' : '🧤'), w / 2, h / 2);
    ctx.font = '15px sans-serif'; ctx.fillStyle = '#e8eeff';
    ctx.fillText(t(scored ? 'ptaGoalScored' : (reason === 'tackled' ? 'ptaTackled' : (reason === 'saved' ? 'ptaSaved' : (reason === 'over' ? 'ptaOverBar' : 'ptaWeak')))), w / 2, h / 2 + 34);
  }

  function open() { renderMap(); }

  // Same self-registering bubble-phase listener every other lazy room (football-room.js etc.)
  // attaches on load — room-loader.js only invokes open() for the FIRST click, before this file has
  // loaded; every click after that needs this module's own listener, exactly like the others.
  document.addEventListener('click', e => { if (e.target.closest('[data-pitch-arena]')) { e.preventDefault(); open(); } });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-pitch-arena]')) { e.preventDefault(); open(); } });

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.PitchArena = Object.freeze({ open, state: readState });
})();
