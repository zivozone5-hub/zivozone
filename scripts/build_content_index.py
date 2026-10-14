#!/usr/bin/env python3
"""Build data/stories/index.json from data/stories/manuscripts/*.md.

The reading room loads this small index for the list and fetches ONE manuscript when a story is opened,
instead of downloading every story (~700 KB) up front.
Manuscript layout:  "NN. Title" / "التصنيف: genre" / "**النوع:** genre" / body...
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "stories" / "manuscripts"
OUT = ROOT / "data" / "stories" / "index.json"
BODIES = ROOT / "data" / "stories" / "content"   # served to the browser; *.md is excluded by firebase.json, so bodies ship as JSON

def blurb(body: str, limit: int = 150) -> str:
    text = re.sub(r"\*\*|\s+", " ", body).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit]
    stop = max(cut.rfind("."), cut.rfind("؟"), cut.rfind("!"))
    return (cut[: stop + 1] if stop > 60 else cut.rsplit(" ", 1)[0] + "…")

def main() -> int:
    items = []
    BODIES.mkdir(parents=True, exist_ok=True)
    for old in BODIES.glob("*.json"):
        old.unlink()
    for f in sorted(SRC.glob("*.md")):
        lines = f.read_text(encoding="utf-8").replace("\r", "").split("\n")
        i = 0
        while i < len(lines) and not lines[i].strip():
            i += 1
        m = re.match(r"^(\d+)[.)]\s*(.+)$", lines[i].strip())
        if not m:
            print(f"!! {f.name}: first line is not 'NN. title'", file=sys.stderr)
            return 1
        n, title = int(m.group(1)), m.group(2).strip()
        i += 1
        genre = ""
        while i < len(lines) and re.match(r"^(#\s|(\*\*)?\s*(التصنيف|النوع))", lines[i].strip()):
            if not lines[i].lstrip().startswith("#"):   # story-56 repeats its title as a '# ' line inside the header
                g = re.sub(r"^(\*\*)?\s*(التصنيف|النوع)\s*(\*\*)?\s*:?\s*(\*\*)?", "", lines[i].strip()).strip()
                genre = genre or g
            i += 1
        body = "\n".join(lines[i:]).strip()
        (BODIES / f"{f.stem}.json").write_text(json.dumps({"id": f.stem, "body": body}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        items.append({"id": f.stem, "n": n, "title": title, "genre": genre or "قصة",
                      "blurb": blurb(body), "words": len(body.split())})
    items.sort(key=lambda x: x["n"])
    OUT.write_text(json.dumps(items, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(items)} stories, {OUT.stat().st_size/1024:.1f} KB")
    return 0

if __name__ == "__main__":
    sys.exit(main())
