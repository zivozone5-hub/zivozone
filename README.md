## V1201 Runtime / Economy Validation

- Perfect 10/10 rewards now carry validated session evidence into Firestore claims.
- Failed reward writes remain retryable instead of being permanently marked processed.
- Guest perfect rewards preserve the validated session id across login.
- Match Center exposes versioned runtime metadata and validates 3-day snapshots.

# ZIVOZONE V1199 CLEAN CORE HARDENED

V1199 is based on V1197.6 and applies the approved cleanup, navigation-state hardening, lazy audio loading, content integrity guard, and language registry expansion.

See `docs/architecture-audit/V1199_ARCHITECTURE_AUDIT.md` for the release gates.

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


## V1185 — World Experiences
- Replaced the shared post-entry question screen with a full room-world experience.
- Each challenge has its own world map, zones, interaction modes and visual scene.
- Football has pitch/tactics/VAR/transfers/set-piece scenes; Math has reactor/geometry/probability/budget scenes; other rooms receive distinct identities.
- Cinematic entry compositions are now materially different by room type, not only image swaps.
- Perfect runs remain linked to the ZIVO reward flow (+10 ZIVO), with guest pending reward support.
- No new parallel challenge runtime was introduced; changes remain in the existing Core challenge engine.
