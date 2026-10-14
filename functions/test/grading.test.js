'use strict';
/* Pure-logic test for functions/grading.js, runnable with plain `node functions/test/grading.test.js`
   — no firebase-admin/firebase-functions install, no emulator, no network. This is the real,
   generated answer key (functions/data/answer-key.json), not a hand-made fixture, so a pass here
   means the grading logic actually agrees with the live question bank's real answers.
*/
const assert = require('assert');
const path = require('path');
const { gradeRound, norm, matchesAny, isCorrect } = require('../grading');
const answerKey = require('../data/answer-key.json');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('PASS', name); }
  catch (e) { failed++; console.log('FAIL', name, '-', e.message); }
}

test('answer-key.json has the expected 21 banks and non-trivial question counts', () => {
  const ids = Object.keys(answerKey);
  assert.strictEqual(ids.length, 21, `expected 21 banks, got ${ids.length}`);
  for (const id of ids) assert.ok(answerKey[id].length > 0, `${id} has no questions`);
});

test('norm() matches the client-side normalization rules', () => {
  assert.strictEqual(norm('  Hello World  '), 'hello world');
  assert.strictEqual(norm('أحمد'), 'احمد'); // أ -> ا
  assert.strictEqual(norm('مدرسة'), 'مدرسه'); // ة -> ه
  assert.strictEqual(norm('علي، احمد'), 'علي احمد'); // ، -> space, collapsed
});

test('matchesAny() accepts any language variant of a multi-language object', () => {
  const choice = { ar: 'نعم', en: 'Yes', zh: '是' };
  assert.ok(matchesAny(choice, 'yes'));
  assert.ok(matchesAny(choice, 'نعم'));
  assert.ok(matchesAny(choice, '是'));
  assert.ok(!matchesAny(choice, 'no'));
});

test('a real "iq" question from the live bank grades correctly by its own recorded correct choice', () => {
  const bank = answerKey.iq;
  const q = bank[0];
  assert.ok(q.a && Number.isInteger(q.c), 'expected a multiple-choice question with a/c fields');
  const correctChoice = q.a[q.c];
  const correctValue = typeof correctChoice === 'object' ? Object.values(correctChoice)[0] : correctChoice;
  assert.ok(isCorrect(q, correctValue), 'the bank\'s own recorded correct choice must grade as correct');
  assert.ok(!isCorrect(q, '__definitely_wrong_value__'), 'a nonsense value must never grade as correct');
});

// Mirrors grading.js's own precedence exactly: an indexed choice only counts if q.c is actually a
// valid index into a NON-EMPTY q.a (some questions in the real bank are direct-answer style with
// a:[] and an unrelated numeric q.c, e.g. iq-03/iq-08 below — q.answer is their real correct text).
function realCorrectValue(q) {
  if (Array.isArray(q.a) && q.a.length && Number.isInteger(q.c) && q.c >= 0 && q.c < q.a.length) {
    const choice = q.a[q.c];
    return typeof choice === 'object' && choice !== null ? Object.values(choice)[0] : choice;
  }
  if (q.answer != null) return typeof q.answer === 'object' ? Object.values(q.answer)[0] : q.answer;
  if (Array.isArray(q.alternatives) && q.alternatives.length) return q.alternatives[0];
  throw new Error(`question ${q.id} has no derivable correct value — fixture assumption broken`);
}

test('gradeRound(): a full submission of the bank\'s own correct answers for the first 10 "iq" questions is perfect', () => {
  const bank = answerKey.iq.slice(0, 10);
  const answers = bank.map(q => ({ id: q.id, value: realCorrectValue(q) }));
  const result = gradeRound(answerKey, 'iq', answers);
  assert.strictEqual(result.ok, true, JSON.stringify(result));
  assert.strictEqual(result.perfect, true, `expected perfect, got correct=${result.correct}/${result.total}`);
});

test('gradeRound(): one wrong answer out of 10 is correctly graded as NOT perfect', () => {
  const bank = answerKey.iq.slice(0, 10);
  const answers = bank.map((q, i) => i === 3 ? { id: q.id, value: '__wrong__' } : { id: q.id, value: realCorrectValue(q) });
  const result = gradeRound(answerKey, 'iq', answers);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.perfect, false);
  assert.strictEqual(result.correct, 9);
});

test('gradeRound(): rejects wrong answer count (anti-tamper: can\'t submit fewer/more than 10)', () => {
  const result = gradeRound(answerKey, 'iq', [{ id: answerKey.iq[0].id, value: 'x' }]);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'wrong-answer-count');
});

test('gradeRound(): rejects an unknown challenge id', () => {
  const result = gradeRound(answerKey, 'not_a_real_challenge', new Array(10).fill({ id: 'x', value: 'y' }));
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'unknown-challenge');
});

test('gradeRound(): rejects a duplicate question id (anti-tamper: can\'t answer the same easy question 10 times)', () => {
  const q = answerKey.iq[0];
  const answers = new Array(10).fill(null).map(() => ({ id: q.id, value: 'x' }));
  const result = gradeRound(answerKey, 'iq', answers);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'duplicate-or-missing-question-id');
});

test('gradeRound(): rejects a question id that does not belong to this bank (anti-tamper: borrowing an easier bank\'s ids)', () => {
  const foreignId = answerKey.science[0].id;
  const bank = answerKey.iq.slice(0, 9);
  const answers = bank.map(q => ({ id: q.id, value: 'x' }));
  answers.push({ id: foreignId, value: 'x' });
  const result = gradeRound(answerKey, 'iq', answers);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.reason, 'question-not-in-bank');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
