/* ZIVOZONE V1230.102 — build-time "ZIVOZONE Academy" article prerenderer.
 * Adapted directly from scripts/prerender-stories.mjs — same approach (static HTML per article per
 * language, cloned from index.html, with a reciprocal hreflang block and an Article JSON-LD block,
 * appended into sitemap.xml) for a different content type: short coaching/training articles instead
 * of fiction. Reusing this exact pattern on purpose rather than inventing a new one: it is already
 * proven against this project's own SEO gate (scripts/qa_seo_basics.py) and Firebase Spark (free
 * tier) hosting — these pages are plain static files, zero Firestore reads, zero new cost.
 *
 * Source data: data/academy/index.json (article list, Arabic) + data/academy/content/<id>.json
 * (Arabic body). A translated data/academy/index.<lang>.json + content/<id>.<lang>.json pair is used
 * when present; a missing translation falls back to the Arabic original, same as stories.
 *
 * Run manually whenever an article is added or edited (same workflow as prerender-stories.mjs —
 * neither is part of the routine scripts/release.py build, since content doesn't change every
 * release): node scripts/prerender-academy.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://zivozone.com";
const DIR_ROOT = path.join(ROOT, "data/academy");
const CONTENT = path.join(DIR_ROOT, "content");
const OUT = path.join(ROOT, "academy");

const LANGS = ["ar", "en", "zh", "hi", "es", "fr", "fa"];
const DIR = { ar: "rtl", en: "ltr", zh: "ltr", hi: "ltr", es: "ltr", fr: "ltr", fa: "rtl" };
const OG_LOCALE = { ar: "ar_AR", en: "en_US", zh: "zh_CN", hi: "hi_IN", es: "es_ES", fr: "fr_FR", fa: "fa_IR" };
const BACK_LABEL = { ar: "العودة إلى ZIVOZONE", en: "Back to ZIVOZONE", zh: "返回 ZIVOZONE", hi: "ZIVOZONE पर वापस जाएँ", es: "Volver a ZIVOZONE", fr: "Retour à ZIVOZONE", fa: "بازگشت به ZIVOZONE" };
const INDEX_LABEL = { ar: "كل مقالات الأكاديمية", en: "All Academy articles", zh: "所有学院文章", hi: "सभी अकादमी लेख", es: "Todos los artículos de la Academia", fr: "Tous les articles de l'Académie", fa: "همه مقالات آکادمی" };
const INDEX_TITLE = { ar: "أكاديمية ZIVOZONE — مقالات تدريب كرة القدم", en: "ZIVOZONE Academy — Football coaching articles", zh: "ZIVOZONE 学院 — 足球训练文章", hi: "ZIVOZONE अकादमी — फुटबॉल कोचिंग लेख", es: "Academia ZIVOZONE — Artículos de entrenamiento de fútbol", fr: "Académie ZIVOZONE — Articles d'entraînement de football", fa: "آکادمی ZIVOZONE — مقالات مربیگری فوتبال" };

const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
const inline = v => esc(v).replace(/\*\*([^*\n]+?)\*\*/g,"<strong>$1</strong>");
function md(src){
  const lines=String(src||"").replace(/\r/g,"").split("\n"), out=[]; let p=[];
  const flush=()=>{if(p.length){out.push(`<p>${p.map(inline).join("<br>")}</p>`);p=[];}};
  for(const raw of lines){const t=raw.trim(); if(!t){flush();continue;}
    let m=t.match(/^(#{1,4})\s+(.+)$/); if(m){flush();const n=Math.max(2,Math.min(4,m[1].length));out.push(`<h${n}>${inline(m[2])}</h${n}>`);continue;}
    if(/^[-*•]\s+/.test(t)){flush();out.push(`<p>• ${inline(t.replace(/^[-*•]\s+/,""))}</p>`);continue;}
    if(/^\d+[.)]\s+/.test(t)){flush();out.push(`<p>${inline(t)}</p>`);continue;}
    if(/^>/.test(t)){flush();out.push(`<blockquote>${inline(t.replace(/^>\s?/,""))}</blockquote>`);continue;}
    p.push(t);
  }
  flush(); return out.join("\n");
}

function urlFor(id, lang) {
  const base = id ? `${SITE}/academy/${encodeURIComponent(id)}` : `${SITE}/academy`;
  return lang === "ar" ? base : `${base}/${lang}`;
}

function hreflangBlock(id) {
  const links = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${urlFor(id, l)}">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${urlFor(id, "ar")}">`);
  return links.join("\n");
}

function injectMeta(html,title,description,url,image,lang,id,type){
  html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(title)} | ZIVOZONE</title>`);
  html=html.replace(/<meta name="description"[^>]*>/i,`<meta name="description" content="${esc(description)}">`);
  html=html.replace(/<link rel="canonical"[^>]*>(\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">)*/i,`<link rel="canonical" href="${url}">\n${hreflangBlock(id)}`);
  html=html.replace(/<meta property="og:url"[^>]*>/i,`<meta property="og:url" content="${url}">`);
  html=html.replace(/<meta property="og:type"[^>]*>/i,`<meta property="og:type" content="${type}">`);
  html=html.replace(/<meta property="og:title"[^>]*>/i,`<meta property="og:title" content="${esc(title)}">`);
  html=html.replace(/<meta property="og:description"[^>]*>/i,`<meta property="og:description" content="${esc(description)}">`);
  html=html.replace(/<meta property="og:image"[^>]*>/i,`<meta property="og:image" content="${image}">`);
  html=html.replace(/<meta name="twitter:image"[^>]*>/i,`<meta name="twitter:image" content="${image}">`);
  html=html.replace(/<meta name="twitter:title"[^>]*>/i,`<meta name="twitter:title" content="${esc(title)}">`);
  html=html.replace(/<meta name="twitter:description"[^>]*>/i,`<meta name="twitter:description" content="${esc(description)}">`);
  html=html.replace(/<meta name="robots"[^>]*>/i,`<meta name="robots" content="index,follow,max-image-preview:large">`);
  html=html.replace(/<meta property="og:locale"[^>]*>/i,`<meta property="og:locale" content="${OG_LOCALE[lang]}">`);
  html=html.replace(/<html lang="ar" dir="rtl">/,`<html lang="${lang}" dir="${DIR[lang]}">`);
  return html;
}

async function readJson(p, fallback) {
  try { return JSON.parse(await fs.readFile(p, "utf8")); } catch (_) { return fallback; }
}

function wrapPage(template, lang, bodyHtml, extraHead) {
  let page = template;
  const hasBase = /<base\s+href=/.test(template);
  page = page.replace('<head>', lang === "ar"
    ? (hasBase ? '<head>' : '<head>\n<base href="/">')
    : (hasBase ? `<head>\n<script>try{localStorage.setItem('zivozone_language_v1','${lang}')}catch(_){}</script>`
               : `<head>\n<base href="/">\n<script>try{localStorage.setItem('zivozone_language_v1','${lang}')}catch(_){}</script>`));
  page = page.replace('<body>', '<body class="zivo-seo-route">');
  page = page.replace(/<main>[\s\S]*?<\/main>/, `<main>\n${bodyHtml}\n</main>`);
  page = page.replace(/<nav class="mobile-nav"[\s\S]*?<\/nav>\n?/, "");
  page = page.replace('</head>', `<style>body.zivo-seo-route>main>#zivo-seo-story{display:block;max-width:900px;margin:110px auto 60px;padding:28px}body.zivo-seo-route>main>#zivo-academy-index{display:block;max-width:900px;margin:110px auto 60px;padding:28px}.zivo-academy-list{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:14px}.zivo-academy-list a{display:block;padding:16px 18px;border:1px solid rgba(255,255,255,.1);border-radius:14px;color:inherit;text-decoration:none}.zivo-academy-list a:hover{border-color:rgba(72,166,255,.4)}.zivo-academy-list small{display:block;color:#8b93a7;margin-top:4px}</style></head>`);
  page = page.replace('</head>', `${extraHead}</head>`);
  return page;
}

const template = await fs.readFile(path.join(ROOT, "index.html"), "utf8");
const articlesAr = await readJson(path.join(DIR_ROOT, "index.json"), []);
const localizedIndex = {};
for (const lang of LANGS) {
  if (lang === "ar") continue;
  localizedIndex[lang] = await readJson(path.join(DIR_ROOT, `index.${lang}.json`), null);
}

const urls = [];

// ---- one page per article, per language -----------------------------------------------------
for (const aAr of articlesAr) {
  const bodyAr = (await readJson(path.join(CONTENT, `${aAr.id}.json`), {})).body || "";
  for (const lang of LANGS) {
    let a = aAr, body = bodyAr;
    if (lang !== "ar") {
      const idxLang = localizedIndex[lang];
      const aLang = idxLang && idxLang.find(x => String(x.id) === String(aAr.id));
      const rawLang = await readJson(path.join(CONTENT, `${aAr.id}.${lang}.json`), null);
      if (aLang && rawLang && String(rawLang.body || "").trim()) { a = aLang; body = rawLang.body; }
    }
    const title = a.title || "ZIVOZONE Academy";
    const baseDescription = String(a.blurb || body).replace(/\s+/g, " ").trim();
    const description = baseDescription.slice(0, 160);
    const url = urlFor(aAr.id, lang);
    const image = `${SITE}/assets/og-image.png`;
    const article = `<article id="zivo-seo-story" class="zivo-seo-story" itemscope itemtype="https://schema.org/Article"><header><span class="eyebrow">ZIVOZONE ACADEMY</span><h1 itemprop="headline">${esc(title)}</h1><p class="muted" itemprop="description">${esc(description)}</p></header><section itemprop="articleBody">${md(body)}</section><p><a class="btn btn-primary" href="/academy${lang === "ar" ? "" : "/" + lang}">${esc(INDEX_LABEL[lang])}</a> &nbsp; <a class="btn" href="/">${esc(BACK_LABEL[lang])}</a></p></article>`;
    const jsonLd = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: title, name: title, description, url, image, wordCount: String(body).split(/\s+/).filter(Boolean).length, author: { "@type": "Organization", name: "ZIVOZONE" }, publisher: { "@type": "Organization", name: "ZIVOZONE" }, inLanguage: lang })}</script>`;
    let page = wrapPage(template, lang, article, jsonLd);
    page = injectMeta(page, title, description, url, image, lang, aAr.id, "article");
    const out = lang === "ar" ? path.join(OUT, aAr.id, "index.html") : path.join(OUT, aAr.id, lang, "index.html");
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.writeFile(out, page, "utf8");
    urls.push(url);
  }
}

// ---- one index/listing page per language -----------------------------------------------------
for (const lang of LANGS) {
  const idxLang = lang === "ar" ? articlesAr : (localizedIndex[lang] || articlesAr);
  const items = articlesAr.map(aAr => {
    const aLang = idxLang.find(x => String(x.id) === String(aAr.id)) || aAr;
    const href = urlFor(aAr.id, lang).replace(SITE, "");
    return `<li><a href="${esc(href)}"><strong>${esc(aLang.title || aAr.title)}</strong><small>${esc(aLang.blurb || aAr.blurb || "")}</small></a></li>`;
  }).join("\n");
  const title = INDEX_TITLE[lang];
  const description = title;
  const url = urlFor(null, lang);
  const image = `${SITE}/assets/og-image.png`;
  const listingHtml = `<section id="zivo-academy-index"><header><span class="eyebrow">ZIVOZONE ACADEMY</span><h1>${esc(title)}</h1></header><ul class="zivo-academy-list">${items}</ul><p><a class="btn" href="/">${esc(BACK_LABEL[lang])}</a></p></section>`;
  const jsonLd = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: title, description, url, inLanguage: lang })}</script>`;
  let page = wrapPage(template, lang, listingHtml, jsonLd);
  page = injectMeta(page, title, description, url, image, lang, "", "website");
  const out = lang === "ar" ? path.join(OUT, "index.html") : path.join(OUT, lang, "index.html");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, page, "utf8");
  urls.push(url);
}

// ---- append-only sitemap update (same safe pattern as prerender-stories.mjs / prerender-rooms.mjs:
// never overwrite the file, only add URLs this script owns and are missing) --------------------
const today = new Date().toISOString().slice(0, 10);
const sitemapPath = path.join(ROOT, "sitemap.xml");
let sitemap = await fs.readFile(sitemapPath, "utf8").catch(() => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n`);
for (const u of urls) {
  if (sitemap.includes(`<loc>${u}</loc>`)) continue;
  sitemap = sitemap.replace('</urlset>', `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>\n</urlset>`);
}
await fs.writeFile(sitemapPath, sitemap, "utf8");
console.log(`Generated ${articlesAr.length} articles x ${LANGS.length} languages + ${LANGS.length} index pages = ${articlesAr.length * LANGS.length + LANGS.length} static pages and appended their URLs to sitemap.xml.`);
