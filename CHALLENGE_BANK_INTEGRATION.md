# Challenge Bank Pro — V2

This build preserves the existing application and UI. The challenge question bank is now
available for every existing challenge key through `window.ZIVOZONE_QUESTION_BANK_PRO`.

API:
- `ZIVOZONE_GET_BANK_QUESTIONS(challengeId, 10)`
- `ZIVOZONE_IMPORT_AI_QUESTIONS(challengeId, questions)`
- `ZIVOZONE_QUESTION_BANK_PRO.stats(challengeId)`

The JSON bank contains an approved seed pool for every existing challenge category.
The existing challenge renderer is intentionally left intact; this avoids regressions.
The next safe step is to switch each challenge's current 10-question source to the bank
one challenge family at a time, with functional tests after each family.
