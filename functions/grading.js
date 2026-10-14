/* ZIVOZONE V1230.68 — pure grading logic for server-side challenge verification.
   Deliberately has ZERO dependency on firebase-admin/firebase-functions, so it can be unit-tested
   (test/grading.test.js) with plain Node, without installing anything and without a Firebase
   project, emulator, or network access — exactly what this sandbox can actually run.
   A faithful Node port of core/modules/challenges.js's text()/norm()/answer() (see that file's
   lines ~11-12 and ~1067 for the original client-side logic this mirrors).
*/
'use strict';

// V1230.89 — must always match challenges.js's `count` (core/modules/challenges.js, _startInner()).
// Unlike the reward/perfect check (now generic — see firestore.rules' perfectClaim()), THIS one is
// deliberately a fixed literal: it validates that a submission has the shape the live room actually
// serves (exactly this many answers), which only changes when the room's design changes, not something
// to make dynamic from client-supplied data. Dormant today (see index.js's header) — update this by
// hand alongside challenges.js's `count` if the room's question count ever changes again.
const REQUIRED_ANSWER_COUNT = 10;

function norm(v) {
  const s = typeof v === 'string' ? v : (v == null ? '' : String(v));
  return s.trim().toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[،,؛;]/g, ' ')
    .replace(/\s+/g, ' ');
}

// The client's text() picks ONE language (document.documentElement.lang) out of a multi-language
// answer object. The server has no notion of "the player's current UI language" to anchor on, so it
// is deliberately more permissive in one specific way only: it accepts a match against ANY of the
// object's language variants, not just one. This cannot let a wrong answer pass — every variant is
// still a translation of the SAME correct answer — it only avoids rejecting a correct answer the
// player typed/selected in a language the server guessed wrong.
function matchesAny(correctValue, submitted) {
  if (correctValue == null) return false;
  const subN = norm(submitted);
  if (typeof correctValue === 'object') {
    return Object.values(correctValue).some(v => norm(v) === subN);
  }
  return norm(correctValue) === subN;
}

function isCorrect(question, submittedValue) {
  if (!question) return false;
  const choices = question.a;
  if (Array.isArray(choices) && Number.isInteger(question.c) && question.c >= 0 && question.c < choices.length) {
    if (matchesAny(choices[question.c], submittedValue)) return true;
  }
  if (question.answer != null && matchesAny(question.answer, submittedValue)) return true;
  if (Array.isArray(question.alternatives) && question.alternatives.some(alt => matchesAny(alt, submittedValue))) return true;
  return false;
}

// Grades a full submitted round against one challenge bank (answerKey[challengeId], an array of
// {id, a, c, answer, alternatives} — see scripts/export_answer_key.js). Pure function, no I/O.
function gradeRound(answerKey, challengeId, answers) {
  const bank = answerKey[challengeId];
  if (!bank || !Array.isArray(bank) || !bank.length) return { ok: false, reason: 'unknown-challenge' };
  if (!Array.isArray(answers) || answers.length !== REQUIRED_ANSWER_COUNT) return { ok: false, reason: 'wrong-answer-count' };
  const byId = new Map(bank.map(q => [String(q.id), q]));
  const seenIds = new Set();
  let correct = 0;
  for (const a of answers) {
    const id = String(a?.id ?? '');
    if (!id || seenIds.has(id)) return { ok: false, reason: 'duplicate-or-missing-question-id' };
    seenIds.add(id);
    const question = byId.get(id);
    if (!question) return { ok: false, reason: 'question-not-in-bank' };
    if (isCorrect(question, a?.value)) correct++;
  }
  return { ok: true, correct, total: REQUIRED_ANSWER_COUNT, perfect: correct === REQUIRED_ANSWER_COUNT };
}

module.exports = { norm, matchesAny, isCorrect, gradeRound, REQUIRED_ANSWER_COUNT };
