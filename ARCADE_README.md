# ZIVO ARCADE — ساحة الألعاب (V1230.183)

## ما الذي أُنجز
- قسم مستقل خارج الغرف: بطاقة بارزة في الرئيسية (قبل قسم الغرف) + عنصر «ساحة الألعاب» في القائمة الجانبية. يُحمَّل كسولاً (لا يزيد وزن الصفحة).
- الألعاب الست: خزنة الذاكرة، سباق المعادلات، هدف وسط الضوضاء، مرآة الشكل، مختبر الكلمات، المخرج الخفي.
- **30 مستوى لكل لعبة** في 3 مراحل (مبتدئ 1-10، متقدم 11-20، خبير 21-30). كل لعبة كانت 10 مستويات؛ الآن تُقسَّم نفس منحنى صعوبتها المجرَّب على 30 خطوة أصغر (لم أتجاوز مستوى 10 القديم لأن بعض المنحنيات تصبح مستحيلة بعده، مثل فرق اللون في «مرآة الشكل»).
- محتوى جديد: لغز المخرج الخفي ومختبر الكلمات كان 5 عناصر فقط؛ صارت **30 لغزاً و30 جملة بالعربية والإنجليزية** (الجمل مرتبة من القصيرة إلى الطويلة). مهلة مختبر الكلمات تتناسب مع عدد الكلمات.
- إصلاحات في اللعبتين: الكلمات/الرموز كانت تتراكب عشوائياً فتصير بعضها غير قابلة للضغط؛ الآن توضع دون تراكب، وخط الكلمات أكبر في الساحة.
- الاقتصاد: XP فقط عبر `Player.addXP` الموجود: 4 / 7 / 11 لكل مستوى حسب المرحلة، +60 عند إنهاء الـ30 (مرة يومياً)، **سقف 300 XP لكل لعبة في اليوم** (يمنع تكرار مستوى لجمع النقاط). لا ZIVO ولا محفظة (قواعد Firestore تمنعها من المتصفح).
- أفضل مستوى/نتيجة لكل لعبة محفوظة محلياً، ومتصدرون لكل لعبة (`arcadeBoards`) للمسجلين.
- في الغرف: لم أغيّر سلوك اللعبة المصغرة القديمة (10 مستويات) — نفس المحرك بوسائط اختيارية.

## الملفات
**جديدة**: `core/modules/arcade-games.js` · `core/styles/arcade-games.css` · `assets/rooms/arcade.svg` · `assets/banners/arcade.webp` · `scripts/arcade_unit_test.js` · `scripts/arcade_e2e_test.py` · هذا الملف.
**معدَّلة**: `core/modules/challenges.js` (`startMiniGame(opts)` + `startArcade`، وضع 30 مستوى، إصلاح التراكب) · `core/modules/minigame-content.js` (محتوى) · `core/modules/runtime/{room-loader,exit-guard,app-shell,i18n}.js` (31 مفتاحاً × 7 لغات) · `scripts/build_bundle.py` · `index.html` · `core/styles/index.css` · `firestore.rules` · `data/changelog.json`.

## النشر
1. ارفع الموقع. 2. `firebase deploy --only firestore:rules` (بدونه تعمل الألعاب والـXP محلياً لكن بلا متصدرين).

## الاختبار الفعلي (ما جرى وما لم يجرِ)
- **وحدات (node)**: اقتصاد الساحة 7/7؛ محتوى الألغاز/الجمل: 30 عنصراً مميزاً في ar وen بلا تكرار ولا إجابة داخل المشتتات.
- **متصفح (Playwright، سطح مكتب + موبايل، ar وen)** لكل من الألعاب الست: القائمة (6 بطاقات)، رسم كل مستوى من 1 إلى 30 (لا مستوى فارغ)، اجتياز 30 مستوى فعلياً بانتقالات حقيقية → شاشة نهائية، **280 XP بالضبط** (220 + 60) = ضمن السقف، حفظ أفضل مستوى 30 ونتيجة 4650، ثلاث خسارات → شاشة النتيجة، وخسارة بانتهاء الوقت الفعلي، وإغلاق كل شيء بزر الرجوع، بلا تمرير أفقي ولا أخطاء JS.
- **ملاحظة صريحة**: الاجتياز اختُبر عبر خطاف اختبار (`zivo_arcade_debug`) يفوز بالمستوى برمجياً. **لم ألعب** كل مستوى كإنسان، فصلاحية الفوز بالمستويات العليا يدوياً (خصوصاً مرآة الشكل وهدف وسط الضوضاء) مبنية على كون منحنى الصعوبة لا يتجاوز مستوى 10 القديم، وليست مُثبتة باختبار بشري.
- **لم يُختبر**: Firebase حقيقي (المتصدرون/القواعد)، ولا اللعبة القديمة داخل العالم في المتصفح (التغيير فيها اختياري بالوسائط؛ حاولت فتحها آلياً ولم أفلح فلم أحسبها اختباراً).
- محتوى الألغاز/الجمل بـ30 عنصراً للعربية والإنجليزية فقط؛ zh/hi/es/fr/fa ما زالت 5 عناصر (تتكرر).
- البوابات (17 + إضافية): ALL GATES PASSED.

## V1230.184 — visual redesign
- Menu restyled after the owner's mock-up: chamfered neon cards per game (`--h` hue), per-game art in `assets/arcade/art-*.webp`, hex buttons, single progress bar with stage ticks, footer strip (`arcFoot`).
- Home strip card image replaced (`assets/banners/arcade.webp`, six-game composite).
- Entry splash = owner key-art (`assets/arcade/entry-hero*.webp`); a transparent real button sits over the baked "ادخل" button (stage emulates object-fit:cover); non-Arabic languages get a live label. The baked title/tagline remain Arabic/English art.
- Gameplay logic, economy and rules untouched.

## V1230.185 — 50 levels, guest limit, ZIVO
- 50 levels per game, 5 stages of 10. Levels 1-10 need no account; at level 10 a guest's run ends with a sign-in button, and 11-50 require login. A signed-in player starts at the start of their highest stage; one heart is refilled at every 10th level.
- Difficulty: each game's tested 1..10 curve is climbed over levels 1-40; levels 41-50 keep the hardest geometry and shrink every countdown by up to 20% (PRESS in challenges.js). Memory Vault has no countdown: its difficulty is sequence length/speed only.
- XP: 4/7/11/15/20 per level by stage, +100 for all 50, cap 500/game/day (XP only counts for signed-in players above 10, since guests stop there).
- ZIVO (first clear only, signed-in): 0.25 (11-30), 0.5 (31-49), 1 (50); client cap 2 ZIVO/game/day; at most 15.5 per game (93 for all six) ever. Type `arcade_level_reward`, claimId `arcade_<game>_<level>`; added to economy.js and firestore.rules (amount + claimId pattern per tier). Amounts are binary-exact because the wallet rule compares with `==`.
- DEPLOY: firestore.rules changed — publish the rules or ZIVO claims for the new type will be rejected.
- Not proven: run is client-side, so rules bound but cannot prove a fair run. Rules not executed against the Firestore emulator here.
