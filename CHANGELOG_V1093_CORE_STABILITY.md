# ZIVOZONE V1093 — CORE STABILITY

## الهدف
نسخة تثبيت تقنية مبنية على V1092. لا تضيف ميزات جديدة ولا تغيّر تصميم الصفحة الرئيسية.

## التغييرات
- إصلاح منطق سجل التعدين ليعتمد على نافذة 24 ساعة بدل اسم مرتبط بيوم التقويم UTC.
- إضافة هامش أمان 15 ثانية إلى `nextMiningAt` لتجنب رفض Firestore للمعاملة بسبب فرق التوقيت بين ساعة العميل و`request.time`.
- تحديث علامات الاقتصاد إلى V1093.
- تحديث cache-busting في `index.html` وService Worker إلى V1093.
- إضافة `ZIVOZONE_CORE_VERSION` كمؤشر إصدار موحد.
- إضافة مراقب محدود لنطاق شريطي الأخبار فقط، بحيث يعيد التنظيف وحساب السرعة عند حقن الأخبار ديناميكيًا، بدون مراقبة كامل DOM.
- إضافة `ZIVOZONE_CORE_DIAGNOSTICS()` لإعطاء لقطة QA خفيفة عن Auth/Firebase/News/Challenges/Wallet/Dark Room.

## ما لم يتغير
- الصفحة الرئيسية وتصميمها الأساسي.
- بنوك الأسئلة.
- تجربة Dark Room V1092.
- نظام اللغات.
- Firebase configuration.
- Firestore rules.

## QA أولي
- `node --check zivo-scripts.bundle.js` — PASS
- `node --check zivo-ai.js` — PASS
- `python -m py_compile scripts/fetch_news.py` — PASS

## الخطوة التالية
V1094 CLEAN CORE: فصل الخدمات الأساسية وإزالة التكرار تدريجيًا بدون تغيير السلوك المرئي.
