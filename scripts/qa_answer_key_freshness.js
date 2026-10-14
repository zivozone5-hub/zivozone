#!/usr/bin/env node
/* V1230.95 gate: functions/data/answer-key.json must always be byte-identical to what
   scripts/export_answer_key.js would regenerate right now from core/modules/question-bank.js +
   question-bank-expansion.js. Without this gate, nothing stopped a question-bank edit from
   shipping while the server-side grading key (used by the Cloud Function in functions/index.js to
   validate rewards) quietly kept grading against the OLD questions — exactly the drift
   scripts/export_answer_key.js's own header warns about, but that warning only works if someone
   remembers to re-run it. Same idea as qa_bundle_freshness.py, for this file instead of the JS
   bundle.

   run:  node scripts/qa_answer_key_freshness.js
*/
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'functions', 'data', 'answer-key.json');

function load(rel, ctx) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel, timeout: 5000 });
}

function regenerate() {
  const ctx = { window: {}, console, Math, Date, JSON, Object, Array, Set, Map, Number, String, Boolean, RegExp };
  ctx.window.window = ctx.window;
  ctx.document = { readyState: 'complete', addEventListener() {}, documentElement: { lang: 'ar' } };
  ctx.localStorage = { getItem() { return null; }, setItem() {} };
  vm.createContext(ctx);
  load('core/modules/question-bank.js', ctx);
  load('core/modules/question-bank-expansion.js', ctx);
  const banks = ctx.window.ZIVOZONE_CHALLENGES || {};
  const key = {};
  for (const [challengeId, bank] of Object.entries(banks)) {
    if (!bank || !Array.isArray(bank.questions)) continue;
    key[challengeId] = bank.questions.map(q => ({
      id: q.id,
      a: q.a || q.options || q.choices || q.answers || null,
      c: q.c !== undefined ? Number(q.c) : null,
      answer: q.answer !== undefined ? q.answer : (q.extra?.answer !== undefined ? q.extra.answer : null),
      alternatives: Array.isArray(q.alternatives) ? q.alternatives : null
    }));
  }
  return JSON.stringify(key);
}

let fails = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail && !ok ? `  [${detail}]` : ''));
  if (!ok) fails++;
}

if (!fs.existsSync(OUT)) {
  check('functions/data/answer-key.json exists', false, 'run: node scripts/export_answer_key.js');
  process.exit(1);
}

const committed = fs.readFileSync(OUT, 'utf8');
const fresh = regenerate();
check('answer-key.json is byte-identical to a fresh regeneration from the current question bank',
  committed === fresh,
  `${committed.length} bytes committed vs ${fresh.length} bytes regenerated — run: node scripts/export_answer_key.js`);

console.log(fails ? `\n${fails} check(s) failed` : '\nANSWER KEY IS FRESH');
process.exit(fails ? 1 : 0);
