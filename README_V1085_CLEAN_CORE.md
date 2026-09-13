# ZIVOZONE V1085 — CLEAN CORE

This release is a structural cleanup of the uploaded V1081 project.

## Contract
- Preserve existing Firebase/Auth/Firestore configuration.
- Preserve existing challenge/question engines and public window APIs.
- Mobile-first is the reference UX.
- Wallet + Mining are mounted in the Home content, not the header.
- Player modal is launched from the existing Profile area; no floating duplicate launcher.
- Account registration is isolated inside the modal.
- Login includes Firebase email password-reset flow.
- Dark Room remains part of the existing challenge engine.
- No paid API, server, payment processor, or external audio service is added.

## Runtime structure
- `index.html` — semantic shell and configuration only.
- `zivozone.css` — single stylesheet containing the previous cascade plus one final mobile contract.
- `zivozone-app.js` — single non-module application bundle preserving the original script execution order.
- `zivo-ai.js` — kept separate because it is an ES module.
- `assets/` — challenge visuals/audio/icons.
- `data/` — news data.
- Firebase files remain unchanged in purpose.

The old version files are intentionally not shipped in this release. The uploaded V1081 ZIP remains the rollback source.
