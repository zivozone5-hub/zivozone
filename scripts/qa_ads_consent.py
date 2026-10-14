#!/usr/bin/env python3
"""V1229.13 gate: AdSense must never load or serve before the visitor accepts the consent banner,
and the placeholder publisher ID must never accidentally be replaced with something that looks live
without the person deliberately updating it (a sanity check, not a security boundary).

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

check("ads.js gates AdSense script loading behind consent",
      "consentGranted()" in ads and "const showPlaceholders = cfg.enabled && adsenseConfigured();" in ads
      and "showPlaceholders && consentGranted()" in ads)
check("ads.js hides the empty ad-slot placeholders entirely until a real AdSense ID is set "
      "(no visible 'your ad space here' box before the account is live)",
      "slot.hidden = !showPlaceholders;" in ads)
check("ads.js re-checks on the 'zivozone-consent' event (loads if the visitor accepts later)",
      "addEventListener('zivozone-consent', apply)" in ads)
check("ads.js detects the placeholder publisher ID and refuses to treat it as configured",
      "PLACEHOLDER_PUB_ID" in ads and "pubId() !== PLACEHOLDER_PUB_ID" in ads)
check("Auto Ads request is gated behind the same enabled+configured+consent check as manual slots",
      "requestAutoAdsIfEnabled()" in ads and "slots.forEach(fillSlot); requestAutoAdsIfEnabled();" in ads)
check("Auto Ads push is idempotent (won't push twice)", "autoAdsRequested" in ads and "if (autoAdsRequested" in ads)
m = re.search(r"ADSENSE_PUBLISHER_ID:\s*'([^']+)'", cfg)
check("core/config.js has an ADSENSE_PUBLISHER_ID (placeholder is fine, must exist)", bool(m), "key not found")
if m:
    is_placeholder = m.group(1) == "ca-pub-0000000000000000"
    print(f"INFO  ADSENSE_PUBLISHER_ID is currently {'the placeholder (ads will not serve — expected until AdSense is set up)' if is_placeholder else 'a real-looking value — verify this is intentional before deploying'}")

privacy = (ROOT / "privacy/index.html").read_text(encoding="utf-8")
check("privacy policy discloses Google AdSense (both languages)",
      privacy.count("AdSense") >= 1 and privacy.count("adssettings.google.com") >= 2)

print("\n%d check(s) failed" % len(fails) if fails else "\nADS/CONSENT WIRING OK")
sys.exit(1 if fails else 0)
