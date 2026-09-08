# ZIVOZONE V16 — Pressure Engine

Built on top of the V15 10-second timer without removing the existing Firebase, guest mode, five-language UI, challenge bank, audio engine, Dark Room, Who Am I, sports/news, fixtures, ads, and exit controls.

## Added
- 10-second timer remains active for every normal challenge and Who Am I.
- Accurate remaining-time measurement for every answer.
- Pressure Score: faster correct answers earn more points.
- Streak: consecutive correct answers increase the streak.
- Best Streak: highest streak in the session and persisted to the player profile.
- Timeouts break the streak without revealing answers in the Dark Room.
- Result records now include pressureScore, bestStreak and timedOut.
- Cloud player profile stores bestStreak when the player is authenticated.
- Final XP/coins calculation now considers performance and pressure score.
- Countdown tick sound is limited to once per second in the final 3 seconds to reduce audio spam.
- Existing Firebase configuration and Firestore structure are preserved.

## Replacement
Replace the files in the repository with the files in this package. No Firebase changes are required for V16.
