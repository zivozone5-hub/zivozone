# ZIVOZONE V61 — Challenge Engine 2.0

## Included
- Unified challenge engine foundation.
- First fully wired challenge: `forensic_lab`.
- 30-second question timer.
- Automatic timeout progression.
- Score calculation.
- Unified result payload.
- Result enters the existing V60 player/cloud pipeline.
- Challenge UI is responsive for mobile.
- Existing challenge UI is preserved; the engine is additive.

## Result contract
`{ gameId, score, win, duration, questions }`

## Production note
The sample forensic case uses fictional scenarios for gameplay. Real reward authorization remains server-side through the V59/V60 Firebase pipeline.
