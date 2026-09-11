# ZIVOZONE V100 — Architecture Contract

## Product principles
- Mobile-first responsive UX, with one shared codebase for mobile/tablet/desktop.
- Remove duplicate buttons, duplicate handlers, and legacy UI layers.
- One action = one primary button.
- Preserve existing working features while consolidating their implementation.

## Economy
- XP: progression only. Used for level/rank/leaderboard progression; never spendable.
- ZIVO: virtual in-platform currency. Used for the ZIVO Store, digital items and future in-platform features.
- Tickets: optional event/tournament entry unit; not a currency.
- All economy mutations must be server-authoritative. The browser must never be trusted to award itself ZIVO/XP.

## ZIVO Mining
- Daily virtual reward cycle: one eligible claim per 24-hour period.
- Start/claim state and timestamps must be validated server-side.
- Every reward creates an auditable transaction record.
- No client-side `zivo += ...` authority.
- Present it as an in-platform virtual reward system, not proof of blockchain mining or guaranteed monetary value.

## Mobile UX
Primary target widths:
- 360px
- 390px
- 430px
Then tablet and desktop.

Check every release for:
- horizontal overflow
- buttons too small for touch
- modal overflow
- bottom navigation covering content
- duplicated/floating actions
- loading/error/empty states

## V100 cleanup priorities
1. Single Economy/Wallet source of truth.
2. Remove/retire duplicate legacy UI layers and IDs after verifying references.
3. Consolidate CSS and JavaScript handlers.
4. Normalize HTML structure.
5. Keep SEO metadata and improve page-level indexable architecture later.
6. Build Mining only after server-side transaction authority is ready.

## Important
This document defines the intended V100 architecture. It does not replace server rules/functions and should not be treated as a security control by itself.
