/* ZIVOZONE V1230.68 — dormant client-side hook for real server-side game-result verification.

   STATUS: written and ready, NOT active. window.ZIVOZONE_CONFIG.CLOUD_FUNCTIONS_ENABLED is unset in
   index.html today, so verify() below returns null immediately, on the very first line, before
   touching the network, Firebase Functions, or anything else — today's behavior (the existing
   100% client-side challenge_reward path in economy.js/challenges.js) is completely unchanged.

   Why this stays off: Cloud Functions require Firebase's Blaze (pay-as-you-go) plan to exist at
   all, even to run entirely inside its free monthly quota. The user has explicitly chosen to stay
   on the free Spark plan for now, so this is prepared but deliberately not wired to anything live.

   To activate later (after upgrading to Blaze and running `firebase deploy --only functions`):
   1. Set window.ZIVOZONE_CONFIG.CLOUD_FUNCTIONS_ENABLED = true in index.html (propagates to every
      generated page the next time release.py / prerender-*.mjs run, same as any other config flag).
   2. Nothing else needs to change here — this module and its one call site in challenges.js are
      already wired; they just do nothing until that flag flips.

   Safety even once enabled: this is a SECOND path, not a replacement. The existing client-side
   'zivozone-result' -> economy.js listener still fires regardless. Both paths target the exact same
   Firestore claimId (the session id), and credit()'s transaction already refuses to pay out twice
   for the same claimId (see core/modules/economy.js) — so having both active is naturally
   idempotent, not a double-reward risk. Once the server path is reliable, the client-side listener
   can be narrowed later; that is a separate, future change, not part of this one.
*/
(() => {
  'use strict';

  let functionsLoadPromise = null;
  function loadFunctionsSdk() {
    if (window.firebase?.functions) return Promise.resolve();
    if (functionsLoadPromise) return functionsLoadPromise;
    functionsLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions-compat.js';
      s.onload = () => (window.firebase?.functions ? resolve() : reject(new Error('functions-sdk-missing-after-load')));
      s.onerror = () => reject(new Error('functions-sdk-network-error'));
      document.head.appendChild(s);
    }).catch(e => { functionsLoadPromise = null; throw e; });
    return functionsLoadPromise;
  }

  async function verify({ challengeId, sessionId, answers } = {}) {
    if (!window.ZIVOZONE_CONFIG?.CLOUD_FUNCTIONS_ENABLED) return null;
    if (!challengeId || !sessionId || !Array.isArray(answers) || !answers.length) return null;
    try {
      await loadFunctionsSdk();
      const callable = window.firebase.functions().httpsCallable('verifyChallengeResult');
      const res = await callable({ challengeId, sessionId, answers });
      return res?.data || null;
    } catch (e) {
      console.warn('ServerVerify (non-fatal, client-side path still applies):', e);
      return null;
    }
  }

  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.ServerVerify = Object.freeze({ version: '1230.68', verify });
})();
