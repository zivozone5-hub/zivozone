/* ============================================================
   ZIVOZONE MAIN APPLICATION
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       STATE
    ======================================================== */

    let currentPlayer = null;

    let currentUser = null;


    /* ========================================================
       HELPERS
    ======================================================== */

    const $ = selector =>
        document.querySelector(
            selector
        );


    const $$ = selector =>
        document.querySelectorAll(
            selector
        );


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* ========================================================
       LOADER
    ======================================================== */

    function hideLoader() {

        const loader =
            $("#app-loader");


        if (!loader) {

            return;

        }


        setTimeout(
            () => {

                loader.style.opacity =
                    "0";

                loader.style.pointerEvents =
                    "none";

                setTimeout(
                    () => {

                        loader.style.display =
                            "none";

                    },
                    400
                );

            },
            500
        );

    }


    /* ========================================================
       MODAL
    ======================================================== */

    function openModal(
        content
    ) {

        const root =
            $("#modal-root");


        if (!root) {

            return;

        }


        root.innerHTML = `

            <div class="modal-overlay">

                <div class="modal-box">

                    <button
                        class="modal-close"
                        type="button"
                        data-close-modal
                    >
                        ×
                    </button>

                    ${content}

                </div>

            </div>

        `;


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        const close =
            root.querySelector(
                "[data-close-modal]"
            );


        if (close) {

            close.onclick =
                closeModal;

        }


        const overlay =
            root.querySelector(
                ".modal-overlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeModal();

                    }

                }
            );

        }

    }


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


    /* ========================================================
       LOGIN / REGISTER
    ======================================================== */

    function showAuthModal(
        mode = "register"
    ) {

        const registerMode =
            mode === "register";


        openModal(`

            <div class="auth-modal">

                <span class="eyebrow">
                    ZIVOZONE PLAYER
                </span>

                <h2>
                    ${
                        registerMode
                        ? "أنشئ حسابك"
                        : "مرحبًا بعودتك"
                    }
                </h2>

                <p>
                    ${
                        registerMode
                        ? "ادخل إلى عالم ZIVOZONE وابدأ رحلتك."
                        : "سجّل الدخول لمتابعة تقدمك."
                    }
                </p>


                ${
                    registerMode
                    ? `
                        <input
                            id="auth-name"
                            type="text"
                            placeholder="اسم اللاعب"
                            autocomplete="name"
                        >

                        <input
                            id="auth-age"
                            type="number"
                            min="5"
                            max="100"
                            placeholder="العمر"
                        >
                    `
                    : ""
                }


                <input
                    id="auth-email"
                    type="email"
                    placeholder="البريد الإلكتروني"
                    autocomplete="email"
                >


                <input
                    id="auth-password"
                    type="password"
                    placeholder="كلمة المرور"
                    autocomplete="${
                        registerMode
                        ? "new-password"
                        : "current-password"
                    }"
                >


                <button
                    id="auth-submit"
                    class="btn btn-primary full"
                    type="button"
                >
                    ${
                        registerMode
                        ? "إنشاء الحساب"
                        : "تسجيل الدخول"
                    }
                </button>


                <div
                    id="auth-message"
                    class="auth-message"
                ></div>


                <button
                    id="auth-switch"
                    class="auth-switch"
                    type="button"
                >
                    ${
                        registerMode
                        ? "لدي حساب بالفعل — تسجيل الدخول"
                        : "ليس لدي حساب — إنشاء حساب"
                    }
                </button>

            </div>

        `);


        $("#auth-submit").onclick =
            async function () {

                const message =
                    $("#auth-message");


                const button =
                    $("#auth-submit");


                button.disabled =
                    true;


                message.textContent =
                    "جاري الاتصال...";


                try {

                    const api =
                        window.ZIVOZONE_AUTH;


                    if (!api) {

                        throw new Error(
                            "نظام الحسابات لم يجهز بعد."
                        );

                    }


                    if (registerMode) {

                        const name =
                            $("#auth-name").value;


                        const age =
                            $("#auth-age").value;


                        const email =
                            $("#auth-email").value;


                        const password =
                            $("#auth-password").value;


                        await api.registerPlayer({

                            name,

                            age,

                            email,

                            password,

                            language:
                                "ar"

                        });


                        message.textContent =
                            "تم إنشاء الحساب بنجاح ✓";


                        setTimeout(
                            closeModal,
                            700
                        );

                    } else {

                        const email =
                            $("#auth-email").value;


                        const password =
                            $("#auth-password").value;


                        await api.loginPlayer(
                            email,
                            password
                        );


                        message.textContent =
                            "تم تسجيل الدخول ✓";


                        setTimeout(
                            closeModal,
                            700
                        );

                    }

                } catch (error) {

                    message.textContent =
                        error.message ||
                        "حدث خطأ.";

                } finally {

                    button.disabled =
                        false;

                }

            };


        $("#auth-switch").onclick =
            function () {

                showAuthModal(
                    registerMode
                    ? "login"
                    : "register"
                );

            };

    }


    /* ========================================================
       PLAYER UI
    ======================================================== */

    function updatePlayerUI(
        player
    ) {

        currentPlayer =
            player;


        if (!player) {

            setText(
                "#profile-name",
                "Guest"
            );

            setText(
                "#quick-player-name",
                "Guest"
            );

            setText(
                "#profile-level",
                "1"
            );

            setText(
                "#quick-level",
                "1"
            );

            setText(
                "#profile-xp",
                "0"
            );

            setText(
                "#quick-xp",
                "0"
            );

            setText(
                "#profile-coins",
                "0"
            );

            setText(
                "#quick-coins",
                "0"
            );

            setText(
                "#player-level-chip",
                "Level 1"
            );


            const note =
                $("#profile-note");


            if (note) {

                note.textContent =
                    "سجّل الدخول لحفظ تقدمك.";

            }


            const login =
                $("#login-btn");


            if (login) {

                login.textContent =
                    "تسجيل الدخول";

            }


            return;

        }


        const level =
            Number(
                player.level || 1
            );


        const xp =
            Number(
                player.xp || 0
            );


        const coins =
            Number(
                player.coins || 0
            );


        const name =
            player.name ||
            "ZIVO Player";


        setText(
            "#profile-name",
            name
        );


        setText(
            "#quick-player-name",
            name
        );


        setText(
            "#profile-level",
            level
        );


        setText(
            "#quick-level",
            level
        );


        setText(
            "#profile-xp",
            xp
        );


        setText(
            "#quick-xp",
            xp
        );


        setText(
            "#profile-coins",
            coins
        );


        setText(
            "#quick-coins",
            coins
        );


        setText(
            "#player-level-chip",
            `Level ${level}`
        );


        const progress =
            $("#xp-progress");


        if (progress) {

            const required =
                level * 100;


            const percentage =
                Math.min(
                    100,
                    Math.round(
                        xp /
                        required *
                        100
                    )
                );


            progress.style.width =
                percentage + "%";

        }


        const note =
            $("#profile-note");


        if (note) {

            note.textContent =
                `أهلًا ${name} — تقدمك محفوظ.`;

        }


        const login =
            $("#login-btn");


        if (login) {

            login.textContent =
                "حسابي";

        }

    }


    function setText(
        selector,
        value
    ) {

        const element =
            $(selector);


        if (element) {

            element.textContent =
                value;

        }

    }


    /* ========================================================
       AUTH EVENT
    ======================================================== */

    window.addEventListener(
        "zivozone-auth",
        event => {

            const detail =
                event.detail ||
                {};


            currentUser =
                detail.user ||
                null;


            updatePlayerUI(
                detail.player ||
                null
            );

        }
    );


    /* ========================================================
       LOGIN BUTTON
    ======================================================== */

    function handleLogin() {

        if (
            currentUser
        ) {

            showAccountModal();

        } else {

            showAuthModal(
                "register"
            );

        }

    }


    /* ========================================================
       ACCOUNT
    ======================================================== */

    function showAccountModal() {

        const player =
            currentPlayer ||
            {};


        openModal(`

            <div class="account-modal">

                <span class="eyebrow">
                    ZIVO PLAYER
                </span>

                <h2>
                    ${escapeHTML(
                        player.name ||
                        "ZIVO Player"
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        player.email ||
                        ""
                    )}
                </p>


                <div class="account-stats">

                    <div>
                        <b>
                            ${player.level || 1}
                        </b>
                        <span>
                            المستوى
                        </span>
                    </div>


                    <div>
                        <b>
                            ${player.xp || 0}
                        </b>
                        <span>
                            XP
                        </span>
                    </div>


                    <div>
                        <b>
                            ${player.coins || 0}
                        </b>
                        <span>
                            ZIVO
                        </span>
                    </div>

                </div>


                <button
                    id="logout-btn"
                    class="btn btn-primary full"
                    type="button"
                >
                    تسجيل الخروج
                </button>

            </div>

        `);


        $("#logout-btn").onclick =
            async function () {

                await window
                    .ZIVOZONE_AUTH
                    .logoutPlayer();

                closeModal();

            };

    }


    /* ========================================================
       GAMES
    ======================================================== */

    const quizQuestions = [

        {
            question:
                "ما العدد التالي؟ 2، 4، 8، 16، ؟",

            answers:
                ["20", "24", "32", "36"],

            correct:
                2

        },

        {
            question:
                "إذا كان لديك 3 كرات وأضفت إليها 4، كم تصبح؟",

            answers:
                ["5", "6", "7", "8"],

            correct:
                2

        },

        {
            question:
                "أي كلمة مختلفة عن البقية؟",

            answers:
                ["تفاحة", "برتقال", "موز", "كرة"],

            correct:
                3

        },

        {
            question:
                "ما نصف 100؟",

            answers:
                ["25", "40", "50", "75"],

            correct:
                2

        },

        {
            question:
                "أي رقم أكبر؟",

            answers:
                ["17", "71", "27", "37"],

            correct:
                1

        }

    ];


    const scienceQuestions = [

        {
            question:
                "ما الكوكب المعروف بالكوكب الأحمر؟",

            answers:
                ["الأرض", "المريخ", "الزهرة", "المشتري"],

            correct:
                1

        },

        {
            question:
                "ما الغاز الذي يحتاجه الإنسان للتنفس؟",

            answers:
                ["الأكسجين", "الهيدروجين", "الهيليوم", "النيتروجين"],

            correct:
                0

        },

        {
            question:
                "كم عدد قارات العالم؟",

            answers:
                ["5", "6", "7", "8"],

            correct:
                2

        },

        {
            question:
                "ما أقرب نجم إلى الأرض؟",

            answers:
                ["الشمس", "القمر", "المريخ", "سيريوس"],

            correct:
                0

        },

        {
            question:
                "ما الذي يدور حول الأرض؟",

            answers:
                ["القمر", "الشمس", "المريخ", "المشتري"],

            correct:
                0

        }

    ];


    let activeQuestions =
        [];

    let activeQuestionIndex =
        0;

    let activeScore =
        0;


    function startQuiz(
        type
    ) {

        if (
            !currentUser
        ) {

            showAuthModal(
                "register"
            );

            return;

        }


        if (
            type === "science"
        ) {

            activeQuestions =
                scienceQuestions;

        } else {

            activeQuestions =
                quizQuestions;

        }


        activeQuestionIndex =
            0;


        activeScore =
            0;


        showQuestion();

    }


    function showQuestion() {

        const question =
            activeQuestions[
                activeQuestionIndex
            ];


        openModal(`

            <div class="game-modal">

                <span class="eyebrow">
                    ZIVO CHALLENGE
                </span>

                <div class="game-progress">
                    سؤال
                    ${activeQuestionIndex + 1}
                    /
                    ${activeQuestions.length}
                </div>


                <h2>
                    ${escapeHTML(
                        question.question
                    )}
                </h2>


                <div class="answers">

                    ${question.answers
                        .map(
                            (
                                answer,
                                index
                            ) => `

                                <button
                                    class="answer-btn"
                                    data-answer="${index}"
                                    type="button"
                                >
                                    ${escapeHTML(
                                        answer
                                    )}
                                </button>

                            `
                        )
                        .join("")}

                </div>

            </div>

        `);


        $$(".answer-btn")
            .forEach(
                button => {

                    button.onclick =
                        function () {

                            const selected =
                                Number(
                                    this.dataset.answer
                                );


                            if (
                                selected ===
                                question.correct
                            ) {

                                activeScore++;

                            }


                            activeQuestionIndex++;


                            if (
                                activeQuestionIndex >=
                                activeQuestions.length
                            ) {

                                finishQuiz();

                            } else {

                                showQuestion();

                            }

                        };

                }
            );

    }


    async function finishQuiz() {

        const reward =
            activeScore * 10;


        if (
            window.ZIVOZONE_AUTH
        ) {

            await window
                .ZIVOZONE_AUTH
                .addXP(
                    reward
                );

        }


        openModal(`

            <div class="result-modal">

                <span class="eyebrow">
                    RESULT
                </span>

                <h2>
                    انتهى التحدي
                </h2>

                <div class="result-score">
                    ${activeScore}
                    /
                    ${activeQuestions.length}
                </div>

                <p>
                    حصلت على
                    <strong>
                        +${reward} XP
                    </strong>
                </p>


                <button
                    class="btn btn-primary full"
                    data-close-modal
                    type="button"
                >
                    متابعة
                </button>

            </div>

        `);


        const close =
            $("[data-close-modal]");


        if (close) {

            close.onclick =
                closeModal;

        }


        const player =
            await window
                .ZIVOZONE_AUTH
                .getCurrentPlayer();


        updatePlayerUI(
            player
        );

    }


    /* ========================================================
       HORROR GAME
    ======================================================== */

    function startHorror() {

        if (
            !currentUser
        ) {

            showAuthModal(
                "register"
            );

            return;

        }


        openModal(`

            <div class="horror-game">

                <span class="eyebrow">
                    ZIVO HORROR
                </span>

                <h2>
                    الغرفة المظلمة
                </h2>

                <p>
                    تستيقظ في غرفة لا تعرفها.
                    أمامك بابان.
                    أحدهما مفتوح قليلًا...
                </p>


                <div class="horror-actions">

                    <button
                        class="btn btn-primary"
                        data-horror="left"
                        type="button"
                    >
                        الباب الأسود
                    </button>


                    <button
                        class="btn btn-ghost"
                        data-horror="right"
                        type="button"
                    >
                        الباب الأبيض
                    </button>

                </div>

            </div>

        `);


        $$("[data-horror]")
            .forEach(
                button => {

                    button.onclick =
                        async function () {

                            const choice =
                                this.dataset.horror;


                            const success =
                                choice === "right";


                            if (
                                success
                            ) {

                                await window
                                    .ZIVOZONE_AUTH
                                    .addXP(20);


                                openModal(`

                                    <div class="result-modal">

                                        <span class="eyebrow">
                                            SURVIVED
                                        </span>

                                        <h2>
                                            نجوت... هذه المرة.
                                        </h2>

                                        <p>
                                            +20 XP
                                        </p>

                                        <button
                                            class="btn btn-primary full"
                                            data-close-modal
                                            type="button"
                                        >
                                            خروج
                                        </button>

                                    </div>

                                `);

                            } else {

                                openModal(`

                                    <div class="result-modal horror-result">

                                        <span class="eyebrow">
                                            GAME OVER
                                        </span>

                                        <h2>
                                            كان اختيارك خاطئًا...
                                        </h2>

                                        <p>
                                            هل تجرؤ على المحاولة مرة أخرى؟
                                        </p>

                                        <button
                                            class="btn btn-primary full"
                                            id="retry-horror"
                                            type="button"
                                        >
                                            مرة أخرى
                                        </button>

                                    </div>

                                `);


                                $("#retry-horror").onclick =
                                    startHorror;

                            }

                        };

                }
            );

    }


    /* ========================================================
       DAILY CHALLENGE
    ======================================================== */

    async function startDaily() {

        if (
            !currentUser
        ) {

            showAuthModal(
                "register"
            );

            return;

        }


        const challenges = [

            "أجب عن السؤال خلال 5 ثوانٍ.",

            "اختر الرقم المختلف بأسرع وقت.",

            "هل تستطيع الفوز دون ارتكاب خطأ؟",

            "اختبر ذاكرتك الآن.",

            "تحدي السرعة: لا تفكر كثيرًا."

        ];


        const index =
            new Date()
                .getDate()
            %
            challenges.length;


        openModal(`

            <div class="daily-modal">

                <span class="eyebrow">
                    DAILY CHALLENGE
                </span>

                <h2>
                    تحدي اليوم
                </h2>

                <p>
                    ${challenges[index]}
                </p>


                <button
                    class="btn btn-primary full"
                    id="daily-win"
                    type="button"
                >
                    أنجزت التحدي
                </button>

            </div>

        `);


        $("#daily-win").onclick =
            async function () {

                await window
                    .ZIVOZONE_AUTH
                    .addXP(30);


                await window
                    .ZIVOZONE_AUTH
                    .addCoins(5);


                openModal(`

                    <div class="result-modal">

                        <h2>
                            أحسنت 🔥
                        </h2>

                        <p>
                            +30 XP
                            <br>
                            +5 🪙
                        </p>

                        <button
                            class="btn btn-primary full"
                            data-close-modal
                            type="button"
                        >
                            متابعة
                        </button>

                    </div>

                `);


                const close =
                    $("[data-close-modal]");


                if (close) {

                    close.onclick =
                        closeModal;

                }


                const player =
                    await window
                        .ZIVOZONE_AUTH
                        .getCurrentPlayer();


                updatePlayerUI(
                    player
                );

            };

    }


    /* ========================================================
       CHALLENGE BANK
    ======================================================== */

    const challengeBank = [

        {
            icon: "⚡",
            title: "تحدي السرعة",
            text: "أجب قبل انتهاء العد التنازلي.",
            xp: 25
        },

        {
            icon: "🧠",
            title: "تحدي المنطق",
            text: "اكتشف النمط المخفي.",
            xp: 35
        },

        {
            icon: "👁️",
            title: "تحدي الملاحظة",
            text: "أنت ترى التفاصيل... أم تتخيلها؟",
            xp: 30
        },

        {
            icon: "🎯",
            title: "تحدي الدقة",
            text: "خطأ واحد قد ينهي الجولة.",
            xp: 40
        },

        {
            icon: "👻",
            title: "تحدي الخوف",
            text: "لا تغلق الشاشة قبل النهاية.",
            xp: 50
        },

        {
            icon: "🏆",
            title: "تحدي البطل",
            text: "اجمع أكبر عدد من النقاط.",
            xp: 60
        }

    ];


    function renderChallenges() {

        const container =
            $("#challenge-list");


        if (!container) {

            return;

        }


        container.innerHTML =
            challengeBank
                .map(
                    challenge => `

                        <article class="challenge-card">

                            <div class="challenge-icon">
                                ${challenge.icon}
                            </div>

                            <div>

                                <span class="card-tag">
                                    CHALLENGE
                                </span>

                                <h3>
                                    ${challenge.title}
                                </h3>

                                <p>
                                    ${challenge.text}
                                </p>

                            </div>

                            <div class="challenge-side">

                                <strong>
                                    +${challenge.xp}
                                </strong>

                                <button
                                    class="btn btn-primary"
                                    data-challenge
                                    data-xp="${challenge.xp}"
                                    type="button"
                                >
                                    تحداني
                                </button>

                            </div>

                        </article>

                    `
                )
                .join("");


        $$("[data-challenge]")
            .forEach(
                button => {

                    button.onclick =
                        async function () {

                            if (
                                !currentUser
                            ) {

                                showAuthModal(
                                    "register"
                                );

                                return;

                            }


                            const xp =
                                Number(
                                    this.dataset.xp
                                );


                            await window
                                .ZIVOZONE_AUTH
                                .addXP(
                                    xp
                                );


                            await window
                                .ZIVOZONE_AUTH
                                .addCoins(
                                    2
                                );


                            openModal(`

                                <div class="result-modal">

                                    <span class="eyebrow">
                                        CHALLENGE COMPLETE
                                    </span>

                                    <h2>
                                        تحدي ناجح 🔥
                                    </h2>

                                    <p>
                                        +${xp} XP
                                        <br>
                                        +2 🪙
                                    </p>

                                    <button
                                        class="btn btn-primary full"
                                        data-close-modal
                                        type="button"
                                    >
                                        ممتاز
                                    </button>

                                </div>

                            `);


                            const close =
                                $("[data-close-modal]");


                            if (close) {

                                close.onclick =
                                    closeModal;

                            }


                            const player =
                                await window
                                    .ZIVOZONE_AUTH
                                    .getCurrentPlayer();


                            updatePlayerUI(
                                player
                            );

                        };

                }
            );

    }


    /* ========================================================
       IDENTITY TEST
    ======================================================== */

    function startIdentity() {

        if (
            !currentUser
        ) {

            showAuthModal(
                "register"
            );

            return;

        }


        openModal(`

            <div class="identity-test">

                <span class="eyebrow">
                    WHO AM I?
                </span>

                <h2>
                    عندما تواجه تحديًا صعبًا...
                </h2>


                <div class="answers">

                    <button
                        class="answer-btn"
                        data-personality="leader"
                        type="button"
                    >
                        أقود الجميع
                    </button>


                    <button
                        class="answer-btn"
                        data-personality="thinker"
                        type="button"
                    >
                        أفكر بهدوء
                    </button>


                    <button
                        class="answer-btn"
                        data-personality="risk"
                        type="button"
                    >
                        أجرب المخاطرة
                    </button>


                    <button
                        class="answer-btn"
                        data-personality="speed"
                        type="button"
                    >
                        أتصرف بسرعة
                    </button>

                </div>

            </div>

        `);


        $$(".answer-btn")
            .forEach(
                button => {

                    button.onclick =
                        function () {

                            const type =
                                this.dataset.personality;


                            const results = {

                                leader:
                                    "أنت تميل إلى القيادة واتخاذ القرار.",

                                thinker:
                                    "أنت لاعب تحليلي يحب فهم التفاصيل.",

                                risk:
                                    "أنت جريء ولا تخاف من التجربة.",

                                speed:
                                    "أنت سريع القرار وتحب الضغط."

                            };


                            openModal(`

                                <div class="result-modal">

                                    <span class="eyebrow">
                                        YOUR ZIVO TYPE
                                    </span>

                                    <h2>
                                        ${results[type]}
                                    </h2>

                                    <button
                                        class="btn btn-primary full"
                                        data-close-modal
                                        type="button"
                                    >
                                        حفظ النتيجة
                                    </button>

                                </div>

                            `);


                            const close =
                                $("[data-close-modal]");


                            if (close) {

                                close.onclick =
                                    closeModal;

                            }

                        };

                }
            );

    }


    /* ========================================================
       SPORTS
    ======================================================== */

    function renderSports() {

        const container =
            $("#sports-list");


        if (!container) {

            return;

        }


        container.innerHTML = `

            <article class="sports-card">

                <span>
                    ⚽
                </span>

                <h3>
                    كرة القدم
                </h3>

                <p>
                    أخبار وتحديات كرة القدم.
                </p>

            </article>


            <article class="sports-card">

                <span>
                    🏃
                </span>

                <h3>
                    اللياقة
                </h3>

                <p>
                    تحديات السرعة والتحمل.
                </p>

            </article>


            <article class="sports-card">

                <span>
                    🏆
                </span>

                <h3>
                    المنافسة
                </h3>

                <p>
                    ارفع مستواك وتنافس مع الآخرين.
                </p>

            </article>

        `;

    }


    /* ========================================================
       AI
    ======================================================== */

    function setupAI() {

        const form =
            $("#ai-form");


        if (!form) {

            return;

        }


        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const input =
                    $("#ai-input");


                const messages =
                    $("#ai-messages");


                const text =
                    input.value.trim();


                if (!text) {

                    return;

                }


                messages.insertAdjacentHTML(
                    "beforeend",
                    `

                        <div class="ai-message user">
                            ${escapeHTML(text)}
                        </div>

                    `
                );


                input.value =
                    "";


                let reply =
                    "فكرة رائعة. جرّب أحد تحديات ZIVOZONE الآن.";


                if (
                    text.includes(
                        "مستوى"
                    )
                ) {

                    reply =
                        currentPlayer
                        ? `مستواك الحالي Level ${currentPlayer.level || 1}.`
                        : "سجّل الدخول أولًا لأعرف مستواك.";

                }


                if (
                    text.includes(
                        "تحدي"
                    )
                ) {

                    reply =
                        "اذهب إلى مركز التحديات واختر تحديًا. هل تستطيع إنهاءه؟";

                }


                setTimeout(
                    () => {

                        messages.insertAdjacentHTML(
                            "beforeend",
                            `

                                <div class="ai-message bot">
                                    ${escapeHTML(reply)}
                                </div>

                            `
                        );


                        messages.scrollTop =
                            messages.scrollHeight;

                    },
                    400
                );

            }
        );

    }


    /* ========================================================
       BUTTON EVENTS
    ======================================================== */

    function setupButtons() {

        document.addEventListener(
            "click",
            event => {

                const game =
                    event.target.closest(
                        "[data-game]"
                    );


                if (game) {

                    const type =
                        game.dataset.game;


                    if (
                        type === "quiz"
                    ) {

                        startQuiz(
                            "quiz"
                        );

                    } else if (
                        type === "science"
                    ) {

                        startQuiz(
                            "science"
                        );

                    } else if (
                        type === "horror"
                    ) {

                        startHorror();

                    } else if (
                        type === "daily"
                    ) {

                        startDaily();

                    }

                    return;

                }


                const action =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!action) {

                    return;

                }


                const type =
                    action.dataset.action;


                if (
                    type === "login"
                ) {

                    handleLogin();

                }


                if (
                    type === "scroll-games"
                ) {

                    $("#games")
                        ?.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                }


                if (
                    type === "open-identity"
                ) {

                    startIdentity();

                }


                if (
                    type === "refresh-sports"
                ) {

                    renderSports();

                }


                if (
                    type === "ad-info"
                ) {

                    openModal(`

                        <div class="result-modal">

                            <span class="eyebrow">
                                ZIVOZONE BUSINESS
                            </span>

                            <h2>
                                الإعلان داخل ZIVOZONE
                            </h2>

                            <p>
                                هذه المساحة مخصصة مستقبلًا
                                للإعلانات والرعاة والشركات.
                            </p>

                            <button
                                class="btn btn-primary full"
                                data-close-modal
                                type="button"
                            >
                                إغلاق
                            </button>

                        </div>

                    `);


                    const close =
                        $("[data-close-modal]");


                    if (close) {

                        close.onclick =
                            closeModal;

                    }

                }

            }
        );

    }


    /* ========================================================
       LANGUAGE
    ======================================================== */

    function setupLanguage() {

        const select =
            $("#language-select");


        if (!select) {

            return;

        }


        select.addEventListener(
            "change",
            function () {

                document.documentElement
                    .lang =
                    this.value;


                if (
                    this.value !==
                    "ar"
                ) {

                    openModal(`

                        <div class="result-modal">

                            <h2>
                                اللغة قيد التطوير
                            </h2>

                            <p>
                                النسخة العربية هي النسخة الأساسية حاليًا.
                            </p>

                            <button
                                class="btn btn-primary full"
                                data-close-modal
                                type="button"
                            >
                                حسنًا
                            </button>

                        </div>

                    `);


                    const close =
                        $("[data-close-modal]");


                    if (close) {

                        close.onclick =
                            closeModal;

                    }

                }

            }
        );

    }


    /* ========================================================
       INIT
    ======================================================== */

    async function init() {

        renderChallenges();

        renderSports();

        setupAI();

        setupButtons();

        setupLanguage();


        hideLoader();


        /* ================================================
           FIREBASE READY
        ================================================= */

        if (
            window.ZIVOZONE_AUTH
        ) {

            try {

                const player =
                    await window
                        .ZIVOZONE_AUTH
                        .getCurrentPlayer();


                if (player) {

                    currentPlayer =
                        player;


                    currentUser =
                        true;


                    updatePlayerUI(
                        player
                    );

                }

            } catch (error) {

                console.warn(
                    "Player load:",
                    error
                );

            }

        }


        console.log(
            "🚀 ZIVOZONE Application Ready"
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
