#!/usr/bin/env node
/* V1230.95 gate: no multiple-choice question's correct option may be >=1.3x longer (by character
   count, Arabic text) than every wrong option. A player who never reads the question and just
   taps "the longest-looking answer" should not be able to beat the quiz.

   Found via a real mobile-audit pass across TWO separate question pools: 41 of 542 in the main
   bank (question-bank.js + question-bank-expansion.js) and, much worse, 225 of 250 (90%!) in the
   Forensic Lab case files (forensic-case-core.js's CASES[*].clues), where a handful of recycled
   question templates (reused verbatim across all 25 cases) all had the same tell. All 291 were
   hand-fixed (short distractors enriched with natural qualifier phrases so none of them reads as
   an obviously-thin placeholder) in the same release that added this gate, so this script exists
   to make sure the pattern never quietly comes back as either bank grows.

   run:  node scripts/qa_mcq_length_bias.js
*/
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const THRESHOLD = 1.3;

function load(rel, ctx) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel, timeout: 5000 });
}

function textOf(opt) {
  if (opt == null) return '';
  if (typeof opt === 'string') return opt;
  return opt.ar || opt.en || '';
}

function evalBias(id, opts, correctIdx, label, flagged) {
  if (!Array.isArray(opts) || opts.length < 2 || correctIdx === undefined || correctIdx === null) return;
  const lens = opts.map(o => textOf(o).length);
  const correctLen = lens[Number(correctIdx)];
  const otherLens = lens.filter((_, i) => i !== Number(correctIdx));
  if (!otherLens.length) return;
  const maxOther = Math.max(...otherLens);
  const ratio = maxOther > 0 ? correctLen / maxOther : (correctLen > 0 ? 99 : 1);
  if (correctLen > maxOther && ratio >= THRESHOLD) {
    flagged.push({ label, id, ratio: Math.round(ratio * 100) / 100 });
  }
}

let total = 0;
const flagged = [];

// Pool 1: the main question bank (challenge categories like iq, science, football, horror, ...)
const ctx1 = { window: {}, console, Math, Date, JSON, Object, Array, Set, Map, Number, String, Boolean, RegExp };
ctx1.window.window = ctx1.window;
ctx1.document = { readyState: 'complete', addEventListener() {}, documentElement: { lang: 'ar' } };
ctx1.localStorage = { getItem() { return null; }, setItem() {} };
vm.createContext(ctx1);
load('core/modules/question-bank.js', ctx1);
load('core/modules/question-bank-expansion.js', ctx1);
const banks = ctx1.window.ZIVOZONE_CHALLENGES || {};
for (const [challengeId, bank] of Object.entries(banks)) {
  if (!bank || !Array.isArray(bank.questions)) continue;
  for (const q of bank.questions) {
    const opts = q.a || q.options || q.choices || q.answers;
    if (!Array.isArray(opts) || q.c === undefined || q.c === null) continue;
    total++;
    evalBias(q.id, opts, Number(q.c), challengeId, flagged);
  }
}

// Pool 2: the Forensic Lab's 25 case files, 10 clue-questions each (forensic-case-core.js)
const forensicSrc = fs.readFileSync(path.join(ROOT, 'core/modules/forensic-case-core.js'), 'utf8');
const casesMatch = /const CASES=(\[[\s\S]*?\]);\s*\n/.exec(forensicSrc);
if (casesMatch) {
  const ctx2 = {};
  vm.createContext(ctx2);
  const CASES = vm.runInContext('(' + casesMatch[1] + ')', ctx2, { timeout: 10000 });
  CASES.forEach(c => {
    (c.clues || []).forEach((clue, qi) => {
      const opts = clue[2], correctIdx = clue[3];
      if (!Array.isArray(opts) || correctIdx === undefined) return;
      total++;
      evalBias(`${c.id}-clue${qi}`, opts, correctIdx, 'forensic', flagged);
    });
  });
}

console.log(`PASS  ${total} multiple-choice questions scanned`);
if (flagged.length) {
  console.log(`FAIL  ${flagged.length} question(s) have a correct answer >=${THRESHOLD}x longer than every wrong option:`);
  for (const f of flagged) console.log(`      [${f.label}/${f.id}] ratio=${f.ratio}`);
  console.log('\nFix: lengthen the short wrong option(s) with a natural qualifier phrase (never shorten the correct answer\'s real meaning), then re-run this gate.');
  process.exit(1);
}
console.log('PASS  no question\'s correct answer is a length giveaway');
process.exit(0);
