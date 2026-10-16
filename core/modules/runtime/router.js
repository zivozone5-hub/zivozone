/* ZIVOZONE V1228 — Dynamic Feature Router / UI Gate
   Single responsibility:
   1) Parse/navigate SPA routes.
   2) Load games/manifest.json.
   3) Reconcile manifest + loaded runtime capabilities + DOM game cards.
   4) Hide unavailable game controls and block stale links safely.
*/
(() => {
  "use strict";
  if (window.ZIVOZONE_ROUTER?.__canonical) return;

  const MANIFEST_URL = "/games/manifest.json";
  // V1230.111 — blockUnavailable()'s toast was the one hardcoded Arabic literal in this file, shown
  // to any visitor who clicks a room/game that isn't enabled yet. Found continuing the "no
  // disconnected layers" audit (V1230.106/.108/.109/.110). See i18n.js's "routerFeaturePreparing" key.
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const normalize = (path = location.pathname) => {
    let p = String(path || "/").replace(/\/{2,}/g, "/");
    if (!p.startsWith("/")) p = "/" + p;
    if (p.length > 1) p = p.replace(/\/+$/, "");
    return p;
  };
  const decode = value => { try { return decodeURIComponent(value); } catch (_) { return value; } };

  function parse(path = location.pathname) {
    const p = normalize(path);
    if (p === "/") return { type: "home", path: p };
    if (p === "/stories") return { type: "stories", path: p };
    if (p === "/health") return { type: "health", path: p };
    if (p === "/challenges") return { type: "challenges", path: p };
    let m = p.match(/^\/stories\/([^/]+)$/i);
    if (m) return { type: "story", id: decode(m[1]), path: p };
    m = p.match(/^\/health\/([^/]+)$/i);
    if (m) return { type: "health-door", id: decode(m[1]), path: p };
    m = p.match(/^\/challenges\/([^/]+)$/i);
    if (m) return { type: "challenge", id: decode(m[1]), path: p };
    // V1230.114 — short links minted by share.js's duel()/invite() (see that file's matching note):
    // https://zivozone.com/d/<code> instead of the old long /challenges/<id>?challenger=...&cscore=
    // =...&utm_source=...&utm_medium=...&utm_campaign=... Resolved below, right after boot()/emit().
    m = p.match(/^\/d\/([^/]+)$/i);
    if (m) return { type: "shortlink", code: decode(m[1]), path: p };
    return { type: "unknown", path: p };
  }

  function emit(reason = "route") {
    const route = parse();
    window.dispatchEvent(new CustomEvent("zivozone:route", { detail: { ...route, reason } }));
    return route;
  }

  function toast(message, type = "info") {
    let box = document.getElementById("toast-container");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast-container";
      box.className = "toast-container";
      box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.textContent = message;
    box.appendChild(node);
    setTimeout(() => node.remove(), 3600);
  }

  function safeErrorRoute(path) {
    window.dispatchEvent(new CustomEvent("zivozone:route-error", {
      detail: { path: normalize(path), fallback: "/404.html" }
    }));
  }

  function navigate(url, { replace = false, state = {}, onError = "event" } = {}) {
    try {
      const target = new URL(url, location.origin);
      if (target.origin !== location.origin) { location.href = target.href; return false; }
      const pathname = normalize(target.pathname);
      const path = pathname + target.search + target.hash;
      const nextState = { ...(history.state || {}), ...state, zivoRoute: true, path };
      history[replace ? "replaceState" : "pushState"](nextState, "", path);
      emit("navigate");
      return true;
    } catch (error) {
      console.warn("ZIVOZONE Router navigation failed:", error);
      if (onError === "404") location.assign(`/404.html?from=${encodeURIComponent(String(url || location.pathname))}`);
      else safeErrorRoute(url);
      return false;
    }
  }

  const feature = {
    ready: false,
    manifest: null,
    enabledManifest: new Set(),
    runtime: new Set(),
    modules: new Set(),
    hidden: new Set()
  };

  function loadedModules() {
    return new Set([...document.scripts]
      .map(s => String(s.src || ""))
      .map(src => {
        const m = src.match(/\/core\/modules\/([^?]+?)(?:\?[^#]*)?$/i);
        return m ? m[1].toLowerCase() : "";
      })
      .filter(Boolean));
  }

  function runtimeIds() {
    const ids = new Set();
    try {
      const banks = window.ZIVOZONE?.Challenges?.getAll?.() || window.ZIVOZONE_CHALLENGES?.getAll?.() || [];
      banks.forEach(x => x?.id && ids.add(String(x.id)));
    } catch (_) {}
    try {
      Object.keys(window.ZIVOZONE_CHALLENGES || {}).forEach(id => {
        if (window.ZIVOZONE_CHALLENGES[id]?.questions) ids.add(String(id));
      });
    } catch (_) {}
    return ids;
  }

  function manifestIds() {
    const games = Array.isArray(feature.manifest?.games) ? feature.manifest.games : [];
    return new Set(games.filter(g => g && g.enabled !== false && g.gameId).map(g => String(g.gameId)));
  }

  function specialAvailable(id) {
    const key = String(id || "").toLowerCase();
    const modules = feature.modules;
    if (key === "horror" || key === "dark-room") return !!window.ZIVOZONE_DARKROOM || modules.has("challenges.js");
    /* V1230.67: forensic-case-core.js is no longer part of the eager bundle (it's fetched on demand
       by challenges.js the first time this room is opened — see loadForensicCore() there), so it no
       longer shows up in loadedModules() at page load. The room is always genuinely available (the
       file is always on the server), so this no longer needs either runtime signal to say so. */
    if (key === "forensic") return true;
    // V1230.71 — puzzle-room.js, beauty-room.js, rooms.js and football-room.js joined
    // forensic-case-core.js's V1230.67 situation: all four are lazy-loaded on demand now (see
    // core/modules/runtime/room-loader.js), so none of them show up in loadedModules() at page load
    // either. Same fix, same reasoning: the room is always genuinely available (the file is always
    // on the server and loads itself the moment it's opened), so this no longer needs a runtime
    // presence check to say so.
    if (key === "puzzle" || key === "puzzle-room") return true;
    if (key === "beauty") return true;
    if (key === "story" || key === "stories") return true;
    if (key === "health" || key === "health-room") return true;
    if (key === "football" || key === "football-room") return true;
    return false;
  }

  function isAvailable(id) {
    const key = String(id || "").trim();
    if (!key) return false;
    return feature.enabledManifest.has(key) || feature.runtime.has(key) || specialAvailable(key);
  }

  function setHidden(el, hidden, reason = "") {
    if (!el) return;
    if (hidden) {
      el.dataset.zivoFeatureState = "unavailable";
      el.dataset.zivoFeatureReason = reason;
      el.setAttribute("aria-hidden", "true");
      el.hidden = true;
      feature.hidden.add(el);
    } else if (el.dataset.zivoFeatureState === "unavailable") {
      delete el.dataset.zivoFeatureState;
      delete el.dataset.zivoFeatureReason;
      el.removeAttribute("aria-hidden");
      el.hidden = false;
      feature.hidden.delete(el);
    }
  }

  function featureIdFromElement(el) {
    if (!el) return "";
    return String(
      el.dataset.game ||
      el.dataset.challenge ||
      el.dataset.feature ||
      el.dataset.gameId ||
      ""
    ).trim();
  }

  function reconcile(root = document) {
    if (!root?.querySelectorAll) return;
    const selector = "[data-game],[data-challenge],[data-feature],[data-game-id],[data-puzzle-room],[data-beauty-room],[data-zivo-story-room],[data-zivo-health-room]";
    const nodes = [];
    if (root.matches?.(selector)) nodes.push(root);
    root.querySelectorAll(selector).forEach(x => nodes.push(x));

    nodes.forEach(el => {
      let id = featureIdFromElement(el);
      if (el.hasAttribute("data-puzzle-room")) id = "puzzle-room";
      if (el.hasAttribute("data-beauty-room")) id = "beauty";
      if (el.hasAttribute("data-zivo-story-room")) id = "stories";
      if (el.hasAttribute("data-zivo-health-room")) id = "health";
      if (!id) return;

      if (!isAvailable(id)) {
        setHidden(el, true, id);
      } else {
        setHidden(el, false);
      }
    });

    window.dispatchEvent(new CustomEvent("zivozone:features-reconciled", {
      detail: { ready: feature.ready, enabled: [...feature.enabledManifest], runtime: [...feature.runtime] }
    }));
  }

  async function loadManifest() {
    try {
      const r = await fetch(`${MANIFEST_URL}?v=1228.0`, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!r.ok) throw new Error(`Manifest HTTP ${r.status}`);
      const data = await r.json();
      if (!data || !Array.isArray(data.games)) throw new Error("Invalid games manifest");
      feature.manifest = data;
    } catch (error) {
      console.warn("ZIVOZONE feature manifest:", error);
      feature.manifest = { games: [] };
    }
    feature.enabledManifest = manifestIds();
    feature.runtime = runtimeIds();
    feature.modules = loadedModules();
    feature.ready = true;
    window.dispatchEvent(new CustomEvent("zivozone:feature-ready", {
      detail: {
        manifest: feature.manifest,
        enabled: [...feature.enabledManifest],
        runtime: [...feature.runtime],
        modules: [...feature.modules]
      }
    }));
    reconcile(document);
    return feature.manifest;
  }

  function blockUnavailable(id, source = "interaction") {
    if (isAvailable(id)) return false;
    toast(t("routerFeaturePreparing"), "info");
    window.dispatchEvent(new CustomEvent("zivozone:feature-blocked", {
      detail: { id: String(id || ""), source }
    }));
    return true;
  }

  function clickHandler(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const gameEl = event.target.closest?.("[data-game],[data-challenge],[data-feature],[data-game-id],[data-puzzle-room],[data-beauty-room]");
    if (gameEl) {
      const id = featureIdFromElement(gameEl) || (gameEl.hasAttribute("data-puzzle-room") ? "puzzle-room" : "");
      if (id && blockUnavailable(id, "game-click")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    }

    const a = event.target.closest?.("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const u = new URL(href, location.origin);
      if (u.origin !== location.origin) return;
      const match = u.pathname.match(/^\/challenges\/([^/]+)$/i);
      if (match && blockUnavailable(decode(match[1]), "route-click")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (/^\/(stories|health|challenges)(?:\/|$)/i.test(u.pathname)) {
        event.preventDefault();
        navigate(u.pathname + u.search + u.hash);
      }
    } catch (_) {}
  }

  function observe() {
    const observer = new MutationObserver(() => {
      clearTimeout(observe.timer);
      observe.timer = setTimeout(() => reconcile(document), 60);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("zivozone:challenges-rendered", () => reconcile(document));
    window.addEventListener("zivozone:ui-ready", () => reconcile(document));
  }

  // V1230.114 — resolves a /d/<code> short link (see parse() above and share.js's matching note)
  // back into the real long-form URL it stands for, then replaces the visible URL with it via
  // navigate(replace:true) — which re-emits 'zivozone:route' as a normal 'challenge'/'home' route,
  // so challenges.js's tryAutoStart (and everything downstream of it: consumeDuelParams(), the
  // finish-screen duel banner, auth.js's referral capture) runs completely unchanged, exactly as if
  // the visitor had opened the long link directly. A code that fails to resolve (never existed,
  // already malformed, or Firestore unreachable) falls back to the homepage with a toast rather than
  // leaving the visitor stuck on a dead /d/<code> URL.
  let resolvingShortLink = false;
  async function resolveShortLinkRoute(code) {
    if (resolvingShortLink) return;
    resolvingShortLink = true;
    try {
      const target = await window.ZIVOZONE?.Share?.resolveShortLink?.(code);
      if (target) navigate(target, { replace: true });
      else {
        toast(t("shortLinkUnavailable"), "info");
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.warn("ZIVOZONE Router short-link resolve:", error);
      navigate("/", { replace: true });
    } finally {
      resolvingShortLink = false;
    }
  }
  window.addEventListener("zivozone:route", e => {
    if (e.detail?.type === "shortlink" && e.detail.code) resolveShortLinkRoute(e.detail.code);
  });

  addEventListener("popstate", () => emit("popstate"));
  document.addEventListener("click", clickHandler, true);

  window.ZIVOZONE_ROUTER = Object.freeze({
    __canonical: true,
    normalize,
    parse,
    emit,
    navigate,
    safeErrorRoute,
    current: () => parse(),
    features: Object.freeze({
      state: () => ({
        ready: feature.ready,
        enabled: [...feature.enabledManifest],
        runtime: [...feature.runtime],
        modules: [...feature.modules]
      }),
      has: isAvailable,
      reconcile,
      block: blockUnavailable,
      loadManifest
    })
  });

  function boot() {
    observe();
    reconcile(document);
    loadManifest().catch(() => reconcile(document));
    emit("boot");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
