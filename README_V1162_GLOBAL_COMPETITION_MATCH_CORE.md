# ZIVOZONE V1162 — GLOBAL COMPETITION MATCH CORE

This is a full replacement of the Match Center module, built from the real live ESPN connection used by V1161.

## Display model

Competition → Yesterday / Today / Tomorrow → Matches → Live state → Match details.

Each major competition is an independent section. The three days are shown under the same competition. On desktop they are three columns; on mobile they become three stacked day panels.

## Data

The browser uses the real ESPN public scoreboard/summary endpoints. Static JSON is fallback only. No fake fixtures are generated.

## Status

UPCOMING → LIVE → FINISHED / POSTPONED based on source state. Live competitions refresh every 30 seconds; otherwise every 2 minutes.

## Engineering

No legacy fixture layer, no overlay patch, no Firebase Functions, no paid API key.
