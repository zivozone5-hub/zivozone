/* ZIVOZONE V1229.3 — defensive News Core
   Now the sole boot trigger is core/modules/runtime/app-shell.js (see the note above ZIVOZONE_NEWS export).
   V1229: the two stacked rails (football / politics, each fading between one headline
   at a time) are now a single continuous ticker, interleaving both feeds like a TV
   news channel banner. Data validation, caching and the remote/local fallback chain
   are unchanged from V1226. */
(() => {
  "use strict";
  const DATA_URL = "data/news.json";
  const SOURCES_URL = "data/news-sources.json";
  const REMOTE_DATA_URL = "https://raw.githubusercontent.com/zivozone5-hub/zivozone/main/data/news.json";
  const CACHE_KEY = "zivozone_news_core_v1226";
  const REFRESH_MS = 30 * 60 * 1000;
  const PX_PER_SECOND = 60; // constant ticker speed regardless of headline count
  const esc = window.ZIVOZONE_ESC;
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const clean = v => String(v ?? "").replace(/\s+/g, " ").trim();
  const arabic = v => /[\u0600-\u06FF]/.test(String(v || ""));
  const safeUrl = v => { try { const u = new URL(String(v || "")); return /^https?:$/.test(u.protocol) ? u.href : ""; } catch (_) { return ""; } };
  const FALLBACK = Object.freeze({
    sports: [
      { headline: "ZIVOZONE: تابع أحدث الأخبار والنتائج الرياضية عبر مركز المباريات", category: "رياضة" },
      { headline: "مركز المباريات يعرض آخر البيانات المتاحة عند تعذر التحديث المباشر", category: "رياضة" }
    ],
    politics: [
      { headline: "ZIVOZONE: لا تتوفر حالياً أخبار سياسية جديدة في المصدر المحلي", category: "عام" },
      { headline: "سيتم تحديث شريط الأخبار تلقائياً عند توفر بيانات جديدة", category: "عام" }
    ]
  });
  const normalizeArray = (value, kind) => {
    if (!Array.isArray(value)) return [];
    return value.map(x => norm(x, kind)).filter(Boolean);
  };
  function norm(x, kind) {
    if (!x || typeof x !== "object") return null;
    const headline = clean(x.headline || x.title);
    if (!headline || !arabic(headline)) return null;
    return { headline, url: safeUrl(x.url), published: x.published || "", category: clean(x.category || kind), kind };
  }
  function validateSources(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("News sources payload is not an object");
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!Array.isArray(value)) { out[key] = []; continue; }
      out[key] = value.filter(item => Array.isArray(item) && item.length >= 2 && clean(item[0]) && safeUrl(item[1]));
    }
    return out;
  }
  function validateData(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("News payload is not an object");
    const sports = normalizeArray(raw.sports, "sports");
    // V1230.97 — the live data/news.json (written every 6h by scripts/fetch_news.py, which this
    // deploy keeps as-is since it's the proven-working fetcher) calls the second feed "general",
    // not "politics". Accept either key so this module doesn't silently render the fallback
    // placeholder for that whole feed against real production data.
    const politics = normalizeArray(raw.politics ?? raw.general, "politics");
    return { updatedAt: Number(raw.updatedAt) || Date.now(), sports, politics };
  }
  function withFallback(data) {
    const d = data && typeof data === "object" ? data : {};
    return {
      updatedAt: Number(d.updatedAt) || Date.now(),
      sports: d.sports?.length ? d.sports : FALLBACK.sports.map(x => ({ ...x })),
      politics: d.politics?.length ? d.politics : FALLBACK.politics.map(x => ({ ...x }))
    };
  }
  function uniq(xs) { const s = new Set(); return xs.filter(x => { const k = clean(x.headline).toLowerCase().replace(/[^\u0600-\u06FF\w]+/g, ""); if (!k || s.has(k)) return false; s.add(k); return true; }); }
  function cacheRead() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch (_) { return null; } }
  function cacheWrite(data) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data })); } catch (_) {} }

  /* interleave two already-normalized lists so the strip reads sport / general / sport / general ...
     instead of running through one whole feed before the other. */
  function interleave(a, b) {
    const out = []; const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) { if (a[i]) out.push(a[i]); if (b[i]) out.push(b[i]); }
    return out;
  }
  function tag(x) { return x.kind === "sports" ? `<span class="zivo-ticker-tag sport">${esc(t("newsTagSports"))}</span>` : `<span class="zivo-ticker-tag general">${esc(t("newsTagGeneral"))}</span>`; }
  function tickerItem(x) {
    const body = `${tag(x)}<span class="zivo-ticker-headline" dir="rtl">${esc(x.headline)}</span>`;
    return x.url
      ? `<a class="zivo-ticker-item" dir="rtl" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${body}</a>`
      : `<span class="zivo-ticker-item" dir="rtl">${body}</span>`;
  }

  let rafId = null;
  function stopTicker() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  /* V1229.3 — the ٍJordan football sub-section (#jordan-news-list) previously had no renderer at all:
     it was permanently blank under a "live sources" label. This filters the same sports feed we already
     fetched for Jordan-related keywords, and shows an honest empty state when the source has none today
     instead of silently showing nothing under a "live" badge. */
  const JORDAN_KEYWORDS = ["الأردن", "أردني", "أردنية", "المنتخب الوطني الأردني", "الفيصلي", "الوحدات", "الرمثا", "الجزيرة الأردني", "اتحاد الكرة الأردني", "نشامى"];
  function renderJordan(sportsList) {
    const box = document.getElementById("jordan-news-list"); if (!box) return;
    const items = sportsList.filter(x => JORDAN_KEYWORDS.some(k => x.headline.includes(k)));
    if (!items.length) {
      box.innerHTML = `<article class="sports-card"><div class="icon">🇯🇴</div><h3>${esc(t("newsJordanEmptyTitle"))}</h3><p>${esc(t("newsJordanEmptyText"))}</p></article>`;
      return;
    }
    box.innerHTML = items.map(x => `<article class="sports-card"><div class="icon">🇯🇴</div><h3>${esc(x.headline)}</h3>${x.url ? `<a class="btn btn-ghost" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(t("newsOpenArticle"))}</a>` : ""}</article>`).join("");
  }

  // V1230.21 — mobile readability: a narrow phone screen shows far less of each headline at a time
  // than a desktop window, so the same constant scroll speed that reads fine on desktop feels rushed
  // on mobile. Pressing/holding the ticker now pauses it so a visitor can finish reading whatever
  // headline is mid-screen, releasing resumes — standard news-ticker behavior, missing here before.
  // Bound once on the static `.zivo-newsbar-window` wrapper (not the track itself, which gets its
  // innerHTML replaced on every refresh) so it survives every re-render without re-binding.
  let pauseBound = false;
  function bindPauseOnTouch() {
    if (pauseBound) return;
    const win = document.querySelector(".zivo-newsbar-window");
    if (!win) return;
    pauseBound = true;
    const setState = state => { const t = document.getElementById("zivoNewsTicker"); if (t) t.style.animationPlayState = state; };
    win.addEventListener("pointerdown", () => setState("paused"));
    win.addEventListener("pointerup", () => setState("running"));
    win.addEventListener("pointercancel", () => setState("running"));
    win.addEventListener("pointerleave", () => setState("running"));
  }

  /* One continuous strip: render the list once, measure it, then duplicate it so the loop is seamless
     (when the first copy has scrolled fully offscreen the second copy is exactly in its place). Speed is
     constant (PX_PER_SECOND) so a short list doesn't crawl and a long one doesn't blur past. */
  function renderTicker(id, list) {
    const track = document.getElementById(id); if (!track) return; stopTicker();
    bindPauseOnTouch();
    const finalList = list.length ? list : [...FALLBACK.sports, ...FALLBACK.politics].map(x => ({ ...x, kind: x.category === "رياضة" ? "sports" : "politics" }));
    const html = finalList.map(tickerItem).join("");
    track.style.animation = "none"; track.style.transform = "translateX(0)";
    track.innerHTML = html;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      const singleWidth = track.scrollWidth;
      track.innerHTML = html + html; // duplicate for a seamless loop
      if (reduceMotion || singleWidth < 10) return; // static strip for reduced-motion users
      const duration = Math.max(18, singleWidth / PX_PER_SECOND);
      track.style.setProperty("--ticker-distance", `-${singleWidth}px`);
      track.style.setProperty("--ticker-duration", `${duration}s`);
      track.style.animation = `zivoNewsTicker var(--ticker-duration) linear infinite`;
    });
  }

  function render(data) {
    const safe = withFallback(data);
    const sports = uniq(normalizeArray(safe.sports, "sports")).slice(0, 30);
    const politics = uniq(normalizeArray(safe.politics, "politics")).slice(0, 30);
    renderTicker("zivoNewsTicker", interleave(sports, politics));
    renderJordan(sports);
    document.querySelectorAll("[data-news-title]").forEach((el, i) => {
      const item = (safe.sports[i] || safe.politics[i] || safe.sports[0] || safe.politics[0]);
      if (item?.headline) el.textContent = item.headline;
    });
    window.dispatchEvent(new CustomEvent("zivozone:news-updated", { detail: safe }));
    return safe;
  }
  async function fetchSources() {
    try { const r = await fetch(`${SOURCES_URL}?v=${Date.now()}`, { cache: "no-store", headers: { Accept: "application/json" } }); if (!r.ok) throw Error(`HTTP ${r.status}`); return validateSources(await r.json()); }
    catch (e) { console.warn("News sources validation:", e); return {}; }
  }
  async function fetchData(url) { const c = new AbortController(), t = setTimeout(() => c.abort(), 8000); try { const r = await fetch(`${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`, { cache: "no-store", signal: c.signal, headers: { Accept: "application/json" } }); if (!r.ok) throw Error(`HTTP ${r.status}`); return validateData(await r.json()); } finally { clearTimeout(t); } }
  let inFlight = null;
  async function loadOnce() {
    const cached = cacheRead(); let best = null;
    try { best = await fetchData(DATA_URL); if (best) { best = withFallback(best); cacheWrite(best); render(best); } } catch (e) { console.warn("News local source:", e); }
    try { const remote = await fetchData(REMOTE_DATA_URL); if (remote && Number(remote.updatedAt) >= Number(best?.updatedAt || 0) && (remote.sports.length || remote.politics.length)) { best = withFallback(remote); cacheWrite(best); return render(best); } } catch (e) { console.warn("News remote source:", e); }
    if (!best && cached?.data) best = withFallback(cached.data);
    return render(best || FALLBACK);
  }
  /* V1229.3: load() used to be called up to 3x back-to-back (auto-init + the sports screen calling both
     .load() and .loadJordan(), which were the same function). Collapsing concurrent calls into one
     in-flight promise means every caller still gets the result, but data/news.json and the GitHub
     mirror are fetched once, not three times. */
  function load() {
    if (inFlight) return inFlight;
    inFlight = loadOnce().finally(() => { inFlight = null; });
    return inFlight;
  }
  window.ZIVOZONE_NEWS = { load, loadJordan: load, refresh: load, loadSources: fetchSources, validate: validateData, validateSources, version: "1229.3" };
  window.ZIVOZONE_SPORTS_TICKER = { load, refresh: load };
  /* V1229.3: no independent DOMContentLoaded trigger here anymore. Both pages that include this file
     (index.html and every story page under stories/) also include core/modules/runtime/app-shell.js, whose own
     boot sequence calls window.ZIVOZONE_NEWS.load() once via sports(). Having both fire meant every page
     load fetched data/news.json and the GitHub mirror twice. If a future page includes news.js WITHOUT
     app-shell.js, add an explicit `window.ZIVOZONE_NEWS.load()` call to that page. */
  setInterval(load, REFRESH_MS);
  window.addEventListener("resize", () => { const t = document.getElementById("zivoNewsTicker"); if (t) render(window.__zivoLastNews || FALLBACK); });
  // V1230.47 — re-render the ticker tags, Jordan empty-state and "open article" chrome in the new
  // language immediately on switch, instead of waiting for the next 30-minute refresh.
  window.addEventListener("zivozone-language", () => { render(window.__zivoLastNews || FALLBACK); });
  window.addEventListener("zivozone:news-updated", e => { window.__zivoLastNews = e.detail; });
})();
