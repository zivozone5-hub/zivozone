/* ZIVOZONE V1226 — runtime technical SEO */
(() => {
  "use strict";
  if (window.ZIVOZONE_SEO?.__canonical) return;

  const SITE = "https://zivozone.com";
  const DEFAULT_IMAGE = `${SITE}/assets/og-image.png`;
  const DEFAULTS = {
    title: "ZIVOZONE | عالمك يبدأ من هنا",
    description: "ZIVOZONE — ألعاب وتحديات ورياضة وقصص وتجارب رقمية تفاعلية.",
    image: DEFAULT_IMAGE,
    type: "website"
  };

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
    const d = { ...DEFAULTS, ...pageData };
    const title = clean(d.title) || DEFAULTS.title;
    const description = clean(d.description).slice(0, 160) || DEFAULTS.description;
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
    setMeta("property", "og:locale", "ar_AR");
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
    const title = clean(s.seoTitle || s.title || "قصة ZIVOZONE");
    const description = clean(s.description || s.blurb || s.excerpt || s.content || "قصة سينمائية تفاعلية من ZIVOZONE.").slice(0, 160);
    const url = `${SITE}/stories/${encodeURIComponent(id)}`;
    const image = absolute(s.image);
    return updateMetaTags({
      title: `${title} | ZIVOZONE`,
      description,
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
        inLanguage: s.language || "ar"
      }
    });
  }

  function game(g = {}) {
    const id = clean(g.id);
    const title = clean(g.seoTitle || g.title || g.name || "لعبة ZIVOZONE");
    const description = clean(g.description || g.excerpt || "اختبر ذكاءك ومهاراتك في ZIVOZONE.").slice(0, 160);
    const url = id ? `${SITE}/challenges/${encodeURIComponent(id)}` : `${SITE}/challenges`;
    const image = absolute(g.image);
    return updateMetaTags({
      title: `${title} | ZIVOZONE`, description, image, url, type: "website",
      jsonLd: { "@context": "https://schema.org", "@type": "Game", name: title, description, url, image, inLanguage: g.language || "ar" }
    });
  }

  function home() { return updateMetaTags({ ...DEFAULTS, url: `${SITE}/` }); }

  window.addEventListener("zivozone:route", event => {
    if (event.detail?.type === "home") home();
  });

  const API = Object.freeze({ __canonical: true, updateMetaTags, update: updateMetaTags, story, game, home });
  window.ZIVOZONE_SEO = API;
  window.ZIVOZONE = window.ZIVOZONE || {};
  window.ZIVOZONE.SEO = API;
})();
