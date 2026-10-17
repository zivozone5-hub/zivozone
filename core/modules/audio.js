/* ZIVOZONE V1226 — single audio runtime
 * Performance rules:
 *   1) No AudioContext at application boot.
 *   2) No ambient Audio element at application boot.
 *   3) No ambient src is assigned until a room explicitly requests it.
 *   4) Ambient resources are unloaded on room exit.
 *   5) SFX are synthesized with WebAudio, so no SFX network files are required.
 */
(() => {
  "use strict";
  if (window.ZIVOZONE_AUDIO?.__unified) return;

  const PREF_KEY = "zivo_audio_settings";
  const TRACKS = {
    math: "assets/audio/math_ambient.mp3",
    horror: "assets/audio/horror_ambient.mp3",
    logic: "assets/audio/logic_ambient.mp3",
    daily: "assets/audio/daily_ambient.mp3",
    strategy: "assets/audio/strategy_ambient.mp3",
    science: "assets/audio/science_ambient.mp3",
    football: "assets/audio/football_ambient.mp3",
    reaction: "assets/audio/reaction_ambient.mp3",
    iq: "assets/audio/iq_ambient.mp3",
    memory: "assets/audio/memory_ambient.mp3"
  };

  const SFX = {
    click_light: [520, .045, 1.7, "sine"],
    click_heavy: [180, .08, 1.7, "sine"],
    menu_toggle: [330, .07, 1.7, "sine"],
    success_coin: [880, .16, 1.7, "sine"],
    purchase_burn: [120, .12, 1.7, "sawtooth"],
    challenge_win: [660, .28, 1.7, "sine"],
    challenge_fail: [150, .25, .55, "sine"]
  };

  const ALIAS = {
    click_subtle: "click_light",
    menu_open: "menu_toggle",
    menu_close: "menu_toggle",
    notification: "menu_toggle"
  };

  // One-shot room-identity stingers (real recorded files, not synthesized tones).
  // Separate from TRACKS (looping ambient) and SFX (synthesized) — played once, on top.
  const STINGERS = {
    horror_laugh: "assets/audio/horror_laugh.mp3",
    horror_scream: "assets/audio/horror_scream.mp3"
  };

  class ZivoAudio {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.ambient = null;
      this.ambientKey = null;
      this.ambientToken = 0;
      this.enabled = true;
      this.volume = .55;
      this.sfxVolume = .7;
      this.lastSfx = new Map();

      try {
        const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
        if (typeof saved.volume === "number") this.volume = saved.volume;
        if (typeof saved.sfxVolume === "number") this.sfxVolume = saved.sfxVolume;
        if (typeof saved.enabled === "boolean") this.enabled = saved.enabled;
      } catch (_) {}
    }

    init() {
      // Intentionally lightweight: do NOT create AudioContext here.
      return this;
    }

    _save() {
      try {
        localStorage.setItem(PREF_KEY, JSON.stringify({
          enabled: this.enabled,
          volume: this.volume,
          sfxVolume: this.sfxVolume
        }));
      } catch (_) {}
    }

    _emit() {
      window.dispatchEvent(new CustomEvent("zivo-audio-change", {
        detail: { enabled: this.enabled, volume: this.volume }
      }));
    }

    async unlock() {
      if (!this.enabled) return;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") await this.ctx.resume();
    }

    isEnabled() { return this.enabled; }
    isMuted() { return !this.enabled; }

    setMuted(muted) {
      this.enabled = !muted;
      if (this.master) this.master.gain.value = this.enabled ? this.volume : 0;
      if (!this.enabled) this.stopAmbient(250);
      this._save();
      this._emit();
    }

    toggle() {
      this.setMuted(this.enabled);
      return this.enabled;
    }

    setVolume(value) {
      this.volume = Math.max(0, Math.min(1, Number(value) || 0));
      if (this.master && this.enabled) this.master.gain.value = this.volume;
      if (this.ambient) this.ambient.volume = this.volume;
      this._save();
      this._emit();
    }

    async playSfx(name, opts = {}) {
      name = ALIAS[name] || name;
      if (!this.enabled || !SFX[name]) return;

      const now = performance.now();
      const gap = opts.minGap ?? 90;
      if (now - (this.lastSfx.get(name) || -Infinity) < gap) return;
      this.lastSfx.set(name, now);

      await this.unlock();
      if (!this.ctx || !this.master) return;

      const [frequency, duration, endFactor, waveform] = SFX[name];
      const t = this.ctx.currentTime;
      const oscillator = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(frequency, t);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(60, frequency * endFactor),
        t + duration
      );

      const peak = Math.max(.0002, .16 * this.sfxVolume / .7 * (opts.volume ?? 1));
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, t + duration);

      oscillator.connect(gain);
      gain.connect(this.master);
      oscillator.start(t);
      oscillator.stop(t + duration + .02);
    }

    playSFX(name, volume = 1) { return this.playSfx(name, { volume }); }

    async playStinger(name, opts = {}) {
      if (!this.enabled || !STINGERS[name]) return;
      const now = performance.now();
      const gap = opts.minGap ?? 1200;
      const key = "stinger:" + name;
      if (now - (this.lastSfx.get(key) || -Infinity) < gap) return;
      this.lastSfx.set(key, now);
      try {
        const el = new Audio(new URL(STINGERS[name], document.baseURI).href);
        el.volume = Math.max(0, Math.min(1, this.volume * (opts.volume ?? 1)));
        await el.play();
      } catch (_) {}
    }

    _createAmbient(key) {
      if (!TRACKS[key]) return null;
      const audio = new Audio();
      audio.loop = true;
      audio.preload = "none";
      audio.playsInline = true;
      audio.volume = 0;
      return audio;
    }

    _attachSource(audio, key) {
      if (!audio || !TRACKS[key]) return false;
      if (!audio.src) audio.src = new URL(TRACKS[key], document.baseURI).href;
      return true;
    }

    _destroyAmbient(audio) {
      if (!audio) return;
      try { audio.pause(); } catch (_) {}
      audio.onplay = null;
      audio.onpause = null;
      audio.onerror = null;
      audio.onended = null;
      try {
        audio.removeAttribute("src");
        audio.src = "";
        audio.load();
      } catch (_) {}
    }

    async transitionAmbient(key) {
      if (!this.enabled || !TRACKS[key]) return;
      if (this.ambientKey === key && this.ambient) return;

      // This is normally called directly from the room's click handler.
      await this.unlock();
      if (!this.enabled) return;

      const token = ++this.ambientToken;
      const old = this.ambient;
      const next = this._createAmbient(key);
      if (!next) return;

      // The actual network request begins only now, after room entry/user gesture.
      this._attachSource(next, key);

      try {
        await next.play();
      } catch (_) {
        this._destroyAmbient(next);
        return;
      }

      if (token !== this.ambientToken) {
        this._destroyAmbient(next);
        return;
      }

      this.ambient = next;
      this.ambientKey = key;
      this._fade(next, old, token, 900);
    }

    stopAmbient(ms = 600) {
      const token = ++this.ambientToken;
      const old = this.ambient;
      this.ambient = null;
      this.ambientKey = null;
      if (!old) return;
      this._fade(null, old, token, ms);
    }

    _fade(inTrack, outTrack, token, ms = 900) {
      const start = performance.now();
      const step = now => {
        if (token !== this.ambientToken) {
          if (outTrack) this._destroyAmbient(outTrack);
          if (inTrack) this._destroyAmbient(inTrack);
          return;
        }

        const progress = Math.max(0, Math.min(1, (now - start) / ms));
        if (inTrack) inTrack.volume = progress * this.volume;
        if (outTrack) outTrack.volume = (1 - progress) * this.volume;

        if (progress < 1) requestAnimationFrame(step);
        else if (outTrack) this._destroyAmbient(outTrack);
      };
      requestAnimationFrame(step);
    }

    stopChallenge() { this.stopAmbient(); }
  }

  const mgr = new ZivoAudio();
  const shortcuts = {
    click: "click_light", heavyClick: "click_heavy", menuToggle: "menu_toggle", menuOpen: "menu_toggle",
    menuClose: "menu_toggle", successCoin: "success_coin", purchaseBurn: "purchase_burn",
    challengeWin: "challenge_win", challengeFail: "challenge_fail", correct: "challenge_win",
    wrong: "challenge_fail", success: "challenge_win", timeout: "challenge_fail", notification: "menu_toggle"
  };
  Object.entries(shortcuts).forEach(([fn, sfx]) => { mgr[fn] = () => mgr.playSfx(sfx); });

  const api = {
    __unified: true,
    version: "1225",
    AudioManager: mgr,
    manager: mgr,
    init: () => mgr.init(),
    unlock: () => mgr.unlock(),
    isEnabled: () => mgr.isEnabled(),
    isMuted: () => mgr.isMuted(),
    toggle: () => mgr.toggle(),
    setMuted: v => mgr.setMuted(v),
    setVolume: v => mgr.setVolume(v),
    playSfx: (n, o) => mgr.playSfx(n, o),
    playSFX: (n, v) => mgr.playSFX(n, v),
    playStinger: (n, o) => mgr.playStinger(n, o),
    transitionAmbient: k => mgr.transitionAmbient(k),
    stopAmbient: ms => mgr.stopAmbient(ms),
    stopChallenge: () => mgr.stopChallenge()
  };
  Object.keys(shortcuts).forEach(fn => { api[fn] = () => mgr[fn](); });

  window.ZIVOZONE_AUDIO = api;
  // V1230.19 — removed the dead ZIVOZONE.Audio alias (zero callers anywhere; the real, actively-used
  // entry point everywhere else in the codebase is window.ZIVOZONE_AUDIO, defined just above). Same
  // class of unused shadow-alias as ui.js's ZIVOZONE.UI and player.js's ZIVOZONE.Progress.
  window.ZIVOZONE = window.ZIVOZONE || {};

  // Explicit opt-in sounds/ambient: data attributes are handled only after a real click.
  document.addEventListener("click", event => {
    const el = event.target.closest?.("[data-sfx],[data-ambient]");
    if (!el) return;
    const sfx = el.getAttribute("data-sfx");
    if (sfx === "light") mgr.playSfx("click_light");
    if (sfx === "heavy") mgr.playSfx("click_heavy");
    const ambient = el.getAttribute("data-ambient");
    if (ambient) mgr.transitionAmbient(ambient);
  }, true);

  const css = document.createElement("style");
  /* V1230.94 — mobile audit (Playwright, iPhone 13 viewport) found the floating audio button's
     fixed bottom:14px/right:14px footprint sitting entirely on top of the mobile bottom-nav's
     last tab ("Player Journey" — one of only 5 primary nav destinations), confirmed via
     elementFromPoint AND by simulating a real tap at that screen position: the tap toggled the
     mute state instead of opening Player Journey, i.e. that nav tab was unreachable on mobile at
     all times, on every page. .mobile-nav spans nearly the full width (left:8px;right:8px), so
     sidestepping horizontally isn't possible; raised the button above the nav instead, reusing
     the existing --zivo-nav-clearance variable (already computed by app-shell.js and already
     used by .zivo-consent for the identical "stay clear of the bottom nav" purpose) so the two
     stay in sync if the nav's height ever changes. */
  // V1230.122 — this floating control (shown only on the narrow widths where the top-bar
  // #audio-toggle hides itself, see sync() below) sat at the exact same right:14px/bottom:14px spot
  // as .zivo-public-chat's FAB on mobile (index.css, right:8px + nav-clearance) — two separate
  // floating buttons stacked on top of each other, flagged by the user as unprofessional. The
  // player HUD (.zivo-v21-hud) already owns the opposite bottom-left corner, so instead of trading
  // one collision for another, this stacks the audio control directly above the chat FAB on the
  // same right edge: chat's own height (~54px) + a clear gap, on top of the same nav-clearance both
  // already respect.
  css.textContent = "#zivo-audio-control{position:fixed;right:14px;bottom:14px;z-index:100001;width:48px;height:48px;border-radius:50%;border:1px solid #ffffff30;background:#0b1020;color:#fff;box-shadow:0 8px 30px #0008;cursor:pointer;font-size:20px}#zivo-audio-control.muted{opacity:.55}#zivo-audio-control[hidden]{display:none}@media(max-width:760px){#zivo-audio-control{right:8px;bottom:calc(var(--zivo-nav-clearance,84px) + env(safe-area-inset-bottom,0px) + 68px)}}";
  document.head.appendChild(css);

  function setupControl() {
    let button = document.getElementById("zivo-audio-control");
    if (!button) {
      button = document.createElement("button");
      button.id = "zivo-audio-control";
      button.type = "button";
      document.body.appendChild(button);
    }
    const top = () => document.getElementById("audio-toggle");
    const sync = () => {
      const label = mgr.isMuted() ? "🔇" : "🔊";
      button.textContent = label;
      button.classList.toggle("muted", mgr.isMuted());
      button.setAttribute("aria-label", mgr.isMuted() ? "Unmute sound" : "Mute sound");
      const topButton = top();
      if (topButton) topButton.textContent = label;
      button.hidden = !!(topButton && topButton.offsetParent !== null);
    };
    button.onclick = async () => {
      await mgr.unlock();
      mgr.toggle();
    };
    window.addEventListener("zivo-audio-change", sync);
    window.addEventListener("resize", sync);
    sync();
    setTimeout(sync, 800);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupControl);
  else setupControl();
})();
