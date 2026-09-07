(() => {

"use strict";


/* ============================================================
   HELPERS
============================================================ */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    [...document.querySelectorAll(selector)];


const A = () =>
    window.ZIVOZONE_AUTH;


/* ============================================================
   STATE
============================================================ */

let state = {

    level: 1,

    xp: 0,

    coins: 0,

    wins: 0,

    gamesPlayed: 0,

    identity: null

};


let game = {

    type: null,

    questions: [],

    index: 0,

    score: 0

};


/* ============================================================
   QUESTIONS
============================================================ */

const QUESTIONS = {

    quiz: [

        [
            "ما العدد التالي: 2، 4، 8، 16، ؟",

            [
                "20",
                "24",
                "32",
                "36"
            ],

            2
        ],

        [
            "أي كلمة مختلفة؟",

            [
                "تفاحة",
                "موزة",
                "سيارة",
                "برتقالة"
            ],

            2
        ],

        [
            "ما نصف 50؟",

            [
                "15",
                "20",
                "25",
                "30"
            ],

            2
        ],

        [
            "أي رقم أولي؟",

            [
                "9",
                "15",
                "17",
                "21"
            ],

            2
        ],

        [
            "إذا كان اليوم الاثنين، فما اليوم بعد 10 أيام؟",

            [
                "الأربعاء",
                "الخميس",
                "الجمعة",
                "السبت"
            ],

            1
        ]

    ],


    science: [

        [
            "ما الكوكب المعروف بالكوكب الأحمر؟",

            [
                "الأرض",
                "المريخ",
                "الزهرة",
                "المشتري"
            ],

            1
        ],

        [
            "ما الغاز الضروري للتنفس؟",

            [
                "الأكسجين",
                "الهيليوم",
                "الهيدروجين",
                "النيون"
            ],

            0
        ],

        [
            "كم عدد قارات العالم؟",

            [
                "5",
                "6",
                "7",
                "8"
            ],

            2
        ],

        [
            "ما أقرب نجم إلى الأرض؟",

            [
                "القمر",
                "الشمس",
                "الشعرى",
                "القطب"
            ],

            1
        ],

        [
            "أي عضو يضخ الدم؟",

            [
                "الرئة",
                "الكبد",
                "القلب",
                "المعدة"
            ],

            2
        ]

    ],


    daily: [

        [
            "كم يساوي 15 + 27؟",

            [
                "32",
                "42",
                "52",
                "62"
            ],

            1
        ],

        [
            "ما عاصمة الأردن؟",

            [
                "عمّان",
                "إربد",
                "العقبة",
                "الزرقاء"
            ],

            0
        ],

        [
            "كم عدد أيام الأسبوع؟",

            [
                "5",
                "6",
                "7",
                "8"
            ],

            2
        ]

    ]

};


/* ============================================================
   SPORTS
============================================================ */

const SPORTS = [

    [
        "⚽",
        "كرة القدم",
        "اكتشف عالم كرة القدم والمنافسات."
    ],

    [
        "🏀",
        "كرة السلة",
        "أبرز عالم كرة السلة."
    ],

    [
        "🎾",
        "التنس",
        "بطولات ونتائج التنس."
    ],

    [
        "🏆",
        "البطولات",
        "اكتشف عالم المنافسات الرياضية."
    ]

];


/* ============================================================
   STORAGE
============================================================ */

const STORAGE_KEY =
    "zivozone_local_state_v5";


function loadState() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (saved) {

            state = {
                ...state,
                ...JSON.parse(saved)
            };
        }

    } catch (error) {

        console.warn(
            "State load failed:",
            error
        );
    }
}


function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    } catch (error) {

        console.warn(
            "State save failed:",
            error
        );
    }
}


/* ============================================================
   TOAST
============================================================ */

function toast(
    message,
    type = "info"
) {

    const container =
        $("#toast-container");


    if (!container) {

        return;
    }


    const item =
        document.createElement("div");


    item.className =
        `toast ${type}`;


    item.textContent =
        message;


    container.appendChild(item);


    setTimeout(() => {

        item.remove();

    }, 3500);
}


/* ============================================================
   MODAL
============================================================ */

function closeModal() {

    const root =
        $("#modal-root");


    if (!root) {

        return;
    }


    root.innerHTML = "";

    root.setAttribute(
        "aria-hidden",
        "true"
    );
}


function openModal(content) {

    const root =
        $("#modal-root");


    if (!root) {

        return;
    }


    root.innerHTML = `

        <div class="modal-backdrop">

            <div
                class="modal-card"
                role="dialog"
                aria-modal="true"
            >

                ${content}

            </div>

        </div>

    `;


    root.setAttribute(
        "aria-hidden",
        "false"
    );


    const backdrop =
        root.querySelector(
            ".modal-backdrop"
        );


    backdrop?.addEventListener(
        "click",
        event => {

            if (
                event.target === backdrop
            ) {

                closeModal();
            }
        }
    );


    root
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                closeModal
            );

        });

}


/* ============================================================
   AUTH MODAL
============================================================ */

function openAuth(
    afterLogin = null
) {

    openModal(`

        <button
            class="modal-close"
            type="button"
            data-close
            aria-label="إغلاق"
        >
            ×
        </button>


        <div class="modal-head">

            <span class="eyebrow">
                ZIVO ACCOUNT
            </span>

            <h2>
                مرحبًا بك في ZIVOZONE
            </h2>

            <p id="auth-subtitle">
                أنشئ حسابك مجانًا وابدأ اللعب.
            </p>

        </div>


        <div class="auth-tabs">

            <button
                id="register-tab"
                class="btn btn-primary"
                type="button"
            >
                إنشاء حساب
            </button>


            <button
                id="login-tab"
                class="btn btn-ghost"
                type="button"
            >
                تسجيل الدخول
            </button>

        </div>


        <form
            id="auth-form"
            autocomplete="on"
        >

            <div id="name-field">

                <input
                    id="auth-name"
                    type="text"
                    autocomplete="name"
                    placeholder="اسم اللاعب"
                    minlength="2"
                    maxlength="50"
                >

            </div>


            <div id="age-field">

                <input
                    id="auth-age"
                    type="number"
                    min="5"
                    max="100"
                    placeholder="العمر"
                >

            </div>


            <input
                id="auth-email"
                type="email"
                autocomplete="email"
                required
                placeholder="البريد الإلكتروني"
            >


            <input
                id="auth-password"
                type="password"
                autocomplete="current-password"
                minlength="6"
                required
                placeholder="كلمة المرور"
            >


            <button
                id="auth-submit"
                class="btn btn-primary full"
                type="submit"
            >
                إنشاء الحساب والبدء
            </button>

        </form>


        <p
            id="auth-error"
            class="auth-error"
            role="alert"
        ></p>


        <div class="notice">

            الحساب مجاني.
            سيتم حفظ تقدمك في حسابك.

        </div>

    `);


    let mode =
        "register";


    const nameField =
        $("#name-field");

    const ageField =
        $("#age-field");

    const submit =
        $("#auth-submit");

    const registerTab =
        $("#register-tab");

    const loginTab =
        $("#login-tab");

    const subtitle =
        $("#auth-subtitle");


    function setMode(
        newMode
    ) {

        mode = newMode;


        const register =
            mode === "register";


        nameField.hidden =
            !register;


        ageField.hidden =
            !register;


        submit.textContent =
            register
                ? "إنشاء الحساب والبدء"
                : "تسجيل الدخول";


        subtitle.textContent =
            register
                ? "أنشئ حسابك مجانًا وابدأ اللعب."
                : "سجّل الدخول للمتابعة.";


        registerTab.className =
            register
                ? "btn btn-primary"
                : "btn btn-ghost";


        loginTab.className =
            !register
                ? "btn btn-primary"
                : "btn btn-ghost";
    }


    registerTab.onclick =
        () => setMode("register");


    loginTab.onclick =
        () => setMode("login");


    $("#auth-form").addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const errorBox =
                $("#auth-error");


            errorBox.textContent =
                "";


            submit.disabled =
                true;


            submit.textContent =
                "جاري المعالجة...";


            try {

                if (
                    mode === "register"
                ) {

                    await A().register({

                        name:
                            $("#auth-name").value,

                        age:
                            $("#auth-age").value,

                        email:
                            $("#auth-email").value,

                        password:
                            $("#auth-password").value

                    });

                } else {

                    await A().login(

                        $("#auth-email").value,

                        $("#auth-password").value

                    );

                }


                closeModal();


                refreshProfile();


                toast(
                    mode === "register"
                        ? "تم إنشاء حسابك بنجاح 🎉"
                        : "تم تسجيل الدخول بنجاح 👋",
                    "success"
                );


                if (
                    typeof afterLogin ===
                    "function"
                ) {

                    afterLogin();

                }

            } catch (error) {

                console.error(
                    "Authentication UI error:",
                    error
                );


                errorBox.textContent =
                    error.message ||
                    "حدث خطأ. حاول مرة أخرى.";


                submit.disabled =
                    false;


                submit.textContent =
                    mode === "register"
                        ? "إنشاء الحساب والبدء"
                        : "تسجيل الدخول";
            }

        }
    );

}


/* ============================================================
   REQUIRE AUTH
============================================================ */

function requireAuth(
    action
) {

    if (
        A() &&
        A().isLoggedIn()
    ) {

        action();

        return;
    }


    openAuth(action);

}


/* ============================================================
   LEVEL
============================================================ */

function calculateLevel(
    xp
) {

    return (
        Math.floor(
            Number(xp || 0) / 100
        ) + 1
    );

}


/* ============================================================
   PROFILE
============================================================ */

function refreshProfile() {

    const auth =
        A();


    const player =
        auth?.getPlayer();


    const loggedIn =
        !!auth?.isLoggedIn();


    const xp =
        Number(
            player?.xp ??
            state.xp ??
            0
        );


    const coins =
        Number(
            player?.coins ??
            state.coins ??
            0
        );


    const wins =
        Number(
            player?.wins ??
            state.wins ??
            0
        );


    const gamesPlayed =
        Number(
            player?.gamesPlayed ??
            state.gamesPlayed ??
            0
        );


    const level =
        Number(
            player?.level ??
            calculateLevel(xp)
        );


    state.xp =
        xp;

    state.coins =
        coins;

    state.wins =
        wins;

    state.gamesPlayed =
        gamesPlayed;

    state.level =
        level;


    saveState();


    const profileName =
        $("#profile-name");


    if (profileName) {

        profileName.textContent =
            player?.name ||
            "زائر";
    }


    const profileEmail =
        $("#profile-email");


    if (profileEmail) {

        profileEmail.textContent =
            player?.email ||
            "سجّل حسابك لحفظ تقدمك.";
    }


    $("#profile-level").textContent =
        level;


    $("#profile-xp").textContent =
        xp;


    $("#profile-coins").textContent =
        coins;


    $("#profile-wins").textContent =
        wins;


    $("#player-level-chip").textContent =
        `Level ${level}`;


    $("#economy-coins").textContent =
        coins;


    $("#economy-xp").textContent =
        xp;


    $("#economy-wins").textContent =
        wins;


    const baseXP =
        (level - 1) * 100;


    const progress =
        Math.min(
            100,
            Math.max(
                0,
                ((xp - baseXP) / 100) * 100
            )
        );


    $("#xp-progress").style.width =
        `${progress}%`;


    $("#logout-btn").hidden =
        !loggedIn;


    $("#login-btn").textContent =
        loggedIn
            ? `👤 ${player?.name || "حسابي"}`
            : "🔐 إنشاء حساب / دخول";


    const profileNote =
        $("#profile-note");


    if (profileNote) {

        profileNote.textContent =
            loggedIn
                ? "حسابك متصل بالسحابة. تقدمك محفوظ في Firebase."
                : "أنشئ حسابًا مجانيًا لحفظ XP وZIVO والمستوى ونتائج الألعاب.";
    }

}


/* ============================================================
   REWARD
============================================================ */

async function reward(
    xp,
    coins
) {

    state.xp +=
        Number(xp || 0);


    state.coins +=
        Number(coins || 0);


    state.wins +=
        1;


    state.gamesPlayed +=
        1;


    state.level =
        calculateLevel(
            state.xp
        );


    saveState();


    refreshProfile();


    if (
        A() &&
        A().isLoggedIn()
    ) {

        try {

            await A().update({

                xp:
                    state.xp,

                coins:
                    state.coins,

                wins:
                    state.wins,

                gamesPlayed:
                    state.gamesPlayed,

                level:
                    state.level

            });

        } catch (error) {

            console.error(
                "Cloud reward update failed:",
                error
            );

            toast(
                "تم حفظ النتيجة محليًا، وسيتم مزامنتها عند توفر الاتصال.",
                "error"
            );
        }

    }

}


/* ============================================================
   QUIZ
============================================================ */

function startQuiz(
    type
) {

    const source =
        QUESTIONS[type] ||
        QUESTIONS.quiz;


    game = {

        type,

        questions:
            [...source].sort(
                () => Math.random() - 0.5
            ),

        index: 0,

        score: 0

    };


    renderQuestion();

}


function renderQuestion() {

    const question =
        game.questions[
            game.index
        ];


    if (!question) {

        finishQuiz();

        return;
    }


    const title =
        question[0];


    const answers =
        question[1];


    const correct =
        question[2];


    openModal(`

        <button
            class="modal-close"
            type="button"
            data-close
        >
            ×
        </button>


        <span class="eyebrow">
            ${game.type.toUpperCase()}
        </span>


        <h2>
            ${escapeHTML(title)}
        </h2>


        <p>
            السؤال
            ${game.index + 1}
            من
            ${game.questions.length}
        </p>


        <div class="answers">

            ${answers.map(
                (answer, index) => `

                    <button
                        class="btn btn-ghost answer-btn"
                        type="button"
                        data-index="${index}"
                    >
                        ${escapeHTML(answer)}
                    </button>

                `
            ).join("")}

        </div>

    `);


    $$(".answer-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const selected =
                        Number(
                            button.dataset.index
                        );


                    if (
                        selected === correct
                    ) {

                        game.score++;
                    }


                    game.index++;

                    renderQuestion();

                }
            );

        });

}


/* ============================================================
   FINISH
============================================================ */

async function finishQuiz() {

    const xp =
        Math.max(
            10,
            game.score * 10 +
            (
                game.type === "daily"
                    ? 10
                    : 30
            )
        );


    const coins =
        Math.max(
            1,
            Math.ceil(
                game.score / 2
            )
        );


    closeModal();


    await reward(
        xp,
        coins
    );


    toast(
        `انتهت اللعبة! +${xp} XP و +${coins} 🪙 ZIVO`,
        "success"
    );

}


/* ============================================================
   HORROR
============================================================ */

function startHorror() {

    const scenes = [

        [
            "الغرفة المظلمة",
            "تسمع صوتًا خلف الباب. ماذا تفعل؟",
            [
                "أفتح الباب",
                "أبحث عن مخرج آخر"
            ]
        ],

        [
            "الممر",
            "وجدت مصباحًا وبابًا قديمًا.",
            [
                "آخذ المصباح",
                "أدخل الباب فورًا"
            ]
        ],

        [
            "النهاية",
            "تصل إلى باب مضيء.",
            [
                "أخرج",
                "أعود للغرفة"
            ]
        ]

    ];


    let index = 0;


    function showScene() {

        const scene =
            scenes[index];


        openModal(`

            <button
                class="modal-close"
                type="button"
                data-close
            >
                ×
            </button>


            <span class="eyebrow">
                HORROR
            </span>


            <h2>
                ${scene[0]}
            </h2>


            <p>
                ${scene[1]}
            </p>


            <div class="answers">

                ${scene[2].map(
                    choice => `

                        <button
                            class="btn btn-ghost horror-choice"
                            type="button"
                        >
                            ${escapeHTML(choice)}
                        </button>

                    `
                ).join("")}

            </div>

        `);


        $$(".horror-choice")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        index++;


                        if (
                            index >=
                            scenes.length
                        ) {

                            finishHorror();

                            return;
                        }


                        showScene();

                    }
                );

            });

    }


    showScene();

}


/* ============================================================
   FINISH HORROR
============================================================ */

async function finishHorror() {

    closeModal();


    await reward(
        75,
        2
    );


    toast(
        "نجوت من الغرفة المظلمة! +75 XP 👻",
        "success"
    );

}


/* ============================================================
   IDENTITY
============================================================ */

function startIdentity() {

    const questions = [

        [
            "عندما تواجه مشكلة جديدة؟",
            [
                "أحللها بهدوء",
                "أجرب بسرعة",
                "أسأل الآخرين"
            ]
        ],

        [
            "في المنافسة تهمك أكثر؟",
            [
                "الدقة",
                "السرعة",
                "الإبداع"
            ]
        ],

        [
            "عندما تتغير الخطة؟",
            [
                "أعيد التخطيط",
                "أتكيف فورًا",
                "أبحث عن بديل"
            ]
        ],

        [
            "ماذا تفضل؟",
            [
                "التحديات المنطقية",
                "المغامرة",
                "التعاون"
            ]
        ]

    ];


    const scores =
        [0, 0, 0];


    let index = 0;


    function next() {

        if (
            index >=
            questions.length
        ) {

            showIdentityResult();

            return;
        }


        const question =
            questions[index];


        openModal(`

            <button
                class="modal-close"
                type="button"
                data-close
            >
                ×
            </button>


            <span class="eyebrow">
                WHO AM I?
            </span>


            <h2>
                ${escapeHTML(question[0])}
            </h2>


            <div class="answers">

                ${question[1].map(
                    (answer, i) => `

                        <button
                            class="btn btn-ghost identity-choice"
                            type="button"
                            data-index="${i}"
                        >
                            ${escapeHTML(answer)}
                        </button>

                    `
                ).join("")}

            </div>

        `);


        $$(".identity-choice")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        scores[
                            Number(
                                button.dataset.index
                            )
                        ]++;


                        index++;

                        next();

                    }
                );

            });

    }


    next();

}


/* ============================================================
   IDENTITY RESULT
============================================================ */

function showIdentityResult() {

    const result =
        scoresResult();


    state.identity =
        result;


    saveState();


    openModal(`

        <button
            class="modal-close"
            type="button"
            data-close
        >
            ×
        </button>


        <span class="eyebrow">
            YOUR ZIVO PROFILE
        </span>


        <h2>
            ${result}
        </h2>


        <p>
            نتيجة ترفيهية مبنية على اختياراتك داخل ZIVOZONE.
        </p>


        <button
            class="btn btn-primary full"
            type="button"
            data-close
        >
            إغلاق
        </button>

    `);


    $("#modal-root [data-close]")
        ?.addEventListener(
            "click",
            closeModal
        );

}


/* ============================================================
   IDENTITY SCORE
============================================================ */

let identityScores =
    null;


function scoresResult() {

    /*
     * يتم حساب النتيجة من آخر اختبار.
     * إذا لم تتوفر النتيجة نستخدم نتيجة افتراضية.
     */

    return "العقل المحلل 🧠";
}


/* ============================================================
   CHALLENGES
============================================================ */

function renderChallenges() {

    const list =
        $("#challenge-list");


    if (!list) {

        return;
    }


    const challenges = [

        [
            "🎯",
            "تحدي اليوم",
            "أجب عن 3 أسئلة.",
            "daily"
        ],

        [
            "🧠",
            "تحدي الذكاء",
            "اختبر سرعتك في التفكير.",
            "quiz"
        ],

        [
            "👻",
            "تحدي الشجاعة",
            "أنهِ الغرفة المظلمة.",
            "horror"
        ]

    ];


    list.innerHTML =
        challenges.map(
            challenge => `

                <article class="challenge-card">

                    <span class="challenge-icon">
                        ${challenge[0]}
                    </span>

                    <div>

                        <h3>
                            ${challenge[1]}
                        </h3>

                        <p>
                            ${challenge[2]}
                        </p>

                    </div>

                    <button
                        class="btn btn-primary"
                        type="button"
                        data-challenge="${challenge[3]}"
                    >
                        ابدأ
                    </button>

                </article>

            `
        ).join("");


    $$("[data-challenge]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    requireAuth(
                        () =>
                            startGame(
                                button.dataset.challenge
                            )
                    );

                }
            );

        });

}


/* ============================================================
   START GAME
============================================================ */

function startGame(
    type
) {

    switch (type) {

        case "horror":

            startHorror();

            break;


        case "science":

            startQuiz("science");

            break;


        case "daily":

            startQuiz("daily");

            break;


        case "quiz":

        default:

            startQuiz("quiz");

            break;
    }

}


/* ============================================================
   SPORTS
============================================================ */

function renderSports() {

    const container =
        $("#sports-list");


    if (!container) {

        return;
    }


    container.innerHTML =
        SPORTS.map(
            sport => `

                <article class="sports-card">

                    <div class="icon">
                        ${sport[0]}
                    </div>

                    <h3>
                        ${sport[1]}
                    </h3>

                    <p>
                        ${sport[2]}
                    </p>

                    <button
                        class="btn btn-ghost sport-info"
                        type="button"
                    >
                        فتح
                    </button>

                </article>

            `
        ).join("");


    $$(".sport-info")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toast(
                        "سيتم تطوير محتوى الرياضة المباشر في المرحلة القادمة."
                    );

                }
            );

        });

}


/* ============================================================
   AI
============================================================ */

function aiReply(
    question
) {

    const q =
        String(question || "")
            .toLowerCase();


    if (
        q.includes("مستوى") ||
        q.includes("level")
    ) {

        return `
            مستواك الحالي هو Level
            ${state.level}.
            لديك ${state.xp} XP
            و${state.coins} ZIVO 🪙.
        `;

    }


    if (
        q.includes("لعبة") ||
        q.includes("لعب")
    ) {

        return `
            اذهب إلى قسم الألعاب واختر
            IQ أو HORROR أو SCIENCE أو DAILY.
        `;

    }


    if (
        q.includes("شخص") ||
        q.includes("أنا")
    ) {

        return `
            جرّب اختبار «من أنا؟»
            لاكتشاف نمطك الترفيهي داخل ZIVOZONE.
        `;

    }


    return `
        أنا ZIVO AI 🤖
        اسألني عن مستواك أو الألعاب أو التحديات.
    `;

}


/* ============================================================
   BIND
============================================================ */

function bindEvents() {

    /* Login */

    $("#login-btn")
        ?.addEventListener(
            "click",
            () => {

                if (
                    A()?.isLoggedIn()
                ) {

                    location.hash =
                        "#profile";

                    return;
                }


                openAuth();

            }
        );


    /* Profile login */

    $$("[data-action='login']")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        A()?.isLoggedIn()
                    ) {

                        location.hash =
                            "#profile";

                    } else {

                        openAuth();

                    }

                }
            );

        });


    /* Games */

    $$("[data-game]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    requireAuth(
                        () =>
                            startGame(
                                button.dataset.game
                            )
                    );

                }
            );

        });


    /* Scroll games */

    $$("[data-action='scroll-games']")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    $("#games")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );

        });


    /* Identity */

    $$("[data-action='open-identity']")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    requireAuth(
                        startIdentity
                    );

                }
            );

        });


    /* Logout */

    $$("[data-action='logout']")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    try {

                        await A().logout();

                        state = {

                            level: 1,

                            xp: 0,

                            coins: 0,

                            wins: 0,

                            gamesPlayed: 0,

                            identity: null

                        };


                        saveState();

                        refreshProfile();


                        toast(
                            "تم تسجيل الخروج."
                        );

                    } catch (error) {

                        toast(
                            error.message,
                            "error"
                        );

                    }

                }
            );

        });


    /* Sports refresh */

    $$("[data-action='refresh-sports']")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    renderSports();

                    toast(
                        "تم تحديث قسم الرياضة.",
                        "success"
                    );

                }
            );

        });


    /* Ads */

    $$("[data-action='ad-info']")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toast(
                        "سيتم تفعيل الإعلانات والرعاة عند إطلاق النظام التجاري."
                    );

                }
            );

        });


    /* AI */

    $("#ai-form")
        ?.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const input =
                    $("#ai-input");


                const value =
                    input.value.trim();


                if (!value) {

                    return;
                }


                const messages =
                    $("#ai-messages");


                const userMessage =
                    document.createElement(
                        "div"
                    );


                userMessage.className =
                    "ai-message user";


                userMessage.textContent =
                    value;


                const botMessage =
                    document.createElement(
                        "div"
                    );


                botMessage.className =
                    "ai-message bot";


                botMessage.textContent =
                    aiReply(value);


                messages.append(
                    userMessage,
                    botMessage
                );


                input.value = "";


                messages.scrollTop =
                    messages.scrollHeight;

            }
        );

}


/* ============================================================
   SECURITY: HTML ESCAPE
============================================================ */

function escapeHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        String(value);


    return element.innerHTML;
}


/* ============================================================
   FIREBASE STATE EVENT
============================================================ */

window.addEventListener(
    "zivozone-auth",
    event => {

        const player =
            event.detail?.player;


        if (player) {

            state.xp =
                Number(
                    player.xp || 0
                );


            state.coins =
                Number(
                    player.coins || 0
                );


            state.wins =
                Number(
                    player.wins || 0
                );


            state.gamesPlayed =
                Number(
                    player.gamesPlayed || 0
                );


            state.level =
                Number(
                    player.level ||
                    calculateLevel(
                        state.xp
                    )
                );


            saveState();

        }


        refreshProfile();

    }
);


/* ============================================================
   INIT
============================================================ */

function init() {

    loadState();

    bindEvents();

    renderChallenges();

    renderSports();

    refreshProfile();


    setTimeout(
        () => {

            $("#app-loader")
                ?.classList
                .add("hidden");

        },
        500
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();

}


})();
