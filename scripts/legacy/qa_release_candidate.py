#!/usr/bin/env python3
"""ZIVOZONE V1197.2 release-candidate QA harness.

Runs deterministic local checks that do not require Firebase credentials or a
paid Firebase plan. Browser/Firebase E2E remains explicitly reported as
UNVERIFIED when the required runtime is unavailable.
"""
from __future__ import annotations
import json, pathlib, re, subprocess, sys, py_compile

ROOT = pathlib.Path(__file__).resolve().parents[1]
FAIL = 0
PASS = 0
WARN = 0

def check(name, ok, detail=""):
    global FAIL, PASS
    if ok:
        PASS += 1
        print(f"PASS  {name}" + (f" — {detail}" if detail else ""))
    else:
        FAIL += 1
        print(f"FAIL  {name}" + (f" — {detail}" if detail else ""))

def warn(name, detail):
    global WARN
    WARN += 1
    print(f"WARN  {name} — {detail}")

# 1. Required architecture
required = [
    "core/modules/runtime/game-registry.js",
    "core/modules/runtime/game-loader.js",
    "core/modules/runtime/game-bridge.js",
    "core/modules/runtime/game-session.js",
    "core/modules/runtime/game-validator.js",
    "core/modules/runtime/game-adapters.js",
    "core/modules/runtime/game-platform.js",
    "core/modules/runtime/game-telemetry.js",
    "core/modules/challenges.js",
    "core/modules/economy.js",
    "core/modules/forensic-case-core.js",
    "core/modules/beauty-room.js",
    "core/modules/puzzle-room.js",
    "core/modules/match-center.js",
    "firestore.rules",
    "games/manifest.json",
]
for p in required:
    check(f"required file: {p}", (ROOT/p).is_file())

# 2. JavaScript syntax
js_files = sorted(ROOT.rglob("*.js"))
syntax_ok = True
for p in js_files:
    r = subprocess.run(["node", "--check", str(p)], capture_output=True, text=True)
    if r.returncode != 0:
        syntax_ok = False
        print(r.stderr.strip())
check("JavaScript syntax", syntax_ok, f"{len(js_files)} files")

# 3. Python syntax
py_ok = True
for p in sorted((ROOT/"scripts").glob("*.py")):
    try:
        py_compile.compile(str(p), doraise=True)
    except Exception as e:
        py_ok = False
        print(e)
check("Python syntax", py_ok)

# 4. Manifest contract
manifest_path = ROOT/"games/manifest.json"
try:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    games = manifest.get("games", [])
    ids = [g.get("gameId") for g in games]
    check("manifest is object", isinstance(manifest, dict))
    check("manifest games array", isinstance(games, list))
    check("unique game ids", len(ids) == len(set(ids)), str(ids))
    for g in games:
        ok = all(g.get(k) not in (None, "") for k in ("gameId","room","type","engine","version"))
        check(f"manifest contract: {g.get('gameId')}", ok)
        if g.get("type") == "flash":
            check(f"SWF uses compatibility engine: {g.get('gameId')}", str(g.get("engine")).lower() == "ruffle")
            check(f"SWF is not enabled without verified asset: {g.get('gameId')}", not g.get("enabled", False) or (ROOT / str(g.get("asset", "").lstrip("/"))).is_file())
except Exception as e:
    check("manifest parse", False, str(e))

# 5. Index/runtime wiring
index = (ROOT/"index.html").read_text(encoding="utf-8", errors="ignore")
for needle in [
    "game-registry.js", "game-session.js", "game-validator.js", "game-adapters.js",
    "game-loader.js", "game-bridge.js", "game-platform.js",
]:
    check(f"index wires {needle}", needle in index)

# 6. Security contracts
bridge = (ROOT/"core/modules/runtime/game-bridge.js").read_text(encoding="utf-8", errors="ignore")
validator = (ROOT/"core/modules/runtime/game-validator.js").read_text(encoding="utf-8", errors="ignore")
economy = (ROOT/"core/modules/economy.js").read_text(encoding="utf-8", errors="ignore")
rules = (ROOT/"firestore.rules").read_text(encoding="utf-8", errors="ignore")
for needle in ["e.source!==s.iframe?.contentWindow", "e.origin!==s.allowedOrigin", "GameResultValidator.validate"]:
    check(f"bridge security: {needle}", needle in bridge)
for needle in ["duplicate final result", "session/game mismatch", "Number.isFinite"]:
    check(f"result validator guard: {needle}", needle in validator)
for needle in ["validatedResult", "validatedSessionId", "challenge_reward", "game-platform"]:
    check(f"economy validation contract: {needle}", needle in economy)
for needle in ["source == 'game-platform'", "validated == true", "validatedSessionId"]:
    check(f"Firestore reward guard: {needle}", needle in rules)

# 7. Match data QA
match_script = ROOT/"scripts/validate_match_data.py"
r = subprocess.run([sys.executable, str(match_script)], capture_output=True, text=True)
check("Match Center data validation", r.returncode == 0, (r.stdout+r.stderr).strip().splitlines()[-1] if (r.stdout+r.stderr).strip() else "")

# 8. Legacy red flags
all_text = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in js_files)
check("no legacy Flash plugin runtime", "ActiveXObject" not in all_text and "navigator.plugins[" not in all_text and "flash-player" not in all_text.lower())
check("single GameBridge symbol", all_text.count("window.ZIVOZONE.GameBridge") <= 3, f"references={all_text.count('window.ZIVOZONE.GameBridge')}")

# 9. Functional browser/runtime status
# This is deliberately not converted to PASS: release freeze requires an actual
# browser session and Firebase Emulator/production test in a suitable environment.
warn("Browser E2E", "NOT VERIFIED in this environment; Chromium headless smoke did not complete deterministically.")
warn("Firebase Emulator E2E", "NOT VERIFIED; Firebase CLI/Emulator is not installed in this environment.")

print("\nRELEASE QA SUMMARY")
print(f"PASS={PASS} FAIL={FAIL} WARN={WARN}")
print("STATUS=" + ("BLOCKED" if FAIL else ("CANDIDATE — E2E REQUIRED" if WARN else "PASS")))
sys.exit(1 if FAIL else 0)
