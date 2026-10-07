# ZIVOZONE V1230

منصة ألعاب وتحديات ورياضة وغرف محتوى — موقع ثابت (GitHub Pages / Firebase Hosting) مع Firebase Auth + Firestore.

## البنية
- `core/` — النواة: `modules/` (الوحدات)، `modules/runtime/` (المحرك: اللغات، الألعاب، الواجهة)، `styles/`.
- `core/modules/audio.js` — نظام الصوت الوحيد (`window.ZIVOZONE_AUDIO`).
- `core/modules/rooms.js` + `core/styles/rooms.css` — غرفتا القصص والصحة.
- `data/` — `stories/index.json` + `stories/manuscripts/tale-NN.md` (12 قصة أصلية)، `health/health-doors.json`، `matches/`، `news.json`.
- `docs/archive/` — كل ما أُزيل من V1218 (لم يُحذف شيء) و`docs/release-history/` — ملاحظات الإصدارات القديمة.

## أوامر الصيانة
```bash
python3 scripts/release.py 1222.0        # يوحّد رقم الإصدار ويعيد بناء قائمة كاش الـ service worker
python3 scripts/build_content_index.py   # يعيد بناء data/stories/index.json من manuscripts/
python3 scripts/clean_health_doors.py    # يولّد health-doors.json من الأصل المؤرشف
python3 scripts/verify_site.py           # البوابة الثابتة الوحيدة (يجب أن تنجح قبل أي نشر)
python3 scripts/browser_smoke.py         # اختبار متصفح حقيقي (Playwright + Chromium)
```
بعد تعديل أي ملف JS/CSS شغّل `release.py` ثم `verify_site.py`.

## مشاكل معروفة (مهمة) — محدّثة مع V1230.13
1. **الاقتصاد (ZIVO) — لا يزال "اقتصاد تجريبي" وليس عملة حقيقية.** مكافأة الاختبار الرئيسي (quiz) محمية بشرط `perfectClaim()` في `firestore.rules` (يتطلب شكل بيانات متسق: `amount/total/correct == 10`، `policy`، `source: 'game-platform'`، `validatedSessionId`)، و**لا يمكن لأي مستخدم المطالبة بنفس المكافأة مرتين** بفضل `claimId` الحتمي داخل معاملة Firestore واحدة. لكن **لا يوجد تحقق من طرف خادم حقيقي** (لا Cloud Function) على خطة Spark المجانية — فكل حقول `validated`/`validatedSessionId` يكتبها المتصفح نفسه عبر `economy.js`. مستخدم متمرّس بإمكانه كتابة مستند مطابق للشكل المطلوب مباشرة عبر Firestore SDK من console المتصفح دون أن يلعب فعليًا. هذا قرار واعٍ وموثّق (البقاء على الخطة المجانية) وليس خطأً يحتاج إصلاحًا عاجلًا — لكن يجب معرفته قبل الإعلان عن الموقع للجمهور، خصوصًا لو أصبح لـ ZIVO/XP قيمة حقيقية قابلة للاستبدال مستقبلًا. التفاصيل الكاملة في `ZIVOZONE_SECURITY_AUDIT.md`.
2. **القصص**: 12 قصة أصلية فقط (~550–630 كلمة). القصص الـ56 القديمة (متشابهة بنسبة ~90%) في `docs/archive/templated-stories-v1218/`. أضف قصة بوضع `tale-NN.md` في `manuscripts/` بنفس تنسيق الترويسة ثم شغّل `build_content_index.py`؛ البوابة تفشل إن تكررت فقرة بين قصتين.
3. **اللغات**: الواجهة بـ7 لغات (عربي/إنجليزي/صيني/هندي/إسباني/فرنسي/فارسي)، لكن القصص والصحة عربية فقط. كذلك ~10 مفاتيح فرنسية و7 فارسية ما زالت نسخة طبق الأصل عن الإنجليزية/العربية (قيد التتبع، غير حاجبة للنشر).
4. لم يُختبر Firebase Emulator ولا نشر `firestore.rules` فعليًا على مشروع Firebase حقيقي من هذه البيئة — هذا يتطلب `firebase login` التفاعلي الذي لا يمكن تنفيذه من هنا (راجع قسم "خطوات النشر الفعلي" أدناه).

## خطوات النشر الفعلي (لازم تسويها إنت — ما بقدر أسويها من هون)
الكود جاهز وكل البوابات (14 بوابة + فحص متصفح حقيقي) ناجحة، لكن هاي الخطوة الأخيرة تحتاج صلاحياتك الشخصية على
Firebase (تسجيل دخول تفاعلي عبر المتصفح) وDNS الدومين — وهذا غير ممكن من بيئة العمل السحابية المعزولة التي
أشتغل منها (لا تسجيل دخول تفاعلي، ولا وصول شبكي لخوادم Firebase نفسها).

**المشروع موجود بالفعل** (`zivozone-fc6ed`، إعدادات Firebase الحقيقية مُدمجة في `index.html`) — فهذا ليس إعدادًا
من الصفر، فقط نشر آخر نسخة من الكود إليه. الخطوات:

1. **تثبيت أدوات Firebase** (مرة واحدة فقط على جهازك): `npm install -g firebase-tools`
2. **تسجيل الدخول** (يفتح متصفحك لتسجيل الدخول بحساب Google المرتبط بالمشروع): `firebase login`
3. **الدخول لمجلد المشروع بالضبط** (المجلد الذي فيه `index.html` و`firebase.json`، وليس مجلدًا أبًا له):
   ```bash
   cd ZIVOZONE_V1229
   firebase use zivozone-fc6ed
   ```
4. **نشر الموقع وقواعد الأمان معًا** (الأهم: تأكد قواعد Firestore الحالية منشورة فعليًا، لا يكفي نشر الموقع وحده):
   ```bash
   firebase deploy --only hosting,firestore:rules
   ```
5. **تفعيل تسجيل الدخول بالبريد وكلمة المرور** (مطلوب لعمل التسجيل بالموقع — خطوة تُفعّل مرة واحدة من كونسول
   Firebase، وليست جزءًا من الكود): Firebase Console → Authentication → Sign-in method → فعّل **Email/Password**.
6. **تأكد Firestore Database منشأة فعلًا** (Native mode) في المشروع من كونسول Firebase، إن لم تكن موجودة
   مسبقًا — بدونها ستفشل كل عمليات القراءة/الكتابة بصمت.
7. **الدومين المخصص (zivozone.com)**: ملف `CNAME` بالمشروع مُعد لـ GitHub Pages فقط. لربط الدومين بـ
   **Firebase Hosting** (المسار الأساسي لهذا المشروع) اذهب إلى Firebase Console → Hosting → Add custom domain،
   وأضف سجلات DNS التي يطلبها (عادة TXT للتحقق ثم A/AAAA) من لوحة تحكم مزود الدومين الخاص بك.
8. **(اختياري) تفعيل Google Analytics**: `measurementId` (`G-ZXW8LP39JY`) موجود مسبقًا بالكود ومربوط بموافقة
   المستخدم (consent banner) — تأكد فقط أن خاصية GA4 بهذا المعرف ما زالت نشطة بحسابك على Google Analytics.

بعد هذه الخطوات الموقع يكون منشورًا فعليًا ويمكن مشاركته كنسخة تجريبية عامة. أي تحديث لاحق للكود: كرّر خطوة 4 فقط.
