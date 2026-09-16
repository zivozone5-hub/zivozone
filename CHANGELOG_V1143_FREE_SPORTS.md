# ZIVOZONE V1143 — FREE SPORTS EDITION

- Removed unverified regional league slugs: Jordan, Iraq, Qatar, UAE, Egypt and Turkish Super Lig.
- Removed any dependency on paid sports APIs, API keys, proxies, or server-side sports functions.
- Kept only leagues documented for the public ESPN Site API scoreboard pattern.
- Added explicit FREE SPORTS catalog and versioned cache to prevent old unsupported leagues returning from localStorage.
- Preserved the larger V1142 match-card UI and Yesterday / Today / Tomorrow experience.
- If a provider endpoint fails in production, its matches fail silently without crashing the Match Center.

Reference: ESPN public Site API documentation/catalog confirms the scoreboard pattern and documented league slugs.
