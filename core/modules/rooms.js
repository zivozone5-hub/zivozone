/* ZIVOZONE — Rooms (Stories + Health)
 * One module for both reading rooms (replaces three earlier router/bind layers).
 * Data:  data/stories/index.json (small list) + data/stories/manuscripts/<id>.md (loaded per story)
 *        data/health/health-doors.json (12 doors, markdown)
 * All text is HTML-escaped before the markdown renderer adds structure, so content can never inject markup.
 */
(() => {
  "use strict";

  const ROOT_ID = "zivo-real-room";
  const PROGRESS_KEY = "zivo_rooms_progress";
  const STORY_INDEX = "/data/stories/index.json";
  const STORY_BODY = id => `/data/stories/content/${encodeURIComponent(id)}.json`;
  const STORY_QUIZZES = "/data/stories/quizzes.json";
  const HEALTH_DOORS = "/data/health/health-doors.json";
  const TIME_DOORS = "/data/time/epochs.json";
  const HG_ROUND_MS = 35000;
  const HG_SPAWN_MS = 650;
  const HG_LIVE_MS = 1150;
  const HG_CELLS = 9;
  const HG_METERS = ["nutrition", "rest", "energy"];
  const HG_METER_ICONS = { nutrition: ["🥦", "🍎"], rest: ["😴", "🧘"], energy: ["🏃", "💧"] };
  const HG_ICON_METER = Object.fromEntries(Object.entries(HG_METER_ICONS).flatMap(([meter, icons]) => icons.map(icon => [icon, meter])));
  const HG_GOOD = Object.values(HG_METER_ICONS).flat();
  const HG_BAD = ["🍬", "🚬", "🍟", "📵"];
  const HG_GOOD_GAIN = 14, HG_BAD_LOSS = 8, HG_DRAIN_PER_SEC = 1.1, HG_PASS_PCT = 50;
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const fmt = (k, vars) => Object.entries(vars || {}).reduce((s, [key, val]) => s.replace(`{${key}}`, val), t(k));
  const LANG = () => { try { return window.ZIVOZONE_I18N?.get?.() || "ar"; } catch (_) { return "ar"; } };
  // Content JSON files (story index/body, quizzes, health doors) are Arabic-only on disk.
  // A per-language sibling file (same name + ".<lang>" before ".json") is the translated version;
  // localize() just points the existing load() at that sibling instead of the Arabic original.
  const localize = (url, lang) => (lang === "ar" ? url : url.replace(/\.json$/i, `.${lang}.json`));

  // V1230.31 — titles/taglines/disclaimer now come from i18n (roomsStoriesTitle etc.) instead of
  // being hardcoded Arabic; COPY is rebuilt as a getter so language switches pick it up live.
  const COPY = {
    get stories() { return { title: t("roomsStoriesTitle"), line: t("roomsStoriesLine"), ambient: "horror" }; },
    get health() { return { title: t("roomsHealthTitle"), line: t("roomsHealthLine"), ambient: "science" }; },
    get time() { return { title: t("roomsTimeTitle"), line: t("roomsTimeLine"), ambient: "science" }; }
  };
  const HEALTH_NOTE = () => t("roomsHealthNote");
  const TIME_NOTE = () => t("roomsTimeNote");

  const A = () => window.ZIVOZONE_AUDIO;
  const R = () => window.ZIVOZONE_ROUTER;
  const SEO = () => window.ZIVOZONE_SEO;
  const esc = window.ZIVOZONE_ESC;

  // ---- data ------------------------------------------------------------------
  const memo = new Map();
  async function load(url, kind) {
    if (memo.has(url)) return memo.get(url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, { cache: "no-store", signal: controller.signal, headers: { Accept: kind === "text" ? "text/plain,text/markdown;q=0.9" : "application/json" } });
      if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
      const v = kind === "text" ? await res.text() : await res.json();
      if (kind !== "text" && (v == null || typeof v !== "object")) throw new Error(`${url} → invalid JSON`);
      if (kind === "text" && !String(v).trim()) throw new Error(`${url} → empty content`);
      memo.set(url, v);
      return v;
    } catch (error) {
      console.warn("ZIVOZONE Rooms load failed:", url, error);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  // Tries the current language's translated file first; silently falls back to the Arabic
  // original (same memoized load()) when a translation is missing or fails to load, so a
  // partially-translated catalog never breaks — it just shows Arabic for the untranslated parts.
  async function loadLocalized(url, kind) {
    const lang = LANG();
    if (lang !== "ar") {
      try { return await load(localize(url, lang), kind); } catch (_) { /* fall through to Arabic */ }
    }
    return load(url, kind);
  }

  async function loadStoryIndex() {
    const list = await loadLocalized(STORY_INDEX);
    if (!Array.isArray(list)) throw new Error("Story index is not an array");
    const valid = list.filter(x => x && typeof x === "object" && /^tale-[\w-]+$/i.test(String(x.id || "")) && String(x.title || "").trim());
    if (!valid.length) throw new Error("Story index is empty or invalid");
    return valid;
  }

  async function loadStoryBody(id) {
    const safeId = String(id || "").trim();
    if (!/^tale-[\w-]+$/i.test(safeId)) throw new Error("Invalid story id");
    const data = await loadLocalized(STORY_BODY(safeId));
    if (!data || typeof data !== "object" || String(data.id || "") !== safeId || !String(data.body || "").trim()) {
      throw new Error(`Story content is missing or inconsistent: ${safeId}`);
    }
    return String(data.body);
  }

  function progress() { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); } catch (_) { return {}; } }
  function markRead(key) { try { const p = progress(); p[key] = 1; localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (_) {} }

  // ---- markdown-lite (headings, bold/italic, lists, quotes, tables, rules) ---------
  function inline(t) {
    return esc(t)
      .replace(/\\\*/g, "&#42;")
      .replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])\*([^*\s][^*\n]*?)\*(?=$|[\s.,;:!?)،؛])/g, "$1<em>$2</em>");
  }
  function md(src) {
    const lines = String(src || "").replace(/\r/g, "").split("\n");
    const out = [];
    let i = 0, para = [], list = null;
    const flushPara = () => { if (para.length) { out.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } };
    const flushList = () => { if (list) { out.push(`<${list.tag}>` + list.items.map(x => "<li>" + inline(x) + "</li>").join("") + `</${list.tag}>`); list = null; } };
    const cells = row => row.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
    while (i < lines.length) {
      const line = lines[i], t = line.trim();
      let m;
      if (!t) { flushPara(); flushList(); i++; continue; }
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flushPara(); flushList(); out.push("<hr>"); i++; continue; }
      if ((m = t.match(/^(#{1,4})\s+(.*)$/))) { flushPara(); flushList(); const lv = Math.max(2, Math.min(4, m[1].length)); out.push(`<h${lv}>${inline(m[2])}</h${lv}>`); i++; continue; }
      if (t.startsWith("|")) {
        flushPara(); flushList();
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(lines[i]); i++; }
        const body = rows.filter(r => !/^\s*\|?[\s:|-]+\|?\s*$/.test(r) || !/-/.test(r));
        if (body.length) {
          const head = cells(body[0]);
          out.push('<div class="zr-table-wrap"><table><thead><tr>' + head.map(c => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>" +
            body.slice(1).map(r => "<tr>" + cells(r).map(c => "<td>" + inline(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>");
        }
        continue;
      }
      if (t.startsWith(">")) {
        flushPara(); flushList();
        const q = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) { q.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
        out.push("<blockquote>" + q.map(inline).join("<br>") + "</blockquote>");
        continue;
      }
      if ((m = t.match(/^[-*•]\s+(.*)$/))) { flushPara(); if (!list || list.tag !== "ul") { flushList(); list = { tag: "ul", items: [] }; } list.items.push(m[1]); i++; continue; }
      if ((m = t.match(/^\d+[.)]\s+(.*)$/))) { flushPara(); if (!list || list.tag !== "ol") { flushList(); list = { tag: "ol", items: [] }; } list.items.push(m[1]); i++; continue; }
      flushList(); para.push(t); i++;
    }
    flushPara(); flushList();
    return out.join("");
  }

  const minutes = text => Math.max(1, Math.round(String(text).split(/\s+/).length / 180));

  // ---- shell: dialog, focus, history ---------------------------------------------
  let lastFocus = null, popping = false, activeStoryId = null;

  function root() {
    let e = document.getElementById(ROOT_ID);
    if (!e) { e = document.createElement("div"); e.id = ROOT_ID; document.body.appendChild(e); }
    return e;
  }
  function isOpen() { return root().classList.contains("show"); }

  function frame(inner, cls, label) {
    const e = root();
    const wasOpen = isOpen();
    if (!wasOpen) {
      lastFocus = document.activeElement;
      // V1230.99 — found while verifying the back-button fix shipped alongside this: openStories()
      // already calls R().navigate('/stories', {state:{zivoRoom:1}}) before rendering, so close()'s
      // own `history.state?.zivoRoom` check below correctly pops one history entry on the way out.
      // openHealth()/healthDoor() never did this — they only ever call frame() directly — so the
      // Health World sub-flow had the exact same "phone Back button exits zivozone.com entirely"
      // bug this version fixes for football/beauty/horror/puzzle, just inside this file's own,
      // otherwise-correct history mechanism instead of exit-guard.js's generic one. Push the same
      // marker here, once, the moment the dialog actually opens (not on every frame() redraw while
      // browsing doors) — guarded so this never double-pushes for Stories, whose navigate() call
      // already set it by the time frame() first runs for that flow.
      if (!history.state?.zivoRoom) { try { history.pushState({ ...(history.state || {}), zivoRoom: 1 }, "", location.href); } catch (_) {} }
    }
    e.className = "show " + (cls || "");
    e.setAttribute("role", "dialog");
    e.setAttribute("aria-modal", "true");
    e.setAttribute("aria-label", label || "ZIVOZONE");
    e.innerHTML = inner + audioButton();
    document.body.classList.add("zivo-room-lock");
    e.scrollTop = 0;
    const closeBtn = e.querySelector("#zr-close, #zr-exit-btn");
    const target = e.querySelector("#zr-enter-btn") || e.querySelector("h1") || closeBtn;
    if (target) { if (!target.matches("button,a,[tabindex]")) target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
    const mute = e.querySelector("#zr-audio");
    if (mute) mute.onclick = async () => { await A()?.unlock?.(); A()?.toggle?.(); mute.textContent = A()?.isMuted?.() ? "🔇" : "🔊"; };
    return e;
  }
  function audioButton() {
    return `<button type="button" class="zr-audio" id="zr-audio" aria-label="${esc(t("roomsAudioToggle"))}">${A()?.isMuted?.() ? "🔇" : "🔊"}</button>`;
  }

  function close(fromPop) {
    const e = root();
    if (!isOpen()) return;
    e.classList.remove("show");
    e.removeAttribute("role"); e.removeAttribute("aria-modal");
    e.innerHTML = "";
    document.body.classList.remove("zivo-room-lock");
    try { A()?.stopAmbient?.(); } catch (_) {}
    if (!fromPop && history.state?.zivoRoom) { popping = true; history.back(); }
    else if (!fromPop && /^\/stories\//i.test(location.pathname)) {
      R()?.navigate("/", { replace: true });
      SEO()?.home();
    }
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (_) {} }
    lastFocus = null;
  }

  document.addEventListener("keydown", ev => {
    if (!isOpen()) return;
    if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
    if (ev.key !== "Tab") return;
    const f = [...root().querySelectorAll("button,a[href],input,[tabindex]:not([tabindex='-1'])")].filter(x => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });
  window.addEventListener("popstate", () => { if (popping) { popping = false; return; } close(true); });

  function failure(retry, message = t("roomsFailureDefault")) {
    const e = frame(`<div class="zr-room"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button><article class="zr-reader"><h1>${esc(t("roomsFailureTitle"))}</h1><p>${esc(message)}</p><div class="zr-nav"><button id="zr-retry" type="button">${esc(t("roomsRetry"))}</button><button id="zr-404" type="button">${esc(t("rooms404"))}</button></div><button id="zr-home" type="button">${esc(t("roomsBackToSite"))}</button></article></div>`, "", t("roomsFailurePageTitle"));
    e.querySelector("#zr-close").onclick = () => { activeStoryId = null; close(); };
    e.querySelector("#zr-retry").onclick = () => Promise.resolve(retry?.()).catch(() => {});
    e.querySelector("#zr-home").onclick = () => close();
    e.querySelector("#zr-404").onclick = () => { location.assign(`/404.html?from=${encodeURIComponent(location.pathname)}`); };
  }

  // ---- entry -------------------------------------------------------------------
  async function enter(kind) {
    const c = COPY[kind] || COPY.health;
    const e = frame(`<div class="zr-entry ${esc(kind)}"><div class="zr-entry-glow"></div><div class="zr-entry-content"><div class="zr-kicker">ZIVO AI • PRIVATE ARCHIVE</div><h1>${esc(c.title)}</h1><p>${esc(c.line)}</p><button id="zr-enter-btn" type="button">${esc(t("roomsOpenDoor"))}</button><button id="zr-exit-btn" class="secondary" type="button">${esc(t("roomsExitToSite"))}</button></div></div>`, "", c.title);
    e.querySelector("#zr-enter-btn").onclick = () => (kind === "stories" ? openStories() : kind === "time" ? openTime() : openHealth());
    e.querySelector("#zr-exit-btn").onclick = () => close();
    try { await A()?.unlock?.(); await A()?.playSfx?.("menu_toggle"); await A()?.transitionAmbient?.(c.ambient); } catch (_) {}
  }

  // ---- stories -----------------------------------------------------------------
  const GENRE_ALL = "__ALL__"; // internal sentinel for the "All" filter chip — never shown, so it stays stable across language switches
  const primaryGenre = g => String(g || t("roomsGenreFallback")).split("/")[0].trim();

  async function openStories() {
    if (location.pathname !== "/stories") R()?.navigate("/stories", { state: { zivoRoom: 1 } });
    let list;
    try { list = await loadStoryIndex(); } catch (_) { return failure(openStories, t("roomsStoryIndexFailure")); }
    const done = progress();
    const genreLabel = g => g === GENRE_ALL ? t("roomsGenreAll") : g;
    const genres = [GENRE_ALL, ...new Set(list.map(s => primaryGenre(s.genre)))];
    const e = frame(`<div class="zr-room"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <header><div class="zr-kicker">ARCHIVE ${list.length}</div><h1>${esc(t("roomsStoriesTitle"))}</h1><p>${esc(t("roomsStoriesPick"))}</p><button id="zr-story-epic-cta" type="button" class="zivo-epic-cta">📖 ${esc(localizedText(EPIC_NAME_SR))} — ${esc(t("epic50Tag"))}</button></header>
      <div class="zr-tools"><input id="zr-search" type="search" placeholder="${esc(t("roomsSearchPlaceholder"))}" aria-label="${esc(t("roomsSearchAria"))}">
        <div class="zr-chips" role="group" aria-label="${esc(t("roomsGenreAria"))}">${genres.map((g, k) => `<button type="button" class="zr-chip${k ? "" : " on"}" data-genre="${esc(g)}">${esc(genreLabel(g))}</button>`).join("")}</div></div>
      <div class="zr-grid" id="zr-list"></div></div>`, "", t("roomsStoriesTitle"));
    let genre = GENRE_ALL, q = "";
    const grid = e.querySelector("#zr-list");
    const paint = () => {
      const rows = list.filter(s => (genre === GENRE_ALL || primaryGenre(s.genre) === genre) && (!q || (s.title + " " + s.genre).includes(q)));
      grid.innerHTML = rows.length ? rows.map(s => `<button type="button" class="zr-card${done["s:" + s.id] ? " done" : ""}" data-story="${esc(s.id)}"><span>${esc(s.genre || t("roomsGenreFallback"))}${done["s:" + s.id] ? ` • ✓ ${esc(t("roomsReadBadge"))}` : ""}</span><strong>${esc(s.title)}</strong><em>${esc(s.blurb || "")}</em><b>${esc(t("roomsOpenStory"))}</b></button>`).join("")
        : `<p class="zr-empty">${esc(t("roomsNoResults"))}</p>`;
    };
    paint();
    e.querySelector("#zr-close").onclick = () => close();
    e.querySelector("#zr-story-epic-cta").onclick = () => gatedEpicStartSR();
    e.querySelector("#zr-search").oninput = ev => { q = ev.target.value.trim(); paint(); };
    e.querySelectorAll("[data-genre]").forEach(b => b.onclick = () => {
      genre = b.dataset.genre;
      e.querySelectorAll("[data-genre]").forEach(x => x.classList.toggle("on", x === b));
      paint();
    });
    grid.addEventListener("click", ev => { const b = ev.target.closest("[data-story]"); if (b) openStory(b.dataset.story); });
  }

  async function openStory(id, options = {}) {
    let list, text;
    try {
      list = await loadStoryIndex();
      text = await loadStoryBody(id);
    } catch (_) {
      return failure(() => openStory(id), fmt("roomsStoryUnavailable", { id }));
    }
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx < 0) return openStories();
    const s = list[idx], body = text;
    const prev = list[idx - 1], next = list[idx + 1];
    activeStoryId = String(id);
    if (!options.fromRoute && location.pathname !== `/stories/${encodeURIComponent(id)}`) {
      R()?.navigate(`/stories/${encodeURIComponent(id)}`, { state: { zivoRoom: 1, zivoStory: id } });
    }
    SEO()?.story({ ...s, content: body });
    const quizDone = !!progress()["quiz:" + id];
    const e = frame(`<div class="zr-room"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <article class="zr-reader"><div class="zr-kicker">${esc(s.genre)} • ${esc(t("roomsGenreFallback"))} ${esc(s.n)}/${list.length} • ${minutes(body)} ${esc(t("roomsMinRead"))}</div>
        <h1>${esc(s.title)}</h1><div class="zr-divider"></div><div class="zr-story-body zr-md">${md(body)}</div>
        <button id="zr-quiz-cta" type="button" class="zr-quiz-cta${quizDone ? " done" : ""}">${quizDone ? esc(t("storyQuizDone")) : esc(t("storyQuizCta"))}</button>
        <div class="zr-nav">${prev ? `<button type="button" data-go="${esc(prev.id)}">→ ${esc(prev.title)}</button>` : "<span></span>"}${next ? `<button type="button" data-go="${esc(next.id)}">${esc(next.title)} ←</button>` : "<span></span>"}</div>
        <button id="zr-back" type="button">${esc(t("roomsBackToStories"))}</button></article></div>`, "", s.title);
    markRead("s:" + id);
    e.querySelector("#zr-close").onclick = () => { activeStoryId = null; close(); };
    e.querySelector("#zr-back").onclick = openStories;
    e.querySelector("#zr-quiz-cta").onclick = () => openStoryQuiz(id, s, () => openStory(id, { fromRoute: true }));
    e.querySelectorAll("[data-go]").forEach(b => b.onclick = () => openStory(b.dataset.go));
    try { A()?.playSfx?.("click_light"); } catch (_) {}
  }

  // ---- story comprehension quiz -----------------------------------------------
  async function loadStoryQuiz(id) {
    const all = await loadLocalized(STORY_QUIZZES);
    const qs = all && all[id];
    if (!Array.isArray(qs) || !qs.length) throw new Error("No quiz for " + id);
    return qs;
  }

  async function grantStoryReward(id) {
    const ok = await window.ZIVOZONE?.Economy?.credit?.(5, { type: "story_reward", source: "story", story: id, claimId: `story_${id}` }); // V1230.84 — unified reward (was 2)
    if (!ok) return;
    await window.ZIVOZONE?.Economy?.addXP?.(20);
    window.dispatchEvent(new CustomEvent("zivozone-reward", { detail: { xp: 20, zivo: 2, source: "story", story: id } }));
  }

  async function openStoryQuiz(id, story, onBack) {
    let questions;
    try { questions = await loadStoryQuiz(id); }
    catch (_) { return failure(() => openStoryQuiz(id, story, onBack), t("storyQuizUnavailable")); }
    // shuffle each question's options once per attempt, tracking the correct text rather than a fixed index
    const shuffled = questions.map(q => {
      const correctText = q.options[q.correct];
      const opts = [...q.options];
      for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
      return { q: q.q, options: opts, correctText };
    });
    let i = 0, score = 0;
    const alreadyDone = !!progress()["quiz:" + id];

    function renderQuestion() {
      const cur = shuffled[i];
      const e = frame(`<div class="zr-room"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
        <article class="zr-reader zr-quiz-view"><div class="zr-kicker">${esc(story.title)} • ${esc(fmt("storyQuizProgress", { current: i + 1, total: shuffled.length }))}</div>
          <h1>${esc(t("storyQuizTitle"))}</h1><div class="zr-divider"></div>
          <div class="zr-quiz-progressbar"><i style="width:${(i / shuffled.length) * 100}%"></i></div>
          <p class="zr-quiz-q">${esc(cur.q)}</p>
          <div class="zr-quiz-options">${cur.options.map((o, idx) => `<button type="button" class="zr-quiz-opt" data-opt="${idx}">${esc(o)}</button>`).join("")}</div>
          <div class="zr-quiz-feedback" id="zr-quiz-feedback" hidden></div>
          <button id="zr-back" type="button">${esc(t("storyQuizBackToStory"))}</button></article></div>`, "quiz", story.title);
      e.querySelector("#zr-close").onclick = () => { activeStoryId = null; close(); };
      e.querySelector("#zr-back").onclick = onBack;
      const opts = [...e.querySelectorAll("[data-opt]")];
      opts.forEach(b => b.onclick = () => {
        opts.forEach(x => x.disabled = true);
        const picked = cur.options[Number(b.dataset.opt)];
        const right = picked === cur.correctText;
        if (right) { score++; b.classList.add("right"); } else {
          b.classList.add("wrong");
          const correctBtn = opts.find(x => x.textContent === cur.correctText);
          correctBtn?.classList.add("right");
        }
        const fb = e.querySelector("#zr-quiz-feedback");
        fb.hidden = false;
        fb.textContent = right ? t("storyQuizCorrect") : t("storyQuizWrong");
        fb.className = "zr-quiz-feedback show " + (right ? "right" : "wrong");
        try { A()?.playSfx?.(right ? "correct" : "wrong"); } catch (_) {}
        setTimeout(() => { i++; i < shuffled.length ? renderQuestion() : renderResult(); }, 900);
      });
    }

    function renderResult() {
      const pass = score >= 4;
      try {
        window.ZIVOZONE?.Events?.emit("STORY_COMPLETED", { storyId: id, storyTitle: story.title, completionMode: "quiz" });
      } catch (_) {}
      const e = frame(`<div class="zr-room"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
        <article class="zr-reader zr-quiz-view"><div class="zr-kicker">${esc(story.title)}</div>
          <h1>${esc(fmt("storyQuizScore", { score, total: shuffled.length }))}</h1><div class="zr-divider"></div>
          <p>${esc(pass ? t("storyQuizFinishGood") : t("storyQuizFinishOk"))}</p>
          ${!alreadyDone ? `<p class="zr-quiz-reward-note">${esc(t("storyQuizRewardNote"))}</p>` : ""}
          ${pass && !alreadyDone ? `<button id="zr-quiz-claim" type="button" class="zr-quiz-cta">${esc(t("storyQuizClaim"))}</button>` : ""}
          <button id="zr-quiz-share" type="button" class="zr-quiz-cta zr-quiz-share">${esc(t("shareResultCta"))}</button>
          <button id="zr-back" type="button">${esc(t("storyQuizBackToStory"))}</button></article></div>`, "quiz", story.title);
      e.querySelector("#zr-close").onclick = () => { activeStoryId = null; close(); };
      e.querySelector("#zr-back").onclick = onBack;
      e.querySelector("#zr-quiz-share").onclick = () => {
        window.ZIVOZONE?.Share?.share?.({ gameId: `stories/${id}`, score: Math.round((score / shuffled.length) * 100), challengeName: story.title });
      };
      const claimBtn = e.querySelector("#zr-quiz-claim");
      if (claimBtn) claimBtn.onclick = async () => {
        claimBtn.disabled = true;
        markRead("quiz:" + id);
        await grantStoryReward(id);
        onBack();
      };
    }

    renderQuestion();
  }

  // ---- story "Epic 50" grand challenge: a real reflex/attention game — "The Plot Twist" — not
  // a quiz, alongside the existing comprehension quiz above (unchanged) ----------------------
  const localizedText = dict => dict[LANG()] || dict.en || dict.ar;
  const EPIC_NAME_SR = { ar: "التفاف الحبكة", en: "The Plot Twist", zh: "剧情逆转", hi: "कहानी का मोड़", es: "El Giro de la Trama", fr: "Le Rebondissement", fa: "پیچش داستان" };
  const EPIC_BANDS_SR = [
    { names: { ar: "البداية", en: "Beginning", zh: "开端", hi: "शुरुआत", es: "El Comienzo", fr: "Le Début", fa: "آغاز" }, twist: { ar: "اتبع الوهج الذهبي بسرعة قبل أن يخفت.", en: "Follow the golden glow quickly before it fades.", zh: "在金色光芒消失前迅速跟随它。", hi: "सुनहरी चमक के मिटने से पहले उसका तुरंत पालन करें।", es: "Sigue el brillo dorado rápidamente antes de que se apague.", fr: "Suivez rapidement la lueur dorée avant qu'elle ne s'évanouisse.", fa: "قبل از محو شدن درخشش طلایی، به‌سرعت آن را دنبال کنید." } },
    { names: { ar: "الشك", en: "Doubt", zh: "疑惑", hi: "संदेह", es: "La Duda", fr: "Le Doute", fa: "شک" }, twist: { ar: "وهج خادع بدأ يظهر على الجانب الخاطئ. لا تنخدع.", en: "A deceptive glow now appears on the wrong side. Don't be fooled.", zh: "现在一个欺骗性的光芒出现在错误的一侧。别被骗了。", hi: "अब एक धोखे वाली चमक गलत तरफ़ दिखती है। धोखा न खाएं।", es: "Ahora aparece un brillo engañoso en el lado equivocado. No te dejes engañar.", fr: "Une lueur trompeuse apparaît maintenant du mauvais côté. Ne vous laissez pas tromper.", fa: "اکنون درخششی فریبنده در سمت اشتباه ظاهر می‌شود. فریب نخورید." } },
    { names: { ar: "الظلام بين الفصول", en: "Darkness Between Chapters", zh: "章节间的黑暗", hi: "अध्यायों के बीच अंधेरा", es: "Oscuridad Entre Capítulos", fr: "Obscurité Entre les Chapitres", fa: "تاریکی میان فصل‌ها" }, twist: { ar: "الشاشة تُطفأ قبل كل إشارة. ثبّت تركيزك للحظة الأخيرة.", en: "The screen blacks out before every cue. Stay sharp for the final instant.", zh: "屏幕在每次提示前都会变黑。保持警觉，留意最后一瞬。", hi: "हर संकेत से पहले स्क्रीन काली हो जाती है। आख़िरी पल के लिए सतर्क रहें।", es: "La pantalla se oscurece antes de cada señal. Mantente alerta para el instante final.", fr: "L'écran devient noir avant chaque signal. Restez attentif pour l'instant final.", fa: "صفحه قبل از هر نشانه سیاه می‌شود. برای لحظه آخر هوشیار بمانید." } },
    { names: { ar: "الالتفاف", en: "The Twist", zh: "转折", hi: "पलटाव", es: "El Giro", fr: "Le Rebondissement", fa: "چرخش" }, twist: { ar: "من الآن، الجهة التي تلمع ليست الصحيحة — بل عكسها.", en: "From now on, the glowing side is not the right one — its opposite is.", zh: "从现在起，发光的一侧不是正确的——它的对面才是。", hi: "अब से, चमकने वाला पक्ष सही नहीं है — उसका विपरीत पक्ष सही है।", es: "A partir de ahora, el lado que brilla no es el correcto: su opuesto sí lo es.", fr: "Désormais, le côté qui brille n'est pas le bon — c'est son opposé.", fa: "از این پس، سمتی که می‌درخشد درست نیست — سمت مقابل آن درست است." } },
    { names: { ar: "الفصل الأخير", en: "The Final Chapter", zh: "最终章", hi: "अंतिम अध्याय", es: "El Capítulo Final", fr: "Le Chapitre Final", fa: "فصل پایانی" }, twist: { ar: "كل قواعد الحبكة معًا. فقط القارئ الحقيقي يكمل هذا الفصل.", en: "Every plot rule together. Only a true reader finishes this chapter.", zh: "所有情节规则一起生效。只有真正的读者才能完成这一章。", hi: "सभी कथानक नियम एक साथ। केवल एक सच्चा पाठक ही यह अध्याय पूरा करता है।", es: "Todas las reglas de la trama juntas. Solo un verdadero lector termina este capítulo.", fr: "Toutes les règles de l'intrigue réunies. Seul un vrai lecteur termine ce chapitre.", fa: "همه قوانین داستان با هم. فقط یک خوانندهٔ واقعی این فصل را به پایان می‌رساند." } }
  ];
  function playPlot(band, bandLv, api) {
    const { lerp, addTimer, clear, ctx, point, addListener, winLevel, loseLevel, canvas, W, H, emoji } = api;
    const chainLen = Math.round(lerp(bandLv, 3, 7)) + (band >= 5 ? 2 : 0);
    const showMs = lerp(bandLv, 650, 260), preDelay = lerp(bandLv, 700, 260);
    const blackoutOn = band >= 3, mirrorOn = band >= 4, decoyOn = band >= 2;
    const leftX = W * 0.28, rightX = W * 0.72, y = H / 2 + 20;
    let hits = 0, roundId = 0, realSide = null, active = false;
    // V1230.65 — quality pass (user asked directly to redo the same success-feel work 1230.62 gave
    // Puzzle/Beauty, for Forensic Lab/Story Room/Health World too). A wrong tap already gets visual
    // feedback for free, from the shared epic50.js engine's own loseLevel() flash — but a CORRECT tap
    // that isn't the final one had nothing at all: hits++ then straight to nextRound(), no confirmation
    // the tap even registered. pulseCorrect() gives that same side a brief green glow before moving on.
    const pulseCorrect = side => { const gx = side === "left" ? leftX : rightX; drawBase(); ctx.save(); ctx.beginPath(); ctx.arc(gx, y, 100, 0, 7); ctx.fillStyle = "rgba(99,230,190,.45)"; ctx.shadowColor = "#63e6be"; ctx.shadowBlur = 50; ctx.fill(); ctx.restore(); emoji("📖", leftX, y, 70); emoji("🕯", rightX, y, 70); };
    const onClick = e => {
      if (!active) return;
      const p = point(e); const side = p.x < W / 2 ? "left" : "right"; active = false;
      if (side === realSide) {
        hits++;
        pulseCorrect(side);
        if (hits >= chainLen) { addTimer(() => winLevel(), 160); return; }
        roundId++; addTimer(() => nextRound(), 160);
      }
      else loseLevel();
    };
    addListener(canvas, "click", onClick);
    const drawBase = () => { clear(); emoji("📖", leftX, y, 70); emoji("🕯", rightX, y, 70); };
    function nextRound() {
      active = false; const myRound = roundId; drawBase();
      addTimer(() => {
        if (myRound !== roundId) return;
        if (blackoutOn) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H); addTimer(() => { if (myRound === roundId) showGlow(myRound); }, lerp(bandLv, 200, 110)); }
        else showGlow(myRound);
      }, preDelay);
    }
    function showGlow(myRound) {
      realSide = Math.random() < 0.5 ? "left" : "right";
      const displaySide = mirrorOn && Math.random() < 0.6 ? (realSide === "left" ? "right" : "left") : realSide;
      drawBase();
      const gx = displaySide === "left" ? leftX : rightX;
      ctx.save(); ctx.beginPath(); ctx.arc(gx, y, 95, 0, 7); ctx.fillStyle = "rgba(255,216,74,.35)"; ctx.shadowColor = "#ffd84a"; ctx.shadowBlur = 40; ctx.fill(); ctx.restore();
      if (decoyOn && Math.random() < 0.45) { const dx = displaySide === "left" ? rightX : leftX; ctx.save(); ctx.beginPath(); ctx.arc(dx, y, 75, 0, 7); ctx.fillStyle = "rgba(138,92,255,.28)"; ctx.fill(); ctx.restore(); }
      emoji("📖", leftX, y, 70); emoji("🕯", rightX, y, 70);
      active = true;
      addTimer(() => { if (myRound === roundId && active) { active = false; loseLevel(); } }, showMs);
    }
    nextRound();
  }
  function grantStoryEpicReward() {
    window.ZIVOZONE?.Economy?.credit?.(5, { type: "story_epic_reward", source: "story", story: "epic50", claimId: "story_epic50_clear" }).then(ok => { if (ok) window.ZIVOZONE?.Economy?.addXP?.(60); });
  }
  function openStoryEpic() {
    // V1230.63 — was mounted inside .zr-reader, the 900px reading-article column meant for long-form
    // story text (90px top margin, 38px padding) — the same "game boxed into a text column" gap Dark
    // Room had before its own 1230.58 fix. .zr-epic-wrap is that fix, applied here: a full-bleed stage
    // with its own backdrop, the actual game shell centered at a sane width inside it.
    const e = frame(`<div class="zr-epic-wrap"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <div class="zr-epic-head"><span class="zr-kicker">ZIVO STORIES • ${esc(localizedText(EPIC_NAME_SR))}</span><h1>${esc(localizedText(EPIC_NAME_SR))}</h1></div>
      <div id="zr-epic-mount"></div>
      <button id="zr-back" class="zr-epic-back" type="button">${esc(t("roomsBackToStories"))}</button></div>`, "", localizedText(EPIC_NAME_SR));
    e.querySelector("#zr-close").onclick = () => close();
    e.querySelector("#zr-back").onclick = () => openStories();
    window.ZIVOZONE_EPIC50?.mount(e.querySelector("#zr-epic-mount"), {
      id: "story_epic", icon: "📖", names: EPIC_NAME_SR, bands: EPIC_BANDS_SR,
      archFn: playPlot,
      onExit: () => openStories(),
      onFinish: won => { if (won) grantStoryEpicReward(); },
      // V1230.92 — "Challenge a friend" (duel): story_epic has no dedicated /rooms/<slug> SEO
      // landing page (unlike the other five Epic50 rooms — see scripts/prerender-rooms.mjs's ROOMS
      // list), so this falls back to the real "/stories" listing page instead of a 404.
      shareGameId: "/stories", shareName: localizedText(EPIC_NAME_SR)
    });
  }
  function gatedEpicStartSR() { return window.ZIVOZONE_REQUIRE_PLAY ? window.ZIVOZONE_REQUIRE_PLAY(openStoryEpic) : openStoryEpic(); }

  // ---- health ------------------------------------------------------------------
  const DOOR_LINES = { "01":"doorLine01","02":"doorLine02","03":"doorLine03","04":"doorLine04","05":"doorLine05","06":"doorLine06","07":"doorLine07","08":"doorLine08","09":"doorLine09","10":"doorLine10","11":"doorLine11","12":"doorLine12" };
  // Doors in the JSON look like "🌙 باب النوم": keep the emoji for the badge, drop the "باب " prefix for the card title.
  const splitTitle = t => { const m = String(t).match(/^(\S+)\s+(?:باب\s+)?(.*)$/); return m ? { icon: m[1], name: m[2] } : { icon: "", name: String(t) }; };

  async function openHealth() {
    let doors;
    try {
      doors = await loadLocalized(HEALTH_DOORS);
      if (!Array.isArray(doors) || !doors.length) throw new Error("Health doors are empty");
    } catch (_) { return failure(openHealth, t("roomsHealthIndexFailure")); }
    const done = progress();
    const hgDone = !!done["health_game"];
    const e = frame(`<div class="zr-room health"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <header><div class="zr-kicker">ZIVO HEALTH ARCHIVE • ${esc(t("roomsHealthTitle"))}</div><h1>${esc(t("roomsHealthTitle"))}</h1><p>${esc(t("roomsHealthPick"))}</p></header>
      <button id="zr-health-game-cta" type="button" class="zr-quiz-cta${hgDone ? " done" : ""}">${hgDone ? esc(t("healthGameDone")) : esc(t("healthGameCta"))}</button>
      <button id="zr-health-epic-cta" type="button" class="zivo-epic-cta">⚔️ ${esc(localizedText(EPIC_NAME_HW))} — ${esc(t("epic50Tag"))}</button>
      <div class="zr-grid">${doors.map(d => { const tt = splitTitle(d.title); return `<button type="button" class="zr-card health-card${done["h:" + d.id] ? " done" : ""}" data-door="${esc(d.id)}"><span>${esc(tt.icon)} ${esc(fmt("roomsDoorLabel", { id: d.id }))}${done["h:" + d.id] ? " • ✓" : ""}</span><strong>${esc(tt.name)}</strong><em>${esc(DOOR_LINES[d.id] ? t(DOOR_LINES[d.id]) : "")}</em><b>${esc(t("roomsOpenDoorCard"))}</b></button>`; }).join("")}</div>
      <p class="zr-note">${esc(HEALTH_NOTE())}</p></div>`, "", t("roomsHealthTitle"));
    e.querySelector("#zr-close").onclick = () => close();
    e.querySelector("#zr-health-game-cta").onclick = () => openHealthGame();
    e.querySelector("#zr-health-epic-cta").onclick = () => gatedEpicStartHW();
    e.querySelectorAll("[data-door]").forEach(b => b.onclick = () => healthDoor(b.dataset.door));
  }

  // ---- health "Epic 50" grand challenge (alongside the fitness reaction game below,
  // not replacing it) ------------------------------------------------------------
  const EPIC_NAME_HW = { ar: "التوازن الكامل", en: "Full Balance", zh: "完全平衡", hi: "पूर्ण संतुलन", es: "Equilibrio Total", fr: "Équilibre Total", fa: "تعادل کامل" };
  const EPIC_BANDS_HW = [
    { names: { ar: "التوازن", en: "Balance", zh: "平衡", hi: "संतुलन", es: "Equilibrio", fr: "Équilibre", fa: "تعادل" }, twist: { ar: "اضغط فقط على الرمز الذي يطابق الهدف الظاهر في الأعلى.", en: "Tap only the icon that matches the target shown above.", zh: "只点击与上方显示目标相匹配的图标。", hi: "केवल उस आइकन को टैप करें जो ऊपर दिखाए गए लक्ष्य से मेल खाता है।", es: "Toca solo el icono que coincide con el objetivo mostrado arriba.", fr: "Touchez uniquement l'icône qui correspond à la cible affichée ci-dessus.", fa: "فقط روی آیکونی ضربه بزنید که با هدف نشان‌داده‌شده در بالا مطابقت دارد." } },
    { names: { ar: "الإغراءات", en: "Temptations", zh: "诱惑", hi: "प्रलोभन", es: "Tentaciones", fr: "Tentations", fa: "وسوسه‌ها" }, twist: { ar: "عناصر غير صحية ظهرت في الشبكة الآن. لمسها خطأ فادح.", en: "Unhealthy items are now mixed into the grid. Tapping one is a costly mistake.", zh: "不健康的物品现在混入了格子中。点击其中一个将是一个代价高昂的错误。", hi: "अब अस्वस्थ वस्तुएं ग्रिड में मिला दी गई हैं। उनमें से किसी एक को टैप करना एक महंगी गलती है।", es: "Ahora hay elementos no saludables mezclados en la cuadrícula. Tocar uno es un error costoso.", fr: "Des éléments malsains sont maintenant mélangés dans la grille. En toucher un est une erreur coûteuse.", fa: "اکنون موارد ناسالم در شبکه مخلوط شده‌اند. لمس یکی از آن‌ها اشتباه پرهزینه‌ای است." } },
    { names: { ar: "إعادة الترتيب", en: "Reshuffle", zh: "重新排列", hi: "फिर से फेरबदल", es: "Reorganización", fr: "Remaniement", fa: "بازچینی" }, twist: { ar: "تُعاد الشبكة بعد كل لمسة صحيحة. احفظ نوع الرمز لا موقعه.", en: "The grid reshuffles after every correct tap. Memorize the icon type, not its position.", zh: "每次正确点击后，网格都会重新排列。记住图标的类型，而不是它的位置。", hi: "हर सही टैप के बाद ग्रिड फिर से फेरबदल हो जाता है। आइकन के प्रकार को याद रखें, उसकी स्थिति को नहीं।", es: "La cuadrícula se reorganiza después de cada toque correcto. Memoriza el tipo de icono, no su posición.", fr: "La grille se remanie après chaque bon toucher. Mémorisez le type d'icône, pas sa position.", fa: "پس از هر ضربه درست، شبکه دوباره به‌هم می‌ریزد. نوع آیکون را به خاطر بسپارید، نه موقعیت آن را." } },
    { names: { ar: "المرآة", en: "The Mirror", zh: "镜子", hi: "दर्पण", es: "El Espejo", fr: "Le Miroir", fa: "آینه" }, twist: { ar: "انعكس ترتيب الشبكة بالكامل.", en: "The grid has been fully mirrored.", zh: "网格已完全镜像翻转。", hi: "ग्रिड पूरी तरह से उलट गई है।", es: "La cuadrícula se ha invertido por completo.", fr: "La grille a été entièrement inversée.", fa: "شبکه کاملاً آینه‌ای شده است." } },
    { names: { ar: "التوازن الكامل", en: "Full Balance", zh: "完全平衡", hi: "पूर्ण संतुलन", es: "Equilibrio Total", fr: "Équilibre Total", fa: "تعادل کامل" }, twist: { ar: "الهدف يتبادل بين فئتين الآن. كل القواعد السابقة معًا.", en: "The target now alternates between two categories. Every previous rule, together.", zh: "目标现在在两个类别之间交替。之前所有规则一起生效。", hi: "लक्ष्य अब दो श्रेणियों के बीच बदलता रहता है। पहले के सभी नियम एक साथ।", es: "El objetivo ahora alterna entre dos categorías. Todas las reglas anteriores, juntas.", fr: "La cible alterne désormais entre deux catégories. Toutes les règles précédentes, réunies.", fa: "هدف اکنون بین دو دسته تغییر می‌کند. همه قوانین قبلی با هم." } }
  ];
  function playBalance(band, bandLv, api) {
    const { lerp, rint, addTimer, clear, ctx, emoji, point, addListener, winLevel, loseLevel, canvas, W, countdown } = api;
    const METERS = [{ icon: "🥦" }, { icon: "😴" }, { icon: "🏃" }];
    const JUNK = ["🍬", "🚬", "🍟", "📵"];
    const junkOn = band >= 2, reshuffleOn = band >= 3, mirrorOn = band >= 4, dualOn = band >= 5;
    const n = 9, cols = 3; const cellW = (W - 80) / cols, cellH = 140;
    const colX = c => mirrorOn ? (cols - 1 - c) : c;
    let slotIcons = [];
    const fillGrid = () => { slotIcons = []; for (let i = 0; i < n; i++) slotIcons.push(junkOn && Math.random() < 0.3 ? { junk: true, icon: JUNK[rint(0, JUNK.length - 1)] } : { junk: false, meterIdx: rint(0, 2) }); };
    let targetIdx = rint(0, 2), targetIdx2 = dualOn ? (targetIdx + 1 + rint(0, 1)) % 3 : null, needSecond = dualOn;
    const ensureTargets = () => {
      if (!slotIcons.some(s => !s.junk && s.meterIdx === targetIdx)) slotIcons[rint(0, n - 1)] = { junk: false, meterIdx: targetIdx };
      if (dualOn && !slotIcons.some(s => !s.junk && s.meterIdx === targetIdx2)) slotIcons[rint(0, n - 1)] = { junk: false, meterIdx: targetIdx2 };
    };
    fillGrid(); ensureTargets();
    const chainLen = Math.round(lerp(bandLv, 2, 5)) + (band >= 5 ? 1 : 0);
    let hits = 0;
    const slotPos = i => ({ x: 40 + colX(i % cols) * cellW + cellW / 2, y: 190 + Math.floor(i / cols) * cellH + cellH / 2 });
    const draw = () => {
      clear();
      emoji(dualOn ? (needSecond ? METERS[targetIdx2].icon : METERS[targetIdx].icon) : METERS[targetIdx].icon, W / 2, 55, 44);
      slotIcons.forEach((s, i) => { const p = slotPos(i); emoji(s.junk ? s.icon : METERS[s.meterIdx].icon, p.x, p.y + 10, 34); });
    };
    draw();
    // V1230.65 — quality pass (same request as playPlot() above): a correct tap that wasn't the
    // final one silently reshuffled/retargeted with no feedback at all. pulseSlot() rings the tapped
    // icon in green for a beat before the grid moves on, so the tap visibly registered.
    const pulseSlot = i => { const p = slotPos(i); ctx.save(); ctx.shadowColor = "#63e6be"; ctx.shadowBlur = 26; ctx.strokeStyle = "#63e6be"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y + 6, 42, 0, 7); ctx.stroke(); ctx.restore(); };
    const onClick = e => {
      const p = point(e);
      const idx = slotIcons.findIndex((_, i) => { const sp = slotPos(i); return Math.abs(p.x - sp.x) < cellW / 2 - 5 && Math.abs(p.y - sp.y) < 60; });
      if (idx < 0) return;
      const s = slotIcons[idx];
      const wantIdx = dualOn ? (needSecond ? targetIdx2 : targetIdx) : targetIdx;
      if (!s.junk && s.meterIdx === wantIdx) {
        hits++; if (dualOn) needSecond = !needSecond;
        pulseSlot(idx);
        if (hits >= chainLen) { addTimer(() => winLevel(), 140); return; }
        addTimer(() => {
          if (reshuffleOn) fillGrid();
          if (!dualOn) targetIdx = rint(0, 2);
          ensureTargets(); draw();
        }, 140);
      } else loseLevel();
    };
    addListener(canvas, "click", onClick);
    countdown(lerp(bandLv, 22, 10) + chainLen, () => loseLevel());
  }
  function grantHealthEpicReward() {
    window.ZIVOZONE?.Economy?.credit?.(5, { type: "health_epic_reward", source: "health", health: "epic50", claimId: "health_epic50_clear" }).then(ok => { if (ok) window.ZIVOZONE?.Economy?.addXP?.(60); });
  }
  function openHealthEpic() {
    hgStop();
    // V1230.63 — same fix as openStoryEpic() above: .zr-epic-wrap instead of the narrow .zr-reader
    // text column this was borrowing from zr-hg-view.
    const e = frame(`<div class="zr-epic-wrap health"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <div class="zr-epic-head"><span class="zr-kicker">${esc(COPY.health.title)} • ${esc(localizedText(EPIC_NAME_HW))}</span><h1>${esc(localizedText(EPIC_NAME_HW))}</h1></div>
      <div id="zr-epic-mount"></div>
      <button id="zr-back" class="zr-epic-back" type="button">${esc(t("healthGameBackToHealth"))}</button></div>`, "health", localizedText(EPIC_NAME_HW));
    e.querySelector("#zr-close").onclick = () => close();
    e.querySelector("#zr-back").onclick = () => openHealth();
    window.ZIVOZONE_EPIC50?.mount(e.querySelector("#zr-epic-mount"), {
      id: "health_epic", icon: "❤", names: EPIC_NAME_HW, bands: EPIC_BANDS_HW,
      archFn: playBalance,
      onExit: () => openHealth(),
      onFinish: won => { if (won) grantHealthEpicReward(); },
      // V1230.92 — "Challenge a friend" (duel): see openStoryEpic()'s matching comment above for why
      // this is needed.
      shareGameId: "rooms/health-world", shareName: localizedText(EPIC_NAME_HW)
    });
  }
  function gatedEpicStartHW() { return window.ZIVOZONE_REQUIRE_PLAY ? window.ZIVOZONE_REQUIRE_PLAY(openHealthEpic) : openHealthEpic(); }

  // ---- health fitness mini-game (real-time reaction game, not a quiz) -----------
  let hg = null;
  function hgStop() {
    if (!hg) return;
    clearInterval(hg.spawnTimer); clearInterval(hg.tickTimer);
    (hg.liveTimers || []).forEach(x => clearTimeout(x));
    hg = null;
  }
  async function grantHealthReward() {
    const ok = await window.ZIVOZONE?.Economy?.credit?.(5, { type: "health_reward", source: "health", health: "fitness_reaction", claimId: "health_game_clear" }); // V1230.84 — unified reward (was 2)
    if (!ok) return;
    await window.ZIVOZONE?.Economy?.addXP?.(20);
    window.dispatchEvent(new CustomEvent("zivozone-reward", { detail: { xp: 20, zivo: 2, source: "health", health: "fitness_reaction" } }));
  }
  function openHealthGame() {
    hgStop();
    const e = frame(`<div class="zr-room health"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <article class="zr-reader zr-hg-view"><div class="zr-kicker">${esc(COPY.health.title)} • ${esc(t("healthGameTitle"))}</div>
        <h1>${esc(t("healthGameTitle"))}</h1><div class="zr-divider"></div>
        <p>${esc(t("healthGameIntro"))}</p>
        <button id="zr-hg-start" type="button" class="zr-quiz-cta">${esc(t("healthGameStart"))}</button>
        <button id="zr-back" type="button">${esc(t("healthGameBackToHealth"))}</button></article></div>`, "health", t("healthGameTitle"));
    e.querySelector("#zr-close").onclick = () => { hgStop(); close(); };
    e.querySelector("#zr-back").onclick = () => { hgStop(); openHealth(); };
    e.querySelector("#zr-hg-start").onclick = () => hgPlay();
  }
  function hgPlay() {
    hgStop();
    hg = {
      meters: { nutrition: 100, rest: 100, energy: 100 }, score: 0,
      timeLeft: Math.round(HG_ROUND_MS / 1000), cells: Array(HG_CELLS).fill(null),
      liveTimers: [], spawnTimer: null, tickTimer: null, ended: false
    };
    const e = frame(`<div class="zr-room health"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <article class="zr-reader zr-hg-view"><div class="zr-kicker">${esc(t("healthGameTitle"))}</div>
        <div class="zr-hg-hud">
          <b id="zr-hg-time">${esc(fmt("healthGameTimeLeft", { sec: hg.timeLeft }))}</b>
          <div class="zr-hg-meters">
            <span class="zr-hg-meter nutrition"><i id="zr-hg-m-nutrition" style="width:100%"></i><b id="zr-hg-t-nutrition">${esc(fmt("healthGameMeterNutrition", { pct: 100 }))}</b></span>
            <span class="zr-hg-meter rest"><i id="zr-hg-m-rest" style="width:100%"></i><b id="zr-hg-t-rest">${esc(fmt("healthGameMeterRest", { pct: 100 }))}</b></span>
            <span class="zr-hg-meter energy"><i id="zr-hg-m-energy" style="width:100%"></i><b id="zr-hg-t-energy">${esc(fmt("healthGameMeterEnergy", { pct: 100 }))}</b></span>
          </div>
          <b id="zr-hg-score">${esc(fmt("healthGameScoreLive", { score: hg.score }))}</b>
        </div>
        <div class="zr-hg-grid" id="zr-hg-grid">${Array.from({ length: HG_CELLS }, (_, i) => `<button type="button" class="zr-hg-cell" data-cell="${i}" data-kind=""></button>`).join("")}</div>
      </article></div>`, "health", t("healthGameTitle"));
    e.querySelector("#zr-close").onclick = () => { hgStop(); close(); };
    const grid = e.querySelector("#zr-hg-grid");

    function updateMeters() {
      HG_METERS.forEach(m => {
        const fillEl = document.getElementById(`zr-hg-m-${m}`);
        const txtEl = document.getElementById(`zr-hg-t-${m}`);
        const pct = Math.max(0, Math.round(hg.meters[m]));
        if (fillEl) fillEl.style.width = pct + "%";
        if (txtEl) txtEl.textContent = fmt(`healthGameMeter${m[0].toUpperCase()}${m.slice(1)}`, { pct });
      });
      const scoreEl = document.getElementById("zr-hg-score");
      if (scoreEl) scoreEl.textContent = fmt("healthGameScoreLive", { score: hg.score });
    }
    function shake() {
      const gridEl = document.getElementById("zr-hg-grid");
      if (!gridEl) return;
      gridEl.classList.add("zr-hg-shake");
      setTimeout(() => gridEl?.classList.remove("zr-hg-shake"), 300);
    }

    grid.addEventListener("click", ev => {
      const btn = ev.target.closest("[data-cell]");
      if (!btn || !hg || hg.ended) return;
      const kind = btn.dataset.kind;
      if (!kind) return;
      const icon = btn.dataset.icon;
      btn.dataset.kind = "";
      btn.classList.remove("good", "bad");
      if (kind === "good") {
        const meter = HG_ICON_METER[icon] || HG_METERS[0];
        hg.meters[meter] = Math.min(100, hg.meters[meter] + HG_GOOD_GAIN);
        hg.score++;
        btn.classList.add("hit-good");
        try { A()?.playSfx?.("correct"); } catch (_) {}
      } else {
        HG_METERS.forEach(m => { hg.meters[m] = Math.max(0, hg.meters[m] - HG_BAD_LOSS); });
        btn.classList.add("hit-bad");
        shake();
        try { A()?.playSfx?.("wrong"); } catch (_) {}
      }
      btn.textContent = "";
      setTimeout(() => btn.classList.remove("hit-good", "hit-bad"), 260);
      updateMeters();
      if (HG_METERS.some(m => hg.meters[m] <= 0)) { const sc = hg.score, mt = { ...hg.meters }; hgStop(); hgResult(false, sc, mt); }
    });
    function spawnOne() {
      if (!hg || hg.ended || !document.getElementById("zr-hg-grid")) return hgStop();
      const free = hg.cells.map((v, i) => v ? -1 : i).filter(i => i >= 0);
      if (!free.length) return;
      const i = free[Math.floor(Math.random() * free.length)];
      const good = Math.random() < 0.65;
      const icon = good ? HG_GOOD[Math.floor(Math.random() * HG_GOOD.length)] : HG_BAD[Math.floor(Math.random() * HG_BAD.length)];
      hg.cells[i] = good ? "good" : "bad";
      const cellBtn = grid.querySelector(`[data-cell="${i}"]`);
      if (!cellBtn) return;
      cellBtn.dataset.kind = good ? "good" : "bad";
      cellBtn.dataset.icon = icon;
      cellBtn.classList.add(good ? "good" : "bad");
      cellBtn.textContent = icon;
      const tm = setTimeout(() => {
        if (!hg) return;
        hg.cells[i] = null;
        if (cellBtn.dataset.kind) { cellBtn.dataset.kind = ""; cellBtn.dataset.icon = ""; cellBtn.classList.remove("good", "bad"); cellBtn.textContent = ""; }
      }, HG_LIVE_MS);
      hg.liveTimers.push(tm);
    }
    hg.spawnTimer = setInterval(spawnOne, HG_SPAWN_MS);
    hg.tickTimer = setInterval(() => {
      if (!hg || !document.getElementById("zr-hg-grid")) return hgStop();
      hg.timeLeft--;
      HG_METERS.forEach(m => { hg.meters[m] = Math.max(0, hg.meters[m] - HG_DRAIN_PER_SEC); });
      const timeEl = document.getElementById("zr-hg-time");
      if (timeEl) timeEl.textContent = fmt("healthGameTimeLeft", { sec: Math.max(0, hg.timeLeft) });
      updateMeters();
      if (HG_METERS.some(m => hg.meters[m] <= 0)) { const sc = hg.score, mt = { ...hg.meters }; hgStop(); hgResult(false, sc, mt); return; }
      if (hg.timeLeft <= 0) { const sc = hg.score, mt = { ...hg.meters }; hgStop(); hgResult(true, sc, mt); }
    }, 1000);
    updateMeters();
  }
  function hgResult(survived, score, meters) {
    const alreadyDone = !!progress()["health_game"];
    const pass = survived && HG_METERS.every(m => (meters?.[m] ?? 0) >= HG_PASS_PCT);
    const e = frame(`<div class="zr-room health"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <article class="zr-reader zr-hg-view"><div class="zr-kicker">${esc(t("healthGameTitle"))}</div>
        <h1>${esc(survived ? fmt("healthGameResultTitle", { score }) : t("healthGameFailedTitle"))}</h1><div class="zr-divider"></div>
        <p>${esc(pass ? t("healthGameFinishGood") : t("healthGameFinishOk"))}</p>
        ${!alreadyDone ? `<p class="zr-quiz-reward-note">${esc(t("healthGameRewardNote"))}</p>` : ""}
        ${pass && !alreadyDone ? `<button id="zr-hg-claim" type="button" class="zr-quiz-cta">${esc(t("healthGameClaim"))}</button>` : ""}
        <button id="zr-hg-again" type="button">${esc(t("healthGamePlayAgain"))}</button>
        <button id="zr-back" type="button">${esc(t("healthGameBackToHealth"))}</button></article></div>`, "health", t("healthGameTitle"));
    e.querySelector("#zr-close").onclick = () => close();
    e.querySelector("#zr-back").onclick = () => openHealth();
    e.querySelector("#zr-hg-again").onclick = () => hgPlay();
    const claimBtn = e.querySelector("#zr-hg-claim");
    if (claimBtn) claimBtn.onclick = async () => {
      claimBtn.disabled = true;
      markRead("health_game");
      await grantHealthReward();
      openHealth();
    };
  }

  async function healthDoor(id) {
    let doors;
    try {
      doors = await loadLocalized(HEALTH_DOORS);
      if (!Array.isArray(doors) || !doors.length) throw new Error("Health doors are empty");
    } catch (_) { return failure(() => healthDoor(id), fmt("roomsHealthUnavailable", { id })); }
    const idx = doors.findIndex(x => x && String(x.id) === String(id));
    if (idx < 0) return openHealth();
    const d = doors[idx], tt = splitTitle(d.title), prev = doors[idx - 1], next = doors[idx + 1];
    const e = frame(`<div class="zr-room health"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <article class="zr-reader"><div class="zr-kicker">ZIVO HEALTH • ${esc(d.id)}/${doors.length}</div>
        <h1>${esc(tt.icon)} ${esc(tt.name)}</h1><div class="zr-divider"></div><div class="zr-health-text zr-md">${md(d.content)}</div>
        <p class="zr-note">${esc(HEALTH_NOTE())}</p>
        <div class="zr-nav">${prev ? `<button type="button" data-go="${esc(prev.id)}">→ ${esc(splitTitle(prev.title).name)}</button>` : "<span></span>"}${next ? `<button type="button" data-go="${esc(next.id)}">${esc(splitTitle(next.title).name)} ←</button>` : "<span></span>"}</div>
        <button id="zr-back" type="button">${esc(t("roomsBackToHealth"))}</button></article></div>`, "health", tt.name);
    markRead("h:" + d.id);
    e.querySelector("#zr-close").onclick = () => close();
    e.querySelector("#zr-back").onclick = openHealth;
    e.querySelectorAll("[data-go]").forEach(b => b.onclick = () => healthDoor(b.dataset.go));
    try { A()?.playSfx?.("click_light"); } catch (_) {}
  }

  // ---- time (ما وراء الزمن) -----------------------------------------------------
  async function openTime() {
    let doors;
    try {
      doors = await loadLocalized(TIME_DOORS);
      if (!Array.isArray(doors) || !doors.length) throw new Error("Time epochs are empty");
    } catch (_) { return failure(openTime, t("roomsTimeIndexFailure")); }
    const done = progress();
    const e = frame(`<div class="zr-room time"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <header><div class="zr-kicker">ZIVO TIME ARCHIVE • ${esc(t("roomsTimeTitle"))}</div><h1>${esc(t("roomsTimeTitle"))}</h1><p>${esc(t("roomsTimePick"))}</p></header>
      <div class="zr-grid">${doors.map(d => `<button type="button" class="zr-card time-card${done["tm:" + d.id] ? " done" : ""}" data-epoch="${esc(d.id)}"><span>${esc(fmt("roomsDoorLabel", { id: d.id }))} • ${esc(d.era || "")}${done["tm:" + d.id] ? " • ✓" : ""}</span><strong>${esc(d.title)}</strong><em>${esc(d.era || "")}</em><b>${esc(t("roomsOpenDoorCard"))}</b></button>`).join("")}</div>
      <p class="zr-note">${esc(TIME_NOTE())}</p></div>`, "time", t("roomsTimeTitle"));
    e.querySelector("#zr-close").onclick = () => close();
    e.querySelectorAll("[data-epoch]").forEach(b => b.onclick = () => timeEpoch(b.dataset.epoch));
  }

  // ---- live community truth-meter (Firestore timeVotes/{doorId} = {fact, illusion}) -------------
  // V1230.123 — same guarded default-app pattern as share.js's shortDb(), duplicated locally rather
  // than imported: rooms.js is a lazy-loaded, self-contained module (see room-loader.js) with no
  // build-time import system, and share.js may not have run yet when this first fires.
  let _timeDb;
  function timeDb() {
    if (_timeDb !== undefined) return _timeDb;
    try {
      const CFG = window.ZIVOZONE_FIREBASE_CONFIG;
      if (!CFG || !window.firebase?.initializeApp) { _timeDb = null; return _timeDb; }
      if (!firebase.apps.some(a => a.name === "[DEFAULT]")) firebase.initializeApp(CFG);
      _timeDb = firebase.firestore();
    } catch (_) { _timeDb = null; }
    return _timeDb;
  }
  // Increments the picked side by 1 and returns the resulting {fact, illusion} totals — or null if
  // Firestore isn't reachable (offline, blocked, or this sandbox/dev build with no live project),
  // in which case the caller just skips showing the live bar. Never blocks or fails the quiz itself.
  async function voteTruth(doorId, pick) {
    const db = timeDb();
    if (!db || !["fact", "illusion"].includes(pick)) return null;
    const ref = db.collection("timeVotes").doc(String(doorId));
    try {
      await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        const cur = snap.exists ? (snap.data() || {}) : {};
        const fact = Number(cur.fact) || 0, illusion = Number(cur.illusion) || 0;
        tx.set(ref, { fact: fact + (pick === "fact" ? 1 : 0), illusion: illusion + (pick === "illusion" ? 1 : 0) }, { merge: true });
      });
      const snap = await ref.get();
      const d = snap.data() || {};
      return { fact: Number(d.fact) || 0, illusion: Number(d.illusion) || 0 };
    } catch (e) { console.warn("ZIVOZONE timeVotes:", e); return null; }
  }

  function renderTruthWidget(tr) {
    if (!tr || !tr.claim) return "";
    return `<div class="zr-truth" id="zr-truth-widget">
      <div class="zr-truth-kicker">${esc(t("timeTruthKicker"))}</div>
      <p class="zr-truth-claim">${esc(tr.claim)}</p>
      <div class="zr-quiz-options zr-truth-options">
        <button type="button" class="zr-quiz-opt" data-truth="fact">${esc(t("timeTruthAnswerFact"))}</button>
        <button type="button" class="zr-quiz-opt" data-truth="illusion">${esc(t("timeTruthAnswerIllusion"))}</button>
      </div>
      <div class="zr-quiz-feedback" id="zr-truth-feedback" hidden></div>
      <div class="zr-truth-stats" id="zr-truth-stats" hidden>
        <div class="zr-truth-stats-label" id="zr-truth-stats-label">${esc(t("timeVoteLoading"))}</div>
        <div class="zr-truth-bar"><i id="zr-truth-bar-fact"></i></div>
        <div class="zr-truth-stats-row"><span id="zr-truth-pct-fact"></span><span id="zr-truth-pct-illusion"></span></div>
      </div>
      <button type="button" class="zr-quiz-cta zr-truth-share" id="zr-truth-share" hidden>${esc(t("timeShareCta"))}</button>
    </div>`;
  }
  function bindTruthWidget(e, tr, doorId) {
    const wrap = e.querySelector("#zr-truth-widget");
    if (!wrap || !tr) return;
    const opts = [...wrap.querySelectorAll("[data-truth]")];
    opts.forEach(b => b.onclick = async () => {
      opts.forEach(x => x.disabled = true);
      const picked = b.dataset.truth;
      const right = picked === tr.answer;
      opts.forEach(x => x.classList.toggle("right", x.dataset.truth === tr.answer));
      if (!right) b.classList.add("wrong");
      const fb = wrap.querySelector("#zr-truth-feedback");
      fb.hidden = false;
      fb.textContent = (right ? t("timeTruthCorrectLabel") : t("timeTruthWrongLabel")) + " " + tr.explanation;
      fb.className = "zr-quiz-feedback show " + (right ? "right" : "wrong");
      try { A()?.playSfx?.(right ? "correct" : "wrong"); } catch (_) {}

      const shareBtn = wrap.querySelector("#zr-truth-share");
      const pickLabel = t(picked === "fact" ? "timeTruthAnswerFact" : "timeTruthAnswerIllusion");
      if (shareBtn) {
        shareBtn.hidden = false;
        shareBtn.onclick = () => window.ZIVOZONE?.Share?.shareStance?.({ doorId, claim: tr.claim, pickLabel });
      }

      const totals = await voteTruth(doorId, picked);
      if (!totals) return;
      const sum = totals.fact + totals.illusion;
      if (sum <= 0) return;
      const factPct = Math.round((totals.fact / sum) * 100);
      const illusionPct = 100 - factPct;
      const stats = wrap.querySelector("#zr-truth-stats");
      const bar = wrap.querySelector("#zr-truth-bar-fact");
      if (bar) bar.style.width = factPct + "%";
      const label = wrap.querySelector("#zr-truth-stats-label");
      if (label) label.textContent = fmt("timeVoteStatsLabel", { factPct, illusionPct, count: sum });
      if (stats) stats.hidden = false;
    });
  }

  async function timeEpoch(id) {
    let doors;
    try {
      doors = await loadLocalized(TIME_DOORS);
      if (!Array.isArray(doors) || !doors.length) throw new Error("Time epochs are empty");
    } catch (_) { return failure(() => timeEpoch(id), fmt("roomsTimeUnavailable", { id })); }
    const idx = doors.findIndex(x => x && String(x.id) === String(id));
    if (idx < 0) return openTime();
    const d = doors[idx], prev = doors[idx - 1], next = doors[idx + 1];
    const e = frame(`<div class="zr-room time"><button class="zr-x" id="zr-close" aria-label="${esc(t("close"))}">×</button>
      <article class="zr-reader"><div class="zr-kicker">ZIVO TIME • ${esc(fmt("roomsDoorLabel", { id: d.id }))}/${doors.length}</div>
        <h1>${esc(d.title)}</h1><div class="zr-divider"></div><div class="zr-time-text zr-md">${md(d.content)}</div>
        ${renderTruthWidget(d.truth, d.id)}
        <p class="zr-note">${esc(TIME_NOTE())}</p>
        <div class="zr-nav">${prev ? `<button type="button" data-go="${esc(prev.id)}">→ ${esc(prev.title)}</button>` : "<span></span>"}${next ? `<button type="button" data-go="${esc(next.id)}">${esc(next.title)} ←</button>` : "<span></span>"}</div>
        <button id="zr-back" type="button">${esc(t("roomsBackToTime"))}</button></article></div>`, "time", d.title);
    markRead("tm:" + d.id);
    e.querySelector("#zr-close").onclick = () => close();
    e.querySelector("#zr-back").onclick = openTime;
    e.querySelectorAll("[data-go]").forEach(b => b.onclick = () => timeEpoch(b.dataset.go));
    bindTruthWidget(e, d.truth, d.id);
    try { A()?.playSfx?.("click_light"); } catch (_) {}
  }

  window.addEventListener("zivozone:route", ev => {
    const route = ev.detail || {};
    if (route.type === "story" && route.id) {
      if (activeStoryId === String(route.id) && isOpen()) return;
      // A prerendered /stories/* page already contains the full semantic article.
      // Keep it visible on first load; hydrate the modal only for SPA navigation.
      if (document.body.classList.contains("zivo-seo-route") && route.reason === "boot") return;
      openStory(route.id, { fromRoute: true }).catch(() => {});
    } else if (route.type === "home" && isOpen()) {
      // V1230.123 — router.js's boot() emits this same "home" event (reason:"boot") on every page
      // load, including one that lands on /?timeDoor=<id>: room-loader.js's deep-link handler races
      // this exact event, and when rooms.js's own lazy module and the door's content both happen to
      // load faster than DOMContentLoaded fires, the shared-link recipient would see their door open
      // for a moment and then get slammed shut by this very branch a few hundred ms later. A real SPA
      // "back to home" navigation is never tagged "boot", so skipping just this one reason costs
      // nothing on the normal close-on-home-nav path.
      if (route.reason === "boot") return;
      activeStoryId = null;
      close(true);
      SEO()?.home();
    }
  });

  const initialRoute = R()?.current?.();
  if (initialRoute?.type === "story" && !document.body.classList.contains("zivo-seo-route")) {
    queueMicrotask(() => openStory(initialRoute.id, { fromRoute: true }).catch(() => {}));
  }

  // ---- public API + wiring (home cards, data-zivo-room attributes) -------------------------
  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.RealRooms = { enter, openStories, openHealth, openStory, healthDoor, openHealthGame, openTime, timeEpoch, close: () => close() };

  const kindOf = el => el.dataset.zivoRoom || (el.hasAttribute("data-zivo-story-room") ? "stories" : "health");
  document.addEventListener("click", ev => {
    const el = ev.target.closest && ev.target.closest("[data-zivo-room],[data-zivo-story-room],[data-zivo-health-room]");
    if (!el) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    enter(kindOf(el));
  }, true);
  document.addEventListener("keydown", ev => {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    const el = ev.target.closest && ev.target.closest("[data-zivo-room],[data-zivo-story-room],[data-zivo-health-room]");
    if (!el || el.tagName === "BUTTON" || el.tagName === "A") return;
    ev.preventDefault(); enter(kindOf(el));
  }, true);
})();
