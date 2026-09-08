/* ============================================================
   ZIVOZONE CHALLENGE BANK
   ============================================================

   NORMAL CHALLENGES
   - 10 questions
   - Difficulty 1 → 10

   HORROR
   - 30 questions
   - Difficulty 1 → 30
   - Phase 1: 1–10
   - Phase 2: 11–20
   - Phase 3: 21–30 EXTREME

   ============================================================ */

(function () {

    "use strict";


    /* ============================================================
       HELPERS
    ============================================================ */

    function answer(text, correct) {

        return {
            text: text,
            correct: correct
        };

    }


    function question(
        q,
        answers,
        difficulty
    ) {

        return {
            q: q,
            difficulty: difficulty,
            answers: answers
        };

    }


    /* ============================================================
       MAIN BANK
    ============================================================ */

    window.ZIVOZONE_CHALLENGES = {


        /* ========================================================
           IQ
        ======================================================== */

        iq: {

            id: "iq",

            type: "normal",

            title: "اختبار سرعة الذكاء",

            description:
                "اختبر سرعة تفكيرك ومنطقك تحت الضغط.",

            icon: "🧠",

            xp: 50,

            questions: [

                question(
                    "ما العدد التالي: 2، 4، 6، 8، ؟",
                    [
                        answer("9", false),
                        answer("10", true),
                        answer("11", false),
                        answer("12", false)
                    ],
                    1
                ),

                question(
                    "إذا كان لديك 3 تفاحات وأخذت تفاحتين، كم تفاحة أصبحت تملك؟",
                    [
                        answer("واحدة", false),
                        answer("اثنتان", true),
                        answer("ثلاث", false),
                        answer("خمس", false)
                    ],
                    2
                ),

                question(
                    "أي كلمة لا تنتمي إلى المجموعة؟",
                    [
                        answer("سيارة", false),
                        answer("حافلة", false),
                        answer("قطار", false),
                        answer("تفاحة", true)
                    ],
                    3
                ),

                question(
                    "إذا كان جميع اللاعبين رياضيين، وبعض الرياضيين مدربين، فهل جميع اللاعبين مدربين؟",
                    [
                        answer("نعم دائمًا", false),
                        answer("لا يمكن الاستنتاج", true),
                        answer("نعم إذا كانوا محترفين", false),
                        answer("فقط بعضهم", false)
                    ],
                    4
                ),

                question(
                    "ما العدد المفقود: 3، 6، 12، 24، ؟",
                    [
                        answer("36", false),
                        answer("42", false),
                        answer("48", true),
                        answer("50", false)
                    ],
                    5
                ),

                question(
                    "إذا كانت الساعة تشير إلى 3:00، فما الزاوية بين العقربين؟",
                    [
                        answer("30 درجة", false),
                        answer("60 درجة", false),
                        answer("90 درجة", true),
                        answer("180 درجة", false)
                    ],
                    6
                ),

                question(
                    "رجل لديه 4 بنات، ولكل بنت أخ واحد. كم عدد الأبناء؟",
                    [
                        answer("4", false),
                        answer("5", true),
                        answer("8", false),
                        answer("9", false)
                    ],
                    7
                ),

                question(
                    "إذا كان A أكبر من B، وB أكبر من C، فأي عبارة صحيحة؟",
                    [
                        answer("C أكبر من A", false),
                        answer("A أكبر من C", true),
                        answer("A يساوي C", false),
                        answer("لا يمكن معرفة شيء", false)
                    ],
                    8
                ),

                question(
                    "ما العدد الذي يكمل النمط: 1، 1، 2، 3، 5، 8، ؟",
                    [
                        answer("11", false),
                        answer("12", false),
                        answer("13", true),
                        answer("15", false)
                    ],
                    9
                ),

                question(
                    "إذا كان كل ZIVO لاعبًا ذكيًا، وبعض اللاعبين الأذكياء سريعون، فما النتيجة المنطقية المؤكدة؟",
                    [
                        answer("كل ZIVO سريعون", false),
                        answer("بعض ZIVO قد يكونون سريعين", true),
                        answer("لا يوجد ZIVO سريع", false),
                        answer("كل السريعين ZIVO", false)
                    ],
                    10
                )

            ]

        },


        /* ========================================================
           SCIENCE
        ======================================================== */

        science: {

            id: "science",

            type: "normal",

            title: "تحدي العلوم",

            description:
                "معلومات علمية متدرجة وممتعة.",

            icon: "🔬",

            xp: 60,

            questions: [

                question(
                    "ما الكوكب المعروف بالكوكب الأحمر؟",
                    [
                        answer("المريخ", true),
                        answer("الزهرة", false),
                        answer("عطارد", false),
                        answer("المشتري", false)
                    ],
                    1
                ),

                question(
                    "ما الغاز الذي يحتاجه الإنسان للتنفس؟",
                    [
                        answer("الأكسجين", true),
                        answer("الهيدروجين", false),
                        answer("الهيليوم", false),
                        answer("النيتروجين فقط", false)
                    ],
                    2
                ),

                question(
                    "ما العضو الذي يضخ الدم في جسم الإنسان؟",
                    [
                        answer("الرئة", false),
                        answer("الكبد", false),
                        answer("القلب", true),
                        answer("المعدة", false)
                    ],
                    3
                ),

                question(
                    "ما وحدة قياس القوة؟",
                    [
                        answer("جول", false),
                        answer("نيوتن", true),
                        answer("واط", false),
                        answer("فولت", false)
                    ],
                    4
                ),

                question(
                    "أي جزء من الخلية يحتوي غالبًا على المادة الوراثية؟",
                    [
                        answer("النواة", true),
                        answer("الغشاء", false),
                        answer("السيتوبلازم", false),
                        answer("الجدار فقط", false)
                    ],
                    5
                ),

                question(
                    "ما سرعة الضوء تقريبًا في الفراغ؟",
                    [
                        answer("30 ألف كم/ث", false),
                        answer("300 ألف كم/ث", true),
                        answer("3 ملايين كم/ث", false),
                        answer("3000 كم/ث", false)
                    ],
                    6
                ),

                question(
                    "ما القوة التي تجذب الأجسام نحو الأرض؟",
                    [
                        answer("المغناطيسية", false),
                        answer("الاحتكاك", false),
                        answer("الجاذبية", true),
                        answer("الطفو", false)
                    ],
                    7
                ),

                question(
                    "أي جزيء يحمل المعلومات الوراثية الأساسية؟",
                    [
                        answer("DNA", true),
                        answer("ATP", false),
                        answer("CO2", false),
                        answer("H2O", false)
                    ],
                    8
                ),

                question(
                    "أي طبقة من الغلاف الجوي تحتوي على معظم الأوزون؟",
                    [
                        answer("التروبوسفير", false),
                        answer("الستراتوسفير", true),
                        answer("الميزوسفير", false),
                        answer("الإكسوسفير", false)
                    ],
                    9
                ),

                question(
                    "ما المبدأ الذي ينص على أن الطاقة لا تفنى ولا تستحدث من العدم؟",
                    [
                        answer("قانون حفظ الطاقة", true),
                        answer("قانون بويل", false),
                        answer("مبدأ باسكال", false),
                        answer("قانون أوم", false)
                    ],
                    10
                )

            ]

        },


        /* ========================================================
           DAILY
        ======================================================== */

        daily: {

            id: "daily",

            type: "normal",

            title: "تحدي ZIVO اليومي",

            description:
                "تحدٍ يومي يمنحك سببًا للعودة.",

            icon: "⚡",

            xp: 30,

            questions: [

                question(
                    "كم عدد أيام الأسبوع؟",
                    [
                        answer("5", false),
                        answer("6", false),
                        answer("7", true),
                        answer("8", false)
                    ],
                    1
                ),

                question(
                    "ما عاصمة الأردن؟",
                    [
                        answer("عمّان", true),
                        answer("إربد", false),
                        answer("الزرقاء", false),
                        answer("العقبة", false)
                    ],
                    2
                ),

                question(
                    "كم دقيقة في الساعة؟",
                    [
                        answer("30", false),
                        answer("45", false),
                        answer("60", true),
                        answer("90", false)
                    ],
                    3
                ),

                question(
                    "ما أكبر محيط على الأرض؟",
                    [
                        answer("الأطلسي", false),
                        answer("الهندي", false),
                        answer("الهادئ", true),
                        answer("المتجمد الشمالي", false)
                    ],
                    4
                ),

                question(
                    "أي رياضة تستخدم فيها كرة مستديرة ومرميان؟",
                    [
                        answer("كرة القدم", true),
                        answer("التنس", false),
                        answer("الجولف", false),
                        answer("السباحة", false)
                    ],
                    5
                ),

                question(
                    "كم ضلعًا للمثلث؟",
                    [
                        answer("2", false),
                        answer("3", true),
                        answer("4", false),
                        answer("5", false)
                    ],
                    6
                ),

                question(
                    "ما المعدن السائل في درجة حرارة الغرفة؟",
                    [
                        answer("الحديد", false),
                        answer("النحاس", false),
                        answer("الزئبق", true),
                        answer("الذهب", false)
                    ],
                    7
                ),

                question(
                    "ما الكوكب الأكبر في المجموعة الشمسية؟",
                    [
                        answer("الأرض", false),
                        answer("المشتري", true),
                        answer("زحل", false),
                        answer("نبتون", false)
                    ],
                    8
                ),

                question(
                    "إذا كان لديك 100 نقطة وخسرت 37 نقطة، كم بقي؟",
                    [
                        answer("53", false),
                        answer("63", true),
                        answer("67", false),
                        answer("73", false)
                    ],
                    9
                ),

                question(
                    "ما الشيء الذي كلما أخذت منه كبر؟",
                    [
                        answer("المال", false),
                        answer("الحفرة", true),
                        answer("الكتاب", false),
                        answer("الماء", false)
                    ],
                    10
                )

            ]

        },


        /* ========================================================
           PSYCHOLOGICAL HORROR
        ======================================================== */

        horror: {

            id: "horror",

            type: "special",

            special: true,

            title: "الغرفة المظلمة",

            description:
                "30 مرحلة. كلما تقدمت، أصبح الخروج أصعب.",

            icon: "👁️",

            xp: 150,

            phases: {

                phase1: {
                    from: 1,
                    to: 10,
                    name: "البداية"
                },

                phase2: {
                    from: 11,
                    to: 20,
                    name: "الحارس"
                },

                phase3: {
                    from: 21,
                    to: 30,
                    name: "لا تنظر خلفك"
                }

            },

            guardianMessages: [

                "أنت دخلت فقط... لماذا لا تخرج؟",

                "أنا أراك.",

                "السؤال التالي ليس كما يبدو.",

                "لقد وصلت أبعد مما توقعت.",

                "لا تحاول تخمين ما أريد.",

                "بقي القليل.",

                "أنت تعرف أنني هنا.",

                "آخر ثلاث مراحل... لا تخطئ."

            ],

            questions: [

                /* ==========================
                   PHASE 1
                ========================== */

                question(
                    "أنت في غرفة مظلمة. أمامك بابان. أيهما تختار؟",
                    [
                        answer("الباب الذي يحمل ضوءًا خافتًا", true),
                        answer("الباب المغلق تمامًا", false),
                        answer("أكسر الجدار", false),
                        answer("أنتظر", false)
                    ],
                    1
                ),

                question(
                    "تسمع طرقًا واحدًا خلفك. ماذا تفعل؟",
                    [
                        answer("ألتفت فورًا", false),
                        answer("أكمل طريقي", true),
                        answer("أصرخ", false),
                        answer("أغلق عيني", false)
                    ],
                    2
                ),

                question(
                    "وجدت مفتاحًا على الأرض، لكن لا يوجد باب أمامك. ماذا يعني ذلك؟",
                    [
                        answer("لا شيء مؤكد", true),
                        answer("هناك باب خلفك بالتأكيد", false),
                        answer("المفتاح مزيف", false),
                        answer("يجب أن أكسره", false)
                    ],
                    3
                ),

                question(
                    "يظهر رقم 4 على الحائط ثم يختفي. ما أفضل تصرف؟",
                    [
                        answer("أعتبره معلومة وأواصل", true),
                        answer("ألمس الحائط", false),
                        answer("أبحث عن الرقم", false),
                        answer("أغلق اللعبة", false)
                    ],
                    4
                ),

                question(
                    "أمامك مرآة، لكن انعكاسك لا يتحرك. ماذا تفعل؟",
                    [
                        answer("أقترب منها", false),
                        answer("ألمسها", false),
                        answer("أبتعد عنها", true),
                        answer("أحطمها فورًا", false)
                    ],
                    5
                ),

                question(
                    "تسمع صوتًا يقول: لا تتحرك. ماذا تفعل؟",
                    [
                        answer("أتحرك بسرعة", false),
                        answer("أتوقف وأراقب", true),
                        answer("أصرخ", false),
                        answer("أبحث عن الصوت", false)
                    ],
                    6
                ),

                question(
                    "ظهر ظل بجانبك، لكنه لا يملك مصدرًا واضحًا. ما الاستنتاج الصحيح؟",
                    [
                        answer("هناك شخص بالتأكيد", false),
                        answer("هناك ضوء بالتأكيد", false),
                        answer("لا يمكن الجزم بالسبب", true),
                        answer("الظل حقيقي", false)
                    ],
                    7
                ),

                question(
                    "وجدت ورقة مكتوب عليها: أنت لست وحدك. ما الذي تعرفه يقينًا؟",
                    [
                        answer("يوجد شخص معك", false),
                        answer("الرسالة صحيحة", false),
                        answer("لا نعرف من كتبها أو ماذا تعني", true),
                        answer("الحارس كتبها", false)
                    ],
                    8
                ),

                question(
                    "باب الغرفة مفتوح، لكنك سمعت صوت قفل. ماذا تعتمد عليه؟",
                    [
                        answer("الخوف", false),
                        answer("الصوت فقط", false),
                        answer("الملاحظة المباشرة", true),
                        answer("التخمين", false)
                    ],
                    9
                ),

                question(
                    "آخر شيء تراه قبل انطفاء الضوء هو ابتسامة في المرآة. ما القرار الأكثر عقلانية؟",
                    [
                        answer("أقترب", false),
                        answer("أبقى في مكان واضح وآمن", true),
                        answer("أكسر المرآة فورًا", false),
                        answer("أغمض عيني وأركض", false)
                    ],
                    10
                ),


                /* ==========================
                   PHASE 2
                   THE GUARDIAN
                ========================== */

                question(
                    "يقول الحارس: أنا خلفك. دون أن تلتفت، كيف تعرف أنه صادق؟",
                    [
                        answer("لا أستطيع التأكد", true),
                        answer("لأنه قال ذلك", false),
                        answer("لأنني أشعر به", false),
                        answer("لأن الظلام دليل", false)
                    ],
                    11
                ),

                question(
                    "يقول الحارس: اختر الباب الذي لم تنظر إليه. ماذا تفعل؟",
                    [
                        answer("أختار عشوائيًا", true),
                        answer("أختار الباب الأحمر", false),
                        answer("أختار الباب الأكبر", false),
                        answer("أرفض لأنني أعرف أنه فخ", false)
                    ],
                    12
                ),

                question(
                    "على الحائط جملة: لا تثق بالحارس. ثم يقول الحارس: لا تثق بالحائط. ما المشكلة؟",
                    [
                        answer("كلاهما قد يكون مضللًا", true),
                        answer("الحارس صادق", false),
                        answer("الحائط صادق", false),
                        answer("لا يوجد أي تناقض", false)
                    ],
                    13
                ),

                question(
                    "يخبرك الحارس أن الوقت توقف. الساعة أمامك تتحرك. ما الدليل الأقوى؟",
                    [
                        answer("كلام الحارس", false),
                        answer("الساعة وحدها تثبت أن عقاربها تتحرك", true),
                        answer("الخوف", false),
                        answer("الصوت", false)
                    ],
                    14
                ),

                question(
                    "يقول الحارس: إذا أجبت صحيحًا سأقترب. هل يجب أن تختار إجابة خاطئة؟",
                    [
                        answer("ليس بالضرورة، لأن كلامه قد يكون خدعة", true),
                        answer("نعم دائمًا", false),
                        answer("لا دائمًا", false),
                        answer("أغلق عيني", false)
                    ],
                    15
                ),

                question(
                    "يظهر أمامك خياران: الحقيقة أو النجاة. ماذا تختار؟",
                    [
                        answer("الحقيقة", true),
                        answer("النجاة", false),
                        answer("كلاهما", false),
                        answer("لا شيء", false)
                    ],
                    16
                ),

                question(
                    "الحارس يكرر إجابتك قبل أن تختارها. ماذا يعني ذلك؟",
                    [
                        answer("قد يكون يحاول التأثير عليك", true),
                        answer("يعرف المستقبل يقينًا", false),
                        answer("هو أنت", false),
                        answer("الإجابة خاطئة", false)
                    ],
                    17
                ),

                question(
                    "تظهر أمامك ثلاث ظلال بينما ترى شخصًا واحدًا فقط. ما الاستنتاج الأكثر حذرًا؟",
                    [
                        answer("هناك ثلاثة أشخاص", false),
                        answer("الضوء قد يصنع أكثر من ظل", true),
                        answer("الحارس استنسخ نفسه", false),
                        answer("الظلال كائنات", false)
                    ],
                    18
                ),

                question(
                    "الحارس يقول: السؤال التالي لا توجد له إجابة صحيحة. ماذا تفعل؟",
                    [
                        answer("أقيّم السؤال بدل تصديق العبارة", true),
                        answer("أستسلم", false),
                        answer("أختار أول إجابة", false),
                        answer("أبحث عن الحارس", false)
                    ],
                    19
                ),

                question(
                    "قبل المرحلة التالية تسمع صوتًا يقول اسمك. ما الحقيقة الوحيدة المؤكدة؟",
                    [
                        answer("شخص يعرف اسمك", false),
                        answer("الصوت قال اسمك", true),
                        answer("الحارس بجانبك", false),
                        answer("أنت في خطر", false)
                    ],
                    20
                ),


                /* ==========================
                   PHASE 3
                   EXTREME
                ========================== */

                question(
                    "يقول الحارس: إذا اخترت الإجابة الصحيحة ستخسر. هل العبارة كافية لتغيير منطق السؤال؟",
                    [
                        answer("لا، يجب فصل التهديد عن صحة الإجابة", true),
                        answer("نعم", false),
                        answer("بالتأكيد سأخطئ", false),
                        answer("لا توجد إجابة", false)
                    ],
                    21
                ),

                question(
                    "توجد أربعة أبواب. الحارس يعرف الباب الصحيح، لكنه يقول: اختر عكس ما سأقوله. ماذا تعرف؟",
                    [
                        answer("لا يمكن ضمان الباب الصحيح من كلامه", true),
                        answer("الباب الذي يقوله خاطئ", false),
                        answer("عكس كلامه صحيح", false),
                        answer("الحارس لا يعرف", false)
                    ],
                    22
                ),

                question(
                    "تظهر رسالة: لا تثق بهذه الرسالة. كيف تتعامل معها منطقيًا؟",
                    [
                        answer("أعتبرها معلومة غير موثوقة حتى يوجد دليل", true),
                        answer("أصدقها", false),
                        answer("أرفضها قطعًا", false),
                        answer("أفعل عكسها دائمًا", false)
                    ],
                    23
                ),

                question(
                    "الحارس يطرح عليك سؤالًا وإجابته تعتمد على ما ستختاره بعد الإجابة. ما المشكلة؟",
                    [
                        answer("السؤال دائري وقد لا يملك جوابًا ثابتًا", true),
                        answer("الإجابة دائمًا نعم", false),
                        answer("الحارس يعرف كل شيء", false),
                        answer("السؤال سهل", false)
                    ],
                    24
                ),

                question(
                    "أمامك مرآتان، وكل واحدة تعكس الأخرى بلا نهاية. أين تنتهي الصورة؟",
                    [
                        answer("لا يوجد موضع نهائي واضح في الانعكاس المثالي", true),
                        answer("في المرآة الأولى", false),
                        answer("في المرآة الثانية", false),
                        answer("خلفك", false)
                    ],
                    25
                ),

                question(
                    "الحارس يقول: أنا لا أستطيع الكذب. ثم يقول: أنا أكذب الآن. ما النتيجة؟",
                    [
                        answer("تناقض منطقي", true),
                        answer("الحارس صادق", false),
                        answer("الحارس كاذب فقط", false),
                        answer("لا يوجد تناقض", false)
                    ],
                    26
                ),

                question(
                    "إذا كانت كل إجابة أمامك مصممة لتجعلك تخاف، فما أفضل وسيلة لمقاومة اللعبة؟",
                    [
                        answer("فصل المشاعر عن تقييم الأدلة", true),
                        answer("اختيار الأسرع دائمًا", false),
                        answer("اختيار الأكثر رعبًا", false),
                        answer("عدم القراءة", false)
                    ],
                    27
                ),

                question(
                    "يقول الحارس: أنت وصلت إلى النهاية. لكن العداد يظهر 28 من 30. ماذا تثق به؟",
                    [
                        answer("العداد دليل مباشر على المرحلة الحالية", true),
                        answer("الحارس دائمًا", false),
                        answer("الإحساس", false),
                        answer("الصوت", false)
                    ],
                    28
                ),

                question(
                    "المرحلة 29: الحارس يسألك: من كان يراقبك طوال الوقت؟ ما الإجابة الأكثر دقة؟",
                    [
                        answer("لا توجد معلومات كافية للجزم", true),
                        answer("الحارس", false),
                        answer("المرآة", false),
                        answer("اللاعب نفسه", false)
                    ],
                    29
                ),

                question(
                    "المرحلة 30. يظهر السؤال: هل كنت تخاف لأن الحارس موجود... أم لأنك صدقت أنه موجود؟",
                    [
                        answer("لا يمكن الجزم دون معرفة الحقيقة خارج اللعبة", true),
                        answer("الحارس موجود بالتأكيد", false),
                        answer("الخوف دليل على وجوده", false),
                        answer("كل شيء كان حقيقيًا", false)
                    ],
                    30
                )

            ]

        }

    };


    /* ============================================================
       GET SINGLE CHALLENGE
    ============================================================ */

    window.ZIVOZONE_CHALLENGES.get = function (id) {

        if (!id) {
            return null;
        }

        return this[id] || null;

    };


    /* ============================================================
       GET NORMAL CHALLENGES
       HORROR IS EXCLUDED
    ============================================================ */

    window.ZIVOZONE_CHALLENGES.getAll = function () {

        return Object.keys(this)

            .filter(function (key) {

                return (

                    typeof window
                        .ZIVOZONE_CHALLENGES[key]
                        === "object"

                    &&

                    window
                        .ZIVOZONE_CHALLENGES[key]
                        .questions

                    &&

                    !window
                        .ZIVOZONE_CHALLENGES[key]
                        .special

                );

            })

            .map(function (key) {

                return window
                    .ZIVOZONE_CHALLENGES[key];

            });

    };


    /* ============================================================
       GET SPECIAL CHALLENGES
    ============================================================ */

    window.ZIVOZONE_CHALLENGES.getSpecial = function () {

        return Object.keys(this)

            .filter(function (key) {

                return (

                    typeof window
                        .ZIVOZONE_CHALLENGES[key]
                        === "object"

                    &&

                    window
                        .ZIVOZONE_CHALLENGES[key]
                        .special

                );

            })

            .map(function (key) {

                return window
                    .ZIVOZONE_CHALLENGES[key];

            });

    };


    /* ============================================================
       VALIDATION
    ============================================================ */

    window.ZIVOZONE_CHALLENGES.validate = function () {

        var bank =
            window.ZIVOZONE_CHALLENGES;


        var problems = [];


        Object.keys(bank).forEach(function (key) {

            var challenge = bank[key];


            if (
                !challenge ||
                typeof challenge !== "object" ||
                !challenge.questions
            ) {
                return;
            }


            challenge.questions.forEach(
                function (q, index) {

                    var correctCount =
                        q.answers.filter(
                            function (a) {
                                return a.correct;
                            }
                        ).length;


                    if (correctCount !== 1) {

                        problems.push(
                            key +
                            " السؤال " +
                            (index + 1) +
                            " يحتوي على " +
                            correctCount +
                            " إجابة صحيحة."
                        );

                    }

                }
            );

        });


        return problems;

    };


    /* ============================================================
       READY
    ============================================================ */

    console.log(
        "🧠 ZIVOZONE Challenge Bank Ready"
    );


    console.log(
        "Normal Challenges:",
        window
            .ZIVOZONE_CHALLENGES
            .getAll()
            .length
    );


    console.log(
        "Special Challenges:",
        window
            .ZIVOZONE_CHALLENGES
            .getSpecial()
            .length
    );


    var validation =
        window
            .ZIVOZONE_CHALLENGES
            .validate();


    if (validation.length) {

        console.error(
            "❌ Challenge Bank Problems:",
            validation
        );

    } else {

        console.log(
            "✅ Challenge Bank Validation Passed"
        );

    }


})();
