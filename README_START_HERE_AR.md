# ZIVOZONE — الحزمة الجاهزة

هذه الحزمة هي نسخة الرفع النهائية لمشروع ZIVOZONE.

## الحساب الإداري
- البريد: `raefalbtish@gmail.com`
- UID: `rBlzUigQ6DhgD4CK6VX3tS43PS43`

## ماذا تم تجهيزُه؟
- الموقع الكامل.
- تسجيل الدخول وإنشاء الحساب عبر Firebase Authentication.
- ملف Firestore Rules صحيح ومربوط في `firebase.json`.
- ربط المشروع تلقائيًا بالمشروع `zivozone-fc6ed` عبر `.firebaserc`.
- لوحة الإدارة والـ Admin Bootstrap عبر Cloud Functions.
- شريطي أخبار: رياضة + أخبار عامة، مع تحديث الأخبار كل ساعة عبر GitHub Actions.
- ملفات Firebase Functions جاهزة للنشر.

## إذا كان الرفع على GitHub Pages
ارفع **كل محتويات هذه الحزمة** إلى المستودع، بما فيها مجلد `.github` وملف `data/news.json`.

## إذا أردت نشر Firebase أيضًا
شغّل `DEPLOY_ZIVOZONE.bat` من Windows. سيقوم بتسجيل الدخول ثم نشر Rules وFunctions وHosting.

> ملاحظة: نشر Cloud Functions في Firebase قد يتطلب تفعيل خطة الفوترة المناسبة في مشروع Firebase. الموقع والأخبار الثابتة لا يعتمدان على Functions لتحديث الأخبار.
