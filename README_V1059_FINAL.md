# ZIVOZONE V1059 FINAL — Challenge Cinema + Mobile First

Built on ZIVOZONE V1058.1 without rebuilding the application from scratch.

## Included
- Full-card challenge launch: the entire challenge image/card is clickable; the legacy Start button remains only as a compatibility hook and is visually hidden.
- Local challenge SVG artwork for the main challenge types, so challenge visuals do not depend on external image hosts.
- Dark Room reduced to a focused 20-question cinematic run, with the existing red-lit horror/audio engine preserved and strengthened by the V1058 styling.
- Registration gate after the first answered question for guest users across challenge runs. Guests cannot continue as guests.
- Who Am I? remains a 20-question profile test and now gates continuation after the first answer for guests.
- Forensic Lab expanded to 20 evidence-linked questions with local evidence images and mobile zoom.
- Mobile-first runner hardening: readable question text, full answer hit areas, vertical scrolling, no horizontal clipping.
- Compact premium ZIVO wallet/mining presentation and unified mining handler.
- Mining uses the existing Spark-compatible Firestore economy core; no Cloud Functions are introduced.
- Perfect-score ZIVO reward flow remains 10 ZIVO for eligible 10/10 knowledge challenges, with ledger-based duplicate protection in the existing economy layer.
- Cache-busting updated to v105.9 for the edited runtime/economy files.

## Validation
- JavaScript syntax checked with Node.js.
- Local referenced assets checked for existence.
- No Firebase config was changed.
- No Cloud Functions or paid services were added.

## Deploy
From the extracted `v95build` folder:

`firebase deploy --only hosting,firestore:rules`

Functions are intentionally excluded because the project is kept Spark/free.
