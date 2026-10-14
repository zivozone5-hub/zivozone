#!/usr/bin/env python3
"""V1230.67 — perf pass: minifies every core/styles/*.css into dist/styles/<name>.css.

Mirrors the existing JS pattern exactly: core/modules/*.js stays the readable, editable source and
dist/app.bundle.js is the generated, minified artifact that actually gets served (see
build_bundle.py). CSS had no such split before this — index.html linked straight to the eight
core/styles/*.css source files. Those source files are untouched by this script; only a minified
COPY is written to dist/styles/.

Falls back to an unminified copy (still correct, just bigger) if esbuild isn't available, for the
same reason build_bundle.py's _minify() does: this is a size optimization, never a hard dependency
the build can fail on.

run:  python3 scripts/build_css.py
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_bundle as bb

ROOT = bb.ROOT
SRC_DIR = ROOT / "core" / "styles"
OUT_DIR = ROOT / "dist" / "styles"


def build():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    for src in sorted(SRC_DIR.glob("*.css")):
        text = src.read_text(encoding="utf-8")
        exe = bb._esbuild_path()
        did_minify = False
        minified = text
        if exe:
            import subprocess
            try:
                r = subprocess.run([exe, "--minify", "--charset=utf8", "--loader=css"],
                                    input=text, capture_output=True, text=True, timeout=60)
                if r.returncode == 0 and r.stdout.strip():
                    minified, did_minify = r.stdout, True
                else:
                    print(f"build_css: esbuild failed on {src.name}, shipping unminified.\n{r.stderr}")
            except Exception as e:
                print(f"build_css: esbuild errored on {src.name} ({e}), shipping unminified.")
        else:
            print(f"build_css: esbuild not found — shipping {src.name} unminified (size optimization skipped, not an error).")
        out = OUT_DIR / src.name
        out.write_text(minified, encoding="utf-8")
        results.append((src.name, len(text.encode("utf-8")), len(minified.encode("utf-8")), did_minify))
    return results


if __name__ == "__main__":
    for name, before, after, did_minify in build():
        print(f"{name}: {before} -> {after} bytes ({'minified' if did_minify else 'copied (unminified)'})")
