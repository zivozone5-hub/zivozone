# «اعرف مركزك في ملعب كرة القدم» (سابقاً: عالم المراكز) / Position World (v1230.186)
Lazy room opened by `[data-positions]` (home button next to "اكتشف مركزك"; the old 4-archetype quiz is untouched).
- Content: `core/modules/positions-content.js` (generated DATA; ar + en, other languages show en). 16 positions, 6 studies, 15 scored questions + foot + side, age guidance (≤12, 13–17, 18+).
- Logic: `core/modules/positions-world.js`: cosine similarity between answer vector (10 traits) and each position's ideal profile, +/- small bonuses for stronger foot and preferred side (to separate RB/LB and classic/inverted wingers).
- Tests: `node scripts/positions_unit_test.js`, `python3 scripts/positions_e2e_test.py` (server on :8973).
- Honest limits: guidance, not scientific selection; drills and legend descriptions are drafts for coach review; study figures are copied from abstracts (West's year is inferred ≈2018; Bradley 2009 is EPL 2005-06).

## «افهم مركزك» / Understand your position (v1230.191)
مع تحيات الكابتن رائف البطوش — With best regards, Captain Raef Al-Batoush.
- Entry: green button on Position World home («افهم مركزك»). Lazy: `dist/lazy/formations-content.js` is loaded with the room (room-loader `deps`).
- Data: `core/modules/formations-content.js` (`window.ZIVOZONE_FORMATIONS_DATA`, ar + en): 15 roles (gk, cb, rb, lb, rwb, lwb, dm, cm, am, rm, lm, rw, lw, st, ss) and 10 formations (4-4-2, 4-3-3, 4-2-3-1, 4-1-4-1, 3-5-2, 3-4-3, 5-3-2, 4-4-1-1, 4-3-2-1, 4-1-2-1-2), 11 slots each with pitch coordinates and a one-line note.
- Flow: choose formation → pitch with 11 tappable players + formation idea/attack/defence/strength/risk → tap a player → role page (one-line job, with ball, without ball, transitions, set pieces, 3 rules, common mistakes, calming tip). Or: "I know my position" → role page + that role in every formation.
- To add a formation: append an object to `formations` (11 slots, one GK, x 0-100, y 0-130 with the goal at y≈118), then run `node scripts/formations_unit_test.js`.
- Guidance only: every coach has his own variations; the page tells the player to follow his coach first.

### v1230.193 additions
- **Collapsible role page:** a summary card (job in one line, "In this formation" note, 3 golden rules, calming tip) then collapsible sections (with ball, without ball, transitions, set pieces, mistakes). Sections are all open on screens >= 860px; "open all / collapse all" on phones.
- **Team shape toggle:** "Base shape / We attack / We defend" moves the 11 dots (CSS transition, disabled under `prefers-reduced-motion`). Geometry lives in `phasePos()` (formations-content.js); `node scripts/formations_unit_test.js` checks range + no overlap for 10 formations x 3 shapes.
- **Coach mode:** formation page -> "Send the line-up to your team": optional names for the 11 slots, copy/share a link `/?fm=<formation>[:slot][&n=<names>]`. Names are url-safe base64 JSON inside the link (never sent to the site's server; max 14 chars each). Opening the link lands directly on the line-up (splash is dismissed and the first-run welcome card is skipped for that visit via `window.__ZIVO_SKIP_ONBOARDING`); the param is stripped from the address bar. Per-position links via "Link to this position".
- **Layout:** one column on phones; on desktop (>= 860px) the pitch is sticky on one side and the content scrolls beside it.
- Tests used for this round (not shipped): Playwright run on 390x844 and 1280x800 in ar + en, covering phases, sections, coach link round-trip, bad-link inputs, overflow and JS errors.

## v1230.194 — مشاركة صورة + رابط في كل مكان
- `Share.shareCard({id, go|url, title, text, card})` ينشئ بطاقة 1080×1920 (QR + رابط) ويشاركها كصورة مع رابط يفتح المكان مباشرة.
- روابط `?go=` : arcade, mindbattle, horror, puzzle, beauty, football, pitch, stories, health, time, positions (+`pos=`), challenges, contest, ai, rooms, player.
- أماكن المشاركة: الأركيد، معركة العقول، نتيجة «ما مركزك؟»، صفحة المركز، التشكيل، الدور، القصص، أبواب الصحة، المسابقة، بطاقة اللاعب، وزر «شارك الموقع» (القائمة الجانبية والتذييل).
- مع تحيات الكابتن رائف البطوش

## v1230.196 — استوديو الإعلانات (صفحة الأدمن)
- زر «افتح الاستوديو» في لوحة الأدمن (للمالك فقط) يفتح `core/modules/promo-studio.js` (تحميل كسول).
- يختار الأدمن: النوع (قصة، باب صحي، تشكيل، مركز، الموقع، المسابقة) + العنصر + اللغة (7 لغات).
- يولّد فيديو عمودياً 9:16 (≈11–20 ث): عنوان، ثلاثة مشاهد نصية، ثم دعوة + رمز QR + الرابط، مع موسيقى هادئة اختيارية.
- ينتج أيضاً نص المنشور (قابل للتعديل) مع الهاشتاغات والرابط، وصورة غلاف PNG، وزر مشاركة/تنزيل.
- يعمل كاملاً في المتصفح (Canvas + MediaRecorder + WebAudio) بلا خادم وبلا تكلفة. كروم/أندرويد/كمبيوتر ينتج MP4، وبعض المتصفحات WebM.
- يجب إبقاء التبويب ظاهراً أثناء التسجيل لأنه يُسجَّل بزمن حقيقي.
- مع تحيات الكابتن رائف البطوش

## v1230.200 — «ملعب القرار» أُعيد بناؤها
- كانت: ضغط على دائرة مضيئة بلا منطق كروي. صارت لعبة قرار حقيقية: أنت حامل الكرة، أمامك زملاء ومدافعون، وتختار التمريرة الأفضل قبل انتهاء الوقت، ثم يُشرح سبب الصواب أو الخطأ.
- المراحل الخمس (10 مستويات لكل مرحلة): الزميل الحرّ، خط التمريرة المقطوع، الأفضل للأمام، فخ التسلل، اللحظة الحاسمة (مع التسديد).
- الجواب محسوب هندسياً (مرصود، خط مقطوع، تسلل، الأكثر تقدماً، التسديد) وليس عشوائياً؛ يغطيه الاختبار `scripts/football_decision_test.js` (2000 مشهد).
- نفس محرك المستويات الخمسين والمكافآت والمشاركة، فلا شيء خارج الملف تغيّر.
- النصوص بالعربية والإنجليزية والصينية والهندية والإسبانية والفرنسية والفارسية.
- مع تحيات الكابتن رائف البطوش

## v1230.201 — إصلاح المشاركة + فحص شامل
- السبب: نافذة المشاركة (z-index 90000) كانت تُرسم خلف صفحات الغرف (2147483000) فلا تظهر في القصص وما وراء الزمن والصحة. رُفعت إلى 2147483645.
- على الكمبيوتر تُفتح نافذة ZIVOZONE مباشرة (فيسبوك، إنستغرام، يوتيوب، تيك توك، واتساب، X، تلغرام، سناب، لينكدإن، ريديت، بنترست، رسالة، بريد). إنستغرام/تيك توك/يوتيوب/سناب لا توفر مشاركة روابط من موقع، فيُنزَّل الغلاف ويُنسخ النص والرابط وتُفتح المنصة.
- على الجوال تُستخدم نافذة النظام التي تعرض التطبيقات المثبتة (إنستغرام ويوتيوب وفيسبوك إن كانت مثبتة).
- الفحص الشامل: الموقع (جانبي/تذييل)، المسابقة، القصص، الصحة، ما وراء الزمن، صفحات المراكز والتشكيلات والأدوار، نتائج الألعاب والتحدي، الدعوة، بطاقة اللاعب.
- مع تحيات الكابتن رائف البطوش
