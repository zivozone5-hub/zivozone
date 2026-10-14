#!/usr/bin/env python3
"""V1229.7 gate: French and Persian UI strings must be REAL translations, not copies of
English/Arabic left over as placeholders. Before this pass, 181/230 French keys and 180/230 Persian
keys were byte-identical to their English/Arabic source — i.e. never actually translated.

This can't tell a good translation from a bad one, but it can catch the specific, previously-real
regression: a key that is textual (not a brand name, a number, or a genuinely shared loanword) and is
byte-identical to its source language. New keys added later should be translated in the same pass
they're introduced; this gate is the tripwire if that's forgotten.

run:  python3 scripts/qa_i18n_coverage.py
"""
import subprocess, sys, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
fails = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        fails.append(name)


# Known-legitimate coincidences: shared loanwords, brand terms, or placeholders that are correctly
# identical across these language pairs. Anything NOT in this list that matches its source is a real
# untranslated leftover.
ALLOW_FR = {"questions10", "xp", "coins", "score", "sportFootball", "sportBasketball", "sportTennis",
            "horrorQuestion", "ledgerFallbackLabel", "operationsLabel", "questionCountSuffix",
            # V1230.29 — "Points" is the real French word too (identical spelling, not a leftover copy).
            "epic50Points",
            # V1230.31 — "Genre" is the real French word too (identical spelling, not a leftover copy).
            "roomsGenreAria",
            # V1230.34 — "Exploration", "Interaction", "Mode", "Phase" and "Mission" are the real French
            # words too (identical spelling, not leftover copies) — challenges.js renderWorld() chrome.
            "challengesPhaseExplore", "challengesPhaseInteract", "challengesModeLabel",
            "challengesPhaseLabel", "challengesMissionLabel", "challengesMissionFallback",
            # V1230.36 — "Points" and "Budget" are the real French words too (identical spelling,
            # not leftover copies) — minigame canvas shell / worldArt() decorative scene chrome.
            "miniPointsLabel", "worldArtBudget",
            # V1230.46 — achRewardLabel is "+1 ZIVO · 15 XP": brand name + numerals, no translatable
            # words, correctly identical across languages (same reason as "xp"/"coins" below).
            "achRewardLabel",
            # V1230.48 — "points" is the real French word too (identical spelling, not a leftover
            # copy), and the three puzzle-room.js logic-puzzle character names (Lian/Sami/Rami) are
            # deliberately kept the same spelling in French as in English.
            "puzzleScoreValueFmt", "puzzleLiveScoreFmt", "puzzleLogicName1", "puzzleLogicName2", "puzzleLogicName3",
            # V1230.59 — "Pause" is the real French word too (identical spelling, not a leftover
            # copy) — Light Escape's pause button, Dark Room rebuild.
            "lightEscapePause"}
ALLOW_FA = {"xp", "coins", "emailPlaceholder", "exit", "horrorQuestion", "walletModalLabel", "loginShort", "questionCountSuffix",
            # V1230.46 — same as ALLOW_FR above.
            "achRewardLabel"}

js = r"""
const fs=require('fs');global.window=global;global.dispatchEvent=()=>{};global.CustomEvent=function(){};
global.document={addEventListener(){},documentElement:{setAttribute(){},style:{}},querySelectorAll(){return[]},getElementById(){return null},querySelector(){return null},body:{}};
global.localStorage={getItem(){return null},setItem(){}};global.navigator={language:'ar'};
(0,eval)(fs.readFileSync('core/modules/runtime/i18n.js','utf8'));
const T=ZIVOZONE_I18N.T,keys=Object.keys(T.ar);
const texty=v=>/[A-Za-z\u0600-\u06FF]{2,}/.test(String(v));
const gap=(l,base)=>keys.filter(k=>T[l][k]===T[base][k]&&texty(T[l][k])&&T[l][k]!=='ZIVOZONE');
console.log(JSON.stringify({total:keys.length, fr:gap('fr','en'), fa:gap('fa','ar')}));
"""
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True)
try:
    o = json.loads(r.stdout.strip().splitlines()[-1])
except Exception:
    check("i18n coverage probe ran", False, (r.stderr or r.stdout)[:300])
    sys.exit(1)

fr_bad = [k for k in o["fr"] if k not in ALLOW_FR]
fa_bad = [k for k in o["fa"] if k not in ALLOW_FA]
check(f"French: no untranslated keys beyond the {len(ALLOW_FR)} known shared words", not fr_bad, ",".join(fr_bad))
check(f"Persian: no untranslated keys beyond the {len(ALLOW_FA)} known shared words", not fa_bad, ",".join(fa_bad))
print(f"INFO {o['total']} total UI keys checked")

print("\n%d check(s) failed" % len(fails) if fails else "\nI18N COVERAGE OK")
sys.exit(1 if fails else 0)
