# V1183 — TRUE CORE FIX

This version repairs the existing architecture in place.

1. Forensic Lab
   - Direct "Return to Site" now confirms, stops timers/3D/audio, removes the fixed forensic mount, and navigates to #home.
   - Case stages also receive a direct Return to Site control.
   - The previous dead-overlay behavior is eliminated.

2. Dark Room
   - Uses the existing challenge/cinematic engine, not a second engine.
   - Adds connected narrative beats across the 30-question progression.
   - Adds coherent cinematic events at story thresholds and stronger critical events later.
   - Restores the `cinema.whisper()` API used by checkpoints.

3. Languages
   - Removed the duplicate V1182 language module.
   - Existing runtime/i18n.js is now the single canonical language engine.
   - Languages: Arabic, English, Chinese, Hindi, French, Spanish, Persian.
   - French and Persian are first-class translations for the core site vocabulary, plus dedicated horror/exit translations.
   - RTL/LTR is applied by language.

No archive/parallel UI layer was introduced.
