/* ZIVOZONE V1230 — build-time landing-page prerenderer for the real game rooms/challenges.
 * Same technique as scripts/prerender-stories.mjs (clone index.html, hide other sections,
 * inject real meta/OG/JSON-LD, write to a dedicated static path) but for rooms/, not stories/,
 * and it never touches sitemap.xml's existing entries — it only appends new ones it owns.
 * Each page's CTA button triggers the REAL, already-built interactive room via its real
 * data-attribute (data-horror-room, data-puzzle-room, ...), not a fake preview.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://zivozone.com";
const OUT = path.join(ROOT, "rooms");

const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

// Real content only — the same copy already shipped inside the actual room modules / challenges.js.
const ROOMS = [
  {
    slug: "puzzle-room",
    trigger: "data-puzzle-room",
    eyebrow: "ZIVOZONE // PUZZLE ROOM",
    title: "غرفة الألغاز — 9 مراحل منطق حقيقية بوقت محدود",
    description: "غرفة ألغاز تفاعلية من 9 مراحل حقيقية (مراقبة، تسلسل، ذاكرة، تدوير، شيفرة، متاهة، فرز، منطق، مرحلة نهائية) — كل مرحلة لها آلية لعب مختلفة ووقت محدود وتحقق فوري للنتيجة.",
    gameType: "LogicPuzzle",
    body: `
      <p class="muted">تحدٍ حقيقي: كل مرحلة لها آلية لعب واضحة ونتيجة قابلة للتحقق فورًا. الأخطاء لا تنهي الغرفة — تستمر وتتعلم من كل محاولة.</p>
      <h2>9 مراحل منطقية متتابعة</h2>
      <p>تبدأ غرفة الألغاز بمرحلة المراقبة وتنتقل عبر التسلسل والذاكرة والتدوير وفك الشيفرة والمتاهة والفرز والمنطق، وصولًا إلى المرحلة النهائية التي تجمع كل ما تعلمته. كل مرحلة محكومة بمؤقّت حقيقي (⏱) وتُحسب نقاطها ضمن سلسلة إنجاز (🔥) تراكمية.</p>
      <h2>لماذا هذه الغرفة مختلفة</h2>
      <p>لا توجد إجابات محفوظة ولا تلميحات مزيفة — كل لغز له حل منطقي واحد يتحقق منه النظام مباشرة، والنتيجة النهائية (الزمن، المحاولات، أفضل سلسلة) تُسجَّل كتجربة حقيقية داخل حسابك.</p>
    `,
  },
  {
    slug: "dark-room",
    trigger: "data-horror-room",
    eyebrow: "ZIVOZONE // DARK ROOM",
    title: "الغرفة المظلمة — تحدي رعب حقيقي بصوت وإضاءة مخيفة",
    description: "غرفة رعب تفاعلية حقيقية: أشباح تتحرك نحوك من 8 نقاط حول الشاشة، عليك إضاءتها بالضوء قبل أن تصل إليك، مع أصوات رعب أصلية (ضحكة وصرخة) ومؤشر تركيز/هدوء ينفذ مع الإهمال.",
    gameType: "SurvivalHorror",
    body: `
      <p class="muted">لا نوافذ منبثقة مزيفة ولا خوف مصطنع بالصدفة — آلية لعب حقيقية تعتمد على ردّ فعلك الفعلي.</p>
      <h2>كيف تلعب</h2>
      <p>أشكال مظلمة تنبعث من 8 اتجاهات حول الغرفة وتتقدم نحو مركزها. حرّك الضوء لتصيب كل شكل قبل أن يصل إليك — الإصابة الناجحة تبعده وتزيد نقاطك، والإهمال يستهلك "تركيزك" تدريجيًا حتى الانهيار. جامعو البطاريات المنتشرون في الغرفة يمنحونك وقتًا إضافيًا من الضوء.</p>
      <h2>صوت رعب حقيقي، لا مؤثرات عامة</h2>
      <p>الغرفة المظلمة هي الغرفة الوحيدة في ZIVOZONE بمؤثرات صوتية رعب أصلية (ضحكة عند الإهمال، صرخة عند السقوط) منفصلة تمامًا عن أصوات باقي الغرف، فوق خلفية صوتية جوية مخصصة لهذا الجو فقط.</p>
    `,
  },
  {
    slug: "health-world",
    trigger: "data-zivo-health-room",
    eyebrow: "ZIVOZONE // HEALTH EXPERIENCE",
    title: "صحتك بالدنيا — أبواب معرفية مستقلة للصحة والرياضة والنوم",
    description: "غرفة معرفية متعددة الأبواب: الصحة، الرياضة، الطعام، النوم، الوزن، والجانب النفسي — كل باب مستقل بمحتواه الخاص داخل تجربة واحدة متكاملة.",
    gameType: "WebApplication",
    body: `
      <p class="muted">مساحة واحدة، أبواب متعددة — كل باب يغطي جانبًا مختلفًا من الحياة اليومية الصحية.</p>
      <h2>أبواب مستقلة حقيقية</h2>
      <p>"صحتك بالدنيا" ليست شاشة واحدة بل مجموعة أبواب مستقلة: الصحة العامة، الرياضة، الطعام، النوم، الوزن، والجانب النفسي — وكل باب يُفتح برحلته الخاصة ومحتواه الخاص بدل تكرار نفس النمط في كل مرة.</p>
      <h2>لمن هذه الغرفة</h2>
      <p>مصممة لمن يريد معلومة عملية مباشرة في لحظة اتخاذ القرار اليومي — سؤال عن النوم، أو الطعام، أو نمط نشاط — دون الحاجة للبحث في مصادر متفرقة.</p>
    `,
  },
  {
    slug: "beauty-room",
    trigger: "data-beauty-room",
    eyebrow: "ZIVOZONE // BEAUTY ROOM",
    title: "غرفة الجمال — عناية يومية، معرفة، وتحدي روتين تفاعلي",
    description: "مساحة عناية يومية للنساء والفتيات مع معلومات عملية عن البشرة والجسد والشعر، وتحدي تفاعلي لترتيب خطوات روتين العناية الصحيح خطوة بخطوة.",
    gameType: "WebApplication",
    body: `
      <p class="muted">الجمال يبدأ من العناية، لا من المثالية.</p>
      <h2>معرفة عملية + تحدي تفاعلي</h2>
      <p>غرفة الجمال تجمع بين معلومات عملية وروتينات بسيطة وأفكار آمنة نسبيًا للعناية بالبشرة والجسد والشعر، وبين تحدٍ تفاعلي حقيقي: ترتيب خطوات روتين عناية كامل بالترتيب الصحيح، بمؤثرات صوتية فورية على كل خطوة صحيحة أو خاطئة.</p>
      <h2>تنويه مهم</h2>
      <p>هذه المساحة معلوماتية وتوجيهية فقط؛ مشاكل البشرة المستمرة تحتاج تقييم مختص حقيقي ولا تعوّض عنه هذه الغرفة.</p>
    `,
  },
  {
    slug: "forensic-lab",
    trigger: 'data-challenge="forensic"',
    eyebrow: "ZIVOZONE // FORENSIC LAB",
    title: "المختبر الجنائي — ابنِ القضية من الأدلة، لا من التخمين",
    description: "تحدي تحقيق جنائي تفاعلي: مسرح جريمة، غرفة أدلة، خط زمني، وغرفة استنتاج — المطلوب ربط القرائن وبناء الرواية من الأدلة الفعلية لا تخمين المتهم.",
    gameType: "MysteryGame",
    body: `
      <p class="muted">المسرح صامت… لكن كل أثر يتكلم.</p>
      <h2>قضية حقيقية تُبنى من الأدلة</h2>
      <p>تدخل مسرح الجريمة، تفتح سجل الأدلة، تصنّف كل قرينة وتربطها بخط زمني متماسك قبل أن تصل إلى غرفة الاستنتاج. الاستنتاج الأقوى هو الذي يفسّر كل الأدلة دون قفزات منطقية — لا الذي يخمّن المتهم مباشرة.</p>
      <h2>ما تتعلمه</h2>
      <p>أن الدليل يحتاج سياقًا، وأن خط الزمن قد يكشف تناقض الروايات — مهارة تحليل حقيقية ملبوسة بقالب تحدٍ تفاعلي.</p>
    `,
  },
  {
    slug: "daily-challenge",
    trigger: 'onclick="window.ZIVOZONE&amp;&amp;window.ZIVOZONE.Daily&amp;&amp;window.ZIVOZONE.Daily.open();return false;"',
    eyebrow: "ZIVOZONE // DAILY CHALLENGE",
    title: "تحدي اليوم — مهمة جديدة كل يوم، لا تتكرر بالطريقة نفسها",
    description: "تحدٍ يومي متغيّر: نفس التحدي لكل اللاعبين في نفس اليوم، مبني من تاريخ اليوم نفسه، مع مفاجأة في منتصف الجولة ونتيجة تُحفظ وتُزامن مع حسابك.",
    gameType: "QuizGame",
    body: `
      <p class="muted">تحدي اليوم لا يتكرر بالطريقة نفسها.</p>
      <h2>نفس التحدي لكل اللاعبين، كل يوم</h2>
      <p>تحدي اليوم يُبنى من تاريخ اليوم نفسه، فكل من يلعبه في نفس اليوم يحصل على نفس التحدي بالضبط — ما يجعله فرصة حقيقية للمقارنة مع غيرك، لا تمرينًا عشوائيًا. تسخين بسيط في البداية، ثم مفاجأة تُغيّر الإيقاع في منتصف الجولة.</p>
      <h2>نتيجتك محفوظة ومُزامنة</h2>
      <p>تُحفظ نتيجتك محليًا فور انتهاء التحدي، وتتم مزامنتها مع حسابك تلقائيًا عند عودة الاتصال — حتى لو انقطع الإنترنت أثناء اللعب.</p>
    `,
  },
  {
    slug: "football-intelligence",
    trigger: 'data-challenge="football_intelligence"',
    eyebrow: "ZIVOZONE // FOOTBALL INTELLIGENCE",
    title: "Football Intelligence — غرفة الرؤية التكتيكية لكرة القدم",
    description: "تحدي تكتيكي حقيقي من مدرب كرة قدم: قراءة المساحات، فتح الخطوط، ونافذة تحول القرار — لا توجد إجابة واحدة، توجد قراءة صحيحة للمشهد.",
    gameType: "SportsGame",
    body: `
      <p class="muted">لا توجد إجابة واحدة… توجد قراءة صحيحة للمشهد.</p>
      <h2>سبورة تكتيكية حقيقية</h2>
      <p>المباراة تُحمَّل والخطوط تتحرك على السبورة التكتيكية: راقب الضغط، الظهير، واللاعب الثالث، ثم اتخذ القرار في نافذة التحول قبل أن تُغلق — القرار الآن هو ما يغيّر شكل الهجمة.</p>
      <h2>محتوى مبني من تجربة تدريب حقيقية</h2>
      <p>التمركز يسبق التمريرة، والضغط الناجح يبدأ من تغطية المساحة لا من مطاردة الكرة — مبادئ تكتيكية حقيقية مأخوذة من تمارين وتحليل كرة قدم فعلي، لا أسئلة عامة مُعاد صياغتها.</p>
    `,
  },
  {
    slug: "football-pitch",
    // V1230.70 — was data-challenge="football" (a plain 10-question quiz). The room now has a real
    // signature-room Epic50 game of its own ("Reading the Pitch", football-room.js) — the landing
    // page's CTA now opens that directly, same as every other signature room's landing page does.
    trigger: "data-football-room",
    eyebrow: "ZIVOZONE // FOOTBALL PITCH",
    title: "ملعب القرار — الملعب لا يسألك، الملعب ينتظر قرارك",
    description: "50 مستوى عبر 5 مراحل تكتيكية حقيقية: لاعب مفتوح تقرأه وتضغط عليه، مدافع يضيّق الخط، تشكيلة تعيد تمركزها، وجهة هجوم تتبدّل — تمامًا كما يقرأ المدرب ملعبًا حقيقيًا.",
    gameType: "SportsGame",
    body: `
      <p class="muted">الملعب لا يسألك… الملعب ينتظر قرارك.</p>
      <h2>قراءة حقيقية للملعب، لا حفظ إجابات</h2>
      <p>لاعب واحد يقف مفتوحًا دون رقابة — عليك قراءة المشهد والضغط عليه قبل أن تُغلق نافذة القرار. من المرحلة الثانية فصاعدًا يضيق مدافع الخط فيتبدّل اللاعب المستهدف، ثم تعيد التشكيلة تمركزها بعد كل تمريرة صحيحة، ثم تتبدّل جهة الهجوم بالكامل — حتى تجمع كل القواعد معًا في المرحلة الخامسة.</p>
      <h2>50 مستوى، 5 مراحل، صعوبة حقيقية متصاعدة</h2>
      <p>كل مرحلة (10 مستويات) تمنحك مكافأة ZIVO عند إنهائها، وإنهاء المستويات الخمسين كلها يمنحك مكافأة ختامية كبرى — مبنية على نفس محرك الألعاب الذي تثبت في كل غرف ZIVOZONE الأخرى.</p>
    `,
  },
];

function injectMeta(html, title, description, url, image) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)} | ZIVOZONE</title>`);
  html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${esc(description)}">`);
  // index.html's own <head> carries ITS (homepage) hreflang block right after its canonical tag;
  // since this script clones index.html as the page template, that block has to be swapped out —
  // these room pages have no translated body copy of their own (see V1229_PHASE1_NOTES.md 1230.20),
  // so they get a plain self-referencing ar/x-default pair instead of inheriting the homepage's
  // 7-language block, which would have wrongly claimed translations that don't exist for this page.
  html = html.replace(/<link rel="canonical"[^>]*>(\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">)*/i,
    `<link rel="canonical" href="${url}">\n<link rel="alternate" hreflang="ar" href="${url}">\n<link rel="alternate" hreflang="x-default" href="${url}">`);
  html = html.replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${url}">`);
  html = html.replace(/<meta property="og:type"[^>]*>/i, `<meta property="og:type" content="website">`);
  html = html.replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(title)}">`);
  html = html.replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${esc(description)}">`);
  html = html.replace(/<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${image}">`);
  html = html.replace(/<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${image}">`);
  html = html.replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${esc(title)}">`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${esc(description)}">`);
  html = html.replace(/<meta name="robots"[^>]*>/i, `<meta name="robots" content="index,follow,max-image-preview:large">`);
  html = html.replace(/<meta property="og:locale"[^>]*>/i, `<meta property="og:locale" content="ar_AR">`);
  return html;
}

const template = await fs.readFile(path.join(ROOT, "index.html"), "utf8");
const bundleVerMatch = template.match(/\?v=([\d.]+)/);
const bundleVer = bundleVerMatch ? bundleVerMatch[1] : "1230.0";

const roomUrls = [];
for (const r of ROOMS) {
  const url = `${SITE}/rooms/${r.slug}`;
  const image = `${SITE}/assets/og-image.png`;
  const article = `<article id="zivo-seo-room" class="zivo-seo-story" itemscope itemtype="https://schema.org/WebPage">` +
    `<header><span class="eyebrow">${esc(r.eyebrow)}</span><h1 itemprop="headline">${esc(r.title)}</h1>` +
    `<p class="muted" itemprop="description">${esc(r.description)}</p>` +
    `<a class="btn btn-primary zivo-seo-cta" ${r.trigger} href="/" role="button">ابدأ التحدي الآن ↗</a></header>` +
    `<section itemprop="mainContentOfPage">${r.body}</section>` +
    `<p><a class="btn" href="/">العودة إلى الصفحة الرئيسية لـ ZIVOZONE</a></p></article>`;

  let page = template;
  // V1230.91 — template (index.html) now carries its own <base href="/"> (see that file's matching
  // note), so skip the now-redundant insertion here; kept as a fallback for a future template that
  // doesn't have one yet.
  if (!/<base\s+href=/.test(template)) page = page.replace("<head>", '<head>\n<base href="/">');
  page = page.replace("<body>", '<body class="zivo-seo-route">');
  // V1230.72 — previously this page was the FULL homepage (hero, newsbar, all 7 signature cards,
  // challenge center, identity/ai/sports sections) with everything but this one article hidden via
  // CSS, so the real app could still boot underneath and the room's own CTA would genuinely work.
  // That CTA never actually needed the rest of the homepage's markup to exist: the trigger attribute
  // (data-horror-room etc.) is read by a document-level click listener (room-loader.js and each
  // room module's own listener both use e.target.closest(), which works no matter where in the DOM
  // the attribute lives), and router.js's feature-reconcile pass matches the same way — confirmed by
  // reading every module that queries these containers before cutting anything. So the entire
  // duplicated <main> content and the dead `.mobile-nav` tab bar (whose #home/#challenges/#ai/#sports
  // links point at sections that no longer exist here) are dropped outright instead of hidden —
  // real bytes saved, not just display:none. core/modules/runtime/app-shell.js's bind() was the one
  // place with a genuine hard dependency on markup being removed here (#ai-form, unguarded) — fixed
  // there in the same change (see its V1230.72 comment) before this went out.
  page = page.replace(/<main>[\s\S]*?<\/main>/, `<main>\n${article}\n</main>`);
  page = page.replace(/<nav class="mobile-nav"[\s\S]*?<\/nav>\n?/, "");
  page = page.replace(
    "</head>",
    `<style>body.zivo-seo-route>main>#zivo-seo-room{display:block;max-width:900px;margin:110px auto 60px;padding:28px}body.zivo-seo-route .zivo-seo-cta{display:inline-block;margin-top:18px}</style></head>`
  );
  page = injectMeta(page, r.title, r.description, url, image);
  page = page.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Game",
      name: r.title,
      description: r.description,
      url,
      image,
      genre: r.gameType,
      publisher: { "@type": "Organization", name: "ZIVOZONE" },
      inLanguage: "ar",
    })}</script></head>`
  );

  const out = path.join(OUT, r.slug, "index.html");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, page, "utf8");
  roomUrls.push(url);
}

// Append-only sitemap update: never rewrite existing entries (privacy/terms/stories/homepage),
// only add this script's own /rooms/* URLs if they're not already present.
const sitemapPath = path.join(ROOT, "sitemap.xml");
let sitemap = await fs.readFile(sitemapPath, "utf8");
const today = new Date().toISOString().slice(0, 10);
for (const url of roomUrls) {
  if (sitemap.includes(`<loc>${url}</loc>`)) continue;
  const entry = `  <url><loc>${esc(url)}</loc><lastmod>${today}</lastmod></url>\n`;
  sitemap = sitemap.replace("</urlset>", entry + "</urlset>");
}
await fs.writeFile(sitemapPath, sitemap, "utf8");

console.log(`Generated ${ROOMS.length} static room/challenge landing pages under rooms/ and appended their URLs to sitemap.xml (bundle v=${bundleVer}).`);
