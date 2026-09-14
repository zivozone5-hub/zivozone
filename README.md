# ZIVOZONE

**Current baseline under development: V1093 CORE STABILITY**

منصة ترفيهية تفاعلية (IQ Tests، Horror Room، تحديات يومية، Who am I، قسم رياضي، نظام XP/ZIVO Coin) مبنية بـ HTML/CSS/JS ومتصلة بـ Firebase (Auth, Firestore, App Check).

- **الموقع الحي:** https://www.zivozone.com
- **سجل التحديثات الكامل (تاريخي):** [`docs/changelog/`](docs/changelog/CHANGELOG.md)

## هيكل الملفات
- `index.html` — الصفحة الرئيسية وترتيب تحميل كل الطبقات
- `styles.css` — التنسيق الأساسي
- `zivo-v103-pro.css/js` … `zivo-v1081-player.css/js` — طبقات تطوير متتالية (مرشحة للدمج، راجع `docs/changelog`)
- `zivozone-runtime.js` — المحرك الرئيسي للتحديات والاقتصاد
- `zivo-global-core.js`, `zivo-ai.js` — وحدات مساعدة
- `assets/` — صور، أصوات، أيقونات
- `data/`, `scripts/` — بيانات الأخبار وسكربت الجلب
- `firebase.json`, `firestore.rules`, `.firebaserc` — إعدادات Firebase

## ملاحظة تقنية
هذا المشروع يحتوي طبقات CSS/JS متعددة متراكمة فوق بعض بدل دمجها بملف واحد. ابتداءً من V1093 يتم تثبيت الوظائف أولًا، ثم تنظيف الـCore تدريجيًا بدون تغيير الشكل أو السلوك المرئي إلا عند إصلاح خلل.
