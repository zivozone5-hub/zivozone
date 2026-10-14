#!/usr/bin/env python3
"""V1230.55 gate: the 6 per-language homepage variants (/en/, /zh/, /hi/, /es/, /fr/, /fa/ — built by
scripts/prerender-lang-home.mjs from index.html, see that file's header) must always be byte-identical
to what re-running that script right now would produce.

Same risk qa_bundle_freshness.py already guards against for dist/app.bundle.js: these pages are full
clones of index.html with translated <head> metadata, so every change to index.html (a new section, a
new ?v= stamp, new bundle output) makes them stale unless the generator is re-run. scripts/release.py
now does that automatically on every release, but this gate catches the case where someone edits
index.html directly and forgets to re-run release.py before shipping.

run:  python3 scripts/qa_lang_home_freshness.py
"""
import shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANGS = ["en", "zh", "hi", "es", "fr", "fa"]
fails = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        fails.append(name)


pages = {lang: ROOT / lang / "index.html" for lang in LANGS}
missing = [lang for lang, p in pages.items() if not p.exists()]
if missing:
    check(f"all {len(LANGS)} per-language homepages exist", False,
          f"missing: {missing} — run: node scripts/prerender-lang-home.mjs")
    sys.exit(1)

committed = {lang: p.read_text(encoding="utf-8") for lang, p in pages.items()}
backups = {lang: p.with_suffix(".html.bak") for lang, p in pages.items()}
for lang, p in pages.items():
    shutil.copy(p, backups[lang])

sitemap_p = ROOT / "sitemap.xml"
sitemap_backup = sitemap_p.read_text(encoding="utf-8") if sitemap_p.exists() else None

try:
    subprocess.run(["node", str(ROOT / "scripts" / "prerender-lang-home.mjs")],
                    check=True, cwd=ROOT, capture_output=True, text=True)
    for lang, p in pages.items():
        regenerated = p.read_text(encoding="utf-8")
        check(f"/{lang}/ homepage is byte-identical to a fresh rebuild from current index.html",
              regenerated == committed[lang],
              f"{len(committed[lang])} bytes committed vs {len(regenerated)} bytes regenerated — "
              f"run: node scripts/prerender-lang-home.mjs (or scripts/release.py <version>)")
finally:
    for lang, p in pages.items():
        shutil.copy(backups[lang], p)
        backups[lang].unlink()
    # the script also appends to sitemap.xml; restore it too so this read-only gate never leaves a diff
    if sitemap_backup is not None:
        sitemap_p.write_text(sitemap_backup, encoding="utf-8")

print("\n%d check(s) failed" % len(fails) if fails else "\nLANG-HOME PAGES ARE FRESH")
sys.exit(1 if fails else 0)
