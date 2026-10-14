/* ZIVOZONE V1229 — EVENT BUS + GA4 TELEMETRY (opt-in consent)
   Canonical event bus for domain modules.
   GA4 is loaded lazily from the Firebase Measurement ID and uses
   gtag with send_page_view:false so SPA route changes can be tracked once.
   No PII is sent.
*/
(() => {
  'use strict';

  const listeners = new Map();
  const history = [];
  const HISTORY_LIMIT = 200;

  const KNOWN_EVENTS = Object.freeze([
    'AUTH_CHANGED', 'PLAYER_UPDATED', 'WALLET_UPDATED', 'MINING_COMPLETED',
    'CHALLENGE_STARTED', 'CHALLENGE_COMPLETED', 'REWARD_GRANTED',
    'MISSION_UPDATED', 'ACHIEVEMENT_UNLOCKED', 'MATCH_UPDATED',
    'NEWS_UPDATED', 'API_ERROR',
    'STORY_COMPLETED', 'SHARE_RESULT', 'DAILY_CHALLENGE_OPEN',
    'DAILY_CHALLENGE_COMPLETED'
  ]);

  function on(eventName, handler) {
    if (typeof handler !== 'function') return () => {};
    if (!listeners.has(eventName)) listeners.set(eventName, new Set());
    listeners.get(eventName).add(handler);
    return () => off(eventName, handler);
  }

  function once(eventName, handler) {
    let unsub = () => {};
    unsub = on(eventName, (...args) => {
      unsub();
      try { handler(...args); } catch (err) {
        console.error(`[ZIVOZONE.Events] once handler failed for ${eventName}`, err);
      }
    });
    return unsub;
  }

  function off(eventName, handler) {
    listeners.get(eventName)?.delete(handler);
  }

  function emit(eventName, detail = {}) {
    history.push({ eventName, detail, at: Date.now() });
    if (history.length > HISTORY_LIMIT) history.shift();

    const set = listeners.get(eventName);
    if (set) {
      Array.from(set).forEach(fn => {
        try { fn(detail, eventName); }
        catch (err) {
          console.error(`[ZIVOZONE.Events] handler failed for ${eventName}`, err);
        }
      });
    }

    try {
      window.dispatchEvent(new CustomEvent(
        `zivozone:${String(eventName).toLowerCase()}`,
        { detail }
      ));
    } catch (_) {}
  }

  function getHistory(eventName) {
    return eventName
      ? history.filter(h => h.eventName === eventName)
      : history.slice();
  }

  /* ---------------- GA4 adapter ---------------- */

  const measurementId =
    String(window.ZIVOZONE_FIREBASE_CONFIG?.measurementId || '').trim();

  /* V1229 — analytics is OPT-IN. Nothing is loaded or sent until the visitor grants consent.
     States: 'granted' | 'denied' | null (not chosen yet). Legacy opt-out flag maps to 'denied'. */
  const GA_OPT_OUT_KEY = 'zivozone_ga4_opt_out_v1227';
  const CONSENT_KEY = 'zivozone_consent_v1';
  let gaReadyPromise = null;

  function getConsent() {
    try {
      const v = localStorage.getItem(CONSENT_KEY);
      if (v === 'granted' || v === 'denied') return v;
      if (localStorage.getItem(GA_OPT_OUT_KEY) === '1') return 'denied';
    } catch (_) {}
    return null;
  }

  function analyticsAllowed() {
    return getConsent() === 'granted';
  }

  function clearGoogleCookies() {
    try {
      document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0].trim();
        if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${location.hostname}`;
        }
      });
    } catch (_) {}
  }

  function setConsent(value) {
    try {
      if (value === null) {
        localStorage.removeItem(CONSENT_KEY);
      } else {
        localStorage.setItem(CONSENT_KEY, value);
      }
      if (value === 'granted') localStorage.removeItem(GA_OPT_OUT_KEY);
      if (value === 'denied') localStorage.setItem(GA_OPT_OUT_KEY, '1');
    } catch (_) {}
    if (value !== 'granted') {
      if (measurementId) window['ga-disable-' + measurementId] = true;
      clearGoogleCookies();
    } else if (measurementId) {
      window['ga-disable-' + measurementId] = false;
    }
    try {
      window.dispatchEvent(new CustomEvent('zivozone-consent', { detail: { consent: value } }));
    } catch (_) {}
    if (value === 'granted') {
      loadGA4().then(ok => { if (ok) pageView(); });
    }
  }

  function loadGA4() {
    if (!measurementId || !analyticsAllowed()) {
      return Promise.resolve(false);
    }
    if (typeof window.gtag === 'function') {
      return Promise.resolve(true);
    }
    if (gaReadyPromise) return gaReadyPromise;

    gaReadyPromise = new Promise(resolve => {
      try {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };

        const script = document.createElement('script');
        script.async = true;
        script.src =
          `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        script.onload = () => {
          try {
            window.gtag('js', new Date());
            window.gtag('config', measurementId, {
              send_page_view: false,
              anonymize_ip: true,
              transport_type: 'beacon'
            });
            resolve(true);
          } catch (_) {
            resolve(false);
          }
        };
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      } catch (_) {
        resolve(false);
      }
    });

    return gaReadyPromise;
  }

  function cleanParam(value, max = 100) {
    return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  }

  function numberParam(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }

  async function track(eventName, params = {}) {
    if (!analyticsAllowed() || !measurementId) return false;

    const ok = await loadGA4();
    if (!ok || typeof window.gtag !== 'function') return false;

    const safe = {};
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (typeof value === 'number' && Number.isFinite(value)) safe[key] = value;
      else if (typeof value === 'boolean') safe[key] = value;
      else safe[key] = cleanParam(value);
    });

    try {
      window.gtag('event', String(eventName).slice(0, 40), safe);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function pageView(path = location.pathname, title = document.title) {
    return track('page_view', {
      page_path: cleanParam(path, 200),
      page_title: cleanParam(title, 150),
      page_location: `${location.origin}${location.pathname}${location.search}`
    });
  }

  function trackStoryCompleted(data = {}) {
    return track('story_completed', {
      story_id: cleanParam(data.storyId || data.id),
      story_title: cleanParam(data.storyTitle || data.title),
      completion_mode: cleanParam(data.completionMode || 'interactive')
    });
  }

  function trackShareResult(data = {}) {
    return track('share_result', {
      game_id: cleanParam(data.gameId || data.id),
      challenge_name: cleanParam(data.challengeName || data.challenge),
      score: numberParam(data.score),
      share_method: cleanParam(data.method || 'unknown')
    });
  }

  function trackDailyOpen(data = {}) {
    return track('daily_challenge_open', {
      challenge_id: cleanParam(data.challengeId || data.id),
      date: cleanParam(data.date)
    });
  }

  function trackDailyCompleted(data = {}) {
    return track('daily_challenge_completed', {
      challenge_id: cleanParam(data.challengeId || data.id),
      score: numberParam(data.score),
      correct: numberParam(data.correct),
      total: numberParam(data.total),
      date: cleanParam(data.date)
    });
  }

  /* Event bridges: modules can remain decoupled. */
  on('STORY_COMPLETED', trackStoryCompleted);
  on('SHARE_RESULT', trackShareResult);
  on('DAILY_CHALLENGE_OPEN', trackDailyOpen);
  on('DAILY_CHALLENGE_COMPLETED', trackDailyCompleted);

  if (analyticsAllowed()) loadGA4();

  window.addEventListener('zivozone:route', event => {
    const route = event.detail || {};
    pageView(route.path || location.pathname, document.title);
  });

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.Events = Object.freeze({
    on, once, off, emit, getHistory, KNOWN_EVENTS,
    track,
    pageView,
    trackStoryCompleted,
    trackShareResult,
    trackDailyOpen,
    trackDailyCompleted,
    consent: Object.freeze({
      get: getConsent,
      grant: () => setConsent('granted'),
      deny: () => setConsent('denied'),
      reset: () => setConsent(null)
    }),
    optOut: () => setConsent('denied'),
    optIn: () => setConsent('granted'),
    analyticsStatus: () => ({
      measurementId: measurementId || null,
      enabled: analyticsAllowed(),
      consent: getConsent()
    })
  });
})();
