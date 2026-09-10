# ZIVOZONE V74 — Domain + Identity Production Release

This release is based on the complete V73 hourly-news production build and preserves the existing ZIVOZONE personality, challenge/game ecosystem, player systems, audio assets, Firebase compatibility layers, and broadcast-style news rails.

## Domain
- Official domain: https://zivozone.com/
- GitHub Pages custom-domain marker: `CNAME` containing `zivozone.com`
- Canonical URL, Open Graph metadata, Twitter metadata, robots.txt and sitemap.xml point to the official domain.

## News
- Top rail: sports news with global + Arab + Jordanian coverage.
- Bottom rail: general world + Arab + Jordanian news.
- GitHub Actions refreshes `data/news.json` every hour.
- Browser refreshes the feed every hour and keeps a one-hour cache with offline fallback.
- TV-style continuous scrolling remains independent from the data refresh.
- No Firebase Blaze billing is required for the news system.

## Personality preservation
- Existing ZIVOZONE visual identity and dark premium aesthetic are preserved.
- Challenge Center remains the visual heart.
- Player profile, XP, ZIVO rewards, missions, competition, cloud-ready layers and existing challenge banks remain additive and intact.
- No existing feature was intentionally removed for the domain release.
