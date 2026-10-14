#!/usr/bin/env python3
"""V1230.89 gate: a multiple-choice question's options must not be guessable by their SHAPE alone.

Flagged by the user directly: if the correct answer is a 4-word phrase and the three decoys are
1-2 words each, a player can pick the "odd one out" without reading any of them — the question
stops testing knowledge and starts testing pattern-matching on option length. This gate checks
every question's options (q.a) for word-count parity: the spread between the shortest and longest
option (by word count, using the question's own ar/en text) must not exceed MAX_SPREAD.

This mirrors qa_no_hardcoded_arabic.py's shape (a standing content-quality gate, run manually /
in CI, not part of build_bundle.py itself — fixing flagged content is a deliberate editing pass,
not something to auto-rewrite). Unlike that gate there is no baseline file: EVERY question, old or
new, must pass. A V1230.89 audit found 101 pre-existing violations across the live question banks
(concentrated in football/strategy/football_intelligence/horror); those are being fixed bank-by-bank
alongside the question-bank size expansion (see V1229_PHASE1_NOTES.md), not in one disconnected pass.

run:  python3 scripts/qa_mcq_option_balance.py
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAX_SPREAD = 1  # longest option's word count minus shortest option's, per question

js = r"""
const fs=require('fs');
const sandbox={window:{},console:{log(){}, warn(){}}};
const vm=require('vm');
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('core/modules/question-bank.js','utf8'), sandbox);
const banks=sandbox.window.ZIVOZONE_CHALLENGES||{};
function wc(v){
  if (typeof v==='string') return v.trim().split(/\s+/).filter(Boolean).length;
  if (v && typeof v==='object') return wc(v.ar||v.en||Object.values(v)[0]||'');
  return 0;
}
const out=[];
for (const [id,b] of Object.entries(banks)) {
  if (!Array.isArray(b.questions)) continue;
  for (const q of b.questions) {
    const opts=q.a;
    if (!Array.isArray(opts) || opts.length<2) continue;
    const counts=opts.map(wc);
    const spread=Math.max(...counts)-Math.min(...counts);
    if (spread>0) out.push({bank:id, id:q.id, counts, spread});
  }
}
console.log(JSON.stringify(out));
"""
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True)
if r.returncode != 0:
    print("FAIL  mcq-option-balance probe ran  [" + (r.stderr or r.stdout)[:400] + "]")
    sys.exit(1)

try:
    rows = json.loads(r.stdout.strip().splitlines()[-1])
except Exception as e:
    print(f"FAIL  mcq-option-balance probe ran  [{e}: {r.stdout[:300]}]")
    sys.exit(1)

violations = [row for row in rows if row["spread"] > MAX_SPREAD]
by_bank = {}
for row in violations:
    by_bank.setdefault(row["bank"], []).append(row["id"])

ok = len(violations) == 0
print(("PASS " if ok else "FAIL ") + f"mcq option word-count parity (spread <= {MAX_SPREAD})"
      + ("" if ok else f"  [{len(violations)} questions, {len(by_bank)} banks]"))
if not ok:
    for bank, ids in sorted(by_bank.items(), key=lambda kv: -len(kv[1])):
        print(f"  - {bank}: {len(ids)}  ({', '.join(ids[:6])}{'…' if len(ids) > 6 else ''})")

sys.exit(0 if ok else 1)
