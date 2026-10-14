/* ZIVOZONE V1230.29 — "Epic 50" shared engine.
   Evolution of the 10-level mini-game engine built into challenges.js's runner.startMiniGame()
   (same helper shapes: lerp/rint/addTimer/addInterval/addListener/cleanupLevel/flash/winLevel/
   loseLevel/point/clear/txt/emoji/button/countdown — this is that exact pattern, generalized so
   six standalone "signature" rooms (Dark Room, Forensic Lab, Puzzle Room, Beauty Room, Story Room,
   Health World) can each mount their own 50-level game without re-implementing the scaffolding.

   Difficulty here escalates on TWO axes at once, by design (the user asked for "stages that
   advance, not one dimension that just increases"):
     1. Continuous, inside each 10-level "band" — the existing lerp(bandLevel,a,b) pattern.
     2. Discrete, across 5 bands — each room's archFn receives the band index and is expected to
        switch on genuinely new mechanics per band (new obstacle types, reversed rules, added
        threats), not just faster numbers. The engine enforces the shape (5 bands × 10 levels,
        one named "twist" per band shown on the transition screen) but the per-band mechanic is
        each room's own design.

   A room mounts this into ITS OWN container (its own root/shell/exit button stay the room's
   responsibility — this engine only owns the inner play area), via:

     window.ZIVOZONE_EPIC50.mount(containerEl, {
       id, names:{ar,en,...}, icon,
       bands: [ {names:{ar,en,...}, twist:{ar,en,...}} ×5 ],
       archFn(band, bandLevel, api) { ...use api to run that level... },
       onExit(), onFinish(won, score, level)
     });

   api given to archFn: lerp, rint, addTimer, addInterval, addListener, point, clear, txt, emoji,
   button, countdown, setStatus, winLevel, loseLevel, ctx, W, H, controls.
*/
(() => {
  "use strict";
  const esc = window.ZIVOZONE_ESC || (s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const fmt = (k, vars) => Object.entries(vars || {}).reduce((s, [key, val]) => s.replace(`{${key}}`, val), t(k));
  const lang = () => { try { return document.documentElement.lang || "ar"; } catch (_) { return "ar"; } };
  const localized = (dict, fallback) => (dict && (dict[lang()] || dict.en || dict.ar)) || fallback || "";

  const MAXLV = 50, BANDS = 5, PER_BAND = 10;
  const bandOf = lv => Math.min(BANDS, Math.ceil(lv / PER_BAND));
  const bandLevelOf = lv => ((lv - 1) % PER_BAND) + 1;

  function mount(container, cfg) {
    if (!container) return;
    const W = 900, H = 500;
    // V1230.59 — optional cfg.startLevel, added for Light Escape's "continue from saved level"
    // screen. Every existing caller omits it, so this is purely additive: level still defaults to 1.
    const startLevel = Number.isFinite(cfg.startLevel) ? Math.min(MAXLV, Math.max(1, Math.round(cfg.startLevel))) : 1;
    let level = startLevel, lives = 3, score = 0, ended = false, raf = 0, timers = [], listeners = [], activeDuel = null;

    const lerp = (lv, a, b) => a + (b - a) * (Math.min(PER_BAND, Math.max(1, lv)) - 1) / (PER_BAND - 1);
    const rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
    const clearTimers = () => { timers.forEach(h => { clearTimeout(h); clearInterval(h); }); timers = []; };
    const clearListeners = () => { listeners.forEach(([el, ev, fn]) => { try { el.removeEventListener(ev, fn); } catch (_) {} }); listeners = []; };
    const addTimer = (fn, ms) => { const h = setTimeout(fn, ms); timers.push(h); return h; };
    const addInterval = (fn, ms) => { const h = setInterval(fn, ms); timers.push(h); return h; };
    const addListener = (el, ev, fn) => { el.addEventListener(ev, fn); listeners.push([el, ev, fn]); };
    const stopLoop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const cleanupLevel = () => { stopLoop(); clearTimers(); clearListeners(); };

    const gameName = localized(cfg.names, cfg.id);
    // V1230.92 — these were plain consts assigned right after an unconditional container.innerHTML
    // write. Now that a duel-intro banner (see bottom of mount()) may need to occupy the container
    // FIRST and only build the actual game shell once it's dismissed, the shell markup/refs move into
    // buildShell() below, called either immediately (no duel) or from the banner's button handler.
    let c, ctx, controls, status, wrap, bandbarEl, levelnumEl, livesEl;
    const resize = () => { const w = Math.min(W, Math.max(300, container.clientWidth - 20)); const scale = w / W; c.style.width = w + "px"; c.style.height = (H * scale) + "px"; };
    function buildShell() {
      container.innerHTML = `<div class="zrg-shell epic50 ${esc(cfg.shellClass || "")}" dir="rtl">
        <div class="zrg-head"><div><span>${esc(t("epic50Tag"))}</span><h3>${esc(gameName)}</h3></div><div><b id="e50-score">0</b><small>${esc(t("epic50Points"))}</small></div></div>
        <div class="zrg-hud epic50-hud">
          <div class="zrg-bandbar" id="e50-bandbar"></div>
          <div class="zrg-levelnum" id="e50-levelnum"></div>
          <div class="zrg-lives" id="e50-lives"></div>
        </div>
        <div class="zrg-canvas-wrap"><canvas id="e50-canvas" width="${W}" height="${H}" aria-label="${esc(gameName)}"></canvas></div>
        <div class="zrg-controls" id="e50-controls"></div>
        <div class="zrg-status" id="e50-status"></div>
      </div>`;
      c = container.querySelector("#e50-canvas"); ctx = c.getContext("2d");
      controls = container.querySelector("#e50-controls"); status = container.querySelector("#e50-status");
      wrap = container.querySelector(".zrg-canvas-wrap");
      bandbarEl = container.querySelector("#e50-bandbar"); levelnumEl = container.querySelector("#e50-levelnum"); livesEl = container.querySelector("#e50-lives");
      // Same bidi fix as the 10-level engine: this canvas also sits inside a dir="rtl" shell.
      ctx.direction = "ltr";
      resize(); addListener(window, "resize", resize);
    }

    const renderHud = () => {
      const band = bandOf(level), bLv = bandLevelOf(level);
      bandbarEl.innerHTML = "";
      for (let b = 1; b <= BANDS; b++) {
        const seg = document.createElement("span");
        seg.className = "zrg-band" + (b < band ? " done" : "") + (b === band ? " current" : "");
        const fill = document.createElement("i");
        if (b < band) fill.style.width = "100%"; else if (b === band) fill.style.width = (bLv / PER_BAND * 100) + "%"; else fill.style.width = "0%";
        seg.appendChild(fill);
        bandbarEl.appendChild(seg);
      }
      levelnumEl.textContent = fmt("epic50LevelLabel", { level, max: MAXLV });
      livesEl.innerHTML = "";
      for (let i = 0; i < 3; i++) { const s = document.createElement("i"); s.textContent = "❤"; if (i >= lives) s.classList.add("spent"); livesEl.appendChild(s); }
      const scoreEl = container.querySelector("#e50-score"); if (scoreEl) scoreEl.textContent = score;
    };
    const setStatus = txt => { if (status) status.textContent = txt; };

    const flash = (kind, titleTxt, sub, after) => {
      cleanupLevel();
      const f = document.createElement("div");
      f.className = "zrg-flash " + kind;
      f.innerHTML = `<div><h4>${esc(titleTxt)}</h4><small>${esc(sub)}</small></div>`;
      wrap.appendChild(f);
      addTimer(() => { f.remove(); if (!ended) after && after(); }, kind === "lose" ? 1000 : (kind === "band" ? 1700 : 800));
    };

    const finishGame = won => {
      ended = true; cleanupLevel();
      const sub = won
        ? esc(t("epic50Victory"))
        : (esc(t("epic50Reached")) + " " + level + "/" + MAXLV + (level === MAXLV ? ` <span class="zrg-final-badge">${esc(t("miniFinalLevelTag"))}</span>` : ""));
      // V1230.92 — "Challenge a friend" (duel): shared across all six Epic50 rooms in one place
      // instead of wiring each room's own result screen separately. scorePct is "how far did you
      // get" (level/MAXLV), a comparable 0-100 number across replays, unlike the open-ended raw
      // score (which depends on level reached AND per-level bonuses). shareGameId/shareName are
      // supplied by each caller (see this file's header comment) because this engine has no way to
      // know which real page a given room's duel/share link should point visitors at.
      const scorePct = Math.round(level / MAXLV * 100);
      const shareGameId = cfg.shareGameId || "";
      const shareName = cfg.shareName || gameName;
      const duelWas = activeDuel; activeDuel = null;
      let duelResultLine = "";
      if (duelWas) {
        const oscore = Number(duelWas.score) || 0;
        duelResultLine = `<p class="zrg-duel-result">${esc(scorePct > oscore ? fmt("duelResultWin", { name: duelWas.name, score: scorePct, oscore }) : scorePct < oscore ? fmt("duelResultLose", { name: duelWas.name, score: scorePct, oscore }) : fmt("duelResultTie", { name: duelWas.name }))}</p>`;
      }
      container.innerHTML = `<div class="zrg-result epic50-result" dir="rtl"><div class="zrg-result-orb">${cfg.icon || "🎮"}</div><small>${esc(gameName)}</small><strong>${score}</strong><span>${esc(t("epic50Points"))}</span><p>${sub}</p>${duelResultLine}
        <button class="e50-restart">${esc(t("miniPlayAgain"))}</button>
        <button class="e50-share">${esc(t("shareResultCta"))}</button>
        <button class="e50-duel">${esc(t("duelChallengeCta"))}</button>
        <button class="e50-exit">${esc(t("epic50Back"))}</button></div>`;
      container.querySelector(".e50-restart").onclick = () => mount(container, cfg);
      container.querySelector(".e50-share").onclick = () => { window.ZIVOZONE?.Share?.share?.({ gameId: shareGameId, score: scorePct, challengeName: shareName }); };
      container.querySelector(".e50-duel").onclick = () => { window.ZIVOZONE?.Share?.duel?.({ gameId: shareGameId, score: scorePct, challengerName: window.ZIVOZONE?.Player?.get?.()?.name, challengeName: shareName }); };
      container.querySelector(".e50-exit").onclick = () => { try { cfg.onFinish && cfg.onFinish(won, score, level); } catch (_) {} try { cfg.onExit && cfg.onExit(); } catch (_) {} };
      try { cfg.onFinish && cfg.onFinish(won, score, level); } catch (_) {}
    };

    const winLevel = (bonus = 0) => {
      score += 10 * level + bonus;
      if (level >= MAXLV) { renderHud(); finishGame(true); return; }
      const nextLv = level + 1;
      const crossingBand = bandOf(nextLv) !== bandOf(level);
      if (crossingBand) {
        lives = Math.min(3, lives + 1);
        const bIdx = bandOf(nextLv);
        const bDef = (cfg.bands || [])[bIdx - 1] || {};
        flash("band", localized(bDef.names, fmt("epic50BandFallback", { n: bIdx })), localized(bDef.twist, ""), () => { level = nextLv; renderHud(); run(); });
      } else {
        flash("win", t("miniLevelUpTitle"), fmt("epic50LevelLabel", { level: nextLv, max: MAXLV }), () => { level = nextLv; renderHud(); run(); });
      }
      renderHud();
    };
    const loseLevel = () => {
      lives--; renderHud();
      if (lives <= 0) { finishGame(false); return; }
      flash("lose", t("miniTryAgain"), fmt("epic50LevelLabel", { level, max: MAXLV }), () => run());
    };

    const point = e => { const r = c.getBoundingClientRect(); const cx = (e.touches ? e.touches[0].clientX : e.clientX), cy = (e.touches ? e.touches[0].clientY : e.clientY); return { x: (cx - r.left) * W / r.width, y: (cy - r.top) * H / r.height }; };
    const clear = () => { ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#07111d"; ctx.fillRect(0, 0, W, H); };
    const txt = (label, x, y, size = 24, align = "center", color = "#fff") => { ctx.fillStyle = color; ctx.font = `800 ${size}px Cairo,Arial`; ctx.textAlign = align; ctx.fillText(label, x, y); };
    const emoji = (label, x, y, size = 36) => { ctx.font = `${size}px sans-serif`; ctx.textAlign = "center"; ctx.fillText(label, x, y); };
    const button = (label, fn) => { const b = document.createElement("button"); b.className = "zrg-btn"; b.textContent = label; b.onclick = fn; controls.appendChild(b); return b; };
    const countdown = (secs, onTimeout) => {
      let left = secs;
      const label = () => fmt("epic50LevelLabel", { level, max: MAXLV }) + ` — ${Math.ceil(left)}s`;
      setStatus(label());
      addInterval(() => { left -= 0.1; if (left <= 0) onTimeout(); else setStatus(label()); }, 100);
    };

    // V1230.92 — ctx/canvas/controls are getters, not plain values: this object is built once, but
    // c/ctx/controls are undefined until buildShell() runs (which may happen after a duel banner is
    // dismissed, i.e. after this object already exists) — a plain-value copy here would freeze in
    // "undefined" and never update, breaking every archFn that reads api.ctx/api.canvas/api.controls.
    const api = { lerp, rint, addTimer, addInterval, addListener, point, clear, txt, emoji, button, countdown, setStatus, winLevel, loseLevel, get ctx() { return ctx; }, get canvas() { return c; }, W, H, get controls() { return controls; } };

    function run() {
      cleanupLevel();
      controls.innerHTML = ""; setStatus("");
      const band = bandOf(level), bLv = bandLevelOf(level);
      try { cfg.archFn(band, bLv, api); } catch (err) { console.error("ZIVOZONE Epic50 archFn error:", err); setStatus(String(err && err.message || err)); }
    }

    // V1230.92 — "Challenge a friend" (duel): if this mount was opened via a duel link
    // (?challenger=&cscore=), show the inviter's name/score before the game starts, same pattern
    // as challenges.js/puzzle-room.js/beauty-room.js/horror-room.js's maybeShowDuelIntro. Runs once
    // per mount() call (a restart via the "Play again" button calls mount() again, but by then the
    // URL's duel params have already been consumed/stripped, so the banner correctly shows only once).
    const duelParams = window.ZIVOZONE?.Share?.consumeDuelParams?.();
    if (duelParams) {
      activeDuel = duelParams;
      container.innerHTML = `<div class="zrg-duel-intro" dir="${document.documentElement.dir || "rtl"}"><div class="zrg-duel-badge">⚔️</div><h2>${esc(fmt("duelInviteBannerTitle", { name: duelParams.name }))}</h2><p>${esc(fmt("duelInviteBannerBody", { name: duelParams.name, score: duelParams.score, challenge: gameName }))}</p><button type="button" class="zrg-duel-start btn btn-primary full">${esc(t("duelInviteStartCta"))}</button></div>`;
      container.querySelector(".zrg-duel-start").onclick = () => { buildShell(); renderHud(); run(); };
    } else {
      buildShell(); renderHud(); run();
    }
    return { stop: () => { ended = true; cleanupLevel(); } };
  }

  window.ZIVOZONE_EPIC50 = Object.freeze({ version: "1230.59", mount, MAXLV, BANDS, PER_BAND });
})();
