#!/usr/bin/env python3
"""Turn the V1218 health-door import into reader-facing text.

The imported markdown mixed reader-facing content with internal product-design notes
("لا نريد داخل ZIVOZONE", "هذا الباب يمكن أن يكون من أقوى أبواب الموقع", "لوحة اللاعب", spec lists ...).
This script rewrites ONLY those notes into reader-facing wording (same ideas, addressed to the reader) and
fails loudly if an expected passage is missing, so it can never silently mangle content.

Input : docs/archive/health-doors.v1218-original.json   (untouched original import)
Output: data/health/health-doors.json
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "archive" / "health-doors.v1218-original.json"
OUT = ROOT / "data" / "health" / "health-doors.json"

HEAD = re.compile(r"^#{2,4}\s", re.M)

def section(text, heading_prefix, new_block):
    """Replace the block that starts at a heading line beginning with heading_prefix, up to the next heading or '---'."""
    m = re.search(r"^#{2,4}\s*" + re.escape(heading_prefix) + r".*$", text, re.M)
    if not m:
        raise SystemExit(f"missing section: {heading_prefix!r}")
    start = m.start()
    tail = text[m.end():]
    n = re.search(r"^(#{2,4}\s|---\s*$)", tail, re.M)
    end = m.end() + (n.start() if n else len(tail))
    return text[:start] + new_block.rstrip() + "\n\n" + text[end:].lstrip("\n")

def sub(text, old, new):
    if old not in text:
        raise SystemExit(f"missing text: {old!r}")
    return text.replace(old, new, 1)

def fix(door_id, c):
    if door_id == "01":
        c = section(c, "🎮 تحدي الباب", """### 🎮 تحدي 7 ليالٍ

جرّب لمدة 7 ليالٍ أن تسجّل:

-  وقت النوم.
-  وقت الاستيقاظ.
-  مدة النوم.
-  مستوى نشاطك صباحًا.

ثم قارن بين الليالي: متى كان نومك أفضل؟ وكيف شعرت في اليوم التالي؟ هذه ملاحظات شخصية تساعدك على فهم عاداتك، وليست تشخيصًا طبيًا.""")
    elif door_id == "02":
        c = sub(c, "في الأردن تحديدًا، يجب الانتباه إلى الترطيب أثناء التدريب الصيفي.",
                "في البلدان الحارة، كما في الأردن صيفًا، يجب الانتباه إلى الترطيب أثناء التدريب.")
        c = section(c, "⚠️ ممنوعات الباب", """### ⚠️ تنبّه

-  الحميات القاسية والتجويع ووعود خسارة الوزن السريعة ليست طريقًا صحيًا.
-  المكملات ليست ضرورية للجميع.
-  الطعام لا يعالج الأمراض؛ إن كانت لديك حالة صحية فاسأل طبيبك أو اختصاصي تغذية.
-  الأطفال لا يُطبَّق عليهم نظام غذائي مبني على حميات البالغين.""")
    elif door_id == "03":
        c = sub(c, "هذا الباب يمكن أن يكون من أقوى أبواب الموقع.\n\nبدل كلمة \"رياضة\" فقط، يقسم إلى:",
                "اللياقة ليست شيئًا واحدًا؛ إنها مجموعة قدرات تعمل معًا:")
        c = sub(c, "يمكن تحويلها إلى:", "وتظهر هذه القدرات عند لاعب كرة القدم بهذه المصطلحات:")
    elif door_id == "04":
        c = section(c, "ماذا نريد من الباب؟", """### الهدف

ليس أن يقال لك:

> "وزنك مثالي."

بل أن:

> "تفهم جسمك وتتابع تغيراته بطريقة صحيحة."
""")
        c = section(c, "لوحة اللاعب", """### ماذا يفيد أن تتابع؟

-  الطول.
-  الوزن.
-  العمر.
-  BMI للبالغ عند الحاجة.
-  تغير الوزن بمرور الوقت.
-  مستوى النشاط.

مع تنبيه:

**هذه المعلومات ليست تشخيصًا طبيًا.**""")
    elif door_id == "07":
        c = sub(c, "يمكن أن يتضمن:", "العناية بالجسم تشمل:")
        c = sub(c, "يجب تعليم اللاعب:", "الأفضل أن يعتاد اللاعب على:")
    elif door_id == "08":
        c = sub(c, "يشرح الباب الفرق بين:", "من المهم التفريق بين:")
    elif door_id == "10":
        c = section(c, "الفكرة الأساسية", """### الفكرة الأساسية

لا توجد قائمة تحاليل واحدة تناسب الجميع كل سنة. الأفضل:

> **"تعرّف على الفحوصات التي قد تناسب عمرك وعوامل الخطورة لديك، واسأل طبيبك."**""")
        c = c.replace("وهذا أكثر أمانًا واحترافية.", "")
    elif door_id == "11":
        # the docx → markdown conversion glued the two header cells together and left an empty third column
        c = sub(c, "| اليومالتحدي |                  |", "| اليوم | التحدي |")
        c = re.sub(r"^\| (\d) +\| (.+?) +\|$", r"| \1 | \2 |", c, flags=re.M)
    return c

def door12():
    return """### «المعلومة الصحية تتغير… فلا تصدق كل ما تسمع»

كل يوم تصلك معلومات صحية من الأصدقاء والمنصات والإعلانات. بعضها صحيح، وبعضها نصف حقيقة، وبعضها إشاعة. المهارة الأهم أن تعرف كيف تتحقق.

### كيف تقيّم خبرًا صحيًا؟

-  **من قال ذلك؟** هل المصدر جهة صحية أو باحث أو مؤسسة معروفة، أم حساب مجهول؟
-  **متى نُشر؟** المعلومات الصحية تتحدّث؛ الخبر القديم قد لا يبقى صحيحًا.
-  **ما الدليل؟** رأي شخص أو تجربة واحدة لا تساوي دراسات جيدة على عدد كبير من الناس.
-  **هل يَعِد بنتيجة سحرية؟** «علاج لكل شيء» أو «خسارة وزن في أيام» علامة تحذير.
-  **هل يبيع لك شيئًا؟** انتبه لمن يربح من تصديقك.
-  **هل يخصّك؟** ما يناسب رياضيًا بالغًا قد لا يناسب طفلًا أو مريضًا.

### 🧠 «حقيقة أم إشاعة؟»

> "شرب الماء البارد يسبب المرض."

**الحكم:** لا يمكن تعميم هذه العبارة بهذه الصورة. نزلات البرد والإنفلونزا تسببها فيروسات لا درجة حرارة الماء. قد يزعج الماء شديد البرودة حلقًا ملتهبًا أو معدة حساسة عند بعض الناس، لكنه ليس سببًا للمرض.

> "التعرّق الكثير يعني حرق دهون أكثر."

**الحكم:** إشاعة. العرق وسيلة لتبريد الجسم، والوزن الذي يُفقد بالعرق ماء يعود بعد الشرب. المهم هو التعويض بالماء لا مطاردة العرق.

> "تمارين البطن تحرق دهون البطن فقط."

**الحكم:** إشاعة. لا يمكن اختيار مكان فقدان الدهون بتمرين يستهدفه. تقوّي التمارين العضلات، أما فقدان الدهون فيحدث في الجسم عمومًا.

> "الإحماء مضيعة للوقت."

**الحكم:** إشاعة. الإحماء يجهّز العضلات والمفاصل للجهد، وبرامج الإحماء المنظمة مثل FIFA 11+ ارتبطت بانخفاض الإصابات لدى لاعبي كرة القدم الهواة.

> "الطفل يحتاج مكملات بروتين ليصبح لاعبًا أقوى."

**الحكم:** غالبًا لا. معظم الأطفال يحصلون على حاجتهم من غذاء متوازن، ويجب ألا تُعطى المكملات للأطفال إلا بتوصية طبيب.

> "إذا شعرت بتحسن بعد ضربة على الرأس فيمكنك العودة للعب فورًا."

**الحكم:** خطأ. أي ضربة على الرأس مع أعراض تحتاج إلى تقييم طبي، والعودة إلى اللعب تكون تدريجية وبعد موافقة مختص.

---
"""

def main():
    doors = json.loads(SRC.read_text(encoding="utf-8"))
    for d in doors:
        d["content"] = door12() if d["id"] == "12" else fix(d["id"], d["content"])
        d["content"] = re.sub(r"[ \t]+\n", "\n", d["content"])      # trailing spaces from the docx export
        d["content"] = re.sub(r"\n{3,}", "\n\n", d["content"]).strip()
        d["content"] = re.sub(r"\n+---\s*$", "", d["content"]).strip() + "\n"   # drop the trailing rule left by the export
    banned = ["لا نريد", "هذا الباب يمكن", "يقسم إلى", "لوحة اللاعب", "ماذا نريد", "يجب أن يكون مختلفًا", "يسجل اللاعب", "تظهر له"]
    for d in doors:
        for b in banned:
            if b in d["content"]:
                raise SystemExit(f"door {d['id']} still contains internal note: {b!r}")
    OUT.write_text(json.dumps(doors, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(doors)} doors, {sum(len(d['content']) for d in doors)} chars")

if __name__ == "__main__":
    main()
