# ZIVOZONE V9 PREMIUM — Challenge Center + Cinematic Audio

This update keeps the existing Firebase/Auth/Firestore/i18n/news/ads architecture and focuses the experience on a single Challenge Center.

## Changes
- Removed the duplicate "Games / Play and Level Up" section. The Challenge Center is now the single destination for all challenges.
- Hero play button and navigation point to the Challenge Center.
- Challenge cards are de-duplicated by stable challenge ID.
- Audio is silent on the home page and starts only after entering a challenge.
- Each challenge mode has a distinct continuous generated soundscape.
- Dark Room audio adds stereo movement, low cinematic drones, eerie synthetic laughter and occasional distant scream accents.
- Answer/submit buttons have in-challenge sound feedback only.
- Existing Firebase files/config are preserved; no Firebase config changes were made.

## Upload
Replace the current files in GitHub with the files in this folder. Do not modify `firebaseConfig` in `auth.js`.
