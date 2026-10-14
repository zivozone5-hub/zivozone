#!/usr/bin/env node
/* V1230.68 — generates functions/data/answer-key.json from the SAME source of truth the client
   uses (core/modules/question-bank.js + question-bank-expansion.js), so the Cloud Function that
   grades answers server-side (functions/index.js) can never drift out of sync with what players are
   actually shown. This is NOT a hand-maintained duplicate: run this script again any time the
   question bank changes, before deploying functions.

   Reuses the exact same vm.runInContext sandboxing approach already used by
   scripts/legacy/foundation-audit-v1197-5.js to load question-bank.js without a browser — same
   pattern, not a new one.

   Only grading-relevant fields are kept per question (id, a, c, answer, extra, alternatives) — the
   question text itself (q) and display metadata are dropped, since the server only ever needs to
   know what counts as correct, never what the player was shown (the client already has that).

   run:  node scripts/export_answer_key.js
*/
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'functions', 'data', 'answer-key.json');

function load(rel, ctx) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel, timeout: 5000 });
}

const ctx = { window: {}, console, Math, Date, JSON, Object, Array, Set, Map, Number, String, Boolean, RegExp };
ctx.window.window = ctx.window;
ctx.document = { readyState: 'complete', addEventListener() {}, documentElement: { lang: 'ar' } };
ctx.localStorage = { getItem() { return null; }, setItem() {} };
vm.createContext(ctx);

load('core/modules/question-bank.js', ctx);
load('core/modules/question-bank-expansion.js', ctx);

const banks = ctx.window.ZIVOZONE_CHALLENGES || {};
const key = {};
let totalQuestions = 0;

for (const [challengeId, bank] of Object.entries(banks)) {
  if (!bank || !Array.isArray(bank.questions)) continue;
  key[challengeId] = bank.questions.map(q => {
    totalQuestions++;
    return {
      id: q.id,
      a: q.a || q.options || q.choices || q.answers || null,
      c: q.c !== undefined ? Number(q.c) : null,
      answer: q.answer !== undefined ? q.answer : (q.extra?.answer !== undefined ? q.extra.answer : null),
      alternatives: Array.isArray(q.alternatives) ? q.alternatives : null
    };
  });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(key), 'utf8');
console.log(`export_answer_key: wrote ${Object.keys(key).length} challenge bank(s), ${totalQuestions} question(s) -> ${path.relative(ROOT, OUT)} (${fs.statSync(OUT).size} bytes)`);
