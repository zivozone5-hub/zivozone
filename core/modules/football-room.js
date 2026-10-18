/* ZIVOZONE V1230.70 — "Football Pitch" signature room: a real Epic50 game, the genuine gap found
   while auditing whether every ZIVOZONE room already has its own dedicated mini-game. It did NOT:
   all six other signature rooms (Dark Room, Puzzle Room, Beauty Room, Forensic Lab, Story Room,
   Health World) already had one, verified live via Playwright before writing a single line here —
   this file adds the one that was missing, on the SAME shared engine (epic50.js) every other room
   already proved out, not a new engine.

   GAME: "Reading the Pitch" (قراءة الملعب). A tactics board: a formation of teammates is shown on a
   mini pitch, one of them glows (the ball is about to arrive). Tap the correct player before the
   decision window closes. Difficulty escalates on the same two axes epic50.js already enforces:
     - continuous within a band (faster window, via lerp)
     - a new STRUCTURAL rule every 10 levels (band), specific to this room:
       Band 1 "First Read": the glowing player IS the answer — tap him directly.
       Band 2 "Opening the Lane": a defender marks the glowing player; the real answer is now his
         free teammate (the other half of a passing pair), not the marked man himself.
       Band 3 "Repositioning": the formation reshuffles after every correct pass — memorize the
         shirt number, not the screen position.
       Band 4 "Switching Flanks": the whole pitch mirrors left/right — the same pairing logic, but
         spatially reversed.
       Band 5 "The Decisive Moment": every rule above, at the fastest tempo, through level 50.
   This is the same proven difficulty-curve math beauty-room.js's "Perfect Touch" game already
   shipped and tested (pairMode/reshuffleMode/mirrorMode/chainLen) — reused deliberately rather than
   inventing a new, unverified curve — but the rendering, theme, and copy are entirely football's own
   (a pitch, numbered jerseys, a ball marker, defender markers), so it reads as a genuinely distinct
   room, not a recolored duplicate.

   This room has no separate "basic" mini-game layer (unlike Puzzle/Beauty Room, which keep an older
   simpler game alongside their Epic50 game) — the whole room IS the Epic50 game, same shape as Dark
   Room's "Light Escape": one intro screen, then straight into the 50-level game.

   Reward wiring: football_epic_reward (full 50-level clear only, value 5) added to economy.js's
   credit() AND firestore.rules' rewardTypeValid()/rewardAmountValid()/validRewardClaim() in the SAME
   change — learning from the 1230.59/1230.60 history documented in those files, where every other
   room's epic reward type was added to only one side first and silently rejected for a while.
*/
(() => {
  "use strict";
  const esc = window.ZIVOZONE_ESC;
  const A = () => window.ZIVOZONE_AUDIO;
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const fmt = (k, vars) => Object.entries(vars || {}).reduce((s, [key, val]) => s.replace(`{${key}}`, val), t(k));
  const EL = () => document.documentElement.lang || "ar";
  const L = dict => (dict && (dict[EL()] || dict.en || dict.ar)) || "";

  const PROGRESS_KEY = "zivo_tactics_progress";
  function progress() { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); } catch (_) { return {}; } }
  function saveProgress(patch) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(Object.assign(progress(), patch))); } catch (_) {} }

  const E50 = window.ZIVOZONE_EPIC50;
  const PER_BAND = E50?.PER_BAND || 10, MAXLV = E50?.MAXLV || 50;

  // ---------------------------------------------------------------------------------------------
  // "Epic Bands" — per-room flavor text (names/twist), inline multi-language dict, same pattern as
  // horror-room.js/puzzle-room.js/beauty-room.js's EPIC_NAME_*/EPIC_BANDS_* content (registered in
  // scripts/qa_no_hardcoded_arabic.py's CONTENT_FILES for the same reason: per-room game content,
  // not UI chrome that should go through i18n.js — the room's actual UI chrome, below, DOES use
  // t()/i18n.js keys added via scripts/add_i18n_keys.py, same as every other room's intro screen).
  // ---------------------------------------------------------------------------------------------
  const EPIC_NAME_FT = { ar: "قراءة الملعب", en: "Reading the Pitch", zh: "解读球场", hi: "मैदान को पढ़ना", es: "Leer la Cancha", fr: "Lire le Terrain", fa: "خوانش زمین" };
  const EPIC_BANDS_FT = [
    { names: { ar: "القراءة الأولى", en: "First Read", zh: "初次解读", hi: "पहली समझ", es: "Primera Lectura", fr: "Première Lecture", fa: "خوانش نخست" },
      twist: { ar: "لاعب واحد مفتوح دون رقيب. اضغط عليه قبل أن تُغلق النافذة.", en: "One teammate stands open, unmarked. Tap him before the window closes.", zh: "一名队友完全空位无人盯防。在窗口关闭前点击他。", hi: "एक साथी बिना किसी निगरानी के खुला है। खिड़की बंद होने से पहले उसे टैप करें।", es: "Un compañero está completamente libre, sin marca. Tócalo antes de que se cierre la ventana.", fr: "Un coéquipier est complètement démarqué. Touchez-le avant que la fenêtre ne se ferme.", fa: "یک هم‌تیمی کاملاً بدون مراقبت باز است. قبل از بسته شدن پنجره او را لمس کن." } },
    { names: { ar: "فتح الخط", en: "Opening the Lane", zh: "打开传球线路", hi: "लाइन खोलना", es: "Abrir la Línea", fr: "Ouvrir la Ligne", fa: "باز کردن خط پاس" },
      twist: { ar: "المدافع يلتصق باللاعب المضيء. مرّر للاعب الحر الآخر، لا للاعب المرصود.", en: "A defender clings to the glowing player. Pass to the OTHER free man, not the marked one.", zh: "后卫紧贴发光的球员。传给另一名自由队员，而不是被盯防的那个。", hi: "डिफेंडर चमकते खिलाड़ी से चिपका है। निशाने वाले को नहीं, दूसरे खुले खिलाड़ी को पास करें।", es: "Un defensor se pega al jugador que brilla. Pasa al OTRO hombre libre, no al marcado.", fr: "Un défenseur colle au joueur qui brille. Faites la passe à l'AUTRE homme libre, pas au marqué.", fa: "یک مدافع به بازیکن درخشان می‌چسبد. به مرد آزاد دیگر پاس بده، نه به کسی که مراقبت می‌شود." } },
    { names: { ar: "إعادة التمركز", en: "Repositioning", zh: "重新站位", hi: "पुनःस्थिति", es: "Reposicionamiento", fr: "Repositionnement", fa: "بازآرایی" },
      twist: { ar: "التشكيلة تتبدّل بعد كل تمريرة صحيحة. لا تحفظ المكان؛ احفظ القميص.", en: "The formation rotates after every correct pass. Don't memorize the spot — memorize the shirt.", zh: "每次传球成功后，阵型都会轮换。别记位置，记号码。", hi: "हर सही पास के बाद फॉर्मेशन बदल जाता है। जगह मत याद रखो; जर्सी याद रखो।", es: "La formación rota después de cada pase correcto. No memorices el lugar; memoriza la camiseta.", fr: "La formation tourne après chaque passe réussie. Ne retenez pas la place ; retenez le maillot.", fa: "آرایش تیم پس از هر پاس درست می‌چرخد. مکان را به خاطر نسپار؛ پیراهن را به خاطر بسپار." } },
    { names: { ar: "تبديل الجهة", en: "Switching Flanks", zh: "换边进攻", hi: "पक्ष बदलना", es: "Cambio de Lado", fr: "Changement de Côté", fa: "تغییر جناح" },
      twist: { ar: "الهجمة تنتقل للجهة المعاكسة. ما كان على يمينك صار على يسارك الآن.", en: "The attack switches to the opposite flank. What was on your right is now your left.", zh: "进攻转向另一侧。原本在你右边的现在在你左边。", hi: "हमला दूसरी तरफ़ बदल जाता है। जो आपके दाईं ओर था वह अब आपके बाईं ओर है।", es: "El ataque cambia al lado opuesto. Lo que estaba a tu derecha ahora está a tu izquierda.", fr: "L'attaque bascule du côté opposé. Ce qui était à votre droite est maintenant à votre gauche.", fa: "حمله به سمت مخالف تغییر می‌کند. آنچه سمت راست تو بود اکنون سمت چپ توست." } },
    { names: { ar: "اللحظة الحاسمة", en: "The Decisive Moment", zh: "决定性瞬间", hi: "निर्णायक क्षण", es: "El Momento Decisivo", fr: "Le Moment Décisif", fa: "لحظهٔ سرنوشت‌ساز" },
      twist: { ar: "كل ما سبق مجتمعًا، بأسرع إيقاع. هكذا يُقرأ الملعب كمدرب محترف، حتى المستوى الخمسين.", en: "Everything before, combined, at the fastest tempo. This is how a professional coach reads the pitch — all the way to level 50.", zh: "前面的一切结合在一起，以最快的节奏。这就是职业教练解读球场的方式，直到第50关。", hi: "पहले की हर चीज़ मिलकर, सबसे तेज़ गति से। एक पेशेवर कोच मैदान को ऐसे ही पढ़ता है, स्तर 50 तक।", es: "Todo lo anterior combinado, al ritmo más rápido. Así lee la cancha un entrenador profesional, hasta el nivel 50.", fr: "Tout ce qui précède, combiné, au rythme le plus rapide. C'est ainsi qu'un entraîneur professionnel lit le terrain, jusqu'au niveau 50.", fa: "همه موارد قبلی با هم، با سریع‌ترین ریتم. این‌گونه است که یک مربی حرفه‌ای زمین را می‌خواند، تا مرحله ۵۰." } }
  ];

  // ---------------------------------------------------------------------------------------------
  // Game: a 3x2 formation of teammates on a drawn pitch. One glows (ball incoming). Band 2+ adds a
  // defender marker tied to the glowing player, which flips who the correct tap target actually is
  // (pairOf — same mechanic family as beauty-room.js's playStyle(), proven across 50 levels there).
  // ---------------------------------------------------------------------------------------------
  // V1230.76 — small canvas word-wrap helper for the persistent in-level rule hint (max 2 lines; a
  // 3rd line, if the text is still too long, is dropped rather than overflowing the pitch artwork).
  function wrapFtText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = String(text || "").split(" ");
    let line = "", lines = [];
    words.forEach(w => {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) lines = lines.slice(0, maxLines);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
  }

  function archFn(band, bandLv, api) {
    const { lerp, rint, addTimer, clear, ctx, point, addListener, winLevel, loseLevel, canvas, W, H, countdown } = api;
    const cols = 3, rows = 2, n = cols * rows;
    const pairMode = band >= 2, reshuffleMode = band >= 3, mirrorMode = band >= 4;
    const chainLen = Math.round(lerp(bandLv, 2, 4)) + (band >= 5 ? 1 : 0);
    const pairOf = i => (i % 2 === 0 ? i + 1 : i - 1);

    // pitch geometry
    const padX = 60, padTop = 150, padBottom = 40;
    const cellW = (W - padX * 2) / cols, cellH = (H - padTop - padBottom) / rows;
    let slots = [...Array(n).keys()];
    const shuffle = () => { for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; } };
    shuffle();
    const colOf = c => (mirrorMode ? cols - 1 - c : c);
    let target = rint(0, n - 1), hits = 0;
    const slotPos = slot => ({ x: padX + colOf(slot % cols) * cellW + cellW / 2, y: padTop + Math.floor(slot / cols) * cellH + cellH / 2 });

    const draw = () => {
      clear();
      // pitch background + markings
      ctx.save();
      ctx.fillStyle = "#0e3b22"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, W - 40, H - 40);
      ctx.beginPath(); ctx.moveTo(20, H / 2); ctx.lineTo(W - 20, H / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 46, 0, 7); ctx.stroke();
      ctx.restore();

      // ball indicator above the glowing target
      const tp = slotPos(target);
      ctx.save(); ctx.font = "26px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("⚽", tp.x, tp.y - 58);
      ctx.restore();

      // V1230.76 — the "who do I actually tap" confusion fix. Band 2+ used to mark the glowing
      // player with a red dashed ring and rely on the PRE-LEVEL instruction text alone ("pass to the
      // other free man") for the player to figure out which teammate that was — nothing on screen
      // ever showed WHICH teammate was free. Now: a bright dashed line is drawn from the marked
      // (glowing) player straight to his actual free teammate, and that teammate gets his own green
      // "tap here" ring, so the correct target is visually obvious every single level, not just
      // inferred from a rule read once at the start of the band.
      const correctSlot = pairMode ? pairOf(target) : target;
      if (pairMode) {
        const markedP = slotPos(target), freeP = slotPos(correctSlot);
        // connecting line: marked player -> his free teammate
        ctx.save();
        ctx.strokeStyle = "rgba(120,230,160,.8)"; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
        ctx.beginPath(); ctx.moveTo(markedP.x, markedP.y); ctx.lineTo(freeP.x, freeP.y); ctx.stroke();
        ctx.restore();
        // the defender tied to the glowing (marked) player — red, "don't tap this one"
        ctx.save();
        ctx.strokeStyle = "rgba(255,90,90,.9)"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(markedP.x, markedP.y, 34, 0, 7); ctx.stroke();
        ctx.restore();
        // the free teammate — green, "tap this one"
        ctx.save();
        ctx.strokeStyle = "#49e08f"; ctx.lineWidth = 3; ctx.shadowColor = "#49e08f"; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(freeP.x, freeP.y, 34, 0, 7); ctx.stroke();
        ctx.restore();
      }

      slots.forEach((shirt, slot) => {
        const p = slotPos(slot);
        const glowing = slot === target;
        const isFreeTarget = pairMode && slot === correctSlot;
        ctx.save();
        if (glowing) { ctx.shadowColor = "#ffe066"; ctx.shadowBlur = 20; }
        else if (isFreeTarget) { ctx.shadowColor = "#49e08f"; ctx.shadowBlur = 16; }
        ctx.fillStyle = glowing ? "#ffe066" : isFreeTarget ? "#d9fce7" : "#f3f6f9";
        ctx.beginPath(); ctx.arc(p.x, p.y, 28, 0, 7); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = glowing ? "#20160a" : "#0e3b22";
        ctx.font = "800 18px Cairo,Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(shirt + 1), p.x, p.y + 1);
        ctx.restore();
      });

      // Persistent, always-on-screen rule reminder for the current band (reuses the same 7-language
      // text already shown once on the band-transition screen via epic50.js's `flash()` — no new
      // translated content needed, just surfaced continuously instead of only at the band's start).
      const hint = L(EPIC_BANDS_FT[band - 1]?.twist);
      if (hint) {
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,.82)";
        ctx.font = "600 15px Cairo,Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        wrapFtText(ctx, hint, W / 2, 55, W - 100, 20, 2);
        ctx.restore();
      }
    };
    draw();

    const pulseSlot = slot => {
      const p = slotPos(slot);
      ctx.save(); ctx.shadowColor = "#fff"; ctx.shadowBlur = 28; ctx.strokeStyle = "#fff"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(p.x, p.y, 32, 0, 7); ctx.stroke(); ctx.restore();
    };

    const onClick = e => {
      const p = point(e);
      const slot = slots.findIndex((_, i) => { const sp = slotPos(i); return Math.hypot(p.x - sp.x, p.y - sp.y) < 34; });
      if (slot < 0) return;
      const correctSlot = pairMode ? pairOf(target) : target;
      if (slot === correctSlot) {
        hits++; pulseSlot(slot);
        try { A()?.playSfx?.("correct"); } catch (_) {}
        if (hits >= chainLen) { addTimer(() => winLevel(), 120); return; }
        addTimer(() => { if (reshuffleMode) shuffle(); target = rint(0, n - 1); draw(); }, 140);
      } else {
        try { A()?.playSfx?.("challenge_fail"); } catch (_) {}
        loseLevel();
      }
    };
    addListener(canvas, "pointerdown", onClick);
    countdown(lerp(bandLv, 20, 9) + chainLen, () => loseLevel());
  }

  function grantFootballEpicReward() {
    window.ZIVOZONE?.Economy?.credit?.(5, { type: "football_epic_reward", source: "football_room", football: "epic50", claimId: "football_epic50_clear" })
      .then(ok => { if (ok) window.ZIVOZONE?.Economy?.addXP?.(70); });
  }

  function root() { let r = document.getElementById("zivo-football-room"); if (!r) { r = document.createElement("div"); r.id = "zivo-football-room"; r.className = "zfr-root"; document.body.appendChild(r); } return r; }
  function close() { try { A()?.stopAmbient?.(); } catch (_) {} root().classList.remove("active"); document.body.classList.remove("zivo-football-active"); location.hash = "#home"; window.scrollTo?.({ top: 0, behavior: "instant" }); }
  function exitWithGuard() { const g = window.ZIVOZONE?.ExitGuard; if (g?.open) g.open(close, t("tacticsBackConfirm")); else close(); }

  function openGame(startLevel) {
    const r = root();
    r.innerHTML = `<div class="zfr-shell" dir="rtl"><button class="zfr-exit" id="zfr-exit" aria-label="${esc(t("epic50Back"))}">×</button><div class="zfr-epic-wrap"><div id="tct-mount"></div></div></div>`;
    r.classList.add("active"); document.body.classList.add("zivo-football-active");
    r.querySelector("#zfr-exit").onclick = exitWithGuard;
    try { A()?.unlock?.(); A()?.transitionAmbient?.("football"); } catch (_) {}
    window.ZIVOZONE_EPIC50?.mount(r.querySelector("#tct-mount"), {
      id: "football_epic", icon: "⚽", names: EPIC_NAME_FT, bands: EPIC_BANDS_FT,
      startLevel: startLevel || 1,
      archFn,
      onExit: renderIntro,
      // epic50.js calls onFinish(won, score, level) exactly once per game, whether the player cleared
      // level 50 or ran out of lives — the one reliable point to persist "how far did they get" for
      // next time's continue screen, same role horror-room.js's finishLevel() plays per-level there.
      onFinish: (won, score, level) => { saveProgress({ highestLevel: Math.max(progress().highestLevel || 0, level) }); if (won) grantFootballEpicReward(); },
      // V1230.92 — "Challenge a friend" (duel): see horror-room.js's matching comment at its own
      // ZIVOZONE_EPIC50?.mount() call for why this is needed.
      shareGameId: "rooms/football-pitch", shareName: L(EPIC_NAME_FT)
    });
  }

  function renderIntro() {
    const r = root();
    const saved = progress().highestLevel || 0;
    const continueBtn = saved > 0 && saved < MAXLV
      ? `<button type="button" class="zfr-start" id="tct-continue">${esc(fmt("tacticsContinueBtn", { level: saved + 1 }))}</button><button type="button" class="zfr-again" id="tct-restart">${esc(t("tacticsRestartBtn"))}</button>`
      : `<button type="button" class="zfr-start" id="tct-start">${esc(t("tacticsStart"))}</button>`;
    r.innerHTML = `<div class="zfr-shell" dir="rtl"><button class="zfr-exit" id="zfr-exit" aria-label="${esc(t("epic50Back"))}">×</button><div class="zfr-intro"><div class="zfr-glow"></div><div class="zfr-intro-content">
      <span class="zfr-kicker">ZIVOZONE // FOOTBALL PITCH</span><h1>${esc(t("tacticsTitle"))}</h1>
      <p>${esc(t("tacticsIntro"))}</p>
      <p class="zfr-controls-hint">${esc(t("tacticsOpenHint"))}</p>
      ${continueBtn}
      <button type="button" class="zfr-trivia" id="tct-trivia">${esc(t("tacticsTriviaBtn"))}</button>
      <p class="zfr-reward-note">${esc(t("tacticsRewardNote"))}</p>
    </div></div></div>`;
    r.classList.add("active");
    document.body.classList.add("zivo-football-active");
    r.querySelector("#zfr-exit").onclick = exitWithGuard;
    r.querySelector("#tct-start")?.addEventListener("click", () => gatedStartAt(1));
    r.querySelector("#tct-continue")?.addEventListener("click", () => gatedStartAt(saved + 1));
    r.querySelector("#tct-restart")?.addEventListener("click", () => gatedStartAt(1));
    // V1230.129 — real football knowledge (leagues/players/World Cup history/tactics terms) lives
    // in the Challenge Center's existing bank.football question pool (question-bank.js), now with
    // 24 new trivia questions added there. Rather than reinventing this room's Epic50 tap-reflex
    // engine as a quiz UI, this button launches that same quiz runner directly from inside the
    // football room itself, so the room covers both tactical reflexes AND real football knowledge.
    // Deliberately NOT calling close() here: close() sets location.hash="#home", and app-shell.js's
    // 'zivozone-home-reset' listener (fired async on that hashchange) unconditionally wipes
    // #modal-root and #zivo-challenge-core as a "went back to the homepage" cleanup — which would
    // silently destroy the play-gate modal / quiz this click is about to open a moment later, with
    // no error anywhere (found live: the button appeared to do nothing). Just hiding this room's own
    // overlay, without touching the hash, avoids triggering that cleanup at all.
    r.querySelector("#tct-trivia")?.addEventListener("click", () => {
      try { A()?.stopAmbient?.(); } catch (_) {}
      root().classList.remove("active");
      document.body.classList.remove("zivo-football-active");
      try { window.ZIVOZONE_CHALLENGE_CORE?.start?.("football"); } catch (_) {}
    });
    try { A()?.unlock?.(); A()?.transitionAmbient?.("football"); } catch (_) {}
  }

  function gatedStartAt(level) { return window.ZIVOZONE_REQUIRE_PLAY ? window.ZIVOZONE_REQUIRE_PLAY(() => openGame(level)) : openGame(level); }
  function gatedStart() { return window.ZIVOZONE_REQUIRE_PLAY ? window.ZIVOZONE_REQUIRE_PLAY(renderIntro) : renderIntro(); }
  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.FootballRoom = Object.freeze({ version: "1230.70", start: gatedStart });
  document.addEventListener("click", e => { if (e.target.closest("[data-football-room]")) { e.preventDefault(); gatedStart(); } });
  document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.closest("[data-football-room]")) { e.preventDefault(); gatedStart(); } });
})();
