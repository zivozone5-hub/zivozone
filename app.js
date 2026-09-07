/* ============================================================
   ZIVOZONE APP
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       STATE
    ======================================================== */

    let currentUser = null;

    let currentPlayer = null;

    let activeChallenge = null;

    let activeQuestion = 0;

    let activeScore = 0;

    let activeAnswers = [];

    let challengeStartedAsGuest = false;


    /* ========================================================
       HELPERS
    ======================================================== */

    const $ = selector =>
        document.querySelector(selector);


    const $$ = selector =>
        document.querySelectorAll(selector);


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


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

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
            function () {

                loader.style.opacity = "0";

                loader.style.pointerEvents =
                    "none";

                setTimeout(
                    function () {

                        loader.style.display =
                            "none";

                    },
                    500
                );

            },
            500
        );

    }


    /* ========================================================
       MODAL
    ======================================================== */

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

            <div class="modal-overlay">

                <div class="modal-box">

                    <button
                        class="modal-close"
                        id="modal-close"
                        type="button"
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


        $("#modal-close").onclick =
            closeModal;


        const overlay =
            root.querySelector(
                ".modal-overlay"
            );


        if (overlay) {

            overlay.onclick =
                function (event) {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeModal();

                    }

                };

        }

    }


    /* ========================================================
       AUTH MODAL
    ======================================================== */

    function showAuthModal(
        mode = "register",
        guestScore = null,
        guestChallenge = null
    ) {

        const register =
            mode === "register";


        openModal(`

            <div class="auth-modal">

                <span class="eyebrow">
                    ZIVOZONE PLAYER
                </span>


                ${
                    guestScore !== null
                    ? `

                        <div class="guest-result-banner">

                            <span>
                                🏆 نتيجتك
                            </span>

                            <strong>
                                ${guestScore}/10
                            </strong>

                            <small>
                                سجّل الآن لحفظ النتيجة
                                والحصول على XP.
                            </small>

                        </div>

                    `
                    : ""
                }


                <h2>
                    ${
                        register
                        ? "أنشئ حسابك"
                        : "تسجيل الدخول"
                    }
                </h2>


                <p>

                    ${
                        register
                        ? "لا تخسر تقدمك. أنشئ حساب ZIVOZONE مجانًا."
                        : "أهلًا بعودتك إلى عالم ZIVOZONE."
                    }

                </p>


                ${
                    register
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
                        register
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
                        register
                        ? "إنشاء الحساب وحفظ النتيجة"
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
                        register
                        ? "لدي حساب بالفعل — تسجيل الدخول"
                        : "ليس لدي حساب — إنشاء حساب"
                    }
                </button>

            </div>

        `);


        $("#auth-submit").onclick =
            async function () {

                const button =
                    $("#auth-submit");

                const message =
                    $("#auth-message");


                button.disabled = true;


                message.textContent =
                    "جاري إنشاء الحساب...";


                try {

                    if (!window.ZIVOZONE_AUTH) {

                        throw new Error(
                            "نظام الحسابات غير جاهز."
                        );

                    }


                    if (register) {

                        const player =
                            await window
                                .ZIVOZONE_AUTH
                                .registerPlayer({

                                    name:
                                        $("#auth-name").value,

                                    age:
                                        $("#auth-age").value,

                                    email:
                                        $("#auth-email").value,

                                    password:
                                        $("#auth-password").value,

                                    language:
                                        "ar"

                                });


                        currentUser =
                            player.user;

                        currentPlayer =
                            player.player;


                        /*
                         * إذا جاء اللاعب من تحدي كزائر،
                         * نحفظ نتيجته بعد التسجيل.
                         */

                        if (
                            guestScore !== null &&
                            currentPlayer
                        ) {

                            await window
                                .ZIVOZONE_AUTH
                                .addXP(
                                    guestScore * 10
                                );


                            await window
                                .ZIVOZONE_AUTH
                                .addCoins(
                                    guestScore
                                );

                        }


                        message.textContent =
                            "تم إنشاء حسابك وحفظ تقدمك ✓";


                        setTimeout(
                            async function () {

                                closeModal();

                                await refreshPlayer();

                            },
                            900
                        );

                    } else {

                        const result =
                            await window
                                .ZIVOZONE_AUTH
                                .loginPlayer(

                                    $("#auth-email").value,

                                    $("#auth-password").value

                                );


                        currentUser =
                            result.user;

                        currentPlayer =
                            result.player;


                        message.textContent =
                            "تم تسجيل الدخول ✓";


                        setTimeout(
                            async function () {

                                closeModal();

                                await refreshPlayer();

                            },
                            700
                        );

                    }

                } catch (error) {

                    console.error(
                        error
                    );


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
                    register
                    ? "login"
                    : "register",
                    guestScore,
                    guestChallenge
                );

            };

    }


    /* ========================================================
       PLAYER UI
    ======================================================== */

    async function refreshPlayer() {

        if (
            !window.ZIVOZONE_AUTH
        ) {

            return;

        }


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

            }


            updatePlayerUI(
                player
            );

        } catch (error) {

            console.warn(
                error
            );

        }

    }


    function updatePlayerUI(
        player
    ) {

        if (!player) {

            setText(
                "#profile-name",
                "زائر"
            );

            setText(
                "#quick-player-name",
                "زائر"
            );

            setText(
                "#profile-level",
                "—"
            );

            setText(
                "#quick-level",
                "—"
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
                "زائر"
            );


            const login =
                $("#login-btn");


            if (login) {

                login.textContent =
                    "تسجيل الدخول";

            }


            const note =
                $("#profile-note");


            if (note) {

                note.textContent =
                    "أنت تلعب كزائر. سجّل حسابًا لحفظ تقدمك.";

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


        const login =
            $("#login-btn");


        if (login) {

            login.textContent =
                "حسابي";

        }


        const note =
            $("#profile-note");


        if (note) {

            note.textContent =
                `أهلًا ${name} — تقدمك محفوظ.`;

        }


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

    }


    /* ========================================================
       CHALLENGE BANK
    ======================================================== */

    function getChallenges() {

        if (
            !window.ZIVOZONE_CHALLENGES
        ) {

            return [];

        }


        return window
            .ZIVOZONE_CHALLENGES
            .getAll();

    }


    /* ========================================================
       RENDER CHALLENGES
    ======================================================== */

    function renderChallenges() {

        const container =
            $("#challenge-list");


        if (!container) {

            return;

        }


        const challenges =
            getChallenges();


        container.innerHTML =
            challenges
                .map(
                    challenge => `

                        <article
                            class="challenge-card"
                        >

                            <div
                                class="challenge-icon"
                            >
                                ${challenge.icon}
                            </div>


                            <div>

                                <span class="card-tag">
                                    ${challenge.category}
                                </span>


                                <h3>
                                    ${challenge.title}
                                </h3>


                                <p>
                                    ${challenge.description}
                                </p>


                                <small>
                                    10 أسئلة • آخر 3 أسئلة EXTREME
                                </small>

                            </div>


                            <div
                                class="challenge-side"
                            >

                                <strong>
                                    10
                                </strong>

                                <span>
                                    أسئلة
                                </span>


                                <button
                                    class="btn btn-primary"
                                    data-challenge-id="${challenge.id}"
                                    type="button"
                                >
                                    ${currentUser ? "ابدأ التحدي" : "جرّب كزائر"}
                                </button>

                            </div>

                        </article>

                    `
                )
                .join("");

    }


    /* ========================================================
       START CHALLENGE
    ======================================================== */

    function startChallenge(
        challengeId
    ) {

        const challenge =
            window
                .ZIVOZONE_CHALLENGES
                ?.get(
                    challengeId
                );


        if (!challenge) {

            alert(
                "التحدي غير متوفر."
            );

            return;

        }


        activeChallenge =
            challenge;


        activeQuestion =
            0;


        activeScore =
            0;


        activeAnswers =
            [];


        challengeStartedAsGuest =
            !currentUser;


        showChallengeQuestion();

    }


    /* ========================================================
       QUESTION
    ======================================================== */

    function showChallengeQuestion() {

        if (!activeChallenge) {

            return;

        }


        const question =
            activeChallenge
                .questions[
                    activeQuestion
                ];


        const difficulty =
            question.difficulty;


        const difficultyText =
            difficulty >= 8
            ? "EXTREME"
            : difficulty >= 6
            ? "HARD"
            : difficulty >= 4
            ? "MEDIUM"
            : "EASY";


        const points =
            difficulty >= 8
            ? 30
            : difficulty >= 6
            ? 20
            : 10;


        openModal(`

            <div class="challenge-game">

                <div class="challenge-game-top">

                    <span class="eyebrow">
                        ${activeChallenge.category}
                    </span>


                    <span class="question-counter">
                        ${activeQuestion + 1} / 10
                    </span>

                </div>


                <div class="question-progress">

                    <span
                        style="
                            width:
                            ${
                                (
                                    (activeQuestion + 1)
                                    /
                                    10
                                )
                                *
                                100
                            }%;
                        "
                    ></span>

                </div>


                <div class="difficulty difficulty-${difficulty}">

                    ${difficultyText}

                </div>


                <h2>
                    ${escapeHTML(
                        question.question
                    )}
                </h2>


                <div class="question-reward">

                    +${points} XP

                </div>


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

                                    <span>
                                        ${
                                            String.fromCharCode(
                                                65 + index
                                            )
                                        }
                                    </span>

                                    ${escapeHTML(
                                        answer
                                    )}

                                </button>

                            `
                        )
                        .join("")}

                </div>


                <div class="challenge-navigation">

                    <button
                        id="quit-challenge"
                        class="btn btn-ghost"
                        type="button"
                    >
                        حفظ وخروج
                    </button>

                    ${
                        activeQuestion > 0
                        ? `
                            <button
                                id="previous-question"
                                class="btn btn-ghost"
                                type="button"
                            >
                                السؤال السابق
                            </button>
                        `
                        : ""
                    }

                </div>

            </div>

        `);


        $$("[data-answer]")
            .forEach(
                button => {

                    button.onclick =
                        function () {

                            selectAnswer(
                                Number(
                                    this.dataset.answer
                                )
                            );

                        };

                }
            );


        const previous =
            $("#previous-question");


        if (previous) {

            previous.onclick =
                goPreviousQuestion;

        }


        const quit =
            $("#quit-challenge");


        if (quit) {

            quit.onclick =
                saveAndExitChallenge;

        }

    }


    /* ========================================================
       SELECT ANSWER
    ======================================================== */

    function selectAnswer(
        selected
    ) {

        const question =
            activeChallenge
                .questions[
                    activeQuestion
                ];


        activeAnswers[
            activeQuestion
        ] =
            selected;


        if (
            selected ===
            question.correct
        ) {

            activeScore++;

        }


        if (
            activeQuestion >=
            9
        ) {

            finishChallenge();

            return;

        }


        activeQuestion++;

        showChallengeQuestion();

    }


    /* ========================================================
       PREVIOUS QUESTION
    ======================================================== */

    function goPreviousQuestion() {

        if (
            activeQuestion <=
            0
        ) {

            return;

        }


        activeQuestion--;


        showChallengeQuestion();

    }


    /* ========================================================
       SAVE / EXIT
    ======================================================== */

    function saveAndExitChallenge() {

        if (!activeChallenge) {

            closeModal();

            return;

        }


        if (!currentUser) {

            openGuestSavePrompt();

            return;

        }


        openModal(`

            <div class="result-modal">

                <span class="eyebrow">
                    PROGRESS SAVED
                </span>


                <h2>
                    تم حفظ تقدمك
                </h2>


                <p>
                    وصلت إلى السؤال
                    ${activeQuestion + 1}
                    من 10.
                </p>


                <button
                    id="continue-challenge"
                    class="btn btn-primary full"
                    type="button"
                >
                    متابعة اللعب
                </button>


                <button
                    id="exit-challenge"
                    class="btn btn-ghost full"
                    type="button"
                >
                    خروج
                </button>

            </div>

        `);


        $("#continue-challenge").onclick =
            showChallengeQuestion;


        $("#exit-challenge").onclick =
            closeModal;

    }


    /* ========================================================
       GUEST SAVE PROMPT
    ======================================================== */

    function openGuestSavePrompt() {

        openModal(`

            <div class="guest-save">

                <div class="guest-icon">
                    💾
                </div>


                <span class="eyebrow">
                    ZIVOZONE
                </span>


                <h2>
                    لحظة...
                </h2>


                <p>
                    أنت تلعب كزائر.
                </p>


                <p>
                    سجّل حسابًا مجانيًا حتى نستطيع
                    حفظ تقدمك ونتائجك.
                </p>


                <button
                    id="guest-register"
                    class="btn btn-primary full"
                    type="button"
                >
                    إنشاء حساب مجاني
                </button>


                <button
                    id="guest-continue"
                    class="btn btn-ghost full"
                    type="button"
                >
                    أكمل كزائر
                </button>

            </div>

        `);


        $("#guest-register").onclick =
            function () {

                showAuthModal(
                    "register"
                );

            };


        $("#guest-continue").onclick =
            function () {

                showChallengeQuestion();

            };

    }


    /* ========================================================
       FINISH
    ======================================================== */

    async function finishChallenge() {

        const correct =
            activeScore;


        const total =
            activeChallenge.questions.length;


        const percentage =
            Math.round(
                correct /
                total *
                100
            );


        const possibleXP =
            activeChallenge.questions
                .reduce(
                    (
                        sum,
                        question
                    ) => {

                        if (
                            question.difficulty >=
                            8
                        ) {

                            return sum + 30;

                        }

                        if (
                            question.difficulty >=
                            6
                        ) {

                            return sum + 20;

                        }

                        return sum + 10;

                    },
                    0
                );


        const earnedXP =
            activeChallenge.questions
                .slice(
                    0,
                    total
                )
                .reduce(
                    (
                        sum,
                        question,
                        index
                    ) => {

                        const selected =
                            activeAnswers[
                                index
                            ];


                        if (
                            selected ===
                            question.correct
                        ) {

                            if (
                                question.difficulty >=
                                8
                            ) {

                                return sum + 30;

                            }

                            if (
                                question.difficulty >=
                                6
                            ) {

                                return sum + 20;

                            }

                            return sum + 10;

                        }


                        return sum;

                    },
                    0
                );


        if (
            currentUser
        ) {

            try {

                await window
                    .ZIVOZONE_AUTH
                    .addXP(
                        earnedXP
                    );


                await window
                    .ZIVOZONE_AUTH
                    .addCoins(
                        correct
                    );


                await refreshPlayer();

            } catch (error) {

                console.error(
                    error
                );

            }

        }


        const rating =
            percentage >= 90
            ? "أسطوري 🔥"
            : percentage >= 70
            ? "ممتاز ⚡"
            : percentage >= 50
            ? "جيد 👊"
            : "لا تستسلم 😈";


        openModal(`

            <div class="result-modal">

                <span class="eyebrow">
                    ${activeChallenge.category}
                </span>


                <h2>
                    ${rating}
                </h2>


                <div class="result-score">
                    ${correct}/${total}
                </div>


                <div class="result-percentage">
                    ${percentage}%
                </div>


                ${
                    currentUser
                    ? `

                        <p>
                            حصلت على
                            <strong>
                                +${earnedXP} XP
                            </strong>

                            <br>

                            و
                            <strong>
                                +${correct} 🪙
                            </strong>
                        </p>

                        <button
                            id="finish-close"
                            class="btn btn-primary full"
                            type="button"
                        >
                            متابعة
                        </button>

                    `
                    : `

                        <div class="guest-result">

                            <strong>
                                🎁 كان بإمكانك الحصول على
                                +${earnedXP} XP
                            </strong>

                            <p>
                                أنت لعبت كزائر.
                                سجّل حسابك الآن لحفظ نتيجتك
                                والاستمرار في بناء مستواك.
                            </p>

                            <button
                                id="save-result"
                                class="btn btn-primary full"
                                type="button"
                            >
                                احفظ نتيجتي وأنشئ حسابًا
                            </button>


                            <button
                                id="guest-finish"
                                class="btn btn-ghost full"
                                type="button"
                            >
                                أكمل كزائر
                            </button>

                        </div>

                    `

                }

            </div>

        `);


        const finishClose =
            $("#finish-close");


        if (finishClose) {

            finishClose.onclick =
                closeModal;

        }


        const saveResult =
            $("#save-result");


        if (saveResult) {

            saveResult.onclick =
                function () {

                    showAuthModal(
                        "register",
                        correct,
                        activeChallenge.id
                    );

                };

        }


        const guestFinish =
            $("#guest-finish");


        if (guestFinish) {

            guestFinish.onclick =
                closeModal;

        }

    }


    /* ========================================================
       HORROR
    ======================================================== */

    function startHorror() {

        startChallenge(
            "iq"
        );

    }


    /* ========================================================
       IDENTITY
    ======================================================== */

    function startIdentity() {

        if (!currentUser) {

            startGuestIdentity();

            return;

        }


        showIdentityQuestion();

    }


    function startGuestIdentity() {

        openModal(`

            <div class="identity-test">

                <span class="eyebrow">
                    WHO AM I?
                </span>


                <h2>
                    عندما تواجه تحديًا صعبًا...
                </h2>


                <p>
                    اختر الإجابة الأقرب لك.
                </p>


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


        $$("[data-personality]")
            .forEach(
                button => {

                    button.onclick =
                        function () {

                            openIdentityResult(
                                this.dataset.personality
                            );

                        };

                }
            );

    }


    function showIdentityQuestion() {

        startGuestIdentity();

    }


    function openIdentityResult(
        type
    ) {

        const results = {

            leader:
                "قائد — تحب اتخاذ القرار وتحمل المسؤولية.",

            thinker:
                "محلل — تراقب التفاصيل قبل اتخاذ القرار.",

            risk:
                "مغامر — لا تخاف من المخاطرة.",

            speed:
                "سريع — تتألق عندما يكون الضغط عاليًا."

        };


        openModal(`

            <div class="result-modal">

                <span class="eyebrow">
                    YOUR ZIVO TYPE
                </span>


                <h2>
                    ${results[type]}
                </h2>


                <p>
                    سجّل النتيجة في حسابك واحصل على
                    تجربة شخصية أفضل داخل ZIVOZONE.
                </p>


                <button
                    id="identity-register"
                    class="btn btn-primary full"
                    type="button"
                >
                    إنشاء حساب
                </button>


                <button
                    id="identity-close"
                    class="btn btn-ghost full"
                    type="button"
                >
                    متابعة كزائر
                </button>

            </div>

        `);


        $("#identity-register").onclick =
            function () {

                showAuthModal(
                    "register"
                );

            };


        $("#identity-close").onclick =
            closeModal;

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


                let response =
                    "جرّب تحديات ZIVOZONE واكتشف مستواك.";


                if (
                    text.includes("مستوى")
                ) {

                    response =
                        currentPlayer
                        ? `مستواك الحالي Level ${currentPlayer.level || 1}.`
                        : "أنت الآن تلعب كزائر. سجّل حسابًا لحفظ مستواك.";

                }


                if (
                    text.includes("تحدي")
                ) {

                    response =
                        "ابدأ بتحدي الذكاء. لكن انتبه... آخر 3 أسئلة صعبة جدًا 😈";

                }


                setTimeout(
                    function () {

                        messages.insertAdjacentHTML(
                            "beforeend",
                            `

                                <div class="ai-message bot">
                                    ${escapeHTML(response)}
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

                <span>⚽</span>

                <h3>
                    كرة القدم
                </h3>

                <p>
                    تحديات كرة القدم والتكتيك.
                </p>

            </article>


            <article class="sports-card">

                <span>🏃</span>

                <h3>
                    اللياقة
                </h3>

                <p>
                    تحديات السرعة والتحمل.
                </p>

            </article>


            <article class="sports-card">

                <span>🏆</span>

                <h3>
                    المنافسة
                </h3>

                <p>
                    ارفع مستواك وتنافس.
                </p>

            </article>

        `;

    }


    /* ========================================================
       ACCOUNT
    ======================================================== */

    function showAccount() {

        if (!currentUser) {

            showAuthModal(
                "register"
            );

            return;

        }


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
                            LEVEL
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
                            COINS
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


                currentUser =
                    null;


                currentPlayer =
                    null;


                closeModal();

                renderChallenges();

                updatePlayerUI(
                    null
                );

            };

    }


    /* ========================================================
       EVENT SYSTEM
    ======================================================== */

    function setupEvents() {

        document.addEventListener(
            "click",
            function (event) {

                const challenge =
                    event.target.closest(
                        "[data-challenge-id]"
                    );


                if (challenge) {

                    startChallenge(
                        challenge.dataset.challengeId
                    );

                    return;

                }


                const game =
                    event.target.closest(
                        "[data-game]"
                    );


                if (game) {

                    const gameId =
                        game.dataset.game;


                    if (
                        gameId === "quiz"
                    ) {

                        startChallenge(
                            "iq"
                        );

                    }


                    if (
                        gameId === "science"
                    ) {

                        startChallenge(
                            "science"
                        );

                    }


                    if (
                        gameId === "daily"
                    ) {

                        startChallenge(
                            "daily"
                        );

                    }


                    if (
                        gameId === "horror"
                    ) {

                        startChallenge(
                            "iq"
                        );

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

                    showAccount();

                }


                if (
                    type === "scroll-games"
                ) {

                    $("#games")
                        ?.scrollIntoView({
                            behavior: "smooth"
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

            }
        );


        const login =
            $("#login-btn");


        if (login) {

            login.onclick =
                showAccount;

        }

    }


    /* ========================================================
       AUTH EVENTS
    ======================================================== */

    window.addEventListener(
        "zivozone-auth",
        function (event) {

            const detail =
                event.detail ||
                {};


            currentUser =
                detail.user ||
                null;


            currentPlayer =
                detail.player ||
                null;


            updatePlayerUI(
                currentPlayer
            );


            renderChallenges();

        }
    );


    /* ========================================================
       LANGUAGE
    ======================================================== */

    function setupLanguage() {

        const select =
            $("#language-select");


        if (!select) {

            return;

        }


        select.onchange =
            function () {

                if (
                    this.value !==
                    "ar"
                ) {

                    openModal(`

                        <div class="result-modal">

                            <h2>
                                Coming Soon
                            </h2>

                            <p>
                                اللغات الإضافية قادمة قريبًا.
                            </p>

                            <button
                                class="btn btn-primary full"
                                id="language-close"
                                type="button"
                            >
                                حسنًا
                            </button>

                        </div>

                    `);


                    $("#language-close")
                        .onclick =
                        closeModal;

                }

            };

    }


    /* ========================================================
       INIT
    ======================================================== */

    async function init() {

        renderChallenges();

        renderSports();

        setupAI();

        setupEvents();

        setupLanguage();

        hideLoader();


        if (
            window.ZIVOZONE_AUTH
        ) {

            await refreshPlayer();

        }


        renderChallenges();


        console.log(
            "🚀 ZIVOZONE Content System Ready"
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
