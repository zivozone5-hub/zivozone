/* ZIVOZONE V1226 — persistent Daily Challenge + offline sync */
(() => {
  "use strict";
  const KEY = "zivozone_daily_state_v1226";
  const QUEUE = "zivozone_daily_sync_queue_v1226";
  const today = () => new Date().toISOString().slice(0, 10);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (_) { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };
  const uid = () => window.firebase?.auth?.()?.currentUser?.uid || window.ZIVOZONE?.Auth?.user?.uid || "guest";
  const eventId = () => crypto?.randomUUID?.() || `daily_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const sourceCache = { stories:null, news:null };
  async function loadSourceJSON(url, key) {
    if (sourceCache[key]) return sourceCache[key];
    try {
      const r = await fetch(`${url}?v=1228.0`, { cache:"no-store", headers:{Accept:"application/json"} });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json(); sourceCache[key] = data; return data;
    } catch (_) { return null; }
  }
  function challengeTitle(id) {
    try {
      const bank = window.ZIVOZONE?.Challenges?.get?.(id) || window.ZIVOZONE_CHALLENGES?.get?.(id) || window.ZIVOZONE_CHALLENGES?.[id];
      const value = bank?.title || bank?.name;
      if (typeof value === "string" && value.trim()) return value.trim();
      if (value && typeof value === "object") return value[document.documentElement.lang] || value.ar || value.en || Object.values(value)[0] || id;
    } catch (_) {}
    return id;
  }
  async function currentContentTitle(id) {
    const title = challengeTitle(id);
    const stories = await loadSourceJSON("data/stories/index.json", "stories");
    const story = Array.isArray(stories) ? stories.find(x => x?.id === id) : null;
    if (story?.title) return { challengeTitle:title, storyTitle:String(story.title), newsHeadline:"" };
    const news = await loadSourceJSON("data/news.json", "news");
    const list = Array.isArray(news?.sports) ? news.sports : Array.isArray(news?.politics) ? news.politics : [];
    return { challengeTitle:title, storyTitle:"", newsHeadline:String(list[0]?.headline || "") };
  }
  function state() { const s = read(KEY, {}); return s.date === today() ? s : { date: today(), played: false, challenge: null, result: null, synced: false }; }
  function saveState(patch) { const next = { ...state(), ...patch, date: today() }; write(KEY, next); return next; }
  function queueResult(result) { const q = read(QUEUE, []); const item = { ...result, queueId: result.queueId || eventId(), queuedAt: Date.now(), uid: uid() }; const filtered = q.filter(x => x.queueId !== item.queueId && !(x.date === item.date && x.uid === item.uid)); q.push(item); write(QUEUE, filtered.slice(-20)); saveState({ result: item, synced: false }); return item; }
  async function sync() {
    const q = read(QUEUE, []); if (!q.length) return { synced: 0, remaining: 0 };
    const user = window.firebase?.auth?.()?.currentUser || window.ZIVOZONE?.Auth?.user || null;
    if (!user || !navigator.onLine) return { synced: 0, remaining: q.length };
    const keep = []; let synced = 0;
    for (const item of q) {
      try {
        let result = null;
        let cloudConfigured = false;
        if (window.ZIVOZONE_V46?.submit) {
          cloudConfigured = true;
          const cloud = await window.ZIVOZONE_V46.submit({ challengeId: item.challengeId, attemptId: item.queueId, total: item.total, correct: item.correct, score: item.score, startedAt: item.startedAt || new Date(item.queuedAt).toISOString() });
          if (cloud?.accepted) result = cloud;
        }
        if (!result && !cloudConfigured) {
          result = await window.ZIVOZONE?.GamePlatform?.recordProviderResult?.({ gameId: item.challengeId, room: "daily", version: "1226.0", score: item.score, correct: item.correct, total: item.total, duration: item.duration || 0, completed: item.completed !== false, timedOut: Boolean(item.timedOut) });
        }
        if (result) { synced++; if (item.date === today()) saveState({ synced: true, result: { ...item, server: result } }); }
        else keep.push(item);
      } catch (_) { keep.push(item); }
    }
    write(QUEUE, keep.slice(-20));
    return { synced, remaining: keep.length };
  }
  function pick() {
    const b = window.ZIVOZONE_CHALLENGES || {};
    const keys = Object.keys(b).filter(k => b[k]?.questions && !b[k].special && !/horror|dark/i.test(k));
    if (!keys.length) return "iq";
    let n = 0; for (const ch of today()) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
    return keys[n % keys.length];
  }
  function persistResult(result = {}) {
    const item = queueResult({
      date: today(),
      challengeId: result.challengeId || state().challenge || pick(),
      score: Number(result.score) || 0,
      correct: Number(result.correct) || 0,
      total: Number(result.total) || 0,
      duration: Number(result.duration) || 0,
      completed: result.completed !== false,
      timedOut: Boolean(result.timedOut)
    });
    saveState({
      played: true,
      challenge: item.challengeId,
      result: item,
      synced: false
    });
    try {
      window.ZIVOZONE?.Events?.emit('DAILY_CHALLENGE_COMPLETED', item);
    } catch (_) {}
    return item;
  }
  async function recordResult(result = {}) { const item = persistResult(result); await sync(); return item; }
  function open() {
    let o = document.getElementById("zivo-daily");
    if (!o) {
      o = document.createElement("div"); o.id = "zivo-daily"; o.className = "v32-overlay";
      o.innerHTML = '<div class="v32-card"><button class="v32-close">×</button><div class="v32-head"><div class="v32-mark">Z</div><div><small>DAILY COMPETITION</small><h2>تحدي اليوم</h2><span id="zivo-daily-date"></span></div></div><div class="v32-hero"><b>تحدٍ جديد كل يوم</b><p>يُحفظ إنجازك محلياً فوراً، ثم تتم مزامنته مع الحساب عند عودة الاتصال.</p><div class="v32-meta"><span id="zivo-daily-ch"></span><span id="zivo-daily-state"></span></div></div><button id="zivo-daily-play">ابدأ تحدي اليوم</button><div class="v32-rules"><span>⏱ 30 ثانية لكل سؤال</span><span>🏆 سجّل أفضل نتيجة</span><span>🔥 ابنِ سلسلة لعب</span></div></div>';
      document.body.appendChild(o); o.querySelector(".v32-close").onclick = () => o.classList.remove("open");
      o.querySelector("#zivo-daily-play").onclick = () => { const ch = pick(); saveState({ played: true, challenge: ch, synced: false }); o.classList.remove("open"); if (typeof window.startChallenge === "function") window.startChallenge(ch); else window.ZIVOZONE?.Challenges?.start?.(ch); };
    }
    const s = state(), ch = s.challenge || pick();
    o.querySelector("#zivo-daily-date").textContent = today();
    o.querySelector("#zivo-daily-ch").textContent = "جاري قراءة بيانات التحدي...";
    currentContentTitle(ch).then(meta => {
      if (!o.isConnected) return;
      const label = meta.challengeTitle || meta.storyTitle || meta.newsHeadline || ch;
      o.querySelector("#zivo-daily-ch").textContent = "التحدي: " + label;
      o.dataset.contentTitle = meta.storyTitle || meta.newsHeadline || "";
    }).catch(() => {
      if (o.isConnected) o.querySelector("#zivo-daily-ch").textContent = "التحدي: " + challengeTitle(ch);
    });
    o.querySelector("#zivo-daily-state").textContent = s.synced ? "مزامن ✓" : s.played ? (s.result ? "نتيجتك محفوظة بانتظار المزامنة" : "لعبته اليوم ✓") : "لم تلعبه بعد";
    try {
      window.ZIVOZONE?.Events?.emit('DAILY_CHALLENGE_OPEN', {
        challengeId: ch,
        date: today()
      });
    } catch (_) {}
    o.classList.add("open");
  }
  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.Daily = Object.freeze({ open, state, pick, recordResult, sync });
  addEventListener("online", sync);
  addEventListener("zivozone-auth", sync);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") sync(); });
  setTimeout(sync, 1500);
})();
