# ZIVOZONE V1083 — Mobile First + Auth + Dark Room

This is an additive refinement of the existing ZIVOZONE structure.

## Changes
- Mobile-first top navigation simplified; primary navigation remains in the bottom mobile bar.
- ZIVO Wallet and Daily Mining moved out of the crowded header into a dedicated homepage economy spotlight.
- Wallet/mining visual hierarchy improved without changing their existing Firebase paths or transaction logic.
- Login modal hardened against accidental click propagation and double submission.
- Added **Forgot password?** to the sign-in mode using Firebase `sendPasswordResetEmail`.
- Added reset-password email flow with the site URL as the return destination.
- Dark Room visual layer expanded with scanlines, eye/glow effect, flashes, distraction messages, creepy laughter synthesis, and question narration via browser speech synthesis.
- Existing challenge runner, Firebase, Firestore, player, wallet and mining structure retained.

## Important
The Dark Room remains a fictional game experience. The exit control remains available.
