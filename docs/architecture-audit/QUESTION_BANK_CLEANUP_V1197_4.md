# ZIVOZONE V1197.4 — QUESTION BANK CLEANUP / FOUNDATION LOCK

## Scope
This release cleans the canonical challenge/question foundation without creating a new Core, Runtime, Economy, or Challenge Engine.

## Audit
- Loaded the complete runtime question bank from `core/modules/question-bank.js`.
- Audited 610 canonical questions across all registered challenge banks.
- 549 choice questions.
- 54 direct-answer questions.
- 7 input/free-response questions are intentionally non-graded or wildcard-based.
- JavaScript syntax: PASS.
- Canonical answer binding: PASS.
- Choice index range validation: PASS.
- Duplicate choice validation: PASS.
- Missing question/answer representation: PASS.

## Corrected defects
1. `iq-03` — corrected the stored direct answer from a formula string to the actual answer `95`, so the numeric answer can be graded correctly.
2. `iq-06` — corrected the ZIVO letter-value question. `Z=26 + I=9 + V=22 + O=15 = 72`; choices and correct index were corrected.
3. `iq-10` — corrected the classic prisoners/lamp puzzle condition so the standard designated-counter solution is logically valid: prisoners may enter multiple times.
4. `lg-07` — corrected the sequence answer from `31` to `33` and removed the contradictory “+1” wording.
5. `logic_extreme` legacy pool — normalized `options + answer(index)` into the canonical `a + c` schema used by the unified challenge engine.
6. `logic_extreme` — corrected inconsistent legacy logic questions, including the weekday calculation and the alternating `+2 / ×2` sequence.
7. `memory_focus` legacy pool — normalized the legacy answer schema into the canonical engine schema.
8. `football_intelligence` legacy pool — normalized the legacy answer schema into the canonical engine schema.
9. `pr22-09` — corrected contradictory wording: the correct answer is “No, it is 1/16”.
10. `lt22-10` — replaced an internally inconsistent full-glass-water question with an objectively answerable transfer-by-freezing question.

## Foundation rule
All future challenge work must preserve the canonical schema:

- choice → `a[] + c`
- direct answer → `answer`
- input/free response → explicit `input` handling

Legacy `options + answer(index)` is normalized before use.

## Important
This release does not redesign rooms or gameplay. It locks the question/answer foundation first. Room-specific content, mini-games, stages, UX and difficulty balancing can now be developed independently in later releases.
