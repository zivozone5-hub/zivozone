/* ZIVOZONE V1230.68 — real server-side game-result verification (Cloud Functions).

   STATUS: written and ready; NOT deployed. The user explicitly chose to stay on Firebase's free
   Spark plan for now ("بدي نظل على المجاني"), and Cloud Functions require the Blaze (pay-as-you-go)
   plan to exist at all, even to run entirely inside Blaze's generous free monthly quota — so nothing
   here is deployed, and the live site does not depend on this in any way (see
   core/modules/runtime/server-verify.js, the one client-side call site, which is a genuine no-op
   until window.ZIVOZONE_CONFIG.CLOUD_FUNCTIONS_ENABLED is explicitly turned on after deploying this).

   What this closes: today, a "perfect 20/20" challenge_reward claim is entirely self-attested by
   the client (challenges.js decides locally whether all 20 answers were right). V1230.61 already
   anchored the ROUND'S START to a real server timestamp (gameSession), closing the zero-elapsed-time
   forgery case, but nothing re-checks the actual 20 answers server-side — a modified client could
   still claim "I got them all right" without having answered a single question correctly. This
   function re-grades the real submitted answers against the SAME answer key the client uses
   (functions/data/answer-key.json, generated from the live question bank by
   scripts/export_answer_key.js — never hand-maintained, so it can't silently drift out of sync with
   what players are actually shown) and only credits the reward if the server's own grading agrees.

   Deploy steps (future, once the user is ready to leave the free plan):
     1. Upgrade the Firebase project to the Blaze plan (adds a billing method; stays inside the free
        quota under normal traffic — Cloud Functions' free tier is ~2M invocations/month).
     2. node scripts/export_answer_key.js   (regenerate functions/data/answer-key.json if the
        question bank changed since the last export)
     3. cd functions && npm install
     4. firebase deploy --only functions
     5. Set window.ZIVOZONE_CONFIG.CLOUD_FUNCTIONS_ENABLED = true in index.html, then run
        scripts/release.py again so every generated page picks it up.
   None of these steps have been run in this sandbox (no real Firebase project access here).
*/
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const answerKey = require('./data/answer-key.json');
const { gradeRound } = require('./grading');

admin.initializeApp();

const ADMIN_EMAIL = 'raefalbtish@gmail.com'; // mirrors core/config.js ADMIN_EMAIL / firestore.rules isOwner()
const MIN_ELAPSED_MS = 15000; // mirrors firestore.rules' perfectClaim() / V1230.61's 15s anchor

/* ---- the callable function itself ---- */

exports.verifyChallengeResult = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'sign-in required');
  const uid = context.auth.uid;
  const email = String(context.auth.token?.email || '').toLowerCase();
  if (email === ADMIN_EMAIL) throw new functions.https.HttpsError('permission-denied', 'admin account cannot claim rewards');

  const challengeId = String(data?.challengeId || '').trim();
  const sessionId = String(data?.sessionId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 140);
  const answers = Array.isArray(data?.answers) ? data.answers : [];
  if (!challengeId || !sessionId) throw new functions.https.HttpsError('invalid-argument', 'challengeId and sessionId are required');

  const db = admin.firestore();

  // Re-check the SAME server-anchored session doc firestore.rules' perfectClaim() checks today —
  // this function must not be a weaker check than the existing client-side rule, only a stronger one.
  const sessionRef = db.collection('users').doc(uid).collection('zivozone').doc('gameSession');
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists) throw new functions.https.HttpsError('failed-precondition', 'no active game session');
  const session = sessionSnap.data() || {};
  if (session.sessionId !== sessionId || session.gameId !== challengeId) {
    throw new functions.https.HttpsError('failed-precondition', 'session does not match this round');
  }
  const startedAtMs = session.startedAt?.toMillis ? session.startedAt.toMillis() : 0;
  if (!startedAtMs || Date.now() - startedAtMs < MIN_ELAPSED_MS) {
    throw new functions.https.HttpsError('failed-precondition', 'round completed implausibly fast');
  }

  const grade = gradeRound(answerKey, challengeId, answers);
  if (!grade.ok) return { credited: false, perfect: false, reason: grade.reason };
  if (!grade.perfect) return { credited: false, perfect: false, correct: grade.correct, total: grade.total };

  // Perfect round, confirmed server-side. Credit it — same document shapes economy.js's credit()
  // writes (see core/modules/economy.js + the V1230.68 rewardClaims path fix in firestore.rules),
  // using the Admin SDK (which is never subject to firestore.rules). claimId intentionally equals
  // the raw sessionId, exactly like the client's own default eventId for this event — so if the
  // client-side path ALSO fires for the same round (it still does today; this is an addition, not a
  // replacement), both target the identical claim document and the transaction's own exists-check
  // below makes whichever one arrives second a harmless no-op. No double payout either way.
  const claimId = sessionId;
  const claimRef = db.collection('users').doc(uid).collection('rewardClaims').doc(claimId);
  const walletRef = db.collection('users').doc(uid).collection('zivozone').doc('wallet');
  const ledgerRef = walletRef.collection('ledger').doc(claimId);

  const credited = await db.runTransaction(async (tx) => {
    const [claimSnap, ledgerSnap, walletSnap] = await Promise.all([tx.get(claimRef), tx.get(ledgerRef), tx.get(walletRef)]);
    if (claimSnap.exists || ledgerSnap.exists) return false;
    const current = Math.max(0, Number(walletSnap.data()?.zivo) || 0);
    const now = admin.firestore.FieldValue.serverTimestamp();
    // V1230.88 — rooms moved from 10 to 20 questions/run and the unified perfect-score reward is 5
    // ZIVO (was 10), mirrored in core/modules/economy.js and firestore.rules' perfectClaim(). This
    // dormant function was never updated to match, so it still wrote amount:10 (double the real
    // payout) and a hardcoded total/correct:10 regardless of the real round size — harmless only
    // because the function has never been deployed; fixed now so activating it later doesn't silently
    // mis-credit or get rejected by firestore.rules (which the Admin SDK itself bypasses, but the
    // written document still needs to match what the rest of the app expects to read back).
    tx.set(claimRef, {
      claimId, type: 'challenge_reward', amount: 5, status: 'consumed', consumedAt: now,
      policy: 'perfect_score_only', total: grade.total, correct: grade.correct, timedOut: 0,
      source: 'cloud-function', validated: true, validatedSessionId: sessionId,
      challenge: challengeId, mission: null, competition: null, achievement: null,
      story: null, health: null, beauty: null, horror: null, lightEscape: null
    });
    tx.set(walletRef, {
      zivo: current + 5, updatedAt: now, lastRewardClaimId: claimId, mode: 'zivozone-economy-v1202'
    }, { merge: true });
    tx.set(ledgerRef, {
      type: 'challenge_reward', label: '🏆 Server-verified challenge reward', amount: 5,
      source: 'cloud-function', eventId: claimId, createdAt: now, claimId,
      challenge: challengeId, mission: null, competition: null, achievement: null,
      story: null, health: null, beauty: null, horror: null, lightEscape: null
    });
    return true;
  });

  return { credited, perfect: true, correct: grade.correct, total: grade.total };
});
