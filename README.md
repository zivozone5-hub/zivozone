# ZIVOZONE V1180 — Canonical Maintenance Core

نسخة صيانة شاملة مبنية على نواة واحدة لكل نطاق وظيفي، مع إزالة الملفات غير المستخدمة، وتوحيد مسار رحلة اللاعب، وتحسين التخزين المؤقت، وحماية بيانات مركز المباريات من الاستبدال ببيانات فارغة.

- العربية هي الواجهة الافتراضية.
- الاستضافة متوافقة مع Firebase Spark / GitHub Pages.
- البريد الإداري الرسمي: raefalbt@gmail.com
- Player Home هو المالك الوحيد لرحلة اللاعب.
- Forensic Core هو المالك الوحيد للمختبر الجنائي.
- Match Center يعتمد على بيانات محفوظة + تحديث مباشر، ولا ينشر لقطة فارغة فوق آخر لقطة ناجحة.


## V1181 ENGINE REBUILD
- Dark Room now uses the same canonical cinematic entry engine as the Forensic Lab, with Dark Room-specific copy and atmosphere.
- Every active challenge/room has a confirmed exit flow and returns directly to `#home`.
- Escape also invokes the same confirmation instead of silently terminating a session.
- Match Center score rendering is direction-safe (`dir=ltr`) and result wording is derived from the actual home/away scores, never from Arabic translation.
- Team names are marked `translate=no` to prevent browser translation from altering club names.
- No new runtime layer or parallel challenge engine was introduced; the existing Core modules were repaired in place.
