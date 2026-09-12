# ZIVOZONE V1064 — Real ZIVO AI Foundation

## What changed
- Added Firebase AI Logic Web SDK through the official Firebase CDN.
- Added real Gemini integration using `gemini-3.5-flash-lite`.
- No Gemini API key is stored in the website. Firebase AI Logic uses Firebase's proxy architecture.
- Added multi-turn chat session.
- Added ZIVOZONE-specific system instructions and player-context support.
- Added a client-side daily UX limit of 10 AI messages.
- Updated the Service Worker cache version to V1064.
- Existing callable/endpoint/local AI paths remain as fallbacks if the real AI path is unavailable.

## Required Firebase Console step
Before real responses can work in production, open Firebase Console → AI Services → AI Logic and run the guided setup for the Gemini Developer API. Keep the project on Spark if you want the Gemini Developer API free tier.

Firebase recommends enforcing App Check for AI Logic. For production, register the web app with a production App Check attestation provider and enforce Firebase AI Logic in Security → App Check.

## Model
`gemini-3.5-flash-lite` is a current stable Gemini 3 Flash-Lite model supported by Firebase AI Logic and does not require Blaze when using the Gemini Developer API.

## Important
The 10-message browser limit is a product-level guard, not a security boundary. Real abuse protection should also be configured with Firebase AI Logic per-user/project rate limits and App Check.
