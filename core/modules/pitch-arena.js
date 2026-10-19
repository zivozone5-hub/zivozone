/* ZIVOZONE V1230.138 — "The Living Pitch" (its in-product Arabic name translates to "The Living
   Pitch"), re-engineered as a
   billiards/pinball-style physics game. This REPLACES the previous dribble+power-meter mechanic
   (V1230.136-137) end to end, per explicit direction from the site owner: the old mechanic wasn't
   intuitive, and the request was for something that plays like pool/billiards — strike the ball
   with a judged pull of power and angle, let it bounce off a hand-placed course of obstacles, and
   land it in the goal mouth — with real, continuous physics instead of discrete lane/zone checks.

   WHAT STAYS THE SAME (deliberately, to avoid re-breaking a tested architecture):
     - Chapter/level map, progress persistence (pitchLevel in player.js), the ZIVO reward hooks
       (pitch_level_reward / pitch_chapter_reward, same claimIds), the attempts/goalsNeeded loop,
       and the PITCH_ARENA_ATTEMPT_RESULT / PITCH_ARENA_LEVEL_RESULT events other code can observe.
       None of firestore.rules, player.js, economy.js, room-loader.js needed to change.

   WHAT CHANGED — the entire moment-to-moment gameplay:
     ENGINE: still a hand-written, dependency-free Canvas 2D engine (no physics library — this
     sandbox cannot fetch/verify any CDN dependency, and a from-scratch 2D rigid-circle solver is
     simple enough to write and test directly: position += velocity, reflect velocity off walls and
     circular obstacles by their surface normal, apply per-frame friction).
     CONTROL: drag away from the ball (a "pull-back", exactly like aiming a billiards cue or a
     slingshot) to set BOTH direction (the ball launches opposite the pull) and power (pull
     distance, capped). Release to shoot. Arrow keys + Space are the full keyboard-only equivalent.
     COURSE: each level places a deterministic (not Math.random) arrangement of bumpers the ball
     rebounds off, and — from level 3 onward — hazard pits that end the attempt instantly if the
     ball rolls over one. Some levels add a goalkeeper who physically oscillates across part of the
     goal mouth as a moving obstacle, instead of a static "lean zone" to out-guess.
     SCORING: the ball must enter the goal slot at a controlled speed — shooting too hard sends it
     over the goal, exactly like a real shot blazing over the bar, which keeps the old mechanic's
     "a fair, learnable power band" idea alive even though the whole rest of the system changed.
     This naturally makes most levels take several real bounces before they resolve — the explicit
     goal of the redesign was a game that does not resolve in one instant tap.

   HONESTY NOTE on tuning: the old discrete mechanic could be (and was) brute-force-verified for
   every level+attempt combination before shipping, because its state space was finite. Continuous
   physics has no such finite check. Level difficulty here is hand-tuned and was spot-verified with
   a standalone simulation script (reproducing the same physics formulas) confirming a reasonably
   aimed shot can clear every level 1-18, plus real end-to-end Playwright runs on representative
   levels — but, unlike the old system, "every possible shot sequence was proven winnable" is not a
   claim this file can honestly make.
*/
(() => {
  'use strict';
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const esc = window.ZIVOZONE_ESC || (s => String(s));
  const reduceMotion = () => { try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };

  const LEVEL_REWARD = 2;
  const CHAPTER_REWARD = 5;
  const KEY = 'zivozone_v1230_pitch_arena';

  // ---- physics constants (logical canvas units; sizeCanvas() maps these to real pixels) ----
  const W = 340, H = 440;
  const BALL_R = 9;
  const MARGIN_X = 16;
  const TOP_WALL_Y = 48;
  const BOTTOM_WALL_Y = H - 26;
  const BALL_START = { x: W / 2, y: H - 60 };
  const GOAL_CX = W / 2;
  const MAX_PULL = 95, MIN_PULL = 14, MAX_SPEED = 640;
  const REST_WALL = 0.80, REST_BUMPER = 0.88, REST_KEEPER = 0.84;
  const STOP_EPS = 5, STOP_FRAMES_NEEDED = 4;
  const SAFETY_MAX_ROLL_MS = 9000;
  const MAX_HOLD_MS = 1100; // keyboard power-charge cap, same feel as the old charge bar

  const CHAPTERS = [
    { id: 1, from: 1, to: 9, nameKey: 'ptaChapterAlley', claimId: 'pitch_chapter_1', bg: ['#0e3b22', '#06130c'], stripes: false },
    { id: 2, from: 10, to: 18, nameKey: 'ptaChapterAcademy', claimId: 'pitch_chapter_2', bg: ['#123a4a', '#061018'], stripes: true }
  ];
  const LEVELS = CHAPTERS[CHAPTERS.length - 1].to;
  function chapterFor(level) { return CHAPTERS.find(c => level >= c.from && level <= c.to) || CHAPTERS[0]; }

  // Hand-tuned difficulty ramp. friction is a per-frame-at-60fps velocity-retention factor (closer
  // to 1 = slipperier table = more bounces before the ball settles); maxEnterSpeedFrac is the
  // fraction of MAX_SPEED the ball may still be carrying when it crosses the goal line — faster
  // than that and it blasts over, exactly like a real shot cleared over the bar.
  const PITCH_LEVELS = {
    1: { bumpers: 2, hazards: 0, keeper: false, friction: 0.984, maxEnterSpeedFrac: 1.00, goalsNeeded: 2, attempts: 5, boss: false },
    2: { bumpers: 3, hazards: 0, keeper: false, friction: 0.985, maxEnterSpeedFrac: 0.95, goalsNeeded: 2, attempts: 5, boss: false },
    3: { bumpers: 3, hazards: 1, keeper: false, friction: 0.985, maxEnterSpeedFrac: 0.90, goalsNeeded: 2, attempts: 5, boss: false },
    4: { bumpers: 4, hazards: 1, keeper: false, friction: 0.986, maxEnterSpeedFrac: 0.85, goalsNeeded: 3, attempts: 6, boss: false },
    5: { bumpers: 4, hazards: 1, keeper: false, friction: 0.987, maxEnterSpeedFrac: 0.82, goalsNeeded: 3, attempts: 6, boss: false },
    6: { bumpers: 5, hazards: 2, keeper: false, friction: 0.988, maxEnterSpeedFrac: 0.78, goalsNeeded: 3, attempts: 6, boss: false },
    7: { bumpers: 5, hazards: 2, keeper: false, friction: 0.989, maxEnterSpeedFrac: 0.75, goalsNeeded: 3, attempts: 7, boss: false },
    8: { bumpers: 6, hazards: 2, keeper: false, friction: 0.990, maxEnterSpeedFrac: 0.72, goalsNeeded: 4, attempts: 7, boss: false },
    9: { bumpers: 6, hazards: 2, keeper: true, friction: 0.990, maxEnterSpeedFrac: 0.70, goalsNeeded: 4, attempts: 8, boss: true },
    10: { bumpers: 6, hazards: 2, keeper: false, friction: 0.991, maxEnterSpeedFrac: 0.78, goalsNeeded: 3, attempts: 7, boss: false },
    11: { bumpers: 7, hazards: 2, keeper: false, friction: 0.991, maxEnterSpeedFrac: 0.74, goalsNeeded: 3, attempts: 7, boss: false },
    12: { bumpers: 7, hazards: 3, keeper: false, friction: 0.992, maxEnterSpeedFrac: 0.70, goalsNeeded: 4, attempts: 7, boss: false },
    13: { bumpers: 7, hazards: 3, keeper: true, friction: 0.992, maxEnterSpeedFrac: 0.68, goalsNeeded: 4, attempts: 8, boss: false },
    14: { bumpers: 8, hazards: 3, keeper: false, friction: 0.993, maxEnterSpeedFrac: 0.66, goalsNeeded: 4, attempts: 8, boss: false },
    15: { bumpers: 8, hazards: 3, keeper: true, friction: 0.994, maxEnterSpeedFrac: 0.64, goalsNeeded: 5, attempts: 8, boss: false },
    16: { bumpers: 8, hazards: 4, keeper: false, friction: 0.994, maxEnterSpeedFrac: 0.62, goalsNeeded: 5, attempts: 8, boss: false },
    17: { bumpers: 9, hazards: 4, keeper: true, friction: 0.995, maxEnterSpeedFrac: 0.60, goalsNeeded: 5, attempts: 9, boss: false },
    18: { bumpers: 9, hazards: 4, keeper: true, friction: 0.996, maxEnterSpeedFrac: 0.58, goalsNeeded: 6, attempts: 9, boss: true }
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Deterministic course layout — same inputs always produce the same course (no Math.random), so
  // a level looks identical across replays and is reproducible for testing, matching the project's
  // existing deterministic-gameplay convention.
  function buildCourse(level, cfg) {
    const slotHalf = cfg.keeper ? 52 : 40;
    const bumpers = [];
    for (let i = 0; i < cfg.bumpers; i++) {
      // col order 0,2,1,0,2,1... so the first two bumpers of any level take the OUTER lanes,
      // leaving the straight middle lane clear until a level has 3+ bumpers in a row — level 1
      // (2 bumpers) is deliberately a clean, intuitive straight shot for a first-time player.
      const col = (i * 2) % 3, row = Math.floor(i / 3);
      const zig = (level + row) % 2 === 0 ? 1 : -1;
      const laneW = (W - 2 * MARGIN_X - 60) / 2;
      const r = row % 2 === 0 ? 15 : 12;
      const x = clamp(MARGIN_X + 46 + col * laneW + zig * 12, MARGIN_X + r + 4, W - MARGIN_X - r - 4);
      const y = TOP_WALL_Y + 78 + row * 62;
      bumpers.push({ x, y, r });
    }
    const hazards = [];
    const hazSpanX = W - 2 * MARGIN_X - 80, hazSpanY = BOTTOM_WALL_Y - TOP_WALL_Y - 190;
    for (let i = 0; i < cfg.hazards; i++) {
      const x = MARGIN_X + 40 + ((i * 97 + level * 31) % Math.max(1, hazSpanX));
      const y = TOP_WALL_Y + 130 + ((i * 53 + level * 17) % Math.max(1, hazSpanY));
      hazards.push({ x, y, r: 15 });
    }
    return { bumpers, hazards, slotHalf, keeper: cfg.keeper, keeperY: TOP_WALL_Y + 8, keeperAmp: 16, keeperR: 13, keeperSpeed: 1.7 };
  }

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

  let run = null;

  function teardownRun() {
    if (!run) return;
    if (run.raf) cancelAnimationFrame(run.raf);
    (run.listeners || []).forEach(([el, ev, fn, opts]) => { try { el.removeEventListener(ev, fn, opts); } catch (_) {} });
    run = null;
  }

  function startLevel(level) {
    const s = readState();
    if (level > s.highestCleared + 1 && level !== s.currentTarget) return;
    teardownRun();
    const cfg = PITCH_LEVELS[level];
    run = { level, cfg, chapter: chapterFor(level), course: buildCourse(level, cfg), attempt: 1, goals: 0, phase: 'play', listeners: [] };
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
    run.w = Math.max(240, rect.width || W);
    run.h = run.w * (H / W);
    run.scale = run.w / W;
    c.width = Math.round(run.w * dpr);
    c.height = Math.round(run.h * dpr);
    c.style.height = run.h + 'px';
    run.ctx.setTransform(dpr * run.scale, 0, 0, dpr * run.scale, 0, 0);
  }

  function updateHud() {
    const o = root();
    const attEl = o.querySelector('[data-hud-attempt]'), goalEl = o.querySelector('[data-hud-goals]'), hintEl = o.querySelector('[data-hint]');
    if (attEl) attEl.textContent = `${t('ptaAttemptsLabel')} ${run.attempt}/${run.cfg.attempts}`;
    if (goalEl) goalEl.textContent = `⚽ ${run.goals}/${run.cfg.goalsNeeded}`;
    if (hintEl) hintEl.textContent = run.rolling ? t('ptaDribbleHint') : t('ptaShotHint');
  }

  function startAttempt() {
    run.ball = { x: BALL_START.x, y: BALL_START.y, vx: 0, vy: 0 };
    run.rolling = false;
    run.touchedKeeper = false;
    run.keeperT = 0;
    run.stopFrames = 0;
    run.aiming = false;
    run.keyCharging = false;
    run.keyAimAngle = -Math.PI / 2;
    run.rollStart = 0;
    run.lastTs = 0;
    run.trail = [];
    updateHud();
    run.raf = requestAnimationFrame(loop);
  }

  function loop(ts) {
    if (!run) return;
    const dt = run.lastTs ? Math.min(0.032, (ts - run.lastTs) / 1000) : 0;
    run.lastTs = ts;
    run.keeperT += dt;
    if (run.rolling) {
      if (!run.rollStart) run.rollStart = ts;
      const ev = stepPhysics(run.ball, run.course, run.cfg, dt, run);
      if (ev || ts - run.rollStart > SAFETY_MAX_ROLL_MS) { endAttempt(ev === 'goal', ev || 'weak'); return; }
    } else if (run.keyCharging && performance.now() - run.keyChargeStart > MAX_HOLD_MS + 400) {
      launchFromKeyboard();
    }
    draw();
    if (run && run.phase === 'play') run.raf = requestAnimationFrame(loop);
  }

  // Pure-ish physics step: mutates `ball` in place, returns 'goal' | 'over' | 'hazard' | 'weak' |
  // null (still in motion). Shared between the real run loop and the aim-preview path below.
  function stepPhysics(ball, course, cfg, dt, state) {
    const steps = dt > 0.018 ? 2 : 1, sdt = dt / steps;
    let result = null;
    for (let s = 0; s < steps && !result; s++) {
      ball.x += ball.vx * sdt; ball.y += ball.vy * sdt;
      if (ball.x < MARGIN_X + BALL_R) { ball.x = MARGIN_X + BALL_R; ball.vx = -ball.vx * REST_WALL; }
      if (ball.x > W - MARGIN_X - BALL_R) { ball.x = W - MARGIN_X - BALL_R; ball.vx = -ball.vx * REST_WALL; }
      if (ball.y > BOTTOM_WALL_Y - BALL_R) { ball.y = BOTTOM_WALL_Y - BALL_R; ball.vy = -ball.vy * REST_WALL; }
      if (ball.y < TOP_WALL_Y + BALL_R) {
        const inSlot = ball.x > GOAL_CX - course.slotHalf + BALL_R * 0.3 && ball.x < GOAL_CX + course.slotHalf - BALL_R * 0.3;
        if (inSlot) {
          const speed = Math.hypot(ball.vx, ball.vy);
          result = speed <= cfg.maxEnterSpeedFrac * MAX_SPEED ? 'goal' : 'over';
          break;
        }
        ball.y = TOP_WALL_Y + BALL_R; ball.vy = -ball.vy * REST_WALL;
      }
      for (const b of course.bumpers) if (collideCircle(ball, b, REST_BUMPER)) { /* bump */ }
      if (course.keeper) {
        const kx = GOAL_CX + course.keeperAmp * Math.sin((state ? state.keeperT : 0) * course.keeperSpeed);
        if (collideCircle(ball, { x: kx, y: course.keeperY, r: course.keeperR }, REST_KEEPER)) { if (state) state.touchedKeeper = true; }
      }
      for (const hz of course.hazards) {
        if (Math.hypot(ball.x - hz.x, ball.y - hz.y) < hz.r * 0.78) { result = 'hazard'; break; }
      }
      if (result) break;
      const fr = Math.pow(cfg.friction, sdt * 60);
      ball.vx *= fr; ball.vy *= fr;
    }
    if (!result) {
      const speed = Math.hypot(ball.vx, ball.vy);
      if (state) {
        if (speed < STOP_EPS) { state.stopFrames = (state.stopFrames || 0) + 1; if (state.stopFrames > STOP_FRAMES_NEEDED) result = state.touchedKeeper ? 'saved' : 'weak'; }
        else state.stopFrames = 0;
        if (state.trail) { state.trail.push({ x: ball.x, y: ball.y }); if (state.trail.length > 14) state.trail.shift(); }
      }
    }
    return result;
  }

  function collideCircle(ball, obstacle, rest) {
    const dx = ball.x - obstacle.x, dy = ball.y - obstacle.y, dist = Math.hypot(dx, dy), minDist = BALL_R + obstacle.r;
    if (dist > 0.0001 && dist < minDist) {
      const nx = dx / dist, ny = dy / dist, overlap = minDist - dist;
      ball.x += nx * overlap; ball.y += ny * overlap;
      const vn = ball.vx * nx + ball.vy * ny;
      if (vn < 0) { ball.vx -= (1 + rest) * vn * nx; ball.vy -= (1 + rest) * vn * ny; }
      return true;
    }
    return false;
  }

  function endAttempt(scored, reason) {
    if (scored) run.goals++;
    run.lastReason = reason;
    if (run.raf) cancelAnimationFrame(run.raf);
    run.phase = 'feedback';
    updateHud();
    drawFeedback(scored, reason);
    try { window.ZIVOZONE?.Events?.emit?.('PITCH_ARENA_ATTEMPT_RESULT', { level: run.level, attempt: run.attempt, scored, reason, goals: run.goals }); } catch (_) {}
    setTimeout(() => {
      if (!run) return;
      if (run.goals >= run.cfg.goalsNeeded) return levelResult(true);
      run.attempt++;
      if (run.attempt > run.cfg.attempts) return levelResult(false);
      run.phase = 'play';
      startAttempt();
    }, 900);
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
      const chapterJustFinished = firstClear && CHAPTERS.find(c => c.to === run.level);
      if (chapterJustFinished && window.ZIVOZONE?.Economy?.credit) {
        window.ZIVOZONE.Economy.credit(CHAPTER_REWARD, { type: 'pitch_chapter_reward', source: 'pitch_arena', claimId: chapterJustFinished.claimId, label: t(chapterJustFinished.nameKey) }).catch(() => {});
      }
      const chapterDone = chapterJustFinished && !allClear;
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

  function canvasPoint(e, c) {
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }

  function pullVector() {
    // Direction the ball will travel = ball position minus the drag point (a slingshot pull).
    const dx = run.ball.x - run.drag.x, dy = run.ball.y - run.drag.y;
    const dist = Math.hypot(dx, dy);
    return { dx, dy, dist };
  }

  function launchFromDrag() {
    const { dx, dy, dist } = pullVector();
    run.aiming = false;
    if (dist < MIN_PULL) return; // too small a pull: treated as a cancelled aim, not a shot
    const power = clamp(dist / MAX_PULL, 0, 1);
    const nx = dx / dist, ny = dy / dist;
    run.ball.vx = nx * power * MAX_SPEED;
    run.ball.vy = ny * power * MAX_SPEED;
    run.rolling = true; run.rollStart = 0; run.stopFrames = 0;
    updateHud();
  }

  function launchFromKeyboard() {
    const power = clamp((performance.now() - run.keyChargeStart) / MAX_HOLD_MS, 0, 1);
    run.keyCharging = false;
    if (power < 0.08) return;
    run.ball.vx = Math.cos(run.keyAimAngle) * power * MAX_SPEED;
    run.ball.vy = Math.sin(run.keyAimAngle) * power * MAX_SPEED;
    run.rolling = true; run.rollStart = 0; run.stopFrames = 0;
    updateHud();
  }

  function bindInput() {
    const c = run.canvas;
    c.style.touchAction = 'none';
    on(c, 'pointerdown', e => {
      if (run.rolling || run.phase !== 'play') return;
      run.aiming = true;
      run.drag = canvasPoint(e, c);
    });
    on(window, 'pointermove', e => {
      if (!run.aiming) return;
      run.drag = canvasPoint(e, c);
    });
    const release = () => { if (run && run.aiming) launchFromDrag(); };
    on(window, 'pointerup', release);
    on(window, 'pointercancel', release);

    on(document, 'keydown', e => {
      if (!run || run.rolling || run.phase !== 'play') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); run.keyAimAngle -= 0.05; }
      else if (e.key === 'ArrowRight') { e.preventDefault(); run.keyAimAngle += 0.05; }
      else if ((e.key === ' ' || e.code === 'Space') && !run.keyCharging && !e.repeat) { e.preventDefault(); run.keyCharging = true; run.keyChargeStart = performance.now(); }
    });
    on(document, 'keyup', e => { if (run && run.keyCharging && (e.key === ' ' || e.code === 'Space')) launchFromKeyboard(); });
  }

  // ---------------------------------------------------------------- drawing ----
  function pitchBg(ctx, chapter) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, chapter.bg[0]); g.addColorStop(1, chapter.bg[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (chapter.stripes) {
      const stripeW = W / 7;
      ctx.fillStyle = 'rgba(255,255,255,.035)';
      for (let i = 0; i < 7; i += 2) ctx.fillRect(i * stripeW, 0, stripeW, H);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2;
    ctx.strokeRect(MARGIN_X, TOP_WALL_Y, W - MARGIN_X * 2, BOTTOM_WALL_Y - TOP_WALL_Y);
  }

  function drawGoal(ctx, course) {
    const half = course.slotHalf;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(MARGIN_X, TOP_WALL_Y); ctx.lineTo(GOAL_CX - half, TOP_WALL_Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(GOAL_CX + half, TOP_WALL_Y); ctx.lineTo(W - MARGIN_X, TOP_WALL_Y); ctx.stroke();
    ctx.strokeStyle = 'rgba(93,224,160,.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(GOAL_CX - half, TOP_WALL_Y); ctx.lineTo(GOAL_CX - half, TOP_WALL_Y - 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(GOAL_CX + half, TOP_WALL_Y); ctx.lineTo(GOAL_CX + half, TOP_WALL_Y - 12); ctx.stroke();
    // net hatching behind the goal line, purely decorative
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1;
    for (let x = GOAL_CX - half + 6; x < GOAL_CX + half; x += 8) { ctx.beginPath(); ctx.moveTo(x, TOP_WALL_Y - 2); ctx.lineTo(x, TOP_WALL_Y - 16); ctx.stroke(); }
  }

  function drawBumpers(ctx, course, chapter) {
    for (const b of course.bumpers) {
      const g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 1, b.x, b.y, b.r);
      g.addColorStop(0, chapter.id === 1 ? '#ffe39a' : '#bfe8ff');
      g.addColorStop(1, chapter.id === 1 ? '#d98a2b' : '#3f8fc9');
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }

  function drawHazards(ctx, course, ts) {
    for (const hz of course.hazards) {
      const g = ctx.createRadialGradient(hz.x, hz.y, 1, hz.x, hz.y, hz.r);
      g.addColorStop(0, '#000'); g.addColorStop(1, '#2a0a0a');
      ctx.beginPath(); ctx.arc(hz.x, hz.y, hz.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.translate(hz.x, hz.y); ctx.rotate((reduceMotion() ? 0 : ts / 900));
      ctx.strokeStyle = 'rgba(255,90,90,.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.arc(0, 0, hz.r * 0.72, 0, Math.PI * 1.5); ctx.stroke();
      ctx.restore();
    }
  }

  function drawKeeper(ctx, course, keeperT) {
    if (!course.keeper) return;
    const kx = GOAL_CX + course.keeperAmp * Math.sin(keeperT * course.keeperSpeed);
    ctx.beginPath(); ctx.arc(kx, course.keeperY, course.keeperR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd96b'; ctx.fill();
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🧤', kx, course.keeperY + 5);
  }

  function drawBall(ctx, ball, trail) {
    (trail || []).forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, BALL_R * (0.3 + 0.4 * (i / Math.max(1, trail.length))), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.04 + 0.05 * (i / Math.max(1, trail.length))})`; ctx.fill();
    });
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = '#f4f6ff'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.stroke();
  }

  function drawAim(ctx) {
    const { dx, dy, dist } = pullVector();
    if (dist < 2) return;
    const power = clamp(dist / MAX_PULL, 0, 1);
    const nx = dx / dist, ny = dy / dist;
    // dashed guide line in the direction the ball will actually travel (opposite the drag)
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = `rgba(93,224,160,${0.35 + power * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(run.ball.x, run.ball.y);
    ctx.lineTo(run.ball.x + nx * 60 * (0.4 + power), run.ball.y + ny * 60 * (0.4 + power));
    ctx.stroke();
    ctx.restore();
    // the pull-back itself, drawn as a taut line from the ball to the drag point
    ctx.strokeStyle = 'rgba(255,217,107,.85)'; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(run.ball.x, run.ball.y); ctx.lineTo(run.drag.x, run.drag.y); ctx.stroke();
    drawPowerBar(ctx, power);
  }

  function drawPowerBar(ctx, power) {
    const barY = H - 20, barW = W - 24, barX = 12;
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(barX, barY, barW, 10);
    const safeFrac = clamp(run.cfg.maxEnterSpeedFrac, 0, 1);
    ctx.fillStyle = 'rgba(93,224,160,.3)'; ctx.fillRect(barX, barY, barW * safeFrac, 10);
    ctx.fillStyle = power > safeFrac ? '#ff6e6e' : '#ffd96b';
    ctx.fillRect(barX, barY, barW * power, 10);
  }

  function draw() {
    const { ctx } = run;
    pitchBg(ctx, run.chapter);
    drawGoal(ctx, run.course);
    drawBumpers(ctx, run.course, run.chapter);
    drawHazards(ctx, run.course, performance.now());
    drawKeeper(ctx, run.course, run.keeperT);
    drawBall(ctx, run.ball, run.trail);
    if (run.aiming) drawAim(ctx);
    else if (run.keyCharging) {
      const power = clamp((performance.now() - run.keyChargeStart) / MAX_HOLD_MS, 0, 1);
      const nx = Math.cos(run.keyAimAngle), ny = Math.sin(run.keyAimAngle);
      ctx.strokeStyle = 'rgba(93,224,160,.7)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(run.ball.x, run.ball.y); ctx.lineTo(run.ball.x + nx * 70, run.ball.y + ny * 70); ctx.stroke();
      ctx.setLineDash([]);
      drawPowerBar(ctx, power);
    } else if (!run.rolling) {
      // idle aim-direction hint (keyboard default) so the control scheme is discoverable at a glance
      const nx = Math.cos(run.keyAimAngle), ny = Math.sin(run.keyAimAngle);
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(run.ball.x, run.ball.y); ctx.lineTo(run.ball.x + nx * 40, run.ball.y + ny * 40); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawFeedback(scored, reason) {
    const { ctx } = run;
    pitchBg(ctx, run.chapter);
    drawGoal(ctx, run.course);
    drawBumpers(ctx, run.course, run.chapter);
    drawHazards(ctx, run.course, performance.now());
    ctx.textAlign = 'center';
    ctx.font = '38px sans-serif';
    ctx.fillText(scored ? '⚽🎉' : (reason === 'hazard' ? '🕳️' : '🧤'), W / 2, H / 2);
    ctx.font = '15px sans-serif'; ctx.fillStyle = '#e8eeff';
    ctx.fillText(t(scored ? 'ptaGoalScored' : (reason === 'hazard' ? 'ptaTackled' : (reason === 'saved' ? 'ptaSaved' : (reason === 'over' ? 'ptaOverBar' : 'ptaWeak')))), W / 2, H / 2 + 34);
  }

  function open() { renderMap(); }

  document.addEventListener('click', e => { if (e.target.closest('[data-pitch-arena]')) { e.preventDefault(); open(); } });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-pitch-arena]')) { e.preventDefault(); open(); } });

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.PitchArena = Object.freeze({ open, state: readState });
  // Exposed for the standalone physics-verification script only — not used by any gameplay code
  // path above, and harmless to read (it's just the formulas, no player state).
  window.ZIVOZONE.__pitchArenaInternals = Object.freeze({ PITCH_LEVELS, buildCourse, stepPhysics, collideCircle, W, H, BALL_START, MAX_SPEED, MAX_PULL, MIN_PULL });
})();
