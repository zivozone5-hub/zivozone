# ZIVOZONE V1163 — PLAYER HOME CORE

## الهدف
استبدال نظام ZIVO HUB / رحلة اللاعب القديم بالكامل بنظام واحد يمثل بيت المستخدم واللاعب داخل ZIVOZONE.

## البنية
Player Home Core يقرأ من الخدمات الحالية ولا ينشئ مخزن تقدم موازٍ:

Auth → Player → Economy → Missions / Daily / Competition / Achievements → Sports → Events → Player Home

## الارتباطات
- الهوية والحساب
- XP / Level
- ZIVO / Wallet
- Mining
- Challenges
- Daily Challenge
- Missions
- Competition / Streak
- Achievements
- Sports / Live matches
- Identity
- ZIVO AI
- Profile
- Event activity

## قواعد هندسية
- لا Legacy Hub runtime.
- لا نسخة ثانية من player state.
- لا بيانات تقدم وهمية.
- لا مكافآت تُحتسب من الواجهة.
- Player Home يعرض ما تملكه الـCore modules الحالية.
- تحديث Event-driven + refresh دوري خفيف.
- Mobile-first.

## ملاحظة
الواجهة تستخدم حالة الخدمات الحالية؛ إذا كانت خدمة بعينها محلية أو غير متصلة بالسحابة، يظهر ذلك للمستخدم بدل ادعاء اتصال غير موجود.
