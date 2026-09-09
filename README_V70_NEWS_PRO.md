# ZIVOZONE V70 — News Pro

This version focuses on the news area only.

Features:
- Premium dual TV-style broadcast rails.
- Sports rail: global, Arab, Jordan.
- General news rail: Jordan, Arab, international.
- Arabic-first display.
- Continuous marquee movement; no fixed "one cycle per X hours" behavior.
- 15-minute backend data refresh.
- Browser fallback to the last cached feed if Firebase is temporarily unavailable.
- Responsive mobile treatment.
- Existing challenge center and other site systems are preserved.

Activation:
1. Deploy the existing Firebase callable `getNewsNetwork`.
2. Publish the website files to GitHub Pages.
3. Do not expose RSS/API secrets in the browser.
