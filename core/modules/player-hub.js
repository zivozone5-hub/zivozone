/* ZIVOZONE V1228 — PLAYER HUB
   Canonical UI owner. Numeric values come only from ZIVOZONE.State.playerData.
*/
(() => {
  "use strict";
  const VERSION = "1228";
  const $ = s => document.querySelector(s);
  const esc = window.ZIVOZONE_ESC;
  const t=k=>{try{return window.zivoT?window.zivoT(k):(window.ZIVOZONE_I18N?.tr?.(k)||k)}catch(_){return k}};
  const fmt = n => { n = Number(n) || 0; return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/,"").replace(/\.$/,""); };
  // V1230.77 — separate from fmt() above (that one formats a ZIVO balance number); this is the
  // key+vars template formatter used by the new room-progress strings ("{level}/{max}" etc.),
  // matching the same pattern already used in football-room.js/horror-room.js.
  const tfmt = (k, vars) => Object.entries(vars || {}).reduce((s, [key, val]) => s.replace(`{${key}}`, val), t(k));
  // V1230.106 — match-center.js's LEAGUE_NAMES catalog stores each league's name as a per-language
  // {ar,en,zh,hi,es,fr,fa} object (same convention as its own text() helper resolves), not a plain
  // string — but this hub's "next match" line took it straight into esc() with no resolution step at
  // all, printing the literal "[object Object]" for the league name on every upcoming match, in every
  // language. Found while auditing this hub's Sports card after fixing the untranslated team names it
  // displays right next to it (see match-center.js's own V1230.106 note for that half of the fix).
  const localizeObj = v => { if (typeof v === "string") return v; if (v && typeof v === "object") { const lang = window.ZIVOZONE_I18N?.get?.() || "ar"; return v[lang] || v.ar || v.en || Object.values(v)[0] || ""; } return String(v ?? ""); };
  const user = () => { try { return window.firebase?.auth?.()?.currentUser || null; } catch (_) { return null; } };

  function playerData() {
    const state = window.ZIVOZONE?.State;
    let p = state?.get?.("playerData") || {};
    if (!Object.keys(p).length) {
      try { window.ZIVOZONE?.Player?.get?.(); } catch (_) {}
      p = state?.get?.("playerData") || {};
    }
    return {
      name: String(p.name || ""),
      level: Math.max(1, Number(p.level) || 1),
      xp: Math.max(0, Number(p.xp) || 0),
      games: Math.max(0, Number(p.games) || 0),
      balance: Math.max(0, Number(p.balance) || 0),
      bestScore: Math.max(0, Number(p.bestScore) || 0),
      streak: Math.max(0, Number(p.streak) || 0),
      history: Array.isArray(p.history) ? p.history : [],
      challengeStats: p.challengeStats || {}
    };
  }

  // V1230.77 — Player Journey real-rooms-progress rebuild. Every signature room persists its own
  // progress under its own localStorage key (set and read entirely by that room's own file — see
  // each room's PROGRESS_KEY). Until now none of that ever surfaced here: the hub showed real
  // player/wallet/mission/achievement data but nothing about the rooms themselves. This reads each
  // room's OWN real progress key directly (read-only, no new storage, no new reward types). Puzzle
  // Room is deliberately shown without a level/count stat — unlike the other rooms it has no
  // persisted progress at all (confirmed by reading puzzle-room.js: its Epic50 mount has no
  // startLevel/onFinish progress save, and its 5-stage basic flow is pure in-memory session state)
  // — inventing a number for it would not be real.
  function readJSON(key) { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) { return {}; } }
  function roomsProgressData() {
    const football = readJSON("zivo_tactics_progress");
    const dark = readJSON("zivo_light_escape_progress");
    const beauty = readJSON("zivo_beauty_progress");
    const forensic = readJSON("ZIVOZONE_FORENSIC_V1180:completed");
    const rooms = readJSON("zivo_rooms_progress");
    const storyCount = Object.keys(rooms).filter(k => k.startsWith("s:")).length;
    const healthCount = Object.keys(rooms).filter(k => k.startsWith("h:")).length;
    const forensicCount = Object.keys(forensic).length;
    // V1230.78 — this used to also call a closeProfile() left over from the now-removed separate
    // Profile overlay; that function no longer exists, so every room-card click silently threw and
    // was swallowed by the catch below, meaning NO room card actually navigated anywhere. Caught
    // only by re-testing live after the merge, not by reading the diff — exactly the kind of
    // "looks like a button but doesn't do anything" bug flagged this round.
    const click = sel => () => { try { close(); document.querySelector(sel)?.click(); } catch (_) {} };
    return [
      { id: "football", icon: "⚽", title: t("sigFootballTitle"),
        stat: football.highestLevel ? tfmt("roomStatLevelFmt", { level: football.highestLevel, max: 50 }) : t("roomStatNotStarted"),
        started: !!football.highestLevel, go: click('[data-football-room]') },
      { id: "dark", icon: "🌑", title: t("sigDarkTitle"),
        stat: dark.highestLevel ? tfmt("roomStatLevelFmt", { level: dark.highestLevel, max: 50 }) : t("roomStatNotStarted"),
        extra: dark.survival_game ? t("roomStatSurvivalDone") : null,
        started: !!(dark.highestLevel || dark.survival_game), go: click('[data-horror-room]') },
      { id: "beauty", icon: "✦", title: t("sigBeautyTitle"),
        stat: beauty.beauty_game ? t("roomStatGameDone") : t("roomStatNotStarted"),
        started: !!beauty.beauty_game, go: click('[data-beauty-room]') },
      { id: "forensic", icon: "🕵️", title: t("sigForensicTitle"),
        stat: forensicCount ? tfmt("roomStatCasesFmt", { n: forensicCount, max: 25 }) : t("roomStatNotStarted"),
        started: forensicCount > 0, go: click('[data-challenge="forensic"]') },
      { id: "puzzle", icon: "🧩", title: t("sigPuzzleTitle"),
        stat: t("roomStatSessionOnly"), started: false, go: click('[data-puzzle-room]') },
      { id: "story", icon: "📖", title: t("sigStoryTitle"),
        stat: tfmt("roomStatStoriesFmt", { n: storyCount, max: 12 }),
        started: storyCount > 0, go: click('[data-zivo-story-room]') },
      { id: "health", icon: "❤", title: t("sigHealthTitle"),
        stat: tfmt("roomStatDoorsFmt", { n: healthCount, max: 12 }),
        started: healthCount > 0, go: click('[data-zivo-health-room]') },
    ];
  }

  const wallet = () => window.ZIVOZONE?.Economy?.getWallet?.() || {};
  const missions = () => window.ZIVOZONE?.Missions?.get?.() || { items:{}, claimed:{} };
  const competition = () => window.ZIVOZONE?.Competition?.state?.() || { streak:0 };
  const achievements = () => window.ZIVOZONE?.Achievements?.state?.() || { unlocked:[] };
  const sports = () => window.ZIVOZONE?.Sports?.getMatches?.() || [];
  const events = () => window.ZIVOZONE?.Events?.getHistory?.() || [];
  const cloud = () => !!user() && !!window.firebase?.firestore;

  function levelInfo(xp, level) {
    const base = Math.pow(Math.max(0, level - 1), 2) * 100;
    const next = Math.pow(level, 2) * 100;
    const span = Math.max(1, next - base);
    return { pct: Math.max(0, Math.min(100, ((xp - base) / span) * 100)) };
  }

  let root = null, timer = null, unsubs = [];

  function close() {
    root?.classList.remove("open");
    document.body.classList.remove("zivo-player-home-open");
    clearInterval(timer);
    unsubs.forEach(fn => fn?.());
    unsubs = [];
  }

  function go(id) {
    // V1230.77 built this as a genuinely separate Player Profile overlay. V1230.78 — direct user
    // feedback: Journey + Profile should be ONE page the player actually benefits from, not two.
    // Undoing that split: "profile" now scrolls
    // within this same hub to the player-card section below, which already carries real level/XP/
    // balance, and now also carries the real achievements count + a working "view all achievements"
    // button (added below) — so the destination is real content, not a second page or a dead link.
    if (id === "profile") { $("#zph-playercard")?.scrollIntoView({ behavior:"smooth" }); return; }
    close();
    const actions = {
      challenges: () => $("#challenges")?.scrollIntoView({ behavior:"smooth" }),
      sports: () => $("#sports")?.scrollIntoView({ behavior:"smooth" }),
      identity: () => $('[data-action="open-identity"]')?.click(),
      // V1230.30 — setting location.hash alone fires no 'hashchange' (and so no scroll) when the
      // hash is already "#ai" from an earlier click; every other destination here scrolls directly.
      ai: () => $("#ai")?.scrollIntoView({ behavior:"smooth" }),
      wallet: () => window.ZIVOZONE?.Economy?.open?.(),
      daily: () => window.ZIVOZONE?.Daily?.open?.(),
      missions: () => window.ZIVOZONE?.Missions?.open?.(),
      competition: () => window.ZIVOZONE?.Competition?.open?.(),
      achievements: () => window.ZIVOZONE?.Achievements?.open?.(),
      leaderboard: () => window.ZIVOZONE?.Leaderboard?.open?.(),
      mining: () => $("#zivo-header-mining")?.click(),
      // V1230.103 — "Invite friends" referral share (see share.js's invite()/buildInviteUrl()).
      // Falls back to the stored player name when no Firebase user object is available yet (e.g.
      // right after a fresh sign-up, before auth.js's onAuthStateChanged callback resolves).
      invite: () => { const u2 = user(), p = playerData(); window.ZIVOZONE?.Share?.invite?.({ name: u2?.displayName || p.name, uid: u2?.uid }); }
    };
    try { actions[id]?.(); } catch (e) { console.warn("ZIVO Player Home action", e); }
  }

  function missionData() {
    const s = missions(), items = s.items || {};
    const rows = Object.entries(items).map(([id,v]) => ({
      id, goal:Number(v?.goal)||0, value:Number(v?.value)||0, claimed:!!s.claimed?.[id]
    }));
    return { rows, done:rows.filter(x=>x.value>=x.goal).length, total:rows.length, next:rows.find(x=>x.value<x.goal&&!x.claimed) || rows[0] };
  }

  function liveSummary() {
    const m = sports();
    return {
      live:m.filter(x=>x.status==="LIVE"),
      next:m.filter(x=>x.status==="UPCOMING").sort((a,b)=>new Date(a.date)-new Date(b.date))[0]
    };
  }

  // V1230.52 — these labels used to be hardcoded Arabic strings; now routed through t() so the
  // activity feed reads in whatever language the player has selected, like the rest of the panel.
  const ACTIVITY_LABELS = {
    CHALLENGE_COMPLETED:["🎯","activityChallengeCompleted"], REWARD_GRANTED:["🎁","activityRewardGranted"],
    MINING_COMPLETED:["⛏️","activityMiningCompleted"], ACHIEVEMENT_UNLOCKED:["🏅","activityAchievementUnlocked"],
    MISSION_UPDATED:["📋","activityMissionUpdated"], MATCH_UPDATED:["⚽","activityMatchUpdated"], AUTH_CHANGED:["👤","activityAuthChanged"],
    // V1230.52 — open()'s own Events.on() subscription list re-renders on PLAYER_UPDATED and
    // PLAYERDATA_UPDATED, but this labels map never had entries for them, so the activity feed
    // fell back to printing the raw event name ("PLAYERDATA_UPDATED") instead of a real label —
    // true regardless of language, found while fixing the Arabic-only labels above.
    PLAYER_UPDATED:["📈","activityPlayerUpdated"], PLAYERDATA_UPDATED:["📈","activityPlayerUpdated"]
  };
  // V1230.77 — n parameter added so the full Player Profile page can show a longer real history
  // (last 20) than the Journey hub's compact feed (last 8), from the same event source/labels.
  function activityRows(n = 8) {
    return events().slice(-n).reverse().map(e => ({
      icon: ACTIVITY_LABELS[e.eventName]?.[0] || "•", label: ACTIVITY_LABELS[e.eventName] ? t(ACTIVITY_LABELS[e.eventName][1]) : e.eventName, at: e.at
    }));
  }

  // Shared by both the Journey hub's "rooms progress" section and the full Profile page. Each card
  // is a real button (data-room-go index) bound after render — not an <a>, since the destination is
  // a JS click() on the room's own trigger element, not a URL.
  let roomCardList = [];
  function roomCardsHtml(rooms) {
    roomCardList = rooms;
    return rooms.map((r, i) => `<button type="button" class="zph-room-card${r.started ? " started" : ""}" data-room-go="${i}">
      <span class="zph-room-icon">${r.icon}</span>
      <b>${esc(r.title)}</b>
      <small>${esc(r.stat)}</small>
      ${r.extra ? `<em>${esc(r.extra)}</em>` : ""}
    </button>`).join("");
  }
  function bindRoomCards(container) {
    container.querySelectorAll("[data-room-go]").forEach(b => {
      b.onclick = () => roomCardList[Number(b.dataset.roomGo)]?.go?.();
    });
  }

  // V1230.52 — toLocaleTimeString("ar-JO",...) was hardcoded regardless of the player's chosen
  // language, so the activity feed's timestamps stayed Arabic-formatted even in other languages.
  const TIME_LOCALES = { ar:"ar-JO", en:"en-US", zh:"zh-CN", hi:"hi-IN", es:"es-ES", fr:"fr-FR", fa:"fa-IR" };
  const timeLocale = () => TIME_LOCALES[window.ZIVOZONE_I18N?.get?.()] || "en-US";

  function render() {
    if (!root) return;
    const p = playerData();
    const w = wallet();
    const c = competition();
    const a = achievements();
    const m = missionData();
    const ls = liveSummary();
    const u = user();
    const z = Math.max(0, Number(w.zivo ?? p.balance) || 0);
    const streak = Math.max(p.streak, Number(c.streak)||0);
    const earned = Array.isArray(a.unlocked) ? a.unlocked.length : 0;
    const li = levelInfo(p.xp, p.level);
    const name = u?.displayName || u?.email?.split("@")[0] || p.name || t("achDefaultPlayerName");
    const avatar = u?.photoURL ? `<img src="${esc(u.photoURL)}" alt="">` : "Z";
    const next = m.next;
    const dir = window.ZIVOZONE_I18N?.dir?.[window.ZIVOZONE_I18N?.get?.()] || "rtl";

    root.innerHTML = `<div class="zph-shell" dir="${esc(dir)}" role="dialog" aria-modal="true" aria-labelledby="zph-title">
<header class="zph-header"><div class="zph-identity"><div class="zph-avatar">${avatar}</div><div>
<span class="zph-kicker">ZIVOZONE · ${esc(t("playerHomeKicker"))} · V${VERSION}</span><h2 id="zph-title">${esc(t("playerJourney"))}</h2>
<p>${esc(name)} <span>•</span> ${u?esc(u.email||t("accountConnected")):esc(t("guestSavePrompt"))}</p></div></div>
<div class="zph-head-tools"><span class="zph-sync ${cloud()?"on":""}">${cloud()?esc(t("cloudConnected")):esc(t("localMode"))}</span><button data-zph="close" aria-label="${esc(t("closeLabel"))}">×</button></div></header>
<section class="zph-hero"><div class="zph-hero-copy"><span>${esc(t("playerHomeKicker"))}</span><h3>${esc(t("heroJourneyBuiltReal"))}</h3><p>${esc(t("heroDataSourceNote"))}</p>
<div class="zph-hero-actions"><button class="primary" data-zph="challenges">${esc(t("continueJourneyBtn"))}</button><button data-zph="profile">${esc(t("playerProfileBtn"))}</button></div></div>
<div class="zph-level"><div><small>${esc(t("levelLabel"))}</small><strong>${p.level}</strong><b>${p.xp} XP</b></div><div class="zph-progress"><i style="width:${li.pct}%"></i></div><span>${Math.round(li.pct)}% ${esc(t("towardLevelLabel"))} ${p.level+1}</span></div></section>
<section class="zph-stats"><article class="gold"><span>🪙</span><small>${esc(t("balanceLabel"))}</small><b>${fmt(z)} <em>ZIVO</em></b></article>
<article><span>🎯</span><small>${esc(t("challengesLabel"))}</small><b>${p.games}</b></article><article><span>🔥</span><small>${esc(t("streakLabel"))}</small><b>${streak} <em>${esc(t("dayUnit"))}</em></b></article>
<article><span>🏆</span><small>${esc(t("bestScoreLabel"))}</small><b>${p.bestScore}</b></article><article><span>🏅</span><small>${esc(t("achievementsLabel"))}</small><b>${earned}</b></article><article><span>⚡</span><small>${esc(t("todayMissionsLabel"))}</small><b>${m.done}/${m.total}</b></article></section>
<section class="zph-rooms"><header><div><span class="zph-label">ROOMS</span><h3>${esc(t("roomsProgressTitle"))}</h3></div><small>${esc(t("roomsProgressNote"))}</small></header>
<div class="zph-room-grid">${roomCardsHtml(roomsProgressData())}</div></section>
<section class="zph-grid"><div class="zph-panel zph-today"><header><div><span class="zph-label">TODAY</span><h3>${esc(t("nextStepTitle"))}</h3></div><button data-zph="refresh">↻</button></header>
${next?`<div class="zph-next"><div class="zph-next-icon">🎯</div><div><b>${esc(next.id)}</b><small>${next.value}/${next.goal} ${esc(t("completedSuffix"))}</small><div><i style="width:${Math.min(100,next.value/Math.max(1,next.goal)*100)}%"></i></div></div><button data-zph="missions">${esc(t("startBtn"))}</button></div>`:`<div class="zph-empty-mini">${esc(t("noMissionNow"))}</div>`}</div>
<div class="zph-panel zph-live"><header><div><span class="zph-label">SPORTS</span><h3>${esc(t("worldPulseTitle"))}</h3></div><button data-zph="sports">${esc(t("allMatchesBtn"))}</button></header>
<div class="zph-live-row"><strong>${ls.live.length}</strong><span>${esc(t("liveNowLabel"))}</span>${ls.live.length?"<b>🔴 LIVE</b>":`<em>${esc(t("noLiveNow"))}</em>`}</div>
${ls.next?`<div class="zph-next-match"><span>${esc(localizeObj(ls.next.leagueName)||t("upcomingMatchFallback"))}</span><b>${esc(localizeObj(ls.next.home?.name)||"—")} × ${esc(localizeObj(ls.next.away?.name)||"—")}</b></div>`:""}</div></section>
<section class="zph-destinations"><header><div><span class="zph-label">YOUR ZIVOZONE</span><h3>${esc(t("yourWorldTitle"))}</h3></div><small>${esc(t("journeyDestinationsNote"))}</small></header>
<div class="zph-dest-grid"><button data-zph="challenges"><span>🎯</span><b>${esc(t("challengesLabel"))}</b><small>${esc(t("raiseXpNote"))}</small></button><button data-zph="daily"><span>📅</span><b>${esc(t("dailyChallengeLabel"))}</b><small>${esc(t("dailyRealDataNote"))}</small></button><button data-zph="missions"><span>📋</span><b>${esc(t("myMissionsLabel"))}</b><small>${m.done}/${m.total} ${esc(t("todayWord"))}</small></button><button data-zph="competition"><span>🏆</span><b>${esc(t("competitionLabel"))}</b><small>${streak} ${esc(t("consecutiveDaysWord"))}</small></button><button data-zph="achievements"><span>🏅</span><b>${esc(t("myAchievementsLabel"))}</b><small>${earned} ${esc(t("achievementUnit"))}</small></button><button data-zph="leaderboard"><span>🥇</span><b>${esc(t("topPlayersLabel"))}</b><small>${esc(t("topPlayersNote"))}</small></button><button data-zph="wallet"><span>🪙</span><b>${esc(t("myWalletLabel"))}</b><small>${fmt(z)} ZIVO</small></button><button data-zph="mining"><span>⛏️</span><b>${esc(t("miningLabel"))}</b><small>${esc(t("buildBalanceNote"))}</small></button><button data-zph="identity"><span>🧠</span><b>${esc(t("whoAmITitle"))}</b><small>${esc(t("identityTestNote"))}</small></button><button data-zph="sports"><span>⚽</span><b>${esc(t("sportsLabel"))}</b><small>${esc(t("matchesNewsNote"))}</small></button><button data-zph="ai"><span>🤖</span><b>ZIVO AI</b><small>${esc(t("aiAssistantNote"))}</small></button>${u ? `<button data-zph="invite"><span>📨</span><b>${esc(t("inviteCta"))}</b><small>${esc(t("inviteDesc"))}</small></button>` : ""}</div></section>
<section class="zph-bottom"><div class="zph-panel"><header><div><span class="zph-label">ACTIVITY</span><h3>${esc(t("recentActivityTitle"))}</h3></div></header>
${activityRows().length?`<div class="zph-activity">${activityRows().map(x=>`<div><span>${x.icon}</span><b>${esc(x.label)}</b><small>${new Date(x.at).toLocaleTimeString(timeLocale(),{hour:"2-digit",minute:"2-digit"})}</small></div>`).join("")}</div>`:`<div class="zph-empty-mini">${esc(t("emptyActivityNote"))}</div>`}</div>
<div class="zph-panel zph-identity-card" id="zph-playercard"><header><div><span class="zph-label">PLAYER CARD</span><h3>${esc(t("playerCardTitle"))}</h3></div></header><div class="zph-card-code"><strong>ZIVOZONE</strong><span>${esc(name)}</span><b>LV ${p.level} · ${p.xp} XP · ${fmt(z)} ZIVO</b><b>🏅 ${earned} ${esc(t("achievementUnit"))}</b></div><button class="primary" data-zph="achievements">${esc(t("viewAllAchievementsBtn"))}</button></div></section>
<footer class="zph-footer"><span>${esc(t("footerDataNote"))}</span><span>V${VERSION} · PLAYER HOME CORE</span></footer></div>`;
    bind();
  }

  function bind() {
    root.querySelectorAll("[data-zph]").forEach(b => b.onclick = () => {
      const id = b.dataset.zph;
      if (id === "close") close();
      else if (id === "refresh") render();
      else go(id);
    });
    bindRoomCards(root);
  }

  function open() {
    if (!root) {
      root = document.createElement("div");
      root.id = "zivo-player-home";
      root.className = "zph-overlay";
      document.body.appendChild(root);
      root.addEventListener("click", e => { if (e.target === root) close(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape" && root?.classList.contains("open")) close(); });
    }
    render();
    root.classList.add("open");
    document.body.classList.add("zivo-player-home-open");
    clearInterval(timer);
    timer = setInterval(() => { if (root?.classList.contains("open")) render(); }, 15000);

    const E = window.ZIVOZONE?.Events;
    if (E) {
      ["PLAYER_UPDATED","PLAYERDATA_UPDATED","WALLET_UPDATED","MINING_COMPLETED","CHALLENGE_COMPLETED","REWARD_GRANTED","MISSION_UPDATED","ACHIEVEMENT_UNLOCKED","MATCH_UPDATED"]
        .forEach(n => unsubs.push(E.on?.(n, () => { if (root?.classList.contains("open")) render(); })));
    }
    const unsubState = window.ZIVOZONE?.State?.subscribe?.("playerData", () => { if (root?.classList.contains("open")) render(); });
    if (typeof unsubState === "function") unsubs.push(unsubState);
  }

  function mount() {
    const host = document.querySelector(".topbar .top-actions");
    if (host && !document.getElementById("zivo-player-home-launch")) {
      const b = document.createElement("button");
      b.id = "zivo-player-home-launch"; b.className = "zph-launch"; b.type = "button";
      b.innerHTML = `<span>⚡</span><b data-i18n="playerJourney">${esc(t("playerJourney"))}</b>`; b.onclick = open;
      host.insertBefore(b, host.firstChild);
    }
    // V1230.30 — this used to be scoped to '.main-nav a[data-player-home]' only. The mobile
    // bottom-nav "Player Journey" tab (index.html's <nav class="mobile-nav">) carries the same
    // data-player-home attribute but lives outside .main-nav, so on any phone-width viewport
    // (.main-nav is display:none there) that bottom-nav tap bound to nothing — just changed the
    // URL hash to #player-home, which no element on the page targets. Binding every matching
    // element, not just the desktop-nav one, fixes every current and future copy of this link.
    document.querySelectorAll("[data-player-home]").forEach(nav => {
      const label = nav.querySelector("span[data-i18n='playerJourney']") || nav;
      label.textContent = t("playerJourney");
      nav.onclick = e => { e.preventDefault(); open(); };
    });
  }

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.PlayerHub = Object.freeze({ open, close, render, refresh:render, version:VERSION, canonical:true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
