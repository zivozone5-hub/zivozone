#!/usr/bin/env python3
"""Regenerates scripts/hardcoded_arabic_baseline.json from the CURRENT codebase.

Run this ONLY after deliberately reducing (translating) hardcoded Arabic text in one or more files —
it records today's counts as the new ceiling. Never run it to silently raise a ceiling after adding
new hardcoded text; if you need to add Arabic-only content, add it to CONTENT_FILES in
scripts/qa_no_hardcoded_arabic.py instead of bumping a number here.

run:  python3 scripts/gen_hardcoded_arabic_baseline.py
"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from qa_no_hardcoded_arabic import scan, ROOT

counts = scan()
out = ROOT / "scripts" / "hardcoded_arabic_baseline.json"
out.write_text(json.dumps(counts, indent=1, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
print(f"wrote {len(counts)} file(s), total {sum(counts.values())} hardcoded Arabic fragments -> {out}")
