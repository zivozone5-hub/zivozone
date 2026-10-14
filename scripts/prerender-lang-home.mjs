/* ZIVOZONE V1230.20 — build-time per-language homepage prerenderer.
 * The live app is a single-page client-side switcher (core/modules/runtime/i18n.js stores the
 * chosen language in localStorage and re-renders ~352 UI strings in place) — that is fine for a
 * returning visitor, but it means a crawler only ever sees one URL (https://zivozone.com/, always
 * declaring lang="ar") no matter which of the 7 supported languages exists. This script gives each
 * non-Arabic language its own real, crawlable URL (/en/, /zh/, /hi/, /es/, /fr/, /fa/) that:
 *   - declares the correct <html lang dir>, canonical and hreflang set (reciprocal with index.html,
 *     which already carries the same 7-language + x-default block — see index.html's <head>),
 *   - carries a translated <title>/description/OG block for that language,
 *   - sets the stored language preference before the app boots, so the one true app immediately
 *     renders in that language for a visitor who lands here instead of "/".
 * The Arabic homepage (index.html) itself is untouched by this script — it stays the canonical,
 * hand-authored root page; this only adds its translated siblings.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://zivozone.com";

/* V1230.81 — this script used to translate only the <head> (title/description/OG), leaving the
 * entire visible BODY of /en/, /zh/, /hi/, /es/, /fr/, /fa/ as the raw Arabic markup from
 * index.html, switched to the real language only client-side after JS runs (core/modules/
 * runtime/app-shell.js's applyLanguage()). To a crawler that doesn't execute JS — or does so after
 * the page is already indexed — that reads as a duplicate of the Arabic homepage wearing a
 * different <title>, exactly the gap flagged in the 2026-10-11 review. Fixed by running the SAME
 * ~352-key i18n table app-shell.js uses at runtime, at BUILD time instead, over every
 * data-i18n / data-i18n-placeholder / data-i18n-aria-label element already in index.html — no new
 * translation system, just the existing one applied one stage earlier.
 *
 * i18n.js is written to run in a browser (`window`, `document`, `localStorage`, `CustomEvent`),
 * so it's executed here in a throwaway vm context with minimal stand-ins for those, purely to
 * read back the T table it builds — nothing in that file is modified.
 */
async function loadI18nTable() {
  const src = await fs.readFile(path.join(ROOT, "core/modules/runtime/i18n.js"), "utf8");
  const store = {};
  const fakeLocalStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  const fakeDocumentElement = { lang: "ar", dir: "rtl" };
  const fakeWindow = { localStorage: fakeLocalStorage, document: { documentElement: fakeDocumentElement }, CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } }, dispatchEvent: () => {} };
  const sandbox = { window: fakeWindow, document: fakeWindow.document, localStorage: fakeLocalStorage, CustomEvent: fakeWindow.CustomEvent, console };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: "i18n.js (build-time, sandboxed)" });
  return sandbox.window.ZIVOZONE_I18N.T;
}

const escAttr = v => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

/* Mirrors applyLanguage() in core/modules/runtime/app-shell.js exactly, just against a raw HTML
 * string at build time instead of a live DOM at runtime: swap the text of every [data-i18n], the
 * placeholder of every [data-i18n-placeholder], and the aria-label of every [data-i18n-aria-label]
 * for the translated string in dict, leaving any key with no entry in dict untouched (falls back
 * to whatever text/attribute index.html already has — the Arabic original, not a blank). */
function localizeBody(html, dict) {
  html = html.replace(/data-i18n="([a-zA-Z0-9]+)"([^>]*)>([^<]*)/g, (full, key, attrs) => {
    if (dict[key] === undefined) return full;
    return `data-i18n="${key}"${attrs}>${escAttr(dict[key])}`;
  });
  html = html.replace(/<[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?>/g, (tag) => {
    let m = tag.match(/data-i18n-placeholder="([a-zA-Z0-9]+)"/);
    if (m && dict[m[1]] !== undefined) {
      tag = /placeholder="[^"]*"/.test(tag)
        ? tag.replace(/placeholder="[^"]*"/, `placeholder="${escAttr(dict[m[1]])}"`)
        : tag.replace(/>$/, ` placeholder="${escAttr(dict[m[1]])}">`);
    }
    m = tag.match(/data-i18n-aria-label="([a-zA-Z0-9]+)"/);
    if (m && dict[m[1]] !== undefined) {
      tag = /aria-label="[^"]*"/.test(tag)
        ? tag.replace(/aria-label="[^"]*"/, `aria-label="${escAttr(dict[m[1]])}"`)
        : tag.replace(/>$/, ` aria-label="${escAttr(dict[m[1]])}">`);
    }
    return tag;
  });
  return html;
}

const LANGS = ["en", "zh", "hi", "es", "fr", "fa"];
const DIR = { en: "ltr", zh: "ltr", hi: "ltr", es: "ltr", fr: "ltr", fa: "rtl" };
const OG_LOCALE = { en: "en_US", zh: "zh_CN", hi: "hi_IN", es: "es_ES", fr: "fr_FR", fa: "fa_IR" };

// Short, hand-translated homepage title/description per language (the same brand tagline the
// Arabic homepage uses) — these are the handful of static marketing strings that live directly in
// index.html's <head>, outside the ~352-key UI-string i18n catalog in runtime/i18n.js.
const COPY = {
  en: {
    title: "ZIVOZONE | Your World Starts Here",
    description: "ZIVOZONE — a digital world of games, challenges, sport and intelligence, with the ZIVO economy and player progress.",
    ogTitle: "ZIVOZONE | Games, Challenges, Sport & the ZIVO Economy",
    ogDescription: "ZIVOZONE — games, challenges, sport and digital experiences with XP and ZIVO in one platform."
  },
  zh: {
    title: "ZIVOZONE | 你的世界从这里开始",
    description: "ZIVOZONE —— 一个集游戏、挑战、运动与智力于一体的数字世界，拥有 ZIVO 经济体系与玩家成长系统。",
    ogTitle: "ZIVOZONE | 游戏、挑战、运动与 ZIVO 经济体系",
    ogDescription: "ZIVOZONE —— 在同一个平台上体验游戏、挑战、运动与数字体验，获得 XP 与 ZIVO。"
  },
  hi: {
    title: "ZIVOZONE | आपकी दुनिया यहीं से शुरू होती है",
    description: "ZIVOZONE — गेम्स, चैलेंजेस, स्पोर्ट्स और बुद्धिमत्ता की एक डिजिटल दुनिया, ZIVO इकॉनॉमी और प्लेयर प्रगति के साथ।",
    ogTitle: "ZIVOZONE | गेम्स, चैलेंजेस, स्पोर्ट्स और ZIVO इकॉनॉमी",
    ogDescription: "ZIVOZONE — एक ही प्लेटफ़ॉर्म पर गेम्स, चैलेंजेस, स्पोर्ट्स और डिजिटल अनुभव, XP और ZIVO के साथ।"
  },
  es: {
    title: "ZIVOZONE | Tu mundo empieza aquí",
    description: "ZIVOZONE — un mundo digital de juegos, retos, deporte e inteligencia, con la economía ZIVO y el progreso del jugador.",
    ogTitle: "ZIVOZONE | Juegos, Retos, Deporte y la Economía ZIVO",
    ogDescription: "ZIVOZONE — juegos, retos, deporte y experiencias digitales con XP y ZIVO en una sola plataforma."
  },
  fr: {
    title: "ZIVOZONE | Ton monde commence ici",
    description: "ZIVOZONE — un monde numérique de jeux, défis, sport et intelligence, avec l'économie ZIVO et la progression du joueur.",
    ogTitle: "ZIVOZONE | Jeux, Défis, Sport et l'Économie ZIVO",
    ogDescription: "ZIVOZONE — jeux, défis, sport et expériences numériques avec XP et ZIVO sur une seule plateforme."
  },
  fa: {
    title: "ZIVOZONE | دنیای تو از همین‌جا شروع می‌شود",
    description: "ZIVOZONE — دنیایی دیجیتال از بازی‌ها، چالش‌ها، ورزش و هوش، همراه با اقتصاد ZIVO و پیشرفت بازیکن.",
    ogTitle: "ZIVOZONE | بازی‌ها، چالش‌ها، ورزش و اقتصاد ZIVO",
    ogDescription: "ZIVOZONE — بازی‌ها، چالش‌ها، ورزش و تجربه‌های دیجیتال همراه با XP و ZIVO در یک پلتفرم."
  }
};

const esc = v => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

const template = await fs.readFile(path.join(ROOT, "index.html"), "utf8");
const I18N_T = await loadI18nTable();

for (const lang of LANGS) {
  const c = COPY[lang];
  const url = `${SITE}/${lang}/`;
  let page = template
    .replace(/<html lang="ar" dir="rtl">/, `<html lang="${lang}" dir="${DIR[lang]}">`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(c.description)}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(c.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(c.ogTitle)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(c.ogDescription)}">`)
    .replace(/<meta property="og:locale" content="[^"]*">/, `<meta property="og:locale" content="${OG_LOCALE[lang]}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(c.ogTitle)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(c.ogDescription)}">`);
  // Base href so this nested page's relative asset/script paths (css/, core/, assets/...) still
  // resolve to the site root, same technique already used by prerender-stories.mjs/prerender-rooms.mjs.
  // Also set the stored language preference BEFORE any app script runs, so
  // core/modules/runtime/i18n.js's get() (localStorage-first) picks it up on the very first paint
  // instead of defaulting to Arabic or re-detecting from navigator.languages. Both go in a single
  // replace of the one <head> tag so the second insertion isn't looking for text the first already consumed.
  // V1230.91 — template (index.html) now carries its own <base href="/"> (see that file's matching
  // note), so skip the now-redundant insertion here; kept as a fallback for a future template that
  // doesn't have one yet.
  const baseTag = /<base\s+href=/.test(template) ? "" : '<base href="/">\n';
  page = page.replace(
    "<head>",
    `<head>\n${baseTag}<script>try{localStorage.setItem('zivozone_language_v1','${lang}')}catch(_){}</script>`
  );
  // V1230.81 — translate the actual visible body (nav, hero, room cards, footer, ...) using the
  // same i18n table the app applies client-side, instead of leaving it as raw Arabic markup.
  page = localizeBody(page, I18N_T[lang] || {});
  const out = path.join(ROOT, lang, "index.html");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, page, "utf8");
}

// Append-only sitemap update (same safe pattern as prerender-rooms.mjs/prerender-stories.mjs):
// never rewrites an existing entry, only adds these pages' own URLs if not already present, each
// stamped with today's <lastmod> directly (scripts/release.py's lastmod map doesn't know about
// these paths, same reasoning as prerender-stories.mjs's V1230.20 note).
const today = new Date().toISOString().slice(0, 10);
const sitemapPath = path.join(ROOT, "sitemap.xml");
let sitemap = await fs.readFile(sitemapPath, "utf8");
for (const lang of LANGS) {
  const u = `${SITE}/${lang}/`;
  if (sitemap.includes(`<loc>${u}</loc>`)) continue;
  sitemap = sitemap.replace("</urlset>", `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>\n</urlset>`);
}
await fs.writeFile(sitemapPath, sitemap, "utf8");

console.log(`Generated ${LANGS.length} per-language homepage variants (${LANGS.join(", ")}).`);
