/* ZIVOZONE V1064 — Real ZIVO AI bridge
 * Firebase AI Logic + Gemini Developer API.
 * No Gemini API key is stored in the client.
 */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-ai.js';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app-check.js';

(() => {
  const cfg = window.ZIVOZONE_FIREBASE_CONFIG;
  const LIMIT = 10;
  const DAY = new Date().toISOString().slice(0, 10);
  const KEY = `zivo_ai_usage_${DAY}`;
  let chat = null;
  let model = null;
  let ready = false;
  let lastError = '';

  function usage() {
    const n = Number(localStorage.getItem(KEY) || 0);
    return Number.isFinite(n) ? n : 0;
  }
  function bump() { localStorage.setItem(KEY, String(usage() + 1)); }

  function playerContext() {
    const s = window.ZIVOZONE_STATE || window.ZIVOZONE_PLAYER || {};
    return {
      level: Number(s.level || 1),
      xp: Number(s.xp || 0),
      zivo: Number(s.coins ?? s.zivo ?? 0),
      gamesPlayed: Number(s.gamesPlayed || 0),
      wins: Number(s.wins || 0),
      bestStreak: Number(s.bestStreak || 0)
    };
  }

  function systemInstruction() {
    const lang = document.documentElement.lang === 'en' ? 'English' : 'Arabic';
    return `You are ZIVO AI, the official smart assistant inside ZIVOZONE.
Answer naturally, accurately, briefly and helpfully. Default language: ${lang}.
ZIVOZONE is a digital platform for challenges, games, sports, learning and virtual ZIVO rewards.
ZIVO is a virtual in-platform balance, not cash, an investment, or a promise of financial return.
Do not invent ZIVOZONE features, balances, rules, news, prices or account data.
When discussing the user's progress, use only the player context supplied in the current request.
Do not claim to have browsed live news unless live web/news data is actually supplied.
For medical, legal, financial or safety-critical questions, give cautious general information and recommend an appropriate qualified professional when needed.
Keep responses suitable for a broad audience and avoid collecting unnecessary personal data.`;
  }

  async function init() {
    if (!cfg?.projectId) throw new Error('Missing Firebase configuration');
    const name = 'zivo-ai';
    let app = getApps().find(a => a.name === name);
    if (!app) app = initializeApp(cfg, name);

    // ZIVOZONE V1064 App Check for the modular Firebase AI Logic app.
    const appCheckKey = window.ZIVOZONE_SECURITY?.appCheckSiteKey;
    if (!appCheckKey) {
      throw new Error('Missing reCAPTCHA Enterprise App Check site key');
    }

    // App Check MUST be initialized on the same Firebase app instance used by AI Logic.
    // Use limited-use tokens for Firebase AI Logic to provide stronger replay protection.
    let appCheck;
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckKey),
        isTokenAutoRefreshEnabled: true
      });

      // Force an initial token acquisition so we fail early with a useful error
      // instead of sending an invalid/empty App Check token to AI Logic.
      await getToken(appCheck, false);
    } catch (appCheckError) {
      console.error('ZIVO AI App Check initialization/token error:', appCheckError);
      throw new Error('فشل التحقق الأمني App Check لـ ZIVO AI. تأكد من أن مفتاح reCAPTCHA Enterprise مسجل لنطاق zivozone.com.');
    }

    const ai = getAI(app, {
      backend: new GoogleAIBackend(),
      useLimitedUseAppCheckTokens: true
    });
    model = getGenerativeModel(ai, {
      model: window.ZIVOZONE_AI_CONFIG?.model || 'gemini-3.5-flash-lite',
      systemInstruction: systemInstruction(),
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: 500
      }
    });
    chat = model.startChat();
    ready = true;
    lastError = '';
    window.dispatchEvent(new CustomEvent('zivo-ai-status', { detail: { ready: true, used: usage(), limit: LIMIT } }));
    return true;
  }

  async function ask(message) {
    const text = String(message || '').trim().slice(0, 1000);
    if (!text) return '';
    if (!navigator.onLine) throw new Error('لا يوجد اتصال بالإنترنت حاليًا.');
    if (usage() >= LIMIT) throw new Error(`وصلت إلى الحد المجاني اليومي (${LIMIT} رسائل). عد غدًا.`);
    if (!ready) await init();

    const ctx = playerContext();
    const prompt = `Player context: level=${ctx.level}, xp=${ctx.xp}, zivo=${ctx.zivo}, gamesPlayed=${ctx.gamesPlayed}, wins=${ctx.wins}, bestStreak=${ctx.bestStreak}.
User message: ${text}`;
    bump();
    const result = await chat.sendMessage(prompt);
    const reply = result?.response?.text?.() || '';
    if (!reply) throw new Error('لم يصل رد من ZIVO AI.');
    window.dispatchEvent(new CustomEvent('zivo-ai-usage', { detail: { used: usage(), limit: LIMIT } }));
    return reply.trim();
  }

  async function resetChat() {
    if (!ready) await init();
    chat = model.startChat();
  }

  window.ZIVOZONE_REAL_AI = {
    ask,
    init,
    resetChat,
    getStatus: () => ({ ready, used: usage(), limit: LIMIT, lastError })
  };

  init().catch(err => {
    lastError = err?.message || String(err);
    console.warn('ZIVO AI initialization:', err);
    window.dispatchEvent(new CustomEvent('zivo-ai-status', { detail: { ready: false, used: usage(), limit: LIMIT, error: lastError } }));
  });
})();
