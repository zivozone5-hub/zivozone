#!/usr/bin/env python3
"""V1229.9 gate: hardcoded Arabic UI text may only ever go DOWN, never up.

Part of the standing i18n infrastructure. Before this existed, UI strings were routinely hand-typed
in Arabic directly into JS templates instead of going through core/modules/runtime/i18n.js — that is
exactly how economy.js ended up ~130 strings out of sync with the language switcher (fixed in
1229.8). This gate turns "don't add new hardcoded text" from a rule someone has to remember into
something the build enforces:

  - scripts/hardcoded_arabic_baseline.json is the recorded count of hardcoded Arabic text runs per
    file, taken right after the 1229.8 economy.js pass.
  - This gate re-scans the same files right now. A file's count going UP means new hardcoded Arabic
    text was just added instead of using t()/data-i18n — FAIL, fix it before merging.
  - A file's count going DOWN (or a file disappearing from the list entirely) means real translation
    progress was made. That's encouraged, but the baseline does NOT silently follow it downward — run
    `python3 scripts/gen_hardcoded_arabic_baseline.py` deliberately to lock in the improvement, the
    same way you'd update a snapshot test.
  - A brand new file with hardcoded Arabic text FAILS immediately (baseline count of 0).

Files in CONTENT_FILES are excluded on purpose: they legitimately contain Arabic as DATA (question
text, story content) or are an internal admin-only tool, not user-facing UI chrome that should route
through the translation system.

A related, one-time-surprising fact worth recording: Persian (fa) is written in a Perso-Arabic script
that shares Unicode's Arabic block, so completing a file's Persian translations legitimately RAISES
this raw count (e.g. challenges.js went 3191 -> 3413 purely from adding real fa text to two existing
in-file dictionaries, 1229.17) even though it is exactly the progress this gate exists to encourage.
This heuristic cannot cheaply tell "new Arabic" from "new Persian" apart — when re-baselining after a
real translation pass, check the diff is genuinely new language coverage (as 1229.17 did, verified in
Node against all 7 languages) rather than assume every increase is fine.

run:  python3 scripts/qa_no_hardcoded_arabic.py
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASELINE_PATH = ROOT / "scripts" / "hardcoded_arabic_baseline.json"
AR = re.compile(r"[\u0600-\u06FF]{2,}")

# Legitimate Arabic DATA, not hardcoded UI chrome — see the module header above.
CONTENT_FILES = {
    "core/modules/question-bank.js",
    "core/modules/question-bank-expansion.js",
    "core/modules/forensic-case-core.js",
    "core/modules/admin.js",
    # V1230.27 — riddle/sentence content for the "lateral" and "language" real mini-games; same
    # rationale as the other CONTENT_FILES entries (data, not UI chrome).
    "core/modules/minigame-content.js",
    # V1230.29 — each of these four room files now carries its own "Epic 50" grand-challenge game
    # name + 5 band names/twist-description dictionaries (EPIC_NAME_*/EPIC_BANDS_*). Same rationale
    # as challenges.js's pre-existing GAME_NAMES_BY_LANG dict: per-room game content, not UI chrome,
    # so it belongs here rather than behind t()/i18n.js.
    "core/modules/horror-room.js",
    "core/modules/puzzle-room.js",
    "core/modules/beauty-room.js",
    "core/modules/rooms.js",
    # V1230.70 — football-room.js's own EPIC_NAME_FT/EPIC_BANDS_FT dicts, same rationale as the
    # four files above. Its actual UI chrome (intro screen) uses t()/i18n.js keys instead, same
    # division of labor as every other room.
    "core/modules/football-room.js",
}
EXCLUDE = CONTENT_FILES | {"core/modules/runtime/i18n.js"}


def scan():
    counts = {}
    for f in sorted(ROOT.glob("core/**/*.js")):
        rel = str(f.relative_to(ROOT)).replace("\\", "/")
        if rel in EXCLUDE:
            continue
        n = len(AR.findall(f.read_text(encoding="utf-8")))
        if n:
            counts[rel] = n
    return counts


def main():
    fails = []

    def check(name, ok, detail=""):
        print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
        if not ok:
            fails.append(name)

    if not BASELINE_PATH.exists():
        check("baseline file exists", False, f"run: python3 scripts/gen_hardcoded_arabic_baseline.py")
        sys.exit(1)

    baseline = json.loads(BASELINE_PATH.read_text(encoding="utf-8"))
    current = scan()

    for f, base_n in sorted(baseline.items()):
        now_n = current.get(f, 0)
        check(f"{f}: hardcoded Arabic count not increased ({base_n} -> {now_n})", now_n <= base_n,
              f"+{now_n - base_n} new hardcoded fragment(s) — use t()/data-i18n instead")
        if now_n < base_n:
            print(f"INFO  {f} improved: {base_n} -> {now_n}. Run gen_hardcoded_arabic_baseline.py to lock this in.")

    new_files = sorted(set(current) - set(baseline))
    for f in new_files:
        check(f"{f}: no hardcoded Arabic in new/previously-clean file", False, f"{current[f]} fragment(s) found")

    total_base, total_now = sum(baseline.values()), sum(current.values())
    print(f"\nINFO total hardcoded Arabic fragments: {total_now} (baseline: {total_base})")
    print("\n%d check(s) failed" % len(fails) if fails else "\nNO NEW HARDCODED ARABIC TEXT")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
