# ZIVOZONE V1220

منصة ألعاب وتحديات ورياضة وغرف محتوى — موقع ثابت (GitHub Pages / Firebase Hosting) مع Firebase Auth + Firestore.

## البنية
- `core/` — النواة: `modules/` (الوحدات)، `modules/runtime/` (المحرك: اللغات، الألعاب، الواجهة)، `styles/`.
- `core/modules/audio.js` — نظام الصوت الوحيد (`window.ZIVOZONE_AUDIO`).
- `core/modules/rooms.js` + `core/styles/rooms.css` — غرفتا القصص والصحة.
- `data/` — `stories/index.json` + `stories/manuscripts/tale-NN.md` (6 قصص أصلية)، `health/health-doors.json`، `matches/`، `news.json`.
- `docs/archive/` — كل ما أُزيل من V1218 (لم يُحذف شيء) و`docs/release-history/` — ملاحظات الإصدارات القديمة.

## أوامر الصيانة
```bash
python3 scripts/release.py 1220.0        # يوحّد رقم الإصدار ويعيد بناء قائمة كاش الـ service worker
python3 scripts/build_content_index.py   # يعيد بناء data/stories/index.json من manuscripts/
python3 scripts/clean_health_doors.py    # يولّد health-doors.json من الأصل المؤرشف
python3 scripts/verify_site.py           # البوابة الثابتة الوحيدة (يجب أن تنجح قبل أي نشر)
python3 scripts/browser_smoke.py         # اختبار متصفح حقيقي (Playwright + Chromium)
```
بعد تعديل أي ملف JS/CSS شغّل `release.py` ثم `verify_site.py`.

## مشاكل معروفة (مهمة)
1. **الاقتصاد (ZIVO)**: قواعد Firestore تعتمد على حقول يكتبها المتصفح نفسه، فيمكن لمستخدم مسجّل تزوير مكافأة. لا يصلح كعملة/رمز حقيقي قبل نقل المنح إلى الخادم (Cloud Function أو Worker) والتحقق من جلسة اللعب هناك.
2. **القصص**: 6 قصص أصلية فقط (~550–630 كلمة). القصص الـ56 القديمة (متشابهة بنسبة ~90%) في `docs/archive/templated-stories-v1218/`. أضف قصة بوضع `tale-NN.md` في `manuscripts/` بنفس تنسيق الترويسة ثم شغّل `build_content_index.py`؛ البوابة تفشل إن تكررت فقرة بين قصتين.
3. **اللغات**: الواجهة بـ7 لغات، لكن القصص والصحة عربية فقط.
4. لم يُختبر Firebase Emulator ولا قواعد Firestore الجديدة (`publicChatPresence`) في هذه البيئة.
