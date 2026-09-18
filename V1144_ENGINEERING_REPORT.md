# ZIVOZONE V1144 — True Clean Core Engineering Repair

## Baseline
V1143 remains the reference baseline. V1144 modifies that baseline in-place; it does not add a parallel UI/runtime layer.

## Repairs
- Match Center: repaired initialization race by adding a provider-ready event and a deterministic mount path.
- Match Center: reduced provider pressure. Requests now use the selected date window instead of fetching a fixed 19-day range for every league.
- Match Center: bounded concurrent provider requests to 4 and isolates failed league requests.
- Match Center: added the public global soccer feed as a resilient enrichment/fallback source.
- Match Center: stopped requesting guessed regional ESPN league slugs as if they were verified. Unsupported slugs no longer poison the fetch cycle.
- Match Center: bumped cache keys to V1144 so stale broken match data cannot mask the repaired engine.
- Forensic Lab: restored a real cinematic entry sequence before the existing case-select screen. The sequence hands off to the existing case engine; it is not a second case system.
- Forensic Lab: entry supports keyboard escape, explicit open/skip, reduced-motion CSS, and audio unlock without making audio a dependency.
- Version/cache references updated to V1144.

## Architecture rule
No legacy match UI was preserved as a fallback layer and no second forensic runtime was created. The existing Match Center repository/UI and existing Forensic case selector remain the owners.

## Verification
Static validation performed on the modified JavaScript files and archive structure. External live-provider HTTP access from this build environment is unavailable, so real ESPN response behavior must still be smoke-tested after Firebase deployment. The browser implementation uses the documented ESPN soccer scoreboard/summary endpoints and keeps provider access isolated inside `match-center.js`.

## Remaining provider limitation
ESPN's public endpoint is an undocumented public-facing feed and its regional coverage is not guaranteed. V1144 therefore treats unsupported regional slugs as non-authoritative rather than pretending they are live.
