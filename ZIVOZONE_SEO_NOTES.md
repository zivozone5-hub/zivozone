# ZIVOZONE — SEO basics (V1229.15)

## Starting point: better than expected
Before touching anything, `index.html` and the 12 story pages already had a solid foundation someone
built earlier: unique `<title>`, meta description, self-referencing canonical, `og:*` tags, Twitter
card, and JSON-LD per page. This was not a from-scratch SEO setup — it was filling two real, specific
gaps and adding a safeguard against them recurring.

## Fixed
1. **Story pages had copy-pasted, generic structured data.** All 12 `stories/tale-*/index.html` pages
   carried the exact same site-wide `WebSite` JSON-LD block (identical `name`, `url`, `description` on
   every single one) instead of describing that specific story. Search engines reading structured data
   would have seen 12 identical, generic blocks rather than 12 distinct pieces of content. Replaced each
   with a `ShortStory` schema built from that page's own already-correct title/description/canonical
   (no invented facts — a `datePublished` field was deliberately left out rather than fabricated, since
   the real publish date isn't known).
2. **`sitemap.xml` had no `<lastmod>` dates at all.** Added them, wired into `scripts/release.py` so
   they're regenerated automatically from each page's real filesystem modification time on every
   release — not today's date stamped onto everything, and not something to remember to update by hand.
3. **New gate — `scripts/qa_seo_basics.py`**: every crawlable page must have a non-empty title
   (no two pages sharing one), description, and canonical; every story page's structured data must
   describe that story specifically (not the generic site); every sitemap URL must have a real-looking
   `lastmod`. Wired into `run_all_gates.sh`.

## The one structural SEO gap worth a real decision — not fixed, deliberately
**This site can currently only be found in search results in Arabic**, regardless of how complete the
translation work in 1229.7–1229.9 gets. The reason is structural, not a translation gap: there is
exactly one URL (`https://zivozone.com/`) for all 7 languages, and the language switch happens entirely
client-side after the page loads. Search engines index the server-delivered HTML — which is always
Arabic — so an English, French, or Persian search query has nothing indexed to match against, no matter
how good the in-app translations are. `hreflang` tags (the mechanism search engines use to serve the
right language version of a page) require separate URLs per language to point at; with one URL, there's
nothing for `hreflang` to reference, which is why it wasn't added here — it would have no effect.

Fixing this properly means real per-language routing (e.g. `zivozone.com/en/`, `/fr/`, ... or a
subdomain per language), each serving that language's content server-side so it's actually indexable,
plus `hreflang` tags linking them together. That's a genuinely large, separate project — it changes
how the site is hosted and routed, not just its content — and shouldn't be started as a side effect of
an SEO pass. Flagging it clearly here because it is the single biggest lever for the stated "global"
goal specifically via organic search, bigger than any further translation work, and deserves its own
explicit decision before any code is written toward it.

## Not covered in this pass
- Story-specific `og:image` (all 12 currently share the same generic ZIVOZONE image) — would need
  unique artwork per story, a content task rather than a code one.
- Page speed / Core Web Speed factors beyond what's already tracked (bundle minification remains the
  known gap from 1229.4 — needs a build tool not available in this sandbox).
- A `SearchAction` sitelinks search box or `Organization` schema for the homepage — minor, lower-value
  additions if there's appetite for more structured-data polish later.
