/* ZIVOZONE V1230.20 — build-time story prerenderer; Firebase Spark compatible.
 * V1230.20: now generates one prerendered page per story PER LANGUAGE (not just Arabic), each at
 * its own real URL, with a full reciprocal hreflang block — this is the SEO/crawler half of the
 * hreflang gap closed this round (the other half, loadLocalized() in core/modules/rooms.js, is
 * what the live app itself uses once a visitor is inside the SPA). A translated story/.<lang>.json
 * sibling (see data/stories/index.<lang>.json / content/<id>.<lang>.json) is used when present;
 * missing translations fall back to the Arabic original so a partially-translated catalog still
 * builds cleanly instead of breaking.
 */
import fs from "node:fs/promises";
import { targetsForGenres } from "./seo-keywords.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://zivozone.com";
const STORY_DIR = path.join(ROOT, "data/stories");
const CONTENT = path.join(STORY_DIR, "content");
const OUT = path.join(ROOT, "stories");

const LANGS = ["ar", "en", "zh", "hi", "es", "fr", "fa"];
const DIR = { ar: "rtl", en: "ltr", zh: "ltr", hi: "ltr", es: "ltr", fr: "ltr", fa: "rtl" };
const OG_LOCALE = { ar: "ar_AR", en: "en_US", zh: "zh_CN", hi: "hi_IN", es: "es_ES", fr: "fr_FR", fa: "fa_IR" };
const BACK_LABEL = { ar: "العودة إلى ZIVOZONE", en: "Back to ZIVOZONE", zh: "返回 ZIVOZONE", hi: "ZIVOZONE पर वापस जाएँ", es: "Volver a ZIVOZONE", fr: "Retour à ZIVOZONE", fa: "بازگشت به ZIVOZONE" };

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
  const base = `${SITE}/stories/${encodeURIComponent(id)}`;
  return lang === "ar" ? base : `${base}/${lang}`;
}

function hreflangBlock(id) {
  const links = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${urlFor(id, l)}">`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${urlFor(id, "ar")}">`);
  return links.join("\n");
}

function injectMeta(html,title,description,url,image,lang,id){
  html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(title)} | ZIVOZONE</title>`);
  html=html.replace(/<meta name="description"[^>]*>/i,`<meta name="description" content="${esc(description)}">`);
  // index.html's own <head> already carries ITS (homepage) hreflang block right after its canonical
  // tag; since this script clones index.html as the page template, that block must be swapped out
  // for this story's own reciprocal block too, not just appended alongside it.
  html=html.replace(/<link rel="canonical"[^>]*>(\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">)*/i,`<link rel="canonical" href="${url}">\n${hreflangBlock(id)}`);
  html=html.replace(/<meta property="og:url"[^>]*>/i,`<meta property="og:url" content="${url}">`);
  html=html.replace(/<meta property="og:type"[^>]*>/i,`<meta property="og:type" content="article">`);
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

const template=await fs.readFile(path.join(ROOT,"index.html"),"utf8");
const storiesAr=JSON.parse(await fs.readFile(path.join(STORY_DIR,"index.json"),"utf8"));
const localizedIndex={}, localizedBody={};
for (const lang of LANGS) {
  if (lang === "ar") continue;
  localizedIndex[lang] = await readJson(path.join(STORY_DIR, `index.${lang}.json`), null);
}
const urls=[SITE+"/"];
for(const sAr of storiesAr){
  const bodyAr=(await readJson(path.join(CONTENT,`${sAr.id}.json`),{})).body||"";
  for (const lang of LANGS) {
    let s=sAr, body=bodyAr;
    if (lang !== "ar") {
      const idxLang=localizedIndex[lang];
      const sLang = idxLang && idxLang.find(x=>String(x.id)===String(sAr.id));
      const rawLang = await readJson(path.join(CONTENT, `${sAr.id}.${lang}.json`), null);
      if (sLang && rawLang && String(rawLang.body||"").trim()) { s = sLang; body = rawLang.body; }
      // else: no translation yet for this story in this language — fall back to the Arabic
      // title/body so the page still builds with real content rather than a broken/empty one.
    }
    const title=s.seoTitle||s.title||"ZIVOZONE";
    const targetPhrases=lang==="ar"?targetsForGenres(s.genre||""):[];
    const baseDescription=String(s.blurb||s.description||body).replace(/\s+/g," ").trim();
    const seoLead=targetPhrases.join(" • ");
    const description=(seoLead?`${seoLead} — ${baseDescription}`:baseDescription).slice(0,160);
    const url=urlFor(sAr.id, lang);
    const image=s.image?new URL(s.image,SITE).href:`${SITE}/assets/og-image.png`;
    const article=`<article id="zivo-seo-story" class="zivo-seo-story" itemscope itemtype="https://schema.org/Article"><header><span class="eyebrow">ZIVOZONE STORIES</span><h1 itemprop="headline">${esc(title)}</h1><p class="muted" itemprop="description">${esc(description)}</p></header><section itemprop="articleBody">${md(body)}</section><p><a class="btn btn-primary" href="/">${esc(BACK_LABEL[lang])}</a></p></article>`;
    let page=template;
    // V1230.91 — template (index.html) now carries its own <base href="/"> (see that file's matching
    // note), so only insert the per-language setItem script here and skip the now-redundant base tag
    // for ar (which had nothing else to insert); leave the base-tag insertion as a fallback for any
    // future template that doesn't have one yet.
    const hasBase=/<base\s+href=/.test(template);
    page=page.replace('<head>', lang==="ar"
      ? (hasBase ? '<head>' : '<head>\n<base href="/">')
      : (hasBase ? `<head>\n<script>try{localStorage.setItem('zivozone_language_v1','${lang}')}catch(_){}</script>`
                 : `<head>\n<base href="/">\n<script>try{localStorage.setItem('zivozone_language_v1','${lang}')}catch(_){}</script>`));
    page=page.replace('<body>', '<body class="zivo-seo-route">');
    // V1230.72 — same fix as scripts/prerender-rooms.mjs (see its matching comment for the full
    // reasoning): the duplicated homepage <main> content was only ever hidden via CSS, never actually
    // needed by anything on this page, so it's dropped outright now instead of shipped-but-hidden.
    // The dead `.mobile-nav` tab bar (its #home/#challenges/#ai/#sports links have nothing to point
    // at here) is dropped too.
    page=page.replace(/<main>[\s\S]*?<\/main>/, `<main>\n${article}\n</main>`);
    page=page.replace(/<nav class="mobile-nav"[\s\S]*?<\/nav>\n?/, "");
    page=page.replace('</head>', `<style>body.zivo-seo-route>main>#zivo-seo-story{display:block;max-width:900px;margin:110px auto 60px;padding:28px}</style></head>`);
    page=injectMeta(page,title,description,url,image,lang,sAr.id);
    // V1230.18 — @type was "Article" (the generic, site-wide shape), but scripts/qa_seo_basics.py's gate
    // (and the pages this script used to ship before a prior round found this drift and restored them from
    // a known-good build rather than re-running this script, see V1229_PHASE1_NOTES.md 1230.1) expect
    // "ShortStory" — a story page describing itself as a generic Article is what the gate is there to catch.
    // wordCount/genre are real fields this script already has on hand, not placeholders.
    page=page.replace('</head>',`<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"ShortStory",headline:title,name:title,description,url,image,genre:s.genre||undefined,wordCount:String(body).split(/\s+/).filter(Boolean).length,author:{"@type":"Organization",name:"ZIVOZONE"},publisher:{"@type":"Organization",name:"ZIVOZONE"},inLanguage:lang})}</script></head>`);
    const out = lang==="ar"
      ? path.join(OUT,sAr.id,"index.html")
      : path.join(OUT,sAr.id,lang,"index.html");
    await fs.mkdir(path.dirname(out),{recursive:true});
    await fs.writeFile(out,page,"utf8");
    urls.push(url);
  }
}
// V1230.18 — append-only, same safe pattern as scripts/prerender-rooms.mjs (see its matching comment):
// this used to overwrite sitemap.xml from scratch with just the homepage + stories, silently deleting
// every <lastmod> scripts/release.py had stamped and every URL another generator (privacy/terms/rooms)
// had added — a real, confirmed data-loss bug, not a hypothetical one (it happened while fixing the CSS
// bug above in this same pass; recovered by re-running scripts/prerender-rooms.mjs afterward).
// V1230.20 — stamp <lastmod> directly at append time (today's date, same pattern already used by
// scripts/prerender-rooms.mjs) instead of leaning on scripts/release.py's PAGE_FOR_URL map, which
// only ever knew about the plain (Arabic) /stories/<id> URL — the new per-language URLs this
// version adds (/stories/<id>/<lang>) would otherwise ship with no lastmod and fail
// scripts/qa_seo_basics.py's "every sitemap URL has a lastmod" check.
const today=new Date().toISOString().slice(0,10);
const sitemapPath=path.join(ROOT,"sitemap.xml");
let sitemap=await fs.readFile(sitemapPath,"utf8").catch(()=>`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls[0]?`  <url><loc>${esc(urls[0])}</loc><lastmod>${today}</lastmod></url>\n`:''}</urlset>\n`);
for(const u of urls.slice(1)){
  if(sitemap.includes(`<loc>${u}</loc>`))continue;
  sitemap=sitemap.replace('</urlset>',`  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>\n</urlset>`);
}
await fs.writeFile(sitemapPath,sitemap,"utf8");
console.log(`Generated ${storiesAr.length} stories × ${LANGS.length} languages = ${storiesAr.length*LANGS.length} static pages and appended their URLs to sitemap.xml.`);
