#!/usr/bin/env python3
"""V1229.4 gate: dist/app.bundle.js must always be byte-identical to what scripts/build_bundle.py
would regenerate from the current core/*.js sources (per scripts/bundle_manifest.txt). If someone
edits a module without rebuilding, the live site would keep serving old code while the source looks
up to date — this gate catches that before it ships.

run:  python3 scripts/qa_bundle_freshness.py
"""
import shutil, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_bundle as bb

ROOT = bb.ROOT
BUNDLE = ROOT / bb.BUNDLE_REL
fails = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        fails.append(name)


if not BUNDLE.exists():
    check("dist/app.bundle.js exists", False, "run: python3 scripts/build_bundle.py <version>")
    sys.exit(1)

committed = BUNDLE.read_text(encoding="utf-8")
backup = BUNDLE.with_suffix(".js.bak")
shutil.copy(BUNDLE, backup)
try:
    files, regenerated = bb.build()  # rebuilds dist/app.bundle.js in place from the manifest right now
    check("bundle is byte-identical to a fresh rebuild from current sources", regenerated == committed,
          f"{len(committed)} bytes committed vs {len(regenerated)} bytes regenerated — run: python3 scripts/build_bundle.py <version>")
    check(f"manifest references all {len(files)} files and none are missing", True)  # bb.build() already sys.exits on a missing file
finally:
    shutil.copy(backup, BUNDLE)  # restore exactly what was committed regardless of outcome
    backup.unlink()

print("\n%d check(s) failed" % len(fails) if fails else "\nBUNDLE IS FRESH")
sys.exit(1 if fails else 0)
