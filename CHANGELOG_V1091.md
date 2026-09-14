# ZIVOZONE V1091 — Dark Room & Intelligence Core

## الهدف
تطوير هندسي وتجربة Dark Room Premium فوق V1090 مع الحفاظ على بيئة التشغيل والهوية والأنظمة الحالية.

## ما تم
- تحويل دخول Dark Room إلى تجربة مستقلة متعددة المراحل داخل نفس التطبيق.
- 5 مراحل: OBSERVE / REMEMBER / DETECT / DECIDE / SURVIVE.
- شاشة دخول وتحذير وخروج آمن بدون مشاهد عنيفة أو محتوى صادم.
- HUD متجاوب للموبايل والويب.
- مؤثرات CRT/scanline/vignette/grid/glow خفيفة.
- استخدام Audio Engine الموجود في ZIVOZONE مع mute/volume واحترام تفاعل المستخدم.
- عدم كشف صحة الإجابة أثناء الجولة.
- حساب Accuracy / Reaction / Observation / Memory / Decision / Pressure / Consistency.
- DARK ROOM SCORE من 100.
- PERFECT RUN عند 10/10 بدون timeout، مع الحفاظ على عقد مكافأة ZIVO الحالي.
- إرسال `zivozone-result` مع بيانات Dark Room الموسعة للحفاظ على Player/Economy/Cloud bridges.
- حفظ نتيجة Dark Room للحساب عند تسجيل الدخول.
- تحديث Service Worker إلى V1091.
- الحفاظ على Challenge Bank وFirebase/Auth وPlayer وEconomy وPWA الموجودة.

## ما لم يتم
- لم يتم تغيير Homepage أو الهوية الأساسية.
- لم يتم تغيير Firebase project ID أو collections.
- لم تتم إعادة كتابة بقية Challenge Engine.
- لم يتم الادعاء بأن مكافآت ZIVO أصبحت Server-Authoritative؛ ذلك يحتاج Backend/Cloud Function.

## ملاحظات
V1091 هي Engineering Evolution وليست Rebuild.
