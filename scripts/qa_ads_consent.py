#!/usr/bin/env python3
"""V1230.115 gate (supersedes the V1229.13 consent-gated version): AdSense now loads unconditionally,
on every page, from the first visit — a deliberate, explicit site-owner choice made to satisfy
Google's "Connect your site" AdSense verification step (which expects its script to be present and
firing on every page load, not gated behind a cookie-consent banner). The privacy policy (all 7
languages) was updated in the SAME change to stop promising "we never show ads before you consent",
since that would otherwise be a false statement on a published legal page. This gate now checks that:
the new unconditional-loading shape is actually in place (not a silent partial revert), the old
consent-gate code is genuinely gone (not a dead duplicate), and the privacy policy's wording was
updated to match in all 7 languages — so a future change can't silently re-introduce the mismatch
this was written to catch (ads behavior and privacy-policy text disagreeing). The placeholder
publisher ID check is unrelated to consent and is kept as-is.

run:  python3 scripts/qa_ads_consent.py
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
fails = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        fails.append(name)


ads = (ROOT / "core/modules/runtime/ads.js").read_text(encoding="utf-8")
cfg = (ROOT / "core/config.js").read_text(encoding="utf-8")
privacy = (ROOT / "privacy/index.html").read_text(encoding="utf-8")

check("ads.js loads AdSense unconditionally (enabled+configured only, no consent gate) — "
      "V1230.115, a deliberate change; see this gate's docstring",
      "if (cfg.enabled && adsenseConfigured()) {" in ads
      and "loadAdSenseScript().then(ok => { if (ok) { slots.forEach(fillSlot); requestAutoAdsIfEnabled(); } });" in ads)
check("the old consentGranted() gate is genuinely gone, not a dead duplicate path",
      "consentGranted()" not in ads)
check("ads.js hides the empty ad-slot placeholders entirely until a real AdSense ID is set "
      "(no visible 'your ad space here' box before the account is live)",
      "slot.hidden = !showPlaceholders;" in ads)
check("ads.js's apply() no longer bails out on pages with no manual .ad-slot markup "
      "(Auto Ads must still run on stories/academy/rooms pages, which have none)",
      "if (!slots.length) return;" not in ads)
check("ads.js detects the placeholder publisher ID and refuses to treat it as configured",
      "PLACEHOLDER_PUB_ID" in ads and "pubId() !== PLACEHOLDER_PUB_ID" in ads)
check("Auto Ads push is idempotent (won't push twice)", "autoAdsRequested" in ads and "if (autoAdsRequested" in ads)
check("index.html carries the literal static AdSense verification tag Google's dashboard asks for",
      "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" in (ROOT / "index.html").read_text(encoding="utf-8"))
check("privacy policy no longer promises ads are gated behind consent (all 7 languages) — "
      "that would be false now that ads load unconditionally",
      not any(s in privacy for s in [
          "لا نعرض أي إعلان قبل موافقتك", "We never show ads before you consent",
          "我们在您同意之前不会展示任何广告", "आपकी सहमति से पहले हम कोई विज्ञापन नहीं दिखाते",
          "Nunca mostramos anuncios antes de tu consentimiento",
          "Nous n'affichons jamais de publicité avant votre consentement",
          "ما قبل از رضایت شما هیچ تبلیغی نمایش نمی‌دهیم",
      ]))
m = re.search(r"ADSENSE_PUBLISHER_ID:\s*'([^']+)'", cfg)
check("core/config.js has an ADSENSE_PUBLISHER_ID (placeholder is fine, must exist)", bool(m), "key not found")
if m:
    is_placeholder = m.group(1) == "ca-pub-0000000000000000"
    print(f"INFO  ADSENSE_PUBLISHER_ID is currently {'the placeholder (ads will not serve — expected until AdSense is set up)' if is_placeholder else 'a real-looking value — verify this is intentional before deploying'}")

check("privacy policy discloses Google AdSense (both languages)",
      privacy.count("AdSense") >= 1 and privacy.count("adssettings.google.com") >= 2)

print("\n%d check(s) failed" % len(fails) if fails else "\nADS/CONSENT WIRING OK")
sys.exit(1 if fails else 0)
