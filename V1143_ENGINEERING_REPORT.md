# ZIVOZONE V1143 — Shared Stage/Progress Engine + Forensic Lab Rebuild + Exit-Confirmation

## What this pass actually built (not a mockup — wired end to end)

### 1. One shared save/resume engine for BOTH Forensic Lab and Dark Room
New module: `core/modules/stages.js` → `window.ZIVOZONE.Stages`.
- Guests: saved to `localStorage`. Signed-in users: saved to
  `users/{uid}/zivozone/progress` in Firestore (added as one more doc under
  the *existing* `zivozone` subcollection economy.js already uses — not a
  new top-level shape, matching last session's data-model concern) and
  mirrored to `localStorage` so reads are instant and it still works
  offline.
- One API, two consumers: `completeCase()` for Forensic Lab's tier-gating,
  `updateDarkroom()` / `completeDarkroomRun()` for Dark Room's furthest-phase
  and run-count tracking. This is the direct fix for "نفس النظام" — it is
  literally the same engine, not two lookalike ones.
- Firestore rule added for the new path: owner-only read/write, key-shape
  checked. Does not touch wallet/economy rules at all.

### 2. Forensic Lab: from 1 flat quiz to a real 50-case, tiered, gated structure
New module: `core/modules/forensic-cases.js`.
- Case 01 is **live** — migrated verbatim from the old flat `bank.forensic`
  (same 10 questions, same story), now framed as the first, easiest case.
- Cases 02–50 exist as a real roadmap (tier assigned: 1–15 easy, 16–35
  medium, 36–50 hard) and render in the new case-select screen as locked
  "قيد الإعداد" tiles — **not fabricated content**. Writing 49 more full
  detective cases is a content-writing task, not an engineering one, and
  doing it well needs your review of the tone/pacing on a few at a time —
  I did not invent placeholder mystery plots to hit "50" today.
- Clicking the Forensic Lab card now opens a case-select grid instead of
  jumping straight into a quiz. Locked cases are visibly locked; finishing
  case *n* unlocks case *n+1* immediately (`Stages.completeCase`) and the
  result screen offers a direct "القضية التالية" button — the return-hook
  you asked for, so finishing one case pulls the player straight into the
  next instead of dropping them back at the menu.
- The 30-second per-question timer was **already present** for every
  challenge type in the existing engine (`left=30` in `challenges.js`) —
  nothing needed changing there, Forensic Lab cases inherit it automatically.

### 3. Exit-confirmation, wired everywhere a session can be left
New shared `confirmExit()` dialog in `challenges.js`, wired into all four
exit points: the in-question exit button, the Dark-Room checkpoint's exit
button, the result-screen exit button, and — the one that's easy to miss —
**leaving via site navigation** (clicking any in-site link or the back
button) while a challenge or Dark Room session is active; a `hashchange`
listener intercepts it, reverts the URL, shows the same confirmation, and
only actually navigates if the player confirms.

### 4. Dark Room keeps its own psychological framing, on the same backend
Retention badge on the card ("أكمل من حيث توقفت" / run count) uses the
shared Stages data, but the wording and cinematic whispers stay exactly
what they were — the save system is shared, the *voice* of each experience
is not.

## Verified
- `python3 scripts/qa_v1141.py` passes (34 JS files now, cache-busting
  consistent at v1143.0).
- Every new function traced against the actual click paths in the existing
  card renderer (`renderCenter`) rather than assumed.

## Honest gaps — not done this pass, and why
- **Cases 02–50 have no story content yet.** This is the single biggest
  remaining piece of *this* request. Suggest doing them in small batches
  (5–10 at a time) so you can react to tone before more get written in
  the same style — same reasoning as before: writing all 49 blind risks
  quality, not stability, but still worth doing carefully.
- **Dark Room doesn't resume mid-question**, only "furthest phase reached."
  Literally resuming inside a randomized run safely would mean persisting
  the exact question set mid-session — doable, but is its own scoped
  change, not bundled in blind.
- **Match Center's real-fetch hardening and a rebuilt ZIVO Hub were not
  touched this pass.** They don't depend on anything built here, so they're
  next, not blocked — just not started yet.
