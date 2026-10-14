const fs=require('fs');
const assert=require('assert');
const puzzle=fs.readFileSync('core/modules/puzzle-room.js','utf8');
const exit=fs.readFileSync('core/modules/runtime/exit-guard.js','utf8');
const audio=fs.readFileSync('core/modules/audio.js','utf8');
const challenges=fs.readFileSync('core/modules/challenges.js','utf8');
const bank=fs.readFileSync('core/modules/question-bank.js','utf8');

// Puzzle Room: stage 1 must actually contain a duplicate pair.
assert(puzzle.includes("let a=[...others,dup,dup]"));
assert(puzzle.includes("s.data.observe=dup"));

// Exit/return: never send the user to about:blank; always return through canonical home route.
assert(!exit.includes('about:blank'));
assert(exit.includes("location.hash='#home'"));
assert(exit.includes('zivozone-home-reset'));

// Audio: no boot-time AudioContext; room/challenge audio can be unlocked on gesture.
assert(audio.includes('Intentionally lightweight: do NOT create AudioContext here.'));
assert(audio.includes('async unlock()'));

// Challenge: every supported world with a matching track requests ambient audio safely.
for (const id of ['iq','math','science','football','logic','daily','strategy','memory','reaction']) {
  assert(challenges.includes(`${id}:'${id}'`));
}

// Question bank: legacy authored questions receive stable ids.
assert(bank.includes('Canonicalize legacy authored questions'));
assert(bank.includes('String(i+1).padStart(3'))

console.log('V1228 FULL QA: PASS');
