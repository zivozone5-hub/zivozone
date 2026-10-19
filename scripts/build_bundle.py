#!/usr/bin/env python3
"""V1229.4 — Phase 3 (unification), step 1: one entry point instead of 48 <script> tags.

Every one of ZIVOZONE's 13 pages (index.html + 12 story pages) loaded the exact same 48 local,
classic (non-module) <script src=...> files, in the exact same order — confirmed byte-for-byte
identical across all 13. Each file is already a self-contained `(() => { 'use strict'; ... })();`
IIFE that only talks to the rest of the app through `window.*`, so concatenating them in their
existing order is behavior-preserving: it is the same code running in the same order, just fetched
once instead of 48 times.

`zivo-ai.js` is excluded on purpose — it is loaded as an ES module (`<script type="module">`) with
top-level `import` statements from a CDN, which cannot be concatenated into a classic-script bundle.
It keeps its own tag. The four Firebase compat SDKs (Google's CDN) are also untouched.

The file order lives in scripts/bundle_manifest.txt — a plain, one-path-per-line, human-editable
list, NOT re-derived from index.html on every run. Re-deriving it from the page would be self-
referential the moment the page only contains the bundle tag (the very case this script produces),
so the manifest is the single, stable source of truth. Add/remove/reorder a module there when the
module list changes, then rebuild.

What this script does:
  1. Reads scripts/bundle_manifest.txt.
  2. Concatenates those files, each preceded by a `//# sourceURL=` comment so browser DevTools still
     show the original file name and line numbers when debugging a stack trace, exactly as if the
     files were still separate.
  3. Writes dist/app.bundle.js.
  4. Rewrites index.html and every stories/*/index.html: the first manifest file's tag becomes the
     single bundle tag; the other 47 tags are removed. Nothing else on the page is touched. Running
     this again on an already-bundled page is a no-op for the HTML (idempotent) and only refreshes
     the bundle content + version stamp.

Run this after any change to core/*.js, or via `python3 scripts/release.py <version>`, which calls it
automatically. `scripts/qa_bundle_freshness.py` fails the build if the committed bundle does not match
what this script would regenerate right now, so a stale bundle can never silently ship.
"""
import re, glob, sys, shutil, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
MANIFEST = ROOT / "scripts" / "bundle_manifest.txt"
BUNDLE_REL = "dist/app.bundle.js"
# V1230.67 — modules deliberately left OUT of bundle_manifest.txt because they're loaded on demand
# by their own room (see challenges.js's loadForensicCore() for the forensic-case-core.js example),
# not at page load. They still get a minified distributable copy written to dist/lazy/, same as the
# eager modules get minified inside dist/app.bundle.js — being lazy shouldn't mean being unminified.
# V1230.71 — the five signature-room game modules joined forensic-case-core.js here; they're now
# fetched on demand by core/modules/runtime/room-loader.js instead of shipping to every visitor.
LAZY_MODULES = [
    "core/modules/forensic-case-core.js",
    "core/modules/horror-room.js",
    "core/modules/puzzle-room.js",
    "core/modules/beauty-room.js",
    "core/modules/rooms.js",
    "core/modules/football-room.js",
    # V1230.134 — the QR encoder is only ever needed while generating a shareable result image
    # (share.js's buildCardImageBlob()), never at page load, so it's lazy like the rooms above
    # instead of growing the eager bundle for every visitor who never shares anything.
    "core/modules/runtime/qr-encoder.js",
]


def manifest_files():
    if not MANIFEST.exists():
        sys.exit(f"build_bundle: {MANIFEST} is missing — this is the source of truth for bundle order")
    files = [l.strip() for l in MANIFEST.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]
    if not files:
        sys.exit("build_bundle: manifest is empty")
    if BUNDLE_REL in files:
        sys.exit(f"build_bundle: manifest must not list {BUNDLE_REL} itself (self-reference)")
    return files


def _esbuild_path():
    """V1230.67 — perf pass: returns a usable esbuild binary, or None. Checked in this order so the
    build works the same whether esbuild is a global install (shutil.which) or just sitting in this
    sandbox's preinstalled tools directory (not on PATH by default)."""
    found = shutil.which("esbuild")
    if found:
        return found
    candidate = "/opt/npm-tools/node_modules/.bin/esbuild"
    return candidate if Path(candidate).exists() else None


def _minify(js_text):
    """Best-effort minification of the concatenated bundle via esbuild. Never raises: if esbuild
    isn't available (a different machine, a fresh checkout without it installed), this prints one
    clear warning and returns the ORIGINAL unminified text unchanged — the build must still succeed
    without esbuild, it's a size optimization, not a required dependency. --charset=utf8 is mandatory
    here: esbuild's default output escapes every non-ASCII character (Arabic, Chinese, Hindi, Persian,
    Spanish accents — this codebase's question/story text in 7 languages) as \\uXXXX sequences, which
    made a first attempt at this produce a LARGER file than the input, not smaller."""
    exe = _esbuild_path()
    if not exe:
        print("build_bundle: esbuild not found — shipping the bundle unminified (size optimization skipped, not an error).")
        return js_text, False
    try:
        result = subprocess.run(
            [exe, "--minify", "--charset=utf8", "--loader=js"],
            input=js_text, capture_output=True, text=True, timeout=120
        )
        if result.returncode != 0 or not result.stdout.strip():
            print(f"build_bundle: esbuild minification failed, shipping unminified bundle instead.\n{result.stderr}")
            return js_text, False
        return result.stdout, True
    except Exception as e:
        print(f"build_bundle: esbuild minification errored ({e}), shipping unminified bundle instead.")
        return js_text, False


def build():
    files = manifest_files()
    parts = []
    for rel in files:
        p = ROOT / rel
        if not p.exists():
            sys.exit(f"build_bundle: {rel} is listed in the manifest but does not exist on disk")
        parts.append(f"//# sourceURL=/{rel}\n" + p.read_text(encoding="utf-8").rstrip() + "\n;\n")
    bundle = "".join(parts)
    minified, did_minify = _minify(bundle)
    out = ROOT / BUNDLE_REL
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(minified, encoding="utf-8")
    if did_minify:
        print(f"build_bundle: minified {len(bundle.encode('utf-8'))} -> {len(minified.encode('utf-8'))} bytes")
    return files, minified


def rewrite_page(path, files, version):
    """Idempotent: if the page already has the bundle tag and none of the per-file tags, this only
    refreshes the version stamp on the existing bundle tag and returns without touching anything else."""
    html = path.read_text(encoding="utf-8")
    bundle_tag_re = re.compile(r'<script src="' + re.escape(BUNDLE_REL) + r'(?:\?[^"]*)?"></script>')
    new_tag = f'<script src="{BUNDLE_REL}?v={version}"></script>'
    if bundle_tag_re.search(html):
        html2 = bundle_tag_re.sub(new_tag, html, count=1)
        path.write_text(html2, encoding="utf-8")
        return 0
    remaining = html
    first_pos_found = False
    removed = 0
    for rel in files:
        m = re.search(r'<script[^>]*\bsrc="' + re.escape(rel) + r'(?:\?[^"]*)?"[^>]*></script>\n?', remaining)
        if not m:
            sys.exit(f"build_bundle: {path}: could not find a tag for {rel} (page structure changed since the manifest was written?)")
        if not first_pos_found:
            remaining = remaining[:m.start()] + new_tag + "\n" + remaining[m.end():]
            first_pos_found = True
        else:
            remaining = remaining[:m.start()] + remaining[m.end():]
            removed += 1
    path.write_text(remaining, encoding="utf-8")
    return removed


def build_lazy_modules():
    """Writes a minified copy of each LAZY_MODULES entry to dist/lazy/<basename>, leaving the
    readable source file in core/modules/ untouched. Falls back to an unminified copy (still a
    real, working file, just bigger) if esbuild isn't available, for the same reason build()'s
    _minify() does."""
    out_dir = ROOT / "dist" / "lazy"
    out_dir.mkdir(parents=True, exist_ok=True)
    results = []
    for rel in LAZY_MODULES:
        src = ROOT / rel
        if not src.exists():
            sys.exit(f"build_bundle: lazy module {rel} does not exist on disk")
        text = src.read_text(encoding="utf-8")
        minified, did_minify = _minify(text)
        out = out_dir / Path(rel).name
        out.write_text(minified, encoding="utf-8")
        results.append((rel, out, len(text.encode("utf-8")), len(minified.encode("utf-8")), did_minify))
    return results


def main():
    version = sys.argv[1] if len(sys.argv) > 1 else "dev"
    files, bundle = build()
    pages = [INDEX] + [Path(p) for p in sorted(glob.glob(str(ROOT / "stories/*/index.html")))]
    total_removed = 0
    for p in pages:
        total_removed += rewrite_page(p, files, version)
    print(f"bundled {len(files)} files -> {BUNDLE_REL} ({len(bundle)} bytes); "
          f"rewrote {len(pages)} pages, removed {total_removed} redundant <script> tags")
    for rel, out, before, after, did_minify in build_lazy_modules():
        tag = "minified" if did_minify else "copied (unminified)"
        print(f"lazy module {rel} -> {out.relative_to(ROOT)} ({before} -> {after} bytes, {tag})")


if __name__ == "__main__":
    main()
