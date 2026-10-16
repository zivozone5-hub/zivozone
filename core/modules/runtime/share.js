/* ZIVOZONE V1226 — result sharing / viral engagement module */
(() => {
  "use strict";
  if (window.ZIVOZONE_SHARE?.__canonical) return;

  const SITE_ORIGIN = window.location.origin || "https://zivozone.com";
  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();
  // V1230.91 — "Challenge a friend" (duel) growth loop: same i18n pattern every other module uses
  // (see challenges.js/horror-room.js/etc.), kept local since share.js has no other i18n calls.
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const fmt = (k, vars) => Object.entries(vars || {}).reduce((s, [key, val]) => s.split(`{${key}}`).join(val), t(k));

  function buildGameUrl(gameId) {
    const id = clean(gameId);
    if (!id) return `${SITE_ORIGIN}/`;
    if (id.startsWith("http://") || id.startsWith("https://")) return id;
    if (id.startsWith("/")) return new URL(id, SITE_ORIGIN).href;
    if (/^(stories|challenges|games|rooms)\//i.test(id)) return new URL(`/${id}`, SITE_ORIGIN).href;
    return new URL(`/challenges/${encodeURIComponent(id)}`, SITE_ORIGIN).href;
  }

  // V1230.16 — growth plan ("Social loop") calls for campaign attribution in shared URLs
  // (utm_source/medium/campaign) while keeping canonical URLs (sitemap, <link rel="canonical">) clean.
  // This only tags the URL that actually gets shared/copied; it never touches canonical links.
  function withUtm(url, { source = "share", medium = "social", campaign = "score_challenge" } = {}) {
    try {
      const u = new URL(url);
      u.searchParams.set("utm_source", source);
      u.searchParams.set("utm_medium", medium);
      u.searchParams.set("utm_campaign", campaign);
      return u.href;
    } catch (_) {
      return url;
    }
  }

  // V1230.110 — this plain "share your score" message (used by beauty-room.js/horror-room.js/
  // puzzle-room.js/epic50.js's own share buttons — the OLDER, simpler share action, distinct from
  // the newer i18n-aware "challenge a friend" duel flow right below it in this same file) was never
  // routed through t()/fmt() at all: every word of the message AND title was a hardcoded Arabic
  // literal, so a share posted to WhatsApp/social media showed Arabic text regardless of the site's
  // selected language — found continuing the "no disconnected layers" audit right after exit-guard.js
  // (V1230.109). See i18n.js's "shareResult*"/"shareScorePart" keys for the 7-language text.
  function buildMessage(gameId, score, challengeName, utmSource = "share") {
    const name = clean(challengeName) || t("shareDefaultChallengeName");
    const canonicalUrl = buildGameUrl(gameId);
    const gameUrl = withUtm(canonicalUrl, { source: utmSource });
    const hasScore = score !== null && score !== undefined && clean(score) !== "";
    const scorePart = hasScore ? fmt("shareScorePart", { score: clean(score) }) : "";
    const message = `${fmt("shareResultMessage", { scorePart, challenge: name })}\n${gameUrl}`;
    return {
      title: fmt("shareResultTitle", { challenge: name }),
      text: message,
      url: gameUrl,
      canonicalUrl,
      params: { gameId, score, challengeName: name }
    };
  }

  function build(options = {}) {
    return buildMessage(
      options.gameId ?? options.game,
      options.score,
      options.challengeName ?? options.challenge ?? options.title,
      options.utmSource
    );
  }

  // V1230.91 — "Challenge a friend" (duel): the link carries the challenger's own name + score
  // (?challenger=&cscore=) on top of the plain score-share link above, so the person who opens it
  // sees a named, scored target to beat instead of a generic "try this challenge" invite — the
  // active ingredient that makes a share turn into a return visit (see getDuelParams()/
  // consumeDuelParams() below, read by challenges.js when that visitor's game actually starts).
  function buildDuelUrl(gameId, challengerName, score) {
    const base = withUtm(buildGameUrl(gameId), { source: "duel", medium: "social", campaign: "duel_challenge" });
    try {
      const u = new URL(base);
      u.searchParams.set("challenger", clean(challengerName).slice(0, 24) || t("duelDefaultChallengerName"));
      if (score !== null && score !== undefined && clean(score) !== "") u.searchParams.set("cscore", clean(score));
      return u.href;
    } catch (_) {
      return base;
    }
  }

  // V1230.114 — short-link layer for duel/invite links. A duel link used to be the full long URL
  // from buildDuelUrl() above (/challenges/<id>?challenger=...&cscore=...&utm_source=...&utm_medium=
  // ...&utm_campaign=...) — a wall of unfamiliar parameters that reads as suspicious, not trustworthy,
  // to a recipient who just wants a clean "tap this to play" link on the zivozone.com domain they
  // already trust. This mints a short, unambiguous code (no 0/O/1/l/I — meant to be readable if
  // someone retypes it by hand), stores the real target once in Firestore's shortLinks/{code} (see
  // firestore.rules' matching V1230.114 note), and returns a plain https://zivozone.com/d/<code>.
  // router.js resolves the code back into the exact same long-form URL this always produced, so
  // nothing downstream (consumeDuelParams(), the finish-screen duel banner, etc.) needed to change.
  // Deliberately reuses the DEFAULT Firebase app (same one auth.js's initFirebase() uses) rather than
  // chat.js's separate named app — this is a tiny, infrequent, unauthenticated write, not a reason to
  // spin up a second app instance.
  const SHORT_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  function randomCode(len = 7) {
    let out = "";
    try {
      const bytes = new Uint32Array(len);
      (window.crypto || window.msCrypto).getRandomValues(bytes);
      for (let i = 0; i < len; i++) out += SHORT_CODE_CHARS[bytes[i] % SHORT_CODE_CHARS.length];
      return out;
    } catch (_) {
      for (let i = 0; i < len; i++) out += SHORT_CODE_CHARS[Math.floor(Math.random() * SHORT_CODE_CHARS.length)];
      return out;
    }
  }
  let _shortDb;
  function shortDb() {
    if (_shortDb !== undefined) return _shortDb;
    try {
      const CFG = window.ZIVOZONE_FIREBASE_CONFIG;
      if (!CFG || !window.firebase?.initializeApp) { _shortDb = null; return _shortDb; }
      if (!firebase.apps.some(a => a.name === "[DEFAULT]")) firebase.initializeApp(CFG);
      _shortDb = firebase.firestore();
    } catch (_) {
      _shortDb = null;
    }
    return _shortDb;
  }
  // Up to 3 attempts to dodge the (astronomically unlikely, 62^7 code space) chance of a code
  // collision; a real failure (offline, blocked by an ad/privacy blocker, Firestore down) resolves
  // after the first attempt's own try/catch, so this never turns a flaky network into a long stall.
  async function createShortLink(type, fields) {
    const db = shortDb();
    if (!db) return null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = randomCode(7);
      try {
        const ref = db.collection("shortLinks").doc(code);
        const existing = await ref.get();
        if (existing.exists) continue;
        await ref.set({ type, ...fields, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        return code;
      } catch (e) {
        console.warn("Short link create:", e);
        return null;
      }
    }
    return null;
  }
  // Reads shortLinks/{code} back and reconstructs the exact long-form URL buildDuelUrl()/
  // buildInviteUrl() would have produced, so router.js can navigate() straight to it and every
  // existing downstream consumer (consumeDuelParams(), auth.js's captureReferralFromUrl()) keeps
  // working completely unchanged.
  async function resolveShortLink(code) {
    const db = shortDb();
    if (!db || !code) return null;
    try {
      const snap = await db.collection("shortLinks").doc(String(code)).get();
      if (!snap.exists) return null;
      const d = snap.data();
      if (d.type === "duel") return buildDuelUrl(d.gameId, d.challenger, d.score);
      if (d.type === "invite") return buildInviteUrl(d.uid);
      return null;
    } catch (e) {
      console.warn("Short link resolve:", e);
      return null;
    }
  }

  async function buildDuelMessage(gameId, score, challengerName, challengeName) {
    const name = clean(challengerName) || t("duelDefaultChallengerName");
    const chName = clean(challengeName) || "ZIVOZONE";
    const id = clean(gameId);
    const hasScore = score !== null && score !== undefined && clean(score) !== "";
    const code = await createShortLink("duel", {
      gameId: id,
      challenger: name.slice(0, 24),
      ...(hasScore ? { score: Number(score) || 0 } : {})
    });
    const duelUrl = code ? `${SITE_ORIGIN}/d/${code}` : buildDuelUrl(id, name, score);
    const body = fmt("duelShareMessage", { score: clean(score), challenge: chName });
    const message = `${body}\n${duelUrl}`;
    return {
      title: fmt("duelShareTitle", { challenge: chName }),
      text: message,
      url: duelUrl,
      canonicalUrl: buildGameUrl(id),
      params: { gameId: id, score, challengerName: name, challengeName: chName, duel: true }
    };
  }

  async function buildDuel(options = {}) {
    return buildDuelMessage(
      options.gameId ?? options.game,
      options.score,
      options.challengerName ?? options.name,
      options.challengeName ?? options.challenge ?? options.title
    );
  }

  // V1230.103 — "Invite friends" (referral): same shape as the duel link above, but points at the
  // homepage with ?ref=<uid> instead of a specific game, and carries no score. auth.js reads this
  // param (via core/modules/auth.js's own capture-on-load logic, persisted to localStorage so it
  // survives the click->browse->sign-up funnel) and attaches it as the new account's `referredBy`
  // field at account-creation time only — a self-written fact on the new user's own doc, nothing
  // else. No reward is attached to this yet (see the matching note in auth.js): that part needs a
  // live Firebase/emulator to verify safely and is deliberately deferred to a later version.
  function buildInviteUrl(uid) {
    const base = withUtm(`${SITE_ORIGIN}/`, { source: "invite", medium: "referral", campaign: "friend_invite" });
    try {
      const u = new URL(base);
      u.searchParams.set("ref", clean(uid).slice(0, 64));
      return u.href;
    } catch (_) {
      return base;
    }
  }

  // V1230.114 — same short-link treatment as the duel link above: an invite link naturally carries
  // someone's uid in plain sight (?ref=<64-char-uid>&utm_source=invite&...), which is both long and,
  // to a recipient unfamiliar with referral links, not an obviously trustworthy-looking URL. Shortened
  // the same way, same graceful fallback to the original long form if the write fails.
  async function buildInviteMessage(name, uid) {
    const inviterName = clean(name) || t("duelDefaultChallengerName");
    const cleanUid = clean(uid).slice(0, 64);
    const code = await createShortLink("invite", { uid: cleanUid });
    const inviteUrl = code ? `${SITE_ORIGIN}/d/${code}` : buildInviteUrl(cleanUid);
    const body = fmt("inviteShareMessage", { name: inviterName });
    const message = `${body}\n${inviteUrl}`;
    return {
      title: t("inviteShareTitle"),
      text: message,
      url: inviteUrl,
      canonicalUrl: `${SITE_ORIGIN}/`,
      params: { uid: cleanUid, name: inviterName, invite: true }
    };
  }

  async function buildInvite(options = {}) {
    return buildInviteMessage(options.name, options.uid);
  }

  async function invite(options = {}) {
    const built = await buildInvite(options);
    return dispatch(() => built, { uid: built.params.uid, invite: true });
  }

  // Reads ?challenger=&cscore= from the current URL without side effects (safe to call anytime).
  function getDuelParams() {
    try {
      const u = new URL(window.location.href);
      const name = u.searchParams.get("challenger");
      const score = u.searchParams.get("cscore");
      if (!name) return null;
      return { name: clean(name).slice(0, 24), score: score !== null ? Number(score) || 0 : null };
    } catch (_) {
      return null;
    }
  }

  // Same as getDuelParams(), but also strips the two params from the visible URL (history.replaceState,
  // no reload/navigation) so retrying the challenge or refreshing the page doesn't keep re-showing the
  // same duel intro — each duel link is meant to be consumed once per visit.
  function consumeDuelParams() {
    const params = getDuelParams();
    if (!params) return null;
    try {
      const u = new URL(window.location.href);
      u.searchParams.delete("challenger");
      u.searchParams.delete("cscore");
      window.history.replaceState(window.history.state, "", u.href);
    } catch (_) {}
    return params;
  }

  async function copyToClipboard(data) {
    // V1230.91 — fixed a pre-existing duplicate-link bug: data.text (built by buildMessage/
    // buildDuelMessage) already ends with data.url, so appending "\n${data.url}" again here put the
    // same link in the clipboard twice. data.text alone already has everything intended.
    const value = data.text;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return { ok: true, method: "clipboard" };
      }
    } catch (_) {}

    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      return { ok, method: ok ? "clipboard-legacy" : "none" };
    } catch (_) {
      return { ok: false, method: "none" };
    }
  }

  async function nativeShare(data) {
    if (typeof navigator.share !== "function") return { ok: false, method: "unsupported" };
    try {
      await navigator.share({ title: data.title, text: data.text, url: data.url });
      return { ok: true, method: "native" };
    } catch (error) {
      return { ok: false, cancelled: error?.name === "AbortError", method: "native" };
    }
  }

  // V1230.91 — shareResult()'s native-share -> clipboard+WhatsApp fallback chain, generalized so the
  // duel flow below can reuse it instead of duplicating it with a second copy of the same 3 branches.
  // `builder(utmSource)` is called once per branch (not a single prebuilt `data`) so each channel keeps
  // its own UTM tag exactly as before this refactor: "share_sheet" for the native share sheet,
  // "copy_link" for the clipboard/WhatsApp fallback (WhatsApp's own retag() then overrides that to
  // "whatsapp" — see API.whatsapp below, unchanged).
  async function dispatch(builder, emitBase) {
    const shareSheetData = builder("share_sheet");
    const native = await nativeShare(shareSheetData);
    if (native.ok) {
      const result = { ...native, data: shareSheetData };
      try { window.ZIVOZONE?.Events?.emit('SHARE_RESULT', { ...emitBase, method: native.method }); } catch (_) {}
      return result;
    }
    if (native.cancelled) return { ...native, data: shareSheetData };
    // V1230.19 — on a browser with no Web Share API (desktop; most phones' own share sheet already
    // lists WhatsApp as a target, so this path is mainly desktop), this used to silently fall back to
    // a clipboard copy with no further action — a dead end for a MENA/Jordanian audience, where
    // WhatsApp is the dominant sharing channel. API.whatsapp() already existed fully implemented but
    // had zero callers anywhere. Now opens WhatsApp Web directly with the message pre-filled, and still
    // copies to the clipboard too so the text is ready to paste anywhere else if the player wants.
    const data = builder("copy_link");
    await copyToClipboard(data);
    const opened = API.whatsapp(data);
    return { ok: Boolean(opened), method: "whatsapp", data };
  }

  async function shareResult(gameId, score, challengeName) {
    return dispatch(
      utmSource => buildMessage(gameId, score, challengeName, utmSource),
      { gameId, score, challengeName }
    );
  }

  async function share(options = {}) {
    return shareResult(options.gameId ?? options.game, options.score, options.challengeName ?? options.challenge ?? options.title);
  }

  // V1230.91 — the "Challenge a friend" entry point: same share-sheet/clipboard/WhatsApp fallback
  // chain as share(), but the message + link are duel-flavored (named challenger + score to beat).
  // buildDuelMessage() doesn't vary by utmSource (the link is always tagged "duel"), so the builder
  // just ignores the argument dispatch() passes it.
  async function duel(options = {}) {
    const built = await buildDuel(options);
    return dispatch(() => built, {
      gameId: built.params.gameId, score: built.params.score,
      challengeName: built.params.challengeName, duel: true
    });
  }

  function openExternal(base, data) {
    // V1230.91 — same duplicate-link fix as copyToClipboard above: data.text already ends with
    // data.url.
    const url = `${base}${encodeURIComponent(data.text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  }

  function emitShare(data, method) {
    try { window.ZIVOZONE?.Events?.emit('SHARE_RESULT', {
      gameId: data.params?.gameId, score: data.params?.score, challengeName: data.params?.challengeName, method
    }); } catch (_) {}
  }

  // whatsapp()/twitter() re-tag the URL with their own utm_source instead of reusing whichever
  // source the caller originally built the message with, so each channel is attributed correctly.
  function retag(data, source) {
    return buildMessage(data.params?.gameId, data.params?.score, data.params?.challengeName, source);
  }

  const API = Object.freeze({
    __canonical: true,
    buildGameUrl,
    buildMessage,
    build,
    shareResult,
    share,
    buildDuelUrl,
    buildDuelMessage,
    buildDuel,
    duel,
    getDuelParams,
    consumeDuelParams,
    buildInviteUrl,
    buildInviteMessage,
    buildInvite,
    invite,
    resolveShortLink,
    copyToClipboard,
    nativeShare,
    whatsapp: data => {
      const tagged = retag(data, "whatsapp");
      openExternal("https://wa.me/?text=", tagged);
      emitShare(tagged, "whatsapp");
      return true;
    },
    twitter: data => {
      const tagged = retag(data, "twitter");
      const q = new URLSearchParams({ text: tagged.text, url: tagged.url });
      window.open(`https://twitter.com/intent/tweet?${q}`, "_blank", "noopener,noreferrer");
      emitShare(tagged, "twitter");
      return true;
    }
  });

  window.ZIVOZONE_SHARE = API;
  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.Share = API;
})();
