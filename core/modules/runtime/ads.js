/* ZIVOZONE V1229.13 — Ad slot visibility/density control + real Google AdSense wiring.
   Extracted verbatim from the former core/runtime.js monolith (V1180 refactor), then extended.

   IMPORTANT — what you still need to do manually, this code cannot do it for you:
     1. Create/sign in to a Google AdSense account and submit this site for review. Ads will not
        render — even with everything below configured correctly — until Google approves the site.
     2. Once approved, replace `ADSENSE_PUBLISHER_ID` in core/config.js with your real
        "ca-pub-XXXXXXXXXXXXXXXX" value.
     3. Create one ad unit per slot in the AdSense dashboard (top, bottom, left-1, left-2, right-1,
        right-2 — the same names already used in index.html's data-ad-slot attributes) and put each
        unit's real numeric slot ID into `ADSENSE_SLOT_IDS` in core/config.js.
     4. See ZIVOZONE_ADS_SETUP.md for the full walkthrough, including the mobile ad-visibility
        trade-off this file does NOT change on its own.

   Until step 2 is done, this file detects the placeholder publisher ID and never loads the AdSense
   script — so shipping this update is safe even before you have a real AdSense account.
*/
(() => {
  'use strict';
  const KEY = 'zivozone_ads_v1';
  let cfg = { enabled: true, density: 'normal', label: true };
  try { cfg = { ...cfg, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };
  const t = (k) => window.zivoT ? window.zivoT(k) : k;

  const PLACEHOLDER_PUB_ID = 'ca-pub-0000000000000000';
  const adsCfg = () => window.ZIVOZONE_CONFIG || {};
  const pubId = () => String(adsCfg().ADSENSE_PUBLISHER_ID || '');
  const adsenseConfigured = () => /^ca-pub-\d+$/.test(pubId()) && pubId() !== PLACEHOLDER_PUB_ID;

  let scriptLoading = null, autoAdsRequested = false;
  function loadAdSenseScript() {
    if (scriptLoading) return scriptLoading;
    scriptLoading = new Promise((resolve) => {
      if (window.adsbygoogle) return resolve(true);
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(pubId())}`;
      s.crossOrigin = 'anonymous';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
    return scriptLoading;
  }

  /* V1229.14 — Google Auto Ads: the manual 6 slots below are CSS-hidden under 700px (see
     ZIVOZONE_ADS_SETUP.md "the mobile trade-off"), so phones currently get zero ad inventory from
     them. Auto Ads asks Google to place responsive units automatically, including mobile-specific
     formats (anchor, vignette) it decides on its own — it fills exactly the gap the manual slots
     leave on mobile, without any manual mobile layout work. Recommended and enabled by default
     (ADSENSE_AUTO_ADS in core/config.js); set it to false to opt out and rely on the manual slots only
     once you've set up real AdSense IDs. Google explicitly supports running Auto Ads alongside manual
     ad units on the same page and manages overall ad density itself, so this does not need to be
     mutually exclusive with the 6 slots above. This still requires the same AdSense account/approval
     as the manual slots — it changes nothing until ADSENSE_PUBLISHER_ID is a real value. */
  function requestAutoAdsIfEnabled() {
    if (autoAdsRequested || !adsCfg().ADSENSE_AUTO_ADS) return;
    autoAdsRequested = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({ google_ad_client: pubId(), enable_page_level_ads: true });
    } catch (e) { console.warn('AdSense auto ads push:', e); }
  }

  /* Fills one placeholder .ad-slot with a real AdSense <ins> unit. Idempotent: safe to call more
     than once on the same slot (e.g. after a consent change) — it no-ops if already filled. */
  function fillSlot(slot) {
    if (slot.dataset.adsenseFilled === '1') return;
    const name = slot.dataset.adSlot;
    const slotId = adsCfg().ADSENSE_SLOT_IDS?.[name];
    if (!slotId) return; // no configured unit for this placement name — leave the placeholder as-is
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', pubId());
    ins.setAttribute('data-ad-slot', String(slotId));
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    slot.querySelector('.ad-badge')?.remove();
    slot.querySelectorAll('strong').forEach(el => el.remove());
    slot.appendChild(ins);
    slot.dataset.adsenseFilled = '1';
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { console.warn('AdSense push:', e); }
  }

  function apply() {
    const slots = [...document.querySelectorAll('.ad-slot')];
    /* V1230.80 — before a real AdSense account is wired in (ADSENSE_PUBLISHER_ID still the
       placeholder), these slots rendered as empty "your ad space here" boxes to every visitor —
       a visibly unfinished element on a site meant to look professional, confirmed live by the
       owner. Nothing in this file changes once a real AdSense ID is set: adsenseConfigured()
       flips to true and these same slots render normally again, exactly as before, with no
       further code change needed. */
    const showPlaceholders = cfg.enabled && adsenseConfigured();
    slots.forEach(slot => {
      slot.hidden = !showPlaceholders;
      slot.dataset.density = cfg.density;
      const badge = slot.querySelector('.ad-badge');
      if (badge) badge.hidden = !cfg.label;
    });
    /* V1230.115 — two fixes made together, both from getting AdSense actually linked:
       1) This whole function used to return at the very top whenever the page had no manual
          .ad-slot placeholders — true of every page except the homepage (stories/, academy/, rooms/,
          the per-language clones' deep routes...). Auto Ads (requestAutoAdsIfEnabled below) needs no
          manual slots at all, so that early exit was silently stopping Auto Ads from ever running on
          100+ of this site's pages, not just skipping the (correctly slot-less) manual fill step. The
          slots-length guard now only wraps the manual-slot loop above, not the whole function.
       2) Loading the base AdSense script used to wait for a site-wide GDPR-style cookie-consent signal
          (same gate analytics used). That is the right default for a new AdSense integration, but
          Google's own "Connect your site" verification step asks for the script to be present and
          firing unconditionally on every page (see index.html's matching static <script> tag) — the
          owner explicitly chose prioritizing fast AdSense verification over waiting for that signal
          here, so the condition below no longer checks it. Ads personalization itself still runs
          through AdSense's own consent-mode signalling (Google's script, not a gate in this file) —
          this change only affects how early the base script loads. */
    if (cfg.enabled && adsenseConfigured()) {
      loadAdSenseScript().then(ok => { if (ok) { slots.forEach(fillSlot); requestAutoAdsIfEnabled(); } });
    }
  }

  function open() {
    const root = document.querySelector('#modal-root'); if (!root) return;
    const consentNote = adsenseConfigured()
      ? `<p class="muted small">${t('adsPersonalizedNote')} <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">${t('adsManageLink')}</a></p>`
      : '';
    root.innerHTML = `<div class="modal-backdrop"><div class="modal-card ad-control-modal"><button class="modal-close" data-close>×</button><span class="eyebrow">ZIVO ADS</span><h2>${t('adsControl')}</h2><p class="muted">${t('adsControlText')}</p><label class="control-row"><span>${t('adsEnabled')}</span><input id="ads-enabled" type="checkbox" ${cfg.enabled ? 'checked' : ''}></label><label class="control-row"><span>${t('adsLabel')}</span><input id="ads-label" type="checkbox" ${cfg.label ? 'checked' : ''}></label><label class="control-row"><span>${t('adsDensity')}</span><select id="ads-density"><option value="low" ${cfg.density === 'low' ? 'selected' : ''}>Low</option><option value="normal" ${cfg.density === 'normal' ? 'selected' : ''}>Normal</option><option value="high" ${cfg.density === 'high' ? 'selected' : ''}>High</option></select></label>${consentNote}<button class="btn btn-primary full" id="ads-save">${t('saveProgress')}</button></div></div>`;
    root.setAttribute('aria-hidden', 'false');
    root.querySelector('[data-close]').onclick = () => { root.setAttribute('aria-hidden', 'true'); root.innerHTML = ''; };
    root.querySelector('#ads-save').onclick = () => {
      cfg.enabled = root.querySelector('#ads-enabled').checked;
      cfg.label = root.querySelector('#ads-label').checked;
      cfg.density = root.querySelector('#ads-density').value;
      save(); apply();
      root.setAttribute('aria-hidden', 'true'); root.innerHTML = '';
    };
  }

  window.ZIVOZONE_ADS = { apply, open, get: () => ({ ...cfg }), isConfigured: adsenseConfigured, isAutoAdsEnabled: () => !!adsCfg().ADSENSE_AUTO_ADS };
  document.addEventListener('DOMContentLoaded', apply);
  /* V1230.115 — AdSense loading is no longer gated on consent (see apply()'s matching note above);
     this listener now mainly keeps the manual ad-slot placeholders and the settings modal's
     "personalized ads" note in sync if the visitor changes their cookie choice mid-session. */
  window.addEventListener('zivozone-consent', apply);
})();
