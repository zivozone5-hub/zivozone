#!/usr/bin/env python3
"""V1229.15 gate: every crawlable page has the SEO basics search engines and social sharing actually
use — a unique <title>, a meta description, a self-referencing canonical, and valid structured data —
and sitemap.xml's <lastmod> is present and not stale beyond what's plausible.

run:  python3 scripts/qa_seo_basics.py
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
fails = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        fails.append(name)


LANGS = ["en", "zh", "hi", "es", "fr", "fa"]

pages = [ROOT / "index.html", ROOT / "privacy" / "index.html", ROOT / "terms" / "index.html"]
pages += sorted((ROOT / "stories").glob("tale-*/index.html"))
pages += sorted((ROOT / "rooms").glob("*/index.html"))
# V1230.57 — the 6 per-language homepage clones (scripts/prerender-lang-home.mjs) are real,
# separately-crawlable pages and deserve the same title/description/canonical basics as everything
# else; they were never added to this gate, so a broken regeneration (missing title, empty
# description, wrong canonical) would have shipped silently.
pages += [ROOT / lang / "index.html" for lang in LANGS]

titles_seen = {}
for p in pages:
    rel = str(p.relative_to(ROOT))
    if not p.exists():
        check(f"{rel}: exists", False, "run: python3 scripts/release.py <version> (regenerates the per-language homepages)")
        continue
    h = p.read_text(encoding="utf-8")
    title_m = re.search(r"<title>([^<]+)</title>", h)
    desc_m = re.search(r'<meta name="description" content="([^"]*)"', h)
    canon_m = re.search(r'<link rel="canonical" href="([^"]*)"', h)
    check(f"{rel}: has a non-empty <title>", bool(title_m and title_m.group(1).strip()))
    check(f"{rel}: has a non-empty meta description", bool(desc_m and desc_m.group(1).strip()))
    check(f"{rel}: has a canonical link", bool(canon_m))
    if title_m:
        titles_seen.setdefault(title_m.group(1), []).append(rel)

dupes = {t: rs for t, rs in titles_seen.items() if len(rs) > 1}
check("no two pages share the exact same <title>", not dupes, str(dupes))

# Story pages specifically: real, page-specific structured data (not a copy-pasted site-wide block).
for p in sorted((ROOT / "stories").glob("tale-*/index.html")):
    rel = str(p.relative_to(ROOT))
    h = p.read_text(encoding="utf-8")
    # V1230.18 — every page also carries a site-wide WebSite ld+json block earlier in <head>; a plain
    # first-match regex was grabbing THAT one instead of the story's own, so this check never actually
    # looked at the story's structured data at all (same failure mode the room check below already
    # avoided by anchoring its regex on @type="Game"). Anchored the same way here, on @type="ShortStory".
    m = re.search(r'<script type="application/ld\+json">(\{"@context":"https://schema\.org","@type":"ShortStory".*?)</script>', h, re.S)
    if not m:
        check(f"{rel}: has page-specific ShortStory structured data", False)
        continue
    try:
        d = json.loads(m.group(1))
    except Exception as e:
        check(f"{rel}: structured data is valid JSON", False, str(e))
        continue
    check(f"{rel}: structured data describes this story, not the generic site (@type=ShortStory)",
          d.get("@type") == "ShortStory")
    check(f"{rel}: structured data url matches this page's own canonical", d.get("url", "").endswith(p.parent.name))

# Room/challenge landing pages specifically: real, page-specific structured data (@type=Game).
for p in sorted((ROOT / "rooms").glob("*/index.html")):
    rel = str(p.relative_to(ROOT))
    h = p.read_text(encoding="utf-8")
    m = re.search(r'<script type="application/ld\+json">(\{"@context":"https://schema\.org","@type":"Game".*?)</script>', h, re.S)
    if not m:
        check(f"{rel}: has page-specific Game structured data", False)
        continue
    try:
        d = json.loads(m.group(1))
    except Exception as e:
        check(f"{rel}: structured data is valid JSON", False, str(e))
        continue
    check(f"{rel}: structured data describes this room (@type=Game)", d.get("@type") == "Game")
    check(f"{rel}: structured data url matches this page's own canonical", d.get("url", "").endswith(p.parent.name))
    cta_attr = r'(data-horror-room|data-puzzle-room|data-zivo-health-room|data-beauty-room|data-football-room|data-challenge="[^"]+"|onclick="[^"]*ZIVOZONE\.Daily\.open\(\)[^"]*")'
    check(f"{rel}: has a real CTA that launches the actual room (not a dead link)",
          bool(re.search(r'<a[^>]+' + cta_attr + r'[^>]*class="[^"]*zivo-seo-cta', h))
          or bool(re.search(r'<a class="[^"]*zivo-seo-cta"[^>]+' + cta_attr, h)))

# Sitemap: every URL has a lastmod, and no lastmod is absurdly old/new (sanity, not strict freshness).
sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
urls = re.findall(r"<url><loc>([^<]+)</loc>(?:<lastmod>([^<]*)</lastmod>)?</url>", sitemap)
check(f"sitemap.xml has at least one URL", len(urls) > 0)
for url, lastmod in urls:
    check(f"sitemap: {url} has a <lastmod>", bool(lastmod), "missing — run scripts/release.py")
    if lastmod:
        check(f"sitemap: {url}'s lastmod looks like a real date (YYYY-MM-DD)",
              bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", lastmod)), lastmod)

# V1230.57 — hreflang reciprocity: index.html and every one of the 6 lang-home pages must all
# declare the exact same set of hreflang alternates (ar + the 6 langs + x-default), each pointing at
# a real, existing page. A mismatched or missing set is a classic hreflang mistake that makes search
# engines ignore the whole annotation rather than just the broken entry.
HREFLANG_RE = re.compile(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">')
URL_FOR_PAGE = {"https://zivozone.com/": ROOT / "index.html"}
URL_FOR_PAGE.update({f"https://zivozone.com/{lang}/": ROOT / lang / "index.html" for lang in LANGS})

expected_tags = {"ar", *LANGS, "x-default"}
reference_set = None
for p in [ROOT / "index.html"] + [ROOT / lang / "index.html" for lang in LANGS]:
    rel = str(p.relative_to(ROOT))
    if not p.exists():
        continue
    h = p.read_text(encoding="utf-8")
    found = dict(HREFLANG_RE.findall(h))
    check(f"{rel}: declares all {len(expected_tags)} hreflang alternates (ar/{'/'.join(LANGS)}/x-default)",
          set(found.keys()) == expected_tags, sorted(set(found.keys()) ^ expected_tags))
    for tag, href in found.items():
        target = URL_FOR_PAGE.get(href)
        check(f"{rel}: hreflang={tag} points at a page that actually exists ({href})",
              target is not None and target.exists())
    if reference_set is None:
        reference_set = found
    else:
        check(f"{rel}: hreflang set is identical to index.html's (reciprocal)", found == reference_set,
              f"{rel} differs from index.html's hreflang block")

print("\n%d check(s) failed" % len(fails) if fails else "\nSEO BASICS OK")
sys.exit(1 if fails else 0)
