# ZIVOZONE V1158 — مركز المباريات العربي

## الفصل المعماري

- `Update ZIVOZONE News` = الأخبار فقط.
- `ZIVOZONE — تحديث مركز المباريات` = المباريات فقط.
- بيانات الأخبار في `data/news.json`.
- بيانات المباريات في `data/matches/`.
- لا يوجد اعتماد على Firebase Functions.
- لا توجد خدمة مدفوعة.

## Match Core

المسار:

`TheSportsDB discovery + ESPN enrichment -> normalizer -> JSON store -> Arabic UI`

المتصفح يقرأ ملفات `data/matches/*.json` أولًا. يوجد اتصال مجاني مباشر احتياطي مع TheSportsDB فقط عند الحاجة؛ لا يتم الاتصال بـ ESPN من المتصفح.

## الأيام

المزامنة تنشئ 7 أيام سابقة + اليوم + 7 أيام قادمة، بتوقيت `Asia/Amman`.

## البطولات

قائمة البطولات في الواجهة تُبنى من البيانات الفعلية المحملة، مع كتالوج ESPN موسع للإثراء. لا يتم عرض بطولة فارغة على أنها متاحة.

## GitHub Actions

`matches-update.yml` يعمل:

- عند Push إلى `main` باستثناء تغييرات `data/matches/**` لتجنب الحلقة اللانهائية.
- كل 15 دقيقة.
- يدويًا من Actions.

بعد رفع محتويات النسخة إلى جذر المستودع، يجب أن يظهر:

**ZIVOZONE — تحديث مركز المباريات**

ويبقى:

**Update ZIVOZONE News**

للأخبار.


## V1160 replacement note
This file is retained as historical documentation; V1160 replaces the previous Match Center UI and runtime rather than layering over it.
