#!/usr/bin/env python3
"""ZIVOZONE V1200 static release gate.
No network access. Verifies structure, version consistency, critical runtime modules,
7-language registry, match data, question-bank assets, and Firebase configuration.
"""
from pathlib import Path
import json, re, sys
ROOT=Path(__file__).resolve().parents[1]
fails=[]; warns=[]
def need(p):
    if not (ROOT/p).exists(): fails.append(f"missing: {p}")
def text(p): return (ROOT/p).read_text(encoding="utf-8")
for p in ["index.html","sw.js","firebase.json","firestore.rules",
          "core/modules/runtime/app-shell.js","core/modules/runtime/audio.js",
          "core/modules/runtime/i18n.js","core/modules/question-bank.js",
          "core/modules/match-center.js","core/modules/forensic-case-core.js",
          "core/modules/chat.js","core/modules/admin.js"]:
    need(p)
for p in ["data/matches/index.json","data/matches/2026-09-18.json","data/matches/2026-09-19.json","data/matches/2026-09-20.json"]:
    need(p)
idx=text("index.html"); i18=text("core/modules/runtime/i18n.js"); sw=text("sw.js")
if "v=1200.0" not in idx: fails.append("index cache-bust is not 1199.0")
if "zivozone-shell-v1200" not in sw: fails.append("service-worker cache version is not 1199.0")
m=re.search(r"const LANGS = \[([^\]]+)\]",i18)
if not m: fails.append("language registry not found")
else:
    langs=re.findall(r"'([a-z]{2})'",m.group(1))
    if langs != ["ar","en","zh","hi","es","fr","fa"]: fails.append(f"language registry mismatch: {langs}")
    for code in ["ar","en","zh","hi","es","fr","fa"]:
        if f"T.{code}" not in i18: warns.append(f"language object {code} is not directly declared before fallback")
try:
    manifest=json.loads(text("data/matches/index.json"))
    if not manifest: warns.append("match index is empty")
except Exception as e: fails.append(f"match index invalid JSON: {e}")
try:
    qb=json.loads(text("QUESTION_BANK_MANIFEST.json"))
    if not qb: warns.append("question bank manifest empty")
except Exception as e: fails.append(f"question bank manifest invalid JSON: {e}")
# required navigation lifecycle hooks
app=text("core/modules/runtime/app-shell.js")
for needle in ["zivozone_navigation_v1198","zivozone-route","hashchange","popstate","pageshow","pagehide","zivozone-home-reset"]:
    if needle not in app: fails.append(f"navigation lifecycle hook missing: {needle}")
# audio lifecycle
au=text("core/modules/runtime/audio.js")
for needle in ["preload='none'","stopMedia","stopChallenge"]:
    if needle not in au: fails.append(f"audio lifecycle marker missing: {needle}")
print(f"PASS={max(0,15-len(fails))} FAIL={len(fails)} WARN={len(warns)}")
for x in fails: print("FAIL:",x)
for x in warns: print("WARN:",x)
sys.exit(1 if fails else 0)
