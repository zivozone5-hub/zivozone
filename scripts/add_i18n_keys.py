#!/usr/bin/env python3
"""Standard, safe way to add or update UI translation keys — the one tool this project's i18n
workflow is built around (see V1229_PHASE1_NOTES.md "Adding a translated string").

Why this exists: every previous round of adding keys was a one-off inline Python script. That's easy
to get subtly wrong (miss a language, typo a key, silently overwrite something). This tool enforces
the two rules that actually matter every time:
  1. Every key must include all 7 languages (ar, en, zh, hi, es, fr, fa) in the same file — you
     cannot add a key with 6 languages "for now and finish it later".
  2. By default it refuses to silently overwrite a key that already exists (use --allow-overwrite if
     that's genuinely intended, e.g. fixing a typo in an existing translation).

Input is a JSON file shaped like:
  {
    "myNewKey": {"ar": "...", "en": "...", "zh": "...", "hi": "...", "es": "...", "fr": "...", "fa": "..."},
    "anotherKey": {...}
  }

Usage:
  python3 scripts/add_i18n_keys.py path/to/new_keys.json
  python3 scripts/add_i18n_keys.py path/to/new_keys.json --allow-overwrite
  python3 scripts/add_i18n_keys.py path/to/new_keys.json --note "V1230 — checkout flow strings"

After running this, always run:
  python3 scripts/release.py <version>      # rebuilds dist/app.bundle.js with the new i18n.js
  bash scripts/run_all_gates.sh              # qa_i18n_completeness.py + qa_i18n_coverage.py verify it
"""
import argparse, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "core" / "modules" / "runtime" / "i18n.js"
LANGS = ["ar", "en", "zh", "hi", "es", "fr", "fa"]


def load_current_keys():
    """Cheap existence check without a JS runtime: does `key:` appear as an object key anywhere."""
    src = I18N.read_text(encoding="utf-8")
    return src


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("keys_file", help="JSON file: {key: {ar,en,zh,hi,es,fr,fa}}")
    ap.add_argument("--allow-overwrite", action="store_true", help="permit re-adding a key that already exists")
    ap.add_argument("--note", default=None, help="comment to attach above the inserted block")
    args = ap.parse_args()

    data = json.loads(Path(args.keys_file).read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not data:
        sys.exit("Input must be a non-empty JSON object of {key: {lang: text}}")

    errors = []
    for key, translations in data.items():
        if not isinstance(translations, dict):
            errors.append(f"{key}: value must be an object of language -> text")
            continue
        missing = [l for l in LANGS if l not in translations]
        if missing:
            errors.append(f"{key}: missing language(s) {missing}")
        empty = [l for l in LANGS if l in translations and not str(translations[l]).strip()]
        if empty:
            errors.append(f"{key}: empty string for language(s) {empty}")
        extra = [l for l in translations if l not in LANGS]
        if extra:
            errors.append(f"{key}: unknown language code(s) {extra} (expected {LANGS})")
    if errors:
        print("REFUSED — fix these and re-run:", file=sys.stderr)
        for e in errors:
            print(" -", e, file=sys.stderr)
        sys.exit(1)

    src = load_current_keys()
    if not args.allow_overwrite:
        existing_conflicts = [k for k in data if f"{k}:" in src]
        if existing_conflicts:
            sys.exit("REFUSED — these keys already exist (pass --allow-overwrite to update them "
                      f"deliberately): {existing_conflicts}")

    def js_str(v):
        return json.dumps(v, ensure_ascii=False)

    lines = []
    for lang in LANGS:
        parts = ",".join(f"{k}:{js_str(v[lang])}" for k, v in data.items())
        lines.append(f"  Object.assign(T.{lang},{{{parts}}});")
    note = args.note or f"added via scripts/add_i18n_keys.py ({args.keys_file})"
    block = f"  /* {note} */\n" + "\n".join(lines) + "\n"

    anchor = "  function tr(key,lang=get())"
    if src.count(anchor) != 1:
        sys.exit(f"Could not find the unique insertion point in {I18N} — file structure changed?")
    I18N.write_text(src.replace(anchor, block + anchor), encoding="utf-8")
    print(f"Added {len(data)} key(s) x {len(LANGS)} languages to {I18N}")
    print("Next: python3 scripts/release.py <version>   &&   bash scripts/run_all_gates.sh")


if __name__ == "__main__":
    main()
