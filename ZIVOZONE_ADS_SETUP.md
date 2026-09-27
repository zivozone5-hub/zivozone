# ZIVOZONE — Google AdSense setup (V1229.13)

## What this update did
- Wired real Google AdSense loading into `core/modules/runtime/ads.js`, gated behind the same consent
  banner already used for analytics (1229.0) — ads never load or serve before a visitor accepts.
- The 6 existing ad placeholders in `index.html` (`top`, `bottom`, `left-1`, `left-2`, `right-1`,
  `right-2` — visible in the desktop challenge layout) now turn into real AdSense units automatically,
  once you complete the two steps below. Nothing else in the page changed.
- Updated `privacy/index.html` (Arabic + English) to disclose Google AdSense, cookies, and the
  standard opt-out links Google requires publishers to provide (Google's own ad settings, plus
  aboutads.info and youronlinechoices.eu). Bumped `PRIVACY_VERSION`.
- Added the consent banner text update (now mentions ads, not just analytics) in all 7 languages via
  `scripts/add_i18n_keys.py` — the standard tool from 1229.9, so every language got the update at once.
- **Nothing renders live yet.** `ads.js` checks for the placeholder publisher ID and safely does
  nothing until you complete the two steps below — shipping this update today changes nothing visible
  to visitors.

## What you still need to do — this is not something code can do for you
1. **Get a Google AdSense account and site approval.** Sign up at
   [google.com/adsense](https://www.google.com/adsense), add zivozone.com, and submit it for review.
   Google manually reviews every site; this can take anywhere from a few days to a few weeks, and can
   be rejected (common reasons: too little original content, site not fully navigable, policy
   violations — worth reading AdSense's program policies before submitting). **No code change can skip
   this step or speed it up.**
2. **Once approved**, get your Publisher ID (looks like `ca-pub-1234567890123456`) from your AdSense
   account, and open `core/config.js`. Replace:
   ```js
   ADSENSE_PUBLISHER_ID: 'ca-pub-0000000000000000',
   ```
   with your real ID.
3. **Create one ad unit per slot** in the AdSense dashboard (Ads → By ad unit → New ad unit). You can
   create 6 separate units matching the 6 placements, or fewer if you'd rather consolidate — any slot
   name below without a real ID just stays a placeholder. Each unit gives you a numeric slot ID (like
   `1234567890`); put those into the same file:
   ```js
   ADSENSE_SLOT_IDS: { top: '<your top unit id>', bottom: '<your bottom unit id>',
                        'left-1': '<...>', 'left-2': '<...>', 'right-1': '<...>', 'right-2': '<...>' },
   ```
4. Run `python3 scripts/release.py <version>` and `bash scripts/run_all_gates.sh`, then deploy as usual.

## The mobile trade-off — a decision for you, not made automatically
**All 6 ad slots are currently hidden on screens narrower than 700px** (`@media(max-width:700px)` in
`core/styles/index.css`) — i.e., on essentially every phone. This predates this update; it wasn't
changed here because it's a real UX decision, not a bug: the 6-slot desktop layout (2 sidebars + top +
bottom) would be cramped and intrusive if shown as-is on a phone screen, and for a game/quiz site most
traffic is very likely mobile. Three honest options, in order of effort:
- **Do nothing.** Ship this update, ads show only on desktop. Simplest, but leaves the majority of
  potential ad impressions on the table if most visitors are on mobile.
- **Enable Google Auto Ads** — set `ADSENSE_AUTO_ADS: true` in `core/config.js` (a follow-up code
  change would be needed to actually load the auto-ads script tag; not wired up in this pass since it
  needs a decision first). Google automatically places responsive ad units, including mobile-specific
  formats (anchor, vignette), without any manual layout work — the standard modern recommendation for
  exactly this situation. Trade-off: less control over exactly where ads appear.
- **Design one mobile-specific slot** (e.g., a single anchor ad at the bottom of the screen) instead of
  cramming all 6 desktop slots in. More design work, most control, but a real follow-up task.

## What was NOT touched
- No change to the reward economy, security rules, or any user data flow — this update only affects
  whether/how ad markup renders, gated by existing consent infrastructure.
- No ads render for any visitor who hasn't accepted the consent banner, regardless of AdSense
  configuration — by design, consistent with how analytics already works.
