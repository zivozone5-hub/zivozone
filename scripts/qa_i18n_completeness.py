#!/usr/bin/env python3
"""V1229.9 gate: every UI key must exist, as a non-empty string, in ALL 7 languages.

This is different from qa_i18n_coverage.py (which checks a translation isn't just a copy of its
source language) — this one checks a key isn't MISSING entirely from some language, which the
fallback chain in tr() (`T[lang][key] || T.en[key] || T.ar[key] || key`) would otherwise hide
silently: the UI would just show English, Arabic, or the raw key name instead of failing loudly.

This is part of the standing i18n workflow (see V1229_PHASE1_NOTES.md "Adding a translated string"):
any new key must be added for all 7 languages in the same change, or this gate fails the build.

run:  python3 scripts/qa_i18n_completeness.py
"""
import subprocess, sys, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANGS = ["ar", "en", "zh", "hi", "es", "fr", "fa"]
fails = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        fails.append(name)


js = r"""
const fs=require('fs');global.window=global;global.dispatchEvent=()=>{};global.CustomEvent=function(){};
global.document={addEventListener(){},documentElement:{setAttribute(){},style:{}},querySelectorAll(){return[]},getElementById(){return null},querySelector(){return null},body:{}};
global.localStorage={getItem(){return null},setItem(){}};global.navigator={language:'ar'};
(0,eval)(fs.readFileSync('core/modules/runtime/i18n.js','utf8'));
const T=ZIVOZONE_I18N.T;
const LANGS=""" + json.dumps(LANGS) + r""";
const allKeys=new Set(); LANGS.forEach(l=>Object.keys(T[l]||{}).forEach(k=>allKeys.add(k)));
const missing={}, empty={};
for (const k of allKeys) for (const l of LANGS) {
  const v=T[l]?.[l===l?k:k];
  if (T[l]===undefined || !(k in T[l])) (missing[l]=missing[l]||[]).push(k);
  else if (typeof T[l][k]==='string' && T[l][k].trim()==='') (empty[l]=empty[l]||[]).push(k);
}
console.log(JSON.stringify({total: allKeys.size, langs: LANGS, missing, empty}));
"""
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True)
try:
    o = json.loads(r.stdout.strip().splitlines()[-1])
except Exception:
    check("i18n completeness probe ran", False, (r.stderr or r.stdout)[:300])
    sys.exit(1)

for lang in LANGS:
    miss = o["missing"].get(lang, [])
    emp = o["empty"].get(lang, [])
    check(f"{lang}: no missing keys", not miss, ",".join(miss[:10]) + (f" (+{len(miss)-10} more)" if len(miss) > 10 else ""))
    check(f"{lang}: no empty-string keys", not emp, ",".join(emp[:10]))
print(f"INFO {o['total']} total keys across {len(LANGS)} languages")

print("\n%d check(s) failed" % len(fails) if fails else "\nI18N COMPLETENESS OK — every key exists in every language")
sys.exit(1 if fails else 0)
