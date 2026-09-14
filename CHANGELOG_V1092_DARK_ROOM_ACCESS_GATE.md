# ZIVOZONE V1092 — Dark Room Access Gate

## الهدف
إضافة بوابة وصول حقيقية داخل تجربة Dark Room تمنع الزائر Guest من إكمال الغرفة كاملة، مع السماح له بخوض الجزء الأول من التجربة ثم إلزامه بإنشاء حساب أو تسجيل الدخول.

## السلوك
- Guest يبدأ Dark Room بشكل طبيعي.
- بعد 5 أسئلة/اختبارات يصل إلى Access Gate.
- الجلسة تتوقف عند نقطة الوصول ولا تُعرض النهاية للزائر.
- التقدم يحفظ في `sessionStorage` داخل جلسة المتصفح: السؤال، النتيجة، الأزمنة، الإحصاءات، والأسئلة المختارة.
- بعد Firebase Authentication يتم استعادة الجلسة ومتابعتها من نفس النقطة.
- Registered users يتجاوزون بوابة الزائر ويكملون التجربة كاملة.
- زر التسجيل يستخدم نظام Auth الموجود أصلًا، ولا ينشئ نظام حساب جديد.
- زر تسجيل الدخول يفتح تبويب Login في نافذة الحساب الحالية.
- الخروج من البوابة يلغي جلسة Dark Room المؤقتة.

## الحماية
حالة المستخدم الأساسية تعتمد على Firebase Auth، وليس localStorage وحده. منع التحايل من جهة العميل هو best-effort؛ المنع القوي ضد العبث يحتاج فرض صلاحية الإكمال/النتيجة على Backend أو Cloud Functions.

## الحفاظ على البيئة
لم يتم تغيير Firebase Project ID أو Collections أو نظام Wallet/Mining/XP أو الصفحة الرئيسية. تم تعديل طبقة Dark Room وCSS الخاص بها فقط.


## V1092 FIX PASS
- Fixed stale browser/service-worker asset versioning: index assets now use V1092 cache-busting and SW cache is V1092.
- Fixed news ticker boot reliability with local fallback data and preserved separate sports/general rails.
- Dark Room audio no longer starts the continuous ambient track; it uses event-based door, footsteps, heartbeat, whispers and restrained horror laugh effects instead.
- Added phase-transition sound/visual events and stronger session atmosphere without changing the ZIVOZONE homepage or Firebase project.
