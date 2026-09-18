# ZIVOZONE V1182 — CINEMATIC + GLOBAL I18N CORE

- Fixed forensic-lab return-to-site using universal delegated exit handling.
- Dark Room now has a connected cinematic progression rather than a generic intro:
  signal → whisper → unopened door → erased name → don't look back → responsive room → last recording → entry.
- Kept the Dark Room and Forensic Lab on the same canonical cinematic engine.
- Added one canonical 7-language engine: Arabic, English, Chinese, Hindi, French, Spanish, Persian.
- Added a single language selector to the existing site shell.
- Language direction switches automatically between RTL and LTR.
- Team/match semantics remain independent from translation.
- No parallel UI/runtime layer was introduced.
