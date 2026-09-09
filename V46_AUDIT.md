# ZIVOZONE V46 — Server Engine

## Architecture
The browser is now treated as an attempt sender. It does not calculate or mint trusted rewards.

Flow:
Player -> Firebase Auth -> submitChallengeAttempt -> canonical server challenge -> server scoring -> verified result -> player result

## Added
- Firebase callable-function adapter in the existing client.
- Offline attempt queue.
- Deployable `functions/` package with a Firebase Functions v2 server entry point.
- Server validates authenticated user.
- Server ignores client score/correct/xp/zivo fields.
- Server scores only from canonical challenge answers.
- Verified result is written by the trusted backend.
- Firestore rules prevent client creation of a `verified` result.

## Preserved
All V45/V44/V43/V42/V41/V40 layers and the existing Firebase initialization, challenge engine,
Dark Room, audio, news, ads, languages, ZIVO, XP, missions and competition layers remain.

## Deployment requirement
The `functions/` code must be deployed to the same Firebase project and the real canonical challenge bank
must be populated server-side before verified scoring is enabled. This release does not claim the function
is live merely because the source files exist.

## Validation
- All existing JavaScript files passed syntax check.
- No second Firebase app initialization added.
- Functions source was added as an independent deployable backend.
