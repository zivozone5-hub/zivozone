/* ZIVOZONE V1206 — Production Audio UX / SFX Core
 * Pure Web Audio API + HTML5 Audio.
 * Responsibilities:
 *  - Ambient registry + cross-fade transitions
 *  - UI SFX registry with synthesized fallbacks
 *  - Autoplay/gesture unlock
 *  - SFX debounce/throttle + concurrency cap
 *  - Persistent mute/volume state
 *  - ZIVOZONE.State synchronization
 *  - Backward-compatible public API used by V1201/V1205 modules
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'zivozone.audio.v1206';

  const AMBIENT = Object.freeze({
    math: 'assets/audio/math_ambient.mp3',
    horror: 'assets/audio/horror_ambient.mp3',
    logic: 'assets/audio/logic_ambient.mp3',
    daily: 'assets/audio/daily_ambient.mp3',
    strategy: 'assets/audio/strategy_ambient.mp3',
    science: 'assets/audio/science_ambient.mp3',
    football: 'assets/audio/football_ambient.mp3',
    reaction: 'assets/audio/reaction_ambient.mp3',
    iq: 'assets/audio/iq_ambient.mp3',
    memory: 'assets/audio/memory_ambient.mp3'
  });

  const SFX = Object.freeze({
    click_light: 'assets/audio/sfx/click_light.mp3',
    click_heavy: 'assets/audio/sfx/click_heavy.mp3',
    menu_toggle: 'assets/audio/sfx/menu_toggle.mp3',
    success_coin: 'assets/audio/sfx/success_coin.mp3',
    purchase_burn: 'assets/audio/sfx/purchase_burn.mp3',
    challenge_win: 'assets/audio/sfx/challenge_win.mp3',
    challenge_fail: 'assets/audio/sfx/challenge_fail.mp3'
  });

  const SFX_GAIN = Object.freeze({
    click_light: 0.30,
    click_heavy: 0.44,
    menu_toggle: 0.38,
    success_coin: 0.56,
    purchase_burn: 0.48,
    challenge_win: 0.62,
    challenge_fail: 0.48
  });

  const SFX_GAP_MS = Object.freeze({
    click_light: 65,
    click_heavy: 110,
    menu_toggle: 110,
    success_coin: 90,
    purchase_burn: 120,
    challenge_win: 180,
    challenge_fail: 150
  });

  const FALLBACK = Object.freeze({
    click_light: [620, 0.045, 0.040, 'triangle', 0],
    click_heavy: [270, 0.075, 0.065, 'square', 0],
    menu_toggle: [390, 0.100, 0.050, 'sine', 0],
    success_coin: [720, 0.130, 0.075, 'triangle', 0],
    purchase_burn: [180, 0.170, 0.065, 'sawtooth', 0],
    challenge_win: [520, 0.180, 0.075, 'triangle', 0],
    challenge_fail: [110, 0.180, 0.065, 'sawtooth', 0]
  });

  const AMBIENT_GAIN = Object.freeze({
    math: 0.50, horror: 0.78, logic: 0.52, daily: 0.52, strategy: 0.48,
    science: 0.50, football: 0.50, reaction: 0.50, iq: 0.52, memory: 0.50
  });

  const state = {
    initialized: false,
    unlocked: false,
    sfxEnabled: true,
    ambientEnabled: true,
    sfxVolume: 0.85,
    ambientVolume: 0.90,
    currentAmbient: null
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (typeof saved.sfxEnabled === 'boolean') state.sfxEnabled = saved.sfxEnabled;
    if (typeof saved.ambientEnabled === 'boolean') state.ambientEnabled = saved.ambientEnabled;
    if (Number.isFinite(saved.sfxVolume)) state.sfxVolume = Math.min(1, Math.max(0, saved.sfxVolume));
    if (Number.isFinite(saved.ambientVolume)) state.ambientVolume = Math.min(1, Math.max(0, saved.ambientVolume));
  } catch (_) {}

  let ctx = null;
  let masterGain = null;
  let sfxBus = null;
  let ambientBus = null;

  let currentAmbient = null;
  let currentAmbientGain = null;
  let currentAmbientSource = null;
  let ambientGeneration = 0;

  const decoded = new Map();
  const loading = new Map();
  const lastPlayed = new Map();
  const activeSfx = new Set();

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, Number(v) || 0));

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sfxEnabled: state.sfxEnabled,
        ambientEnabled: state.ambientEnabled,
        sfxVolume: state.sfxVolume,
        ambientVolume: state.ambientVolume
      }));
    } catch (_) {}
    syncState();
  }

  function syncState() {
    try {
      window.ZIVOZONE?.State?.set?.('ui', {
        audio: {
          sfxEnabled: state.sfxEnabled,
          ambientEnabled: state.ambientEnabled,
          sfxVolume: state.sfxVolume,
          ambientVolume: state.ambientVolume,
          muted: !state.sfxEnabled && !state.ambientEnabled
        },
        audioUnlocked: state.unlocked
      });
  } catch (_) {}
  }

  function ensureContext() {
    if (ctx) return ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      ctx = new AudioCtx();

      masterGain = ctx.createGain();
      masterGain.gain.value = 1;

      sfxBus = ctx.createGain();
      ambientBus = ctx.createGain();

      sfxBus.gain.value = state.sfxVolume;
      ambientBus.gain.value = state.ambientVolume;

      sfxBus.connect(masterGain);
      ambientBus.connect(masterGain);
      masterGain.connect(ctx.destination);

      syncState();
      return ctx;
    } catch (_) {
      ctx = null;
      return null;
    }
  }

  async function unlock() {
    const c = ensureContext();
    if (!c) return false;

    try {
      if (c.state === 'suspended') await c.resume();
      state.unlocked = c.state === 'running';
      syncState();

      if (state.unlocked) {
        preloadSFX();
        if (state.ambientEnabled && state.currentAmbient) {
          await transitionAmbient(state.currentAmbient, { restart: false });
        }
      }
      return state.unlocked;
    } catch (_) {
      return false;
    }
  }

  function installGestureUnlock() {
    const handler = () => {
      unlock();
      document.removeEventListener('pointerdown', handler, true);
      document.removeEventListener('touchstart', handler, true);
      document.removeEventListener('keydown', handler, true);
    };

    document.addEventListener('pointerdown', handler, { capture: true, passive: true });
    document.addEventListener('touchstart', handler, { capture: true, passive: true });
    document.addEventListener('keydown', handler, { capture: true, passive: true });
  }

  function connectWithOptionalPan(node, bus, pan = 0) {
    const c = ensureContext();
    if (!c || !node || !bus) return;
    if (c.createStereoPanner) {
      const panner = c.createStereoPanner();
      panner.pan.value = clamp(pan, -1, 1);
      node.connect(panner);
      panner.connect(bus);
    } else {
      node.connect(bus);
    }
  }

  function playFallback(name, volume = 1) {
    const spec = FALLBACK[name];
    if (!spec) return false;

    const c = ensureContext();
    if (!c || c.state !== 'running' || !state.sfxEnabled) return false;

    const [freq, duration, gain, type, endFreq] = spec;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), now);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    const peak = clamp(gain * state.sfxVolume * clamp(volume));
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    connectWithOptionalPan(g, sfxBus, 0);
    osc.start(now);
    osc.stop(now + duration + 0.03);
    return true;
  }

  async function loadSFX(name) {
    if (decoded.has(name)) return decoded.get(name);
    if (loading.has(name)) return loading.get(name);

    const path = SFX[name];
    const c = ensureContext();
    if (!path || !c) return null;

    const promise = (async () => {
      try {
        const response = await fetch(path, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`SFX HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await c.decodeAudioData(arrayBuffer.slice(0));
        decoded.set(name, buffer);
        return buffer;
      } catch (_) {
        return null;
      } finally {
        loading.delete(name);
      }
    })();

    loading.set(name, promise);
    return promise;
  }

  function preloadSFX() {
    if (!state.unlocked) return;
    Object.keys(SFX).forEach(name => { loadSFX(name).catch(() => {}); });
  }

  function playDecoded(buffer, name, volume = 1) {
    const c = ensureContext();
    if (!c || c.state !== 'running' || !buffer || !state.sfxEnabled) return false;

    // Hard concurrency ceiling prevents sound storms from dynamic UIs.
    if (activeSfx.size >= 8) return false;

    const source = c.createBufferSource();
    const gain = c.createGain();
    source.buffer = buffer;
    gain.gain.value = clamp(volume) * state.sfxVolume * (SFX_GAIN[name] || 0.45);

    source.connect(gain);
    gain.connect(sfxBus);

    activeSfx.add(source);
    source.onended = () => activeSfx.delete(source);
    source.start(0);
    return true;
  }

  function playSFX(name, volume = 1) {
    if (!state.sfxEnabled || !SFX[name]) return false;

    const now = performance.now();
    const gap = SFX_GAP_MS[name] || 80;
    const previous = lastPlayed.get(name) || 0;

    if (now - previous < gap) return false;
    lastPlayed.set(name, now);

    const c = ensureContext();
    if (!c || c.state !== 'running') return false;

    const buffer = decoded.get(name);
    if (buffer) return playDecoded(buffer, name, volume);

    loadSFX(name).then(result => {
      if (result) playDecoded(result, name, volume);
      else playFallback(name, volume);
    }).catch(() => playFallback(name, volume));

    return true;
  }

  function createAmbientTrack(mode) {
    const path = AMBIENT[mode];
    if (!path) return null;

    const audio = document.createElement('audio');
    audio.src = path;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 1;
    audio.setAttribute('aria-hidden', 'true');
    audio.style.display = 'none';

    document.body.appendChild(audio);

    let source = null;
    let gain = null;

    try {
      const c = ensureContext();
      source = c.createMediaElementSource(audio);
      gain = c.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(ambientBus);
    } catch (_) {
      // If MediaElementSource is unavailable, HTML5 Audio remains a safe fallback.
    }

    return { mode, audio, source, gain };
  }

  async function fadeTrack(track, from, to, duration) {
    if (!track) return;

    const c = ensureContext();
    if (track.gain && c) {
      const now = c.currentTime;
      track.gain.gain.cancelScheduledValues(now);
      track.gain.gain.setValueAtTime(clamp(from) * (AMBIENT_GAIN[track.mode] || 0.5), now);
      track.gain.gain.linearRampToValueAtTime(
        clamp(to) * (AMBIENT_GAIN[track.mode] || 0.5),
        now + duration
      );
    } else {
      track.audio.volume = clamp(to);
    }
  }

  async function transitionAmbient(mode, options = {}) {
    const { restart = false, duration = 1.6 } = options;
    if (!AMBIENT[mode]) return false;

    state.currentAmbient = mode;
    syncState();

    if (!state.ambientEnabled || !state.unlocked) return false;

    const c = ensureContext();
    if (!c || c.state !== 'running') return false;

    const generation = ++ambientGeneration;

    if (currentAmbient?.mode === mode && !restart) {
      try {
        if (currentAmbient.audio.paused) await currentAmbient.audio.play();
      } catch (_) {}
      return true;
    }

    const next = createAmbientTrack(mode);
    if (!next) return false;

    try {
      await next.audio.play();
    } catch (_) {
      next.audio.remove();
      return false;
    }

    await fadeTrack(next, 0, 1, duration);

    const previous = currentAmbient;
    currentAmbient = next;
    currentAmbientGain = next.gain;
    currentAmbientSource = next.source;

    if (previous && previous !== next) {
      await fadeTrack(previous, 1, 0, duration);
      if (generation === ambientGeneration) {
        try {
          previous.audio.pause();
          previous.audio.removeAttribute('src');
          previous.audio.load();
          previous.audio.remove();
        } catch (_) {}
      }
    }

    return true;
  }

  async function stopAmbient(fadeDuration = 0.6) {
    ++ambientGeneration;
    const track = currentAmbient;
    currentAmbient = null;
    currentAmbientGain = null;
    currentAmbientSource = null;

    if (!track) return;

    await fadeTrack(track, 1, 0, fadeDuration);
    try {
      track.audio.pause();
      track.audio.removeAttribute('src');
      track.audio.load();
      track.audio.remove();
    } catch (_) {}
  }

  function setSFXEnabled(value) {
    state.sfxEnabled = !!value;
    persist();
    return state.sfxEnabled;
  }

  function setAmbientEnabled(value) {
    state.ambientEnabled = !!value;
    persist();

    if (!state.ambientEnabled) {
      stopAmbient().catch(() => {});
    } else if (state.currentAmbient && state.unlocked) {
      transitionAmbient(state.currentAmbient).catch(() => {});
    }
    return state.ambientEnabled;
  }

  function setSFXVolume(value) {
    state.sfxVolume = clamp(value);
    if (sfxBus && ctx) sfxBus.gain.setTargetAtTime(state.sfxVolume, ctx.currentTime, 0.03);
    persist();
    return state.sfxVolume;
  }

  function setAmbientVolume(value) {
    state.ambientVolume = clamp(value);
    if (ambientBus && ctx) ambientBus.gain.setTargetAtTime(state.ambientVolume, ctx.currentTime, 0.03);
    persist();
    return state.ambientVolume;
  }

  function toggleSFX() { return setSFXEnabled(!state.sfxEnabled); }
  function toggleAmbient() { return setAmbientEnabled(!state.ambientEnabled); }

  function startChallenge(mode) {
    unlock().catch(() => {});
    state.currentAmbient = AMBIENT[mode] ? mode : state.currentAmbient;
    if (state.currentAmbient && state.ambientEnabled && state.unlocked) {
      transitionAmbient(state.currentAmbient).catch(() => {});
    }
    return state.currentAmbient;
  }

  function stopChallenge() {
    stopAmbient().catch(() => {});
  }

  function init() {
    if (state.initialized) return api;
    state.initialized = true;
    ensureContext();
    syncState();
    installGestureUnlock();
    return api;
  }

  // Backward-compatible aliases used by existing V1201/V1205 game code.
  const api = {
    init,
    unlock,
    preloadSFX,
    playSFX,
    playAmbient: transitionAmbient,
    transitionAmbient,
    stopAmbient,
    startChallenge,
    stopChallenge,

    click: () => playSFX('click_light'),
    heavyClick: () => playSFX('click_heavy'),
    menuToggle: () => playSFX('menu_toggle'),
    menuOpen: () => playSFX('menu_toggle'),
    menuClose: () => playSFX('menu_toggle'),
    successCoin: () => playSFX('success_coin'),
    purchaseBurn: () => playSFX('purchase_burn'),
    challengeWin: () => playSFX('challenge_win'),
    challengeFail: () => playSFX('challenge_fail'),

    // Existing challenge aliases.
    correct: () => playSFX('challenge_win'),
    wrong: () => playSFX('challenge_fail'),
    success: () => playSFX('challenge_win'),
    timeout: () => playSFX('challenge_fail'),
    notification: () => playSFX('menu_toggle'),

    setSFXEnabled,
    setAmbientEnabled,
    setSFXVolume,
    setAmbientVolume,
    toggleMuteSFX: toggleSFX,
    toggleMuteAmbient: toggleAmbient,

    isUnlocked: () => state.unlocked,
    sfxEnabled: () => state.sfxEnabled,
    ambientEnabled: () => state.ambientEnabled,
    sfxVolume: () => state.sfxVolume,
    ambientVolume: () => state.ambientVolume,
    getState: () => ({ ...state })
  };

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE_AUDIO = window.ZIVOZONE_AUDIO || {};
  window.ZIVOZONE_AUDIO.AudioManager = api;
  window.ZIVOZONE_AUDIO.SFX = SFX;
  window.ZIVOZONE_AUDIO.unlock = unlock;
  window.ZIVOZONE.Audio = api;

  // Static/dynamic UI click delegation.
  document.addEventListener('click', event => {
    const target = event.target?.closest?.('[data-sfx]');
    if (!target) return;
    const kind = String(target.dataset.sfx || '').toLowerCase();
    if (kind === 'light') playSFX('click_light');
    else if (kind === 'heavy') playSFX('click_heavy');
  }, true);

  init();
})();
