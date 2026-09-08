# ZIVOZONE V13 — V11 Base Remaster

This release is based on the V11 build and preserves the existing Firebase configuration, authentication, Firestore rules, challenge bank, multilingual layer, news layer, audio engine, guest mode, XP and cloud result saving.

## V13 changes
- Dark Room: mid-session scary voice event, stronger psychological narration, checkpoint audio, whisper/warden effects, and full audio/speech cleanup on exit.
- Universal challenge exit: result screens and challenge dialogs can return to Challenge Center and stop challenge audio.
- Challenge Center: four independent future ad slots (top, left rail, right rail, bottom) with one independent ad-control module.
- Z logo: central Z remains fixed while surrounding orbit rings move.
- Who Am I?: 20-question self-reflection test with four personality axes and a personalized result paragraph.
- Sports Match Center: public ESPN scoreboard aggregation for Champions League, Premier League, LaLiga, Serie A, Bundesliga and Ligue 1, plus an official Jordan Pro League schedule link from JFA.
- Featured Champions League alert card based on the nearest current fixture.
- Five-language UI additions for the new fixture and identity features.

## Cloud preservation
No Firebase project/config or Firestore rule was changed by this release.

## Notes
Public sports feeds can fail or rate-limit. The UI falls back to official source links. For production reliability, move aggregation to a secure server/cache later.
