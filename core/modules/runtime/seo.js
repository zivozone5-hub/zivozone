/* ZIVOZONE V1226 — runtime technical SEO */
(() => {
  "use strict";
  if (window.ZIVOZONE_SEO?.__canonical) return;

  const SITE = "https://zivozone.com";
  const DEFAULT_IMAGE = `${SITE}/assets/og-image.png`;
  const t = k => { try { return window.zivoT ? window.zivoT(k) : (window.ZIVOZONE_I18N?.tr?.(k) || k); } catch (_) { return k; } };
  const lang = () => window.ZIVOZONE_I18N?.get?.() || "ar";
  // V1230.111 — DEFAULTS used to be a frozen object with a hardcoded Arabic title/description, and
  // home() (called on every SPA 'zivozone:route' home navigation — i.e. on EVERY language, not just
  // Arabic) spread it straight into document.title/meta description. So clicking a nav link back to
  // #home on the English (or any other non-Arabic) page flipped the tab title and meta description
  // to Arabic, mid-session, on a page whose own static <title> was already correctly translated.
  // Now computed fresh via t() on every call, so it reflects whatever language is actually active —
  // matching the exact per-language title/description already baked into each homepage clone (see
  // en/index.html's static <title>, say) rather than a second, stale, Arabic-only copy of them.
  // og:locale is a real OG property search engines/social previews read, and was hardcoded to
  // "ar_AR" unconditionally; OG_LOCALE below fixes that the same way.
  const OG_LOCALE = { ar: "ar_AR", en: "en_US", zh: "zh_CN", hi: "hi_IN", es: "es_ES", fr: "fr_FR", fa: "fa_IR" };
  const defaults = () => ({
    title: t("seoDefaultTitle"),
    description: t("seoDefaultDescription"),
    image: DEFAULT_IMAGE,
    type: "website"
  });

  const clean = value => String(value ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const absolute = value => {
    try { return new URL(value || DEFAULT_IMAGE, SITE).href; }
    catch (_) { return DEFAULT_IMAGE; }
  };

  function setMeta(attribute, key, value) {
    let el = document.head.querySelector(`meta[${attribute}="${CSS.escape(key)}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attribute, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", clean(value));
  }

  function setCanonical(url) {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.rel = "canonical";
      document.head.appendChild(el);
    }
    el.href = url;
  }

  function setJsonLd(data) {
    let el = document.head.querySelector('script[data-zivo-seo-jsonld]');
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.zivoSeoJsonld = "1";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function updateMetaTags(pageData = {}) {
    const base = defaults();
    const d = { ...base, ...pageData };
    const title = clean(d.title) || base.title;
    const description = clean(d.description).slice(0, 160) || base.description;
    const image = absolute(d.image);
    const url = d.url ? absolute(d.url) : `${SITE}${location.pathname}`;

    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", "index,follow,max-image-preview:large");
    setMeta("property", "og:type", d.type);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:site_name", "ZIVOZONE");
    setMeta("property", "og:locale", OG_LOCALE[lang()] || "en_US");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setCanonical(url);

    if (d.jsonLd) setJsonLd(d.jsonLd);

    window.dispatchEvent(new CustomEvent("zivozone:seo-updated", {
      detail: { title, description, image, url, type: d.type }
    }));

    return { title, description, image, url, type: d.type };
  }

  function story(s = {}) {
    const id = clean(s.id);
    const title = clean(s.seoTitle || s.title) || t("seoStoryFallbackTitle");
    const description = clean(s.description || s.blurb || s.excerpt || s.content) || t("seoStoryFallbackDescription");
    const url = `${SITE}/stories/${encodeURIComponent(id)}`;
    const image = absolute(s.image);
    return updateMetaTags({
      title: `${title} | ZIVOZONE`,
      description: description.slice(0, 160),
      image,
      url,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url,
        image: [image],
        author: { "@type": "Organization", name: "ZIVOZONE" },
        publisher: { "@type": "Organization", name: "ZIVOZONE" },
        inLanguage: s.language || lang()
      }
    });
  }

  function game(g = {}) {
    const id = clean(g.id);
    const title = clean(g.seoTitle || g.title || g.name) || t("seoGameFallbackTitle");
    const description = clean(g.description || g.excerpt) || t("seoGameFallbackDescription");
    const url = id ? `${SITE}/challenges/${encodeURIComponent(id)}` : `${SITE}/challenges`;
    const image = absolute(g.image);
    return updateMetaTags({
      title: `${title} | ZIVOZONE`, description: description.slice(0, 160), image, url, type: "website",
      jsonLd: { "@context": "https://schema.org", "@type": "Game", name: title, description, url, image, inLanguage: g.language || lang() }
    });
  }

  function home() { return updateMetaTags({ ...defaults(), url: `${SITE}/` }); }

  window.addEventListener("zivozone:route", event => {
    if (event.detail?.type === "home") home();
  });

  const API = Object.freeze({ __canonical: true, updateMetaTags, update: updateMetaTags, story, game, home });
  window.ZIVOZONE_SEO = API;
  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.SEO = API;
})();
