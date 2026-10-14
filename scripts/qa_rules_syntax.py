#!/usr/bin/env python3
"""Gate: firestore.rules must have balanced (), {}, [] — a real defect this caught once already.

V1229's firestore.rules shipped with `&& (...request.time))` — one extra closing paren in the
publicChat rate-limit condition. That is a hard compile error: `firebase deploy --only
firestore:rules` would have rejected the entire file, meaning either the deploy fails outright, or
(worse) an OLDER, less-restrictive ruleset stays live while everyone assumes the new one is active.
This project has no Firebase CLI / emulator available to compile-check rules for real, so this gate
is a cheap, no-dependency substitute: it cannot catch every mistake a real compiler would, but a
paren/brace/bracket imbalance is exactly the class of error that silently breaks a deploy, and is
exactly what slipped through here.

run:  python3 scripts/qa_rules_syntax.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RULES = ROOT / "firestore.rules"
fails = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        fails.append(name)


if not RULES.exists():
    check("firestore.rules exists", False)
    sys.exit(1)

s = RULES.read_text(encoding="utf-8")
for open_ch, close_ch in [("(", ")"), ("{", "}"), ("[", "]")]:
    depth = 0
    bad_line = None
    line = 1
    for ch in s:
        if ch == "\n":
            line += 1
        elif ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth < 0 and bad_line is None:
                bad_line = line
    check(f"'{open_ch}{close_ch}' balanced in firestore.rules", depth == 0 and bad_line is None,
          f"unmatched '{close_ch}' near line {bad_line}" if bad_line else f"net depth {depth} (unclosed '{open_ch}')")

# Every custom function referenced must be defined somewhere in the file (catches a typo'd rename).
import re
defined = set(re.findall(r"function\s+([A-Za-z_]\w*)\s*\(", s))
KNOWN_BUILTINS = {"exists", "get", "getAfter", "duration", "size", "keys", "diff", "hasOnly", "hasAny", "affectedKeys", "value"}
for name in defined:
    check(f"function {name}() is called somewhere in the file", len(re.findall(r"\b" + name + r"\s*\(", s)) > 1, "defined but never called")

print("\n%d check(s) failed" % len(fails) if fails else "\nRULES FILE IS STRUCTURALLY SOUND")
sys.exit(1 if fails else 0)
