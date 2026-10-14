#!/usr/bin/env python3
"""Single release gate (replaces the overlapping per-version gates in scripts/legacy/).
Static checks only — run scripts/browser_smoke.py for the real-browser check.
exit code 0 = pass, 1 = fail."""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def hosting_ignored(rel: str, patterns) -> bool:
    """True if firebase.json's hosting.ignore would exclude this file from the deployed site."""
    def rx(g):
        g = re.escape(g).replace(r"\*\*/", "(?:.*/)?").replace(r"\*\*", ".*").replace(r"\*", "[^/]*")
        return re.compile("^(?:" + g + ")$")
    return any(rx(g).match(rel) or rx(g + "/**").match(rel) for g in patterns)

fails, passes = [], 0
def check(name, ok, detail=""):
    global passes
    if ok: passes += 1
    else: fails.append(f"{name} {detail}".strip())
    print(("PASS  " if ok else "FAIL  ") + name + (f" — {detail}" if detail and not ok else ""))

html = (ROOT / "index.html").read_text(encoding="utf-8")

# 1 JavaScript syntax
bad = []
for f in list(ROOT.glob("core/**/*.js")) + [ROOT / "sw.js", ROOT / "zivo-ai.js"]:
    r = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
    if r.returncode: bad.append(f.name)
check("JavaScript syntax (core, sw, zivo-ai)", not bad, ", ".join(bad))

# 2 every local file referenced by index.html exists
refs = [r.split("?")[0] for r in re.findall(r'(?:src|href|content)="((?!https?:|#|data:|width)[^"]+\.(?:js|css|png|svg|webmanifest))', html)]
missing = [r for r in refs if not (ROOT / r.lstrip("/")).exists()]
check("index.html references resolve", not missing, ", ".join(missing))
og = re.search(r'og:image" content="https://zivozone.com/([^"]+)"', html)
check("og:image file exists", bool(og) and (ROOT / og.group(1)).exists())

# 3 version stamp + service worker
vers = set(re.findall(r"\?v=(\d+\.\d+)", html))
check("single ?v= version in index.html", len(vers) == 1, str(vers))
sw = (ROOT / "sw.js").read_text(encoding="utf-8")
shell = re.findall(r"'(/[^']*)'", sw.split("const SHELL=[")[1].split("];")[0])
gone = [s for s in shell if s not in ("/", "/index.html") and not (ROOT / s.split("?")[0].lstrip("/")).exists()]
check("service-worker precache files exist", not gone, ", ".join(gone))
if vers:
    v = next(iter(vers))
    check("service-worker shell carries same version", all(f"?v={v}" in s for s in shell if "?v=" in s))
    check("service-worker cache name matches major", f"zivozone-shell-v{v.split('.')[0]}" in sw)

# 4 no stale references to archived layers
legacy = ["independent-story-health", "real-room-router", "real-room-home-bind", "audio-v1212", "audio-ui-v1212", "ready-rooms", "story-engine-56", "health-room-content"]
hits = [str(p.relative_to(ROOT)) for p in list(ROOT.glob("core/**/*.js")) + [ROOT / "index.html", ROOT / "sw.js"] if any(l in p.read_text(encoding="utf-8") for l in legacy)]
check("no references to archived layers", not hits, ", ".join(hits))

# 5 Firestore rules cover every collection the client touches
code = "".join(p.read_text(encoding="utf-8") for p in ROOT.glob("core/**/*.js")) + (ROOT / "zivo-ai.js").read_text(encoding="utf-8")
used = set(re.findall(r"collection\(['\"]([A-Za-z]+)['\"]\)", code))
rules = (ROOT / "firestore.rules").read_text(encoding="utf-8")
ruled = {seg for path in re.findall(r"match ((?:/[^\s{]+|/\{[^}]+\})+)", rules) for seg in re.findall(r"/([A-Za-z]+)", path)}
missing_rules = sorted(used - ruled)
check("Firestore rules cover used collections", not missing_rules, ", ".join(missing_rules))

# 6 content integrity
idx = json.loads((ROOT / "data/stories/index.json").read_text(encoding="utf-8"))
ms = {p.stem for p in (ROOT / "data/stories/manuscripts").glob("*.md")}
check("story index == manuscripts", {x["id"] for x in idx} == ms and len(idx) >= 1, f"{len(idx)} in index, {len(ms)} files")
doors = json.loads((ROOT / "data/health/health-doors.json").read_text(encoding="utf-8"))
check("12 health doors, ids 01-12", [d["id"] for d in doors] == [f"{i:02d}" for i in range(1, 13)])
notes = ["لا نريد", "هذا الباب يمكن", "يقسم إلى", "لوحة اللاعب", "ماذا نريد", "يجب أن يكون مختلفًا", "يسجل اللاعب"]
check("no internal design notes in health text", not [d["id"] for d in doors if any(n in d["content"] for n in notes)])
for f in ["data/news.json"] + [str(p.relative_to(ROOT)) for p in (ROOT / "data/matches").glob("*.json")]:
    try: json.loads((ROOT / f).read_text(encoding="utf-8")); ok = True
    except Exception: ok = False
    if not ok: check(f"valid JSON {f}", False)
check("live data JSON valid", not [x for x in fails if x.startswith("valid JSON")])

# 6b everything the browser fetches must actually be deployed (firebase.json ignores **/*.md, docs/**, scripts/** ...)
ign = json.loads((ROOT / "firebase.json").read_text(encoding="utf-8"))["hosting"]["ignore"]
need = ["data/stories/index.json", "data/health/health-doors.json"] + [f"data/stories/content/{i['id']}.json" for i in idx]
gone = [n for n in need if not (ROOT / n).exists() or hosting_ignored(n, ign)]
check("room data files exist and are not excluded from hosting", not gone, ", ".join(gone))
shipped = [str(p.relative_to(ROOT)) for p in ROOT.rglob("*") if p.is_file()]
fetched = re.findall(r"[\"'`](/(?:data|assets)/[^\"'`$]+)", (ROOT / "core/modules/rooms.js").read_text(encoding="utf-8"))
check("rooms.js fetch paths are not hosting-ignored", not [f for f in fetched if "$" not in f and hosting_ignored(f.lstrip("/"), ign)])

# 7 originality gate: no paragraph may appear in two different stories (the V1218 corpus failed this badly)
seen, dups = {}, 0
for i in idx:
    for p in (ROOT / f"data/stories/manuscripts/{i['id']}.md").read_text(encoding="utf-8").split("\n"):
        p = p.strip()
        if len(p) > 40:
            if p in seen and seen[p] != i["id"]: dups += 1
            seen.setdefault(p, i["id"])
check("no paragraph repeated across stories", dups == 0, f"{dups} repeated paragraphs")
check("stories are at least 400 words", all(x["words"] >= 400 for x in idx))

print(f"\nPASS={passes} FAIL={len(fails)}")
sys.exit(1 if fails else 0)
