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
  // V1230.128 — universal share sheet: esc() for the custom bottom-sheet markup below, same
  // global every other module uses (core/modules/util-esc.js, loaded earlier in the bundle).
  const esc = window.ZIVOZONE_ESC || (v => String(v ?? ""));
  const RTL_LANGS = new Set(["ar", "fa"]);
  function isRtl() { try { return RTL_LANGS.has(window.ZIVOZONE_I18N?.get?.() || "ar"); } catch (_) { return true; } }

  // V1230.134 — lazy-loads core/modules/runtime/qr-encoder.js (dist/lazy/qr-encoder.js in
  // production) only the first time a share-card image is actually built, same "don't make
  // everyone pay for a feature only some visitors use" pattern as room-loader.js's room modules.
  // Cached by promise so a second share in the same session never re-fetches the script.
  let _qrPromise;
  function loadQrEncoder() {
    if (window.ZIVOZONE_QR) return Promise.resolve(window.ZIVOZONE_QR);
    if (_qrPromise) return _qrPromise;
    _qrPromise = new Promise((resolve, reject) => {
      try {
        const v = window.ZIVOZONE_CONFIG?.APP_VERSION || Date.now();
        const s = document.createElement("script");
        s.src = `dist/lazy/qr-encoder.js?v=${v}`;
        s.onload = () => window.ZIVOZONE_QR ? resolve(window.ZIVOZONE_QR) : reject(new Error("qr-encoder-missing-after-load"));
        s.onerror = () => reject(new Error("qr-encoder-network-error"));
        document.head.appendChild(s);
      } catch (e) { reject(e); }
    }).catch(e => { _qrPromise = null; throw e; });
    return _qrPromise;
  }
  // Draws a scannable QR code (encoding `url`) inside a white rounded box on the canvas, with a
  // caption above it. Returns true/false so the caller can decide whether to still draw the plain
  // fallback URL text below (it always does — a QR code is an ADDITION, not a replacement: not
  // every recipient has a camera handy, and the short link is short enough to type by hand too).
  function drawQrBlock(ctx, qr, url, W, boxTop) {
    const boxSize = 360, pad = 24;
    const boxLeft = (W - boxSize) / 2;
    ctx.fillStyle = "#9fb3c8"; ctx.font = FONT(600, 36);
    ctx.fillText(t("shareCardScanCta"), W / 2, boxTop - 24);
    ctx.fillStyle = "#ffffff";
    const r = 22;
    ctx.beginPath();
    ctx.moveTo(boxLeft + r, boxTop);
    ctx.arcTo(boxLeft + boxSize, boxTop, boxLeft + boxSize, boxTop + boxSize, r);
    ctx.arcTo(boxLeft + boxSize, boxTop + boxSize, boxLeft, boxTop + boxSize, r);
    ctx.arcTo(boxLeft, boxTop + boxSize, boxLeft, boxTop, r);
    ctx.arcTo(boxLeft, boxTop, boxLeft + boxSize, boxTop, r);
    ctx.closePath(); ctx.fill();
    const model = qr.makeQr(url, "M");
    const count = model.getModuleCount();
    const inner = boxSize - pad * 2;
    const cell = inner / count;
    ctx.fillStyle = "#0a1626";
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (model.isDark(row, col)) {
          ctx.fillRect(boxLeft + pad + col * cell, boxTop + pad + row * cell, Math.ceil(cell) + 0.5, Math.ceil(cell) + 0.5);
        }
      }
    }
  }

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

  // V1230.123 — "Share your stance" (Beyond Time room): lets a visitor who just answered a
  // Fact-or-Illusion claim send a friend a message stating their own pick on that specific claim,
  // with a link that deep-links straight to that door (room-loader.js reads ?timeDoor=<id> on load
  // and opens it directly) — so the recipient lands on the exact same claim, not just the homepage.
  // Reuses the same native-share/clipboard/WhatsApp fallback chain as every other share action here.
  function buildTimeDoorUrl(doorId) {
    try {
      const u = new URL("/", SITE_ORIGIN);
      u.searchParams.set("timeDoor", clean(doorId));
      return u.href;
    } catch (_) {
      return `${SITE_ORIGIN}/`;
    }
  }
  function buildStanceMessage(doorId, claim, pickLabel, utmSource = "share") {
    const url = withUtm(buildTimeDoorUrl(doorId), { source: utmSource, medium: "social", campaign: "time_stance" });
    const claimText = clean(claim);
    const message = `${fmt("timeShareStanceMessage", { pick: clean(pickLabel), claim: claimText })}\n${url}`;
    return {
      title: fmt("timeShareStanceTitle", { claim: claimText }),
      text: message,
      url,
      canonicalUrl: buildTimeDoorUrl(doorId),
      params: { doorId, claim: claimText, pickLabel: clean(pickLabel) }
    };
  }
  function buildStance(options = {}) {
    return buildStanceMessage(options.doorId, options.claim, options.pickLabel, options.utmSource);
  }
  async function shareStance(options = {}) {
    const built = buildStance(options);
    return dispatch(
      utmSource => buildStanceMessage(options.doorId, options.claim, options.pickLabel, utmSource),
      { doorId: built.params.doorId, claim: built.params.claim, stance: true }
    );
  }

  async function invite(options = {}) {
    const built = await buildInvite(options);
    return dispatch(() => built, { uid: built.params.uid, invite: true });
  }

  // V1230.128 — generic entry point for any interactive feature that has its own already-localized
  // title/body text (e.g. achievements.js's player-card share) but previously called navigator.share
  // directly, bypassing the clipboard/WhatsApp-Web/image-card/custom-sheet fallbacks every other
  // share action here gets for free. Takes a pre-built {title, text} and wraps it exactly like every
  // other builder above, so it goes through the same dispatch() chain.
  function buildCustomMessage(options = {}) {
    const url = withUtm(options.url || `${SITE_ORIGIN}/`, {
      source: options.utmSource || "share", medium: "social", campaign: options.campaign || "custom_share"
    });
    const text = options.text ? `${clean(options.text)}\n${url}` : url;
    return {
      title: options.title || "ZIVOZONE",
      text,
      url,
      canonicalUrl: options.canonicalUrl || options.url || `${SITE_ORIGIN}/`,
      params: { ...(options.params || {}), custom: true }
    };
  }
  async function shareCustom(options = {}) {
    return dispatch(utmSource => buildCustomMessage({ ...options, utmSource }), { ...(options.params || {}), custom: true });
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

  // V1230.128 — branded, shareable result-image generator. A plain text/link share consistently
  // underperforms an image when it lands on Instagram/Snapchat Stories (the actual repost surface
  // that drives the "spread the site widely" goal) — those surfaces are built around media, not
  // links. Works for every dispatch() caller (score shares, duels, the Beyond Time "stance" share,
  // and plain invites) by reading only the fields every builder already returns (title/params),
  // so no per-caller changes were needed anywhere else in the codebase.
  function prettyUrl(url) {
    try { const u = new URL(url); return (u.host + u.pathname).replace(/\/$/, ""); }
    catch (_) { return String(url || "").replace(/^https?:\/\//, ""); }
  }
  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    let line = "", lines = [];
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (line && ctx.measureText(test).width > maxWidth) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
    return lines.length;
  }
  const FONT = (weight, size) => `${weight} ${size}px Tahoma, "Segoe UI", Arial, sans-serif`;
  async function buildCardImageBlob(data) {
    try {
      if (typeof document === "undefined" || !document.createElement) return null;
      const p = data?.params || {};
      const hasScore = p.score !== null && p.score !== undefined && clean(p.score) !== "";
      const heading = String(data?.title || "ZIVOZONE").replace(/\s*\|\s*ZIVOZONE\s*$/i, "").trim() || "ZIVOZONE";
      const W = 1080, H = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.direction = isRtl() ? "rtl" : "ltr";
      ctx.textAlign = "center";
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0a1626"); bg.addColorStop(1, "#03070d");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(W / 2, H * 0.34, 20, W / 2, H * 0.34, 620);
      glow.addColorStop(0, "rgba(70,205,255,.32)"); glow.addColorStop(1, "rgba(70,205,255,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(70,205,255,.35)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.34, 330, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#46cdff"; ctx.font = FONT(800, 50);
      ctx.fillText("ZIVOZONE", W / 2, 190);
      ctx.fillStyle = "#f5f8ff"; ctx.font = FONT(700, 58);
      wrapCanvasText(ctx, heading, W / 2, hasScore ? 340 : 420, W - 160, 70);
      if (hasScore) {
        ctx.fillStyle = "#ffffff"; ctx.font = FONT(900, 230);
        ctx.fillText(`${clean(p.score)}%`, W / 2, H * 0.44);
      }
      // V1230.134 — a QR code baked into the image itself, so a friend who only receives the
      // PICTURE (Instagram/Snapchat Stories and similar strip the caption text entirely) still has
      // a one-tap way straight into this exact challenge, not just the homepage. Best-effort: on
      // any failure (lazy-load blocked, encoder error) this just silently skips the QR block and
      // the card still works exactly as it always did, with only the plain URL text below.
      try {
        const qr = await loadQrEncoder();
        const scanUrl = data?.url || data?.canonicalUrl;
        if (qr && scanUrl) drawQrBlock(ctx, qr, scanUrl, W, 1080);
      } catch (_) {}
      ctx.fillStyle = "#9fb3c8"; ctx.font = FONT(500, 40);
      wrapCanvasText(ctx, t("shareCardFooterCta"), W / 2, H - 230, W - 200, 50);
      ctx.fillStyle = "#46cdff"; ctx.font = FONT(700, 44);
      ctx.fillText(prettyUrl(data?.canonicalUrl || data?.url), W / 2, H - 150);
      return await new Promise(resolve => canvas.toBlob(resolve, "image/png", 0.95));
    } catch (_) { return null; }
  }
  function canShareFiles(file) {
    try { return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }); }
    catch (_) { return false; }
  }
  async function nativeShareWithImage(file, data) {
    if (typeof navigator.share !== "function" || !canShareFiles(file)) return { ok: false, method: "unsupported" };
    try {
      await navigator.share({ files: [file], title: data.title, text: data.text });
      return { ok: true, method: "native-image" };
    } catch (error) {
      return { ok: false, cancelled: error?.name === "AbortError", method: "native-image" };
    }
  }
  // V1230.128 — one small ZIVO reward for the first *successful* share action of the day (any
  // channel: native image/text share, or any icon in the custom sheet below). claimId bakes in
  // today's date (Asia/Amman, matching admin.js/economy.js's own day-key convention elsewhere),
  // so Economy.credit()'s existing claim/ledger transaction naturally caps this at once per day —
  // no new anti-abuse mechanism needed, just reusing the same idempotent-claim contract every other
  // reward in economy.js already relies on. Mirrored in economy.js's credit() switch and
  // firestore.rules' rewardTypeValid()/rewardAmountValid()/validRewardClaim() in this same change.
  async function rewardFirstShareToday() {
    try {
      const credit = window.ZIVOZONE?.Economy?.credit;
      if (typeof credit !== "function") return;
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman" }).format(new Date());
      await credit(1, { type: "share_reward", source: "share", claimId: `share_${day}` });
    } catch (_) {}
  }
  function afterShareSuccess(emitBase, method) {
    try { window.ZIVOZONE?.Events?.emit("SHARE_RESULT", { ...emitBase, method }); } catch (_) {}
    rewardFirstShareToday();
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

  // V1230.128 — rewritten three-step chain (was native-share -> silent WhatsApp-only fallback):
  //   1. Try sharing the branded result IMAGE through the native share sheet — the richest, most
  //      repostable format, and what actually makes a share spread (an Instagram/Snapchat Story,
  //      WhatsApp Status, etc. are built around media, not bare links). Skipped instantly (no
  //      dialog shown) on a browser that can't share files — this never costs an interaction.
  //   2. Fall back to the plain native share sheet (text + link) — on mobile this already lists
  //      every installed app (WhatsApp, Telegram, Instagram DM, Messenger, SMS, Mail...), so it's
  //      the broadest "share to everywhere" option with zero custom UI.
  //   3. On a browser with neither (desktop, mainly) open our own rich multi-platform sheet
  //      (openShareSheet below) instead of silently guessing WhatsApp was the right channel.
  // `builder(utmSource)` is called once per branch so each channel keeps its own UTM tag, exactly
  // as before this rewrite.
  async function dispatch(builder, emitBase) {
    const shareSheetData = builder("share_sheet");
    try {
      const blob = await buildCardImageBlob(shareSheetData);
      if (blob) {
        const file = new File([blob], "zivozone-share.png", { type: "image/png" });
        const withImage = await nativeShareWithImage(file, shareSheetData);
        if (withImage.ok) { afterShareSuccess(emitBase, withImage.method); return { ...withImage, data: shareSheetData }; }
        if (withImage.cancelled) return { ...withImage, data: shareSheetData };
      }
    } catch (_) {}
    const native = await nativeShare(shareSheetData);
    if (native.ok) { afterShareSuccess(emitBase, native.method); return { ...native, data: shareSheetData }; }
    if (native.cancelled) return { ...native, data: shareSheetData };
    return openShareSheet(builder, emitBase);
  }

  // V1230.128 — the custom bottom-sheet fallback for browsers with no Web Share API at all (mainly
  // desktop). Calls `builder(channel)` per icon — the SAME per-call builder dispatch() was given —
  // instead of the old desktop fallback's retag()/buildMessage() shortcut, which silently rebuilt a
  // generic score-share link even for a duel/stance/invite share (those builders' own params, like
  // the duel's short link + challenger name, were discarded). Using the real builder here fixes that
  // latent bug as a side effect of adding the richer UI.
  const CHANNEL_OPENERS = {
    whatsapp: tagged => { openExternal("https://wa.me/?text=", tagged); return true; },
    twitter: tagged => { const q = new URLSearchParams({ text: tagged.text, url: tagged.url }); window.open(`https://twitter.com/intent/tweet?${q}`, "_blank", "noopener,noreferrer"); return true; },
    facebook: tagged => { const q = new URLSearchParams({ u: tagged.url }); window.open(`https://www.facebook.com/sharer/sharer.php?${q}`, "_blank", "noopener,noreferrer"); return true; },
    telegram: tagged => { const q = new URLSearchParams({ url: tagged.url, text: tagged.title }); window.open(`https://t.me/share/url?${q}`, "_blank", "noopener,noreferrer"); return true; },
    email: tagged => { const q = new URLSearchParams({ subject: tagged.title, body: tagged.text }); window.location.href = `mailto:?${q}`; return true; }
  };
  const CHANNEL_LABELS = { whatsapp: "WhatsApp", facebook: "Facebook", twitter: "Twitter/X", telegram: "Telegram", email: "Email" };
  const CHANNEL_ICONS = { whatsapp: "🟢", facebook: "🔵", twitter: "⚫", telegram: "🔵", email: "✉️" };
  function sheetRoot() {
    let o = document.getElementById("zivo-share-sheet");
    if (!o) { o = document.createElement("div"); o.id = "zivo-share-sheet"; o.className = "zss-root"; document.body.appendChild(o); }
    return o;
  }
  function openShareSheet(builder, emitBase) {
    return new Promise(resolve => {
      const data = builder("copy_link");
      const o = sheetRoot();
      const rtl = isRtl();
      let previewUrl = null, settled = false;
      const settle = result => { if (settled) return; settled = true; resolve(result); };
      const cleanup = () => { if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (_) {} previewUrl = null; } o.classList.remove("open"); setTimeout(() => { if (!o.classList.contains("open")) o.innerHTML = ""; }, 260); };
      const finish = (method, tagged) => { cleanup(); afterShareSuccess(emitBase, method); settle({ ok: true, method, data: tagged }); };
      const dismiss = () => { cleanup(); settle({ ok: false, cancelled: true, method: "sheet", data }); };
      const chButtons = Object.keys(CHANNEL_OPENERS).map(ch =>
        `<button type="button" class="zss-opt" data-ch="${ch}"><span class="zss-ico">${CHANNEL_ICONS[ch]}</span><b>${esc(CHANNEL_LABELS[ch])}</b></button>`
      ).join("");
      o.innerHTML = `
        <div class="zss-backdrop"></div>
        <div class="zss-card" dir="${rtl ? "rtl" : "ltr"}">
          <button type="button" class="zss-close" id="zss-close" aria-label="close">×</button>
          <div class="zss-handle"></div>
          <h3>${esc(t("shareSheetTitle"))}</h3>
          <div class="zss-preview" id="zss-preview"><div class="zss-preview-skel"></div></div>
          <button type="button" class="zss-image-btn" id="zss-image-btn" disabled>${esc(t("shareSheetShareImage"))}</button>
          <div class="zss-grid">${chButtons}<button type="button" class="zss-opt" data-ch="copy"><span class="zss-ico">🔗</span><b id="zss-copy-label">${esc(t("shareSheetCopyLink"))}</b></button></div>
        </div>`;
      requestAnimationFrame(() => o.classList.add("open"));
      o.querySelector(".zss-backdrop").onclick = dismiss;
      o.querySelector("#zss-close").onclick = dismiss;
      o.querySelectorAll(".zss-opt").forEach(btn => {
        btn.onclick = async () => {
          const ch = btn.dataset.ch;
          const tagged = builder(ch);
          if (ch === "copy") {
            await copyToClipboard(tagged);
            const label = btn.querySelector("#zss-copy-label");
            if (label) label.textContent = t("shareSheetLinkCopied");
            setTimeout(() => finish("copy_link", tagged), 650);
            return;
          }
          CHANNEL_OPENERS[ch]?.(tagged);
          finish(ch, tagged);
        };
      });
      const imgBtn = o.querySelector("#zss-image-btn");
      let cachedBlob = null;
      buildCardImageBlob(data).then(blob => {
        const preview = o.querySelector("#zss-preview");
        if (!blob) { preview?.remove(); imgBtn?.remove(); return; }
        cachedBlob = blob;
        previewUrl = URL.createObjectURL(blob);
        if (preview) preview.innerHTML = `<img src="${previewUrl}" alt="">`;
        if (!imgBtn) return;
        const file = new File([blob], "zivozone-share.png", { type: "image/png" });
        const canShareImg = canShareFiles(file);
        imgBtn.textContent = canShareImg ? t("shareSheetShareImage") : t("shareSheetSaveImage");
        imgBtn.disabled = false;
        imgBtn.onclick = async () => {
          imgBtn.disabled = true;
          try {
            if (canShareImg) {
              const shared = await nativeShareWithImage(new File([cachedBlob], "zivozone-share.png", { type: "image/png" }), data);
              if (shared.ok) { finish(shared.method, data); return; }
              if (shared.cancelled) { imgBtn.disabled = false; return; }
            }
            const url = URL.createObjectURL(cachedBlob);
            const a = document.createElement("a"); a.href = url; a.download = "zivozone-share.png";
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            finish("image_download", data);
          } catch (_) { imgBtn.disabled = false; }
        };
      }).catch(() => { o.querySelector("#zss-preview")?.remove(); imgBtn?.remove(); });
    });
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
    buildTimeDoorUrl,
    buildStanceMessage,
    buildStance,
    shareStance,
    buildCustomMessage,
    shareCustom,
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
