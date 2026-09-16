# ZIVOZONE V1144 — TRUE FREE SPORTS CORE

- Removed the fragile hard-coded multi-league fetch strategy.
- Match Center now uses the public ESPN Soccer `all/scoreboard` endpoint per day.
- Fetches yesterday, today and tomorrow as first-class data ranges; upcoming/previous ranges extend only when requested.
- Added a second public ESPN host as transport fallback.
- League filter is generated from actual returned match data instead of assuming a league exists.
- No paid API key, Firebase Function, server, proxy, or external paid service.
- Existing UI, large match cards, cache, favorites and details architecture remain in the same core module.
- If a competition is not actually returned by the free provider, it is not displayed.
