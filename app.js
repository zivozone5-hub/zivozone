/* ============================================================
   ZIVOZONE APP ENGINE
   VERSION: 2.0
   Guest Mode + Firebase Auth + Challenge Engine + Horror 30
============================================================ */

(function () {

    "use strict";

    /* ============================================================
       GLOBAL STATE
    ============================================================ */

    const STATE_KEY = "zivozone_game_state_v2";
    const PLAYER_KEY = "zivozone_guest_player_v2";
    const LANGUAGE_KEY = "zivozone_language_v2";

    let language =
        localStorage.getItem(LANGUAGE_KEY) || "ar";

    let player = loadGuestPlayer();

    let currentGame = null;

    let timer = null;

    let timeLeft = 0;

    let authState = {
        loggedIn: false,
        user: null,
        player: null
    };


    /* ============================================================
       TRANSLATIONS
    ============================================================ */

    const TEXT = {

        ar: {
            guest: "زائر",
            start: "ابدأ",
            continue: "استكمال",
            save: "حفظ",
            back: "العودة",
            next: "التالي",
            correct: "إجابة صحيحة",
            wrong: "إجابة خاطئة",
            timeout: "انتهى الوقت",
            login: "تسجيل الدخول",
            register: "إنشاء حساب",
            playGuest: "العب كزائر",
            challengeFriend: "تحدَّ صديقًا",
            saved: "تم حفظ تقدمك",
            guestSave:
                "أنشئ حسابًا لحفظ تقدمك ونتائجك على جميع أجهزتك.",
            result: "النتيجة",
            points: "النقاط",
            xp: "XP",
            level: "المستوى",
            question: "السؤال",
            horror: "الغرفة المظلمة",
            guardian: "الحارس",
            phase1: "المرحلة الأولى",
            phase2: "الحارس",
            phase3: "لا تنظر خلفك",
            resume: "لديك تحدٍ محفوظ",
            resumeText:
                "يمكنك العودة ومتابعة التحدي من حيث توقفت.",
            deleteSave: "حذف التقدم",
            restart: "ابدأ من جديد",
            shareCopied:
                "تم نسخ رابط التحدي.",
            finalMessage:
                "لقد وصلت إلى نهاية الغرفة.",
            visitor:
                "أنت تلعب الآن كزائر."
        },

        en: {
            guest: "Guest",
            start: "Start",
            continue: "Continue",
            save: "Save",
            back: "Back",
            next: "Next",
            correct: "Correct",
            wrong: "Wrong",
            timeout: "Time's up",
            login: "Login",
            register: "Create account",
            playGuest: "Play as guest",
            challengeFriend: "Challenge a friend",
            saved: "Progress saved",
            guestSave:
                "Create an account to save your progress.",
            result: "Result",
            points: "Points",
            xp: "XP",
            level: "Level",
            question: "Question",
            horror: "Dark Room",
            guardian: "The Guardian",
            phase1: "Phase One",
            phase2: "The Guardian",
            phase3: "Don't Look Behind",
            resume: "Saved challenge",
            resumeText:
                "Continue from where you stopped.",
            deleteSave: "Delete progress",
            restart: "Restart",
            shareCopied:
                "Challenge link copied.",
            finalMessage:
                "You reached the end of the room.",
            visitor:
                "You are playing as a guest."
        }

    };


    function t(key) {

        return (
            TEXT[language]?.[key] ||
            TEXT.ar[key] ||
            key
        );

    }


    /* ============================================================
       PLAYER
    ============================================================ */

    function loadGuestPlayer() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        PLAYER_KEY
                    )
                );

            if (saved) {

                return {
                    name: saved.name || "",
                    age: saved.age || 18,
                    xp: Number(saved.xp) || 0,
                    points:
                        Number(saved.points) || 0,
                    level:
                        Number(saved.level) || 1,
                    games:
                        Number(saved.games) || 0,
                    correct:
                        Number(saved.correct) || 0,
                    answered:
                        Number(saved.answered) || 0
                };

            }

        } catch (error) {

            console.warn(
                "ZIVOZONE player load failed",
                error
            );

        }

        return {
            name: "",
            age: 18,
            xp: 0,
            points: 0,
            level: 1,
            games: 0,
            correct: 0,
            answered: 0
        };

    }


    function saveGuestPlayer() {

        localStorage.setItem(
            PLAYER_KEY,
            JSON.stringify(player)
        );

    }


    function calculateLevel() {

        player.level =
            Math.max(
                1,
                Math.floor(
                    player.xp / 500
                ) + 1
            );

    }


    /* ============================================================
       CHALLENGE BANK
    ============================================================ */

    function getBank() {

        return window.ZIVOZONE_CHALLENGES || {};

    }


    function getChallenge(id) {

        const bank = getBank();

        return bank[id] || null;

    }


    /* ============================================================
       NORMAL QUESTIONS
    ============================================================ */

    function normalizeQuestion(q) {

        if (!q) {
            return null;
        }

        return {

            question:
                q.question ||
                q.q ||
                "",

            difficulty:
                Number(
                    q.difficulty
                ) || 1,

            answers:
                Array.isArray(q.answers)
                    ? q.answers.map(
                        answer => {

                            if (
                                typeof answer ===
                                "string"
                            ) {

                                return {
                                    text: answer,
                                    correct: false
                                };

                            }

                            return {
                                text:
                                    answer.text ||
                                    "",
                                correct:
                                    Boolean(
                                        answer.correct
                                    )
                            };

                        }
                    )
                    : []

        };

    }


    function shuffle(array) {

        const copy =
            [...array];

        for (
            let i =
                copy.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );

            [
                copy[i],
                copy[j]
            ] = [
                copy[j],
                copy[i]
            ];

        }

        return copy;

    }


    function buildNormalQuestions(challenge) {

        if (
            !challenge ||
            !Array.isArray(
                challenge.questions
            )
        ) {

            return [];

        }

        return shuffle(
            challenge.questions
        )
        .slice(0, 10)
        .map(
            normalizeQuestion
        );

    }


    function buildHorrorQuestions() {

        const horror =
            getChallenge("horror");

        if (
            !horror ||
            !Array.isArray(
                horror.questions
            )
        ) {

            console.error(
                "❌ Horror challenge not found."
            );

            return [];

        }

        return horror.questions
            .map(
                normalizeQuestion
            )
            .slice(0, 30);

    }


    /* ============================================================
       SAVED GAME
    ============================================================ */

    function saveGameState() {

        if (!currentGame) {
            return;
        }

        const state = {

            type:
                currentGame.type,

            index:
                currentGame.index,

            correct:
                currentGame.correct,

            score:
                currentGame.score,

            totalTime:
                currentGame.totalTime,

            questions:
                currentGame.questions,

            savedAt:
                Date.now()

        };

        localStorage.setItem(
            STATE_KEY,
            JSON.stringify(state)
        );

        showToast(
            t("saved")
        );

    }


    function loadSavedGame() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    STATE_KEY
                )
            );

        } catch {

            return null;

        }

    }


    function clearSavedGame() {

        localStorage.removeItem(
            STATE_KEY
        );

    }


    /* ============================================================
       MODAL
    ============================================================ */

    function modal() {

        let root =
            document.getElementById(
                "modal-root"
            );

        if (!root) {

            root =
                document.createElement(
                    "div"
                );

            root.id =
                "modal-root";

            document.body.appendChild(
                root
            );

        }

        return root;

    }


    function openModal(html) {

        const root =
            modal();

        root.innerHTML = `
            <div class="zz-modal-backdrop">
                <div class="zz-modal">
                    ${html}
                </div>
            </div>
        `;

        root
            .querySelector(
                ".zz-modal-backdrop"
            )
            .addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        this
                    ) {

                        closeModal();

                    }

                }
            );

    }


    function closeModal() {

        const root =
            document.getElementById(
                "modal-root"
            );

        if (root) {

            root.innerHTML = "";

        }

    }


    function showToast(message) {

        let toast =
            document.getElementById(
                "zz-toast"
            );

        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.id =
                "zz-toast";

            toast.className =
                "zz-toast";

            document.body.appendChild(
                toast
            );

        }

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );

        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

    }


    /* ============================================================
       LOGIN / REGISTER BRIDGE
    ============================================================ */

    function requestAccount() {

        if (
            window.ZIVOZONE_AUTH
        ) {

            openAccountModal();

            return;

        }

        showToast(
            "نظام الحسابات غير جاهز."
        );

    }


    function openAccountModal() {

        openModal(`

            <div class="zz-account">

                <button
                    class="zz-close"
                    data-close-modal
                    type="button">
                    ×
                </button>

                <div class="zz-account-logo">
                    Z
                </div>

                <h2>
                    ZIVOZONE
                </h2>

                <p>
                    احفظ تقدمك ونتائجك واصنع ملف لاعبك.
                </p>

                <div class="zz-tabs">

                    <button
                        type="button"
                        class="active"
                        data-auth-tab="register">
                        إنشاء حساب
                    </button>

                    <button
                        type="button"
                        data-auth-tab="login">
                        تسجيل الدخول
                    </button>

                </div>

                <form
                    id="zz-register-form">

                    <input
                        id="zz-name"
                        required
                        minlength="2"
                        maxlength="50"
                        placeholder="اسم اللاعب">

                    <input
                        id="zz-age"
                        required
                        type="number"
                        min="5"
                        max="100"
                        placeholder="العمر">

                    <input
                        id="zz-email"
                        required
                        type="email"
                        placeholder="البريد الإلكتروني">

                    <input
                        id="zz-password"
                        required
                        minlength="6"
                        type="password"
                        placeholder="كلمة المرور">

                    <button
                        class="btn btn-primary full"
                        type="submit">
                        إنشاء الحساب
                    </button>

                </form>

                <form
                    id="zz-login-form"
                    style="display:none">

                    <input
                        id="zz-login-email"
                        required
                        type="email"
                        placeholder="البريد الإلكتروني">

                    <input
                        id="zz-login-password"
                        required
                        type="password"
                        placeholder="كلمة المرور">

                    <button
                        class="btn btn-primary full"
                        type="submit">
                        تسجيل الدخول
                    </button>

                </form>

                <button
                    class="btn btn-ghost full"
                    type="button"
                    data-close-modal>
                    إلغاء
                </button>

                <div
                    id="zz-auth-message"
                    class="zz-auth-message">
                </div>

            </div>

        `);

        bindAccountEvents();

    }


    function bindAccountEvents() {

        document
            .querySelectorAll(
                "[data-close-modal]"
            )
            .forEach(
                button => {

                    button.onclick =
                        closeModal;

                }
            );


        document
            .querySelectorAll(
                "[data-auth-tab]"
            )
            .forEach(
                button => {

                    button.onclick =
                        function () {

                            const mode =
                                this.dataset.authTab;

                            document
                                .querySelectorAll(
                                    "[data-auth-tab]"
                                )
                                .forEach(
                                    item =>
                                        item.classList
                                            .remove(
                                                "active"
                                            )
                                );

                            this.classList.add(
                                "active"
                            );

                            document
                                .getElementById(
                                    "zz-register-form"
                                )
                                .style.display =
                                mode === "register"
                                    ? "block"
                                    : "none";

                            document
                                .getElementById(
                                    "zz-login-form"
                                )
                                .style.display =
                                mode === "login"
                                    ? "block"
                                    : "none";

                        };

                }
            );


        const register =
            document.getElementById(
                "zz-register-form"
            );

        if (register) {

            register.onsubmit =
                async function (event) {

                    event.preventDefault();

                    const message =
                        document.getElementById(
                            "zz-auth-message"
                        );

                    try {

                        message.textContent =
                            "جاري إنشاء الحساب...";

                        const result =
                            await window
                                .ZIVOZONE_AUTH
                                .registerPlayer({

                                    name:
                                        document
                                            .getElementById(
                                                "zz-name"
                                            )
                                            .value,

                                    age:
                                        document
                                            .getElementById(
                                                "zz-age"
                                            )
                                            .value,

                                    email:
                                        document
                                            .getElementById(
                                                "zz-email"
                                            )
                                            .value,

                                    password:
                                        document
                                            .getElementById(
                                                "zz-password"
                                            )
                                            .value,

                                    language:
                                        language

                                });

                        if (
                            result &&
                            result.success
                        ) {

                            closeModal();

                            showToast(
                                "تم إنشاء حسابك بنجاح 🎉"
                            );

                            syncAuthPlayer(
                                result.player
                            );

                        }

                    } catch (error) {

                        message.textContent =
                            error.message ||
                            "تعذر إنشاء الحساب.";

                    }

                };

        }


        const login =
            document.getElementById(
                "zz-login-form"
            );

        if (login) {

            login.onsubmit =
                async function (event) {

                    event.preventDefault();

                    const message =
                        document.getElementById(
                            "zz-auth-message"
                        );

                    try {

                        message.textContent =
                            "جاري تسجيل الدخول...";

                        const result =
                            await window
                                .ZIVOZONE_AUTH
                                .loginPlayer(

                                    document
                                        .getElementById(
                                            "zz-login-email"
                                        )
                                        .value,

                                    document
                                        .getElementById(
                                            "zz-login-password"
                                        )
                                        .value

                                );

                        if (
                            result &&
                            result.success
                        ) {

                            closeModal();

                            showToast(
                                "تم تسجيل الدخول 👋"
                            );

                            syncAuthPlayer(
                                result.player
                            );

                        }

                    } catch (error) {

                        message.textContent =
                            error.message ||
                            "تعذر تسجيل الدخول.";

                    }

                };

        }

    }


    /* ============================================================
       AUTH SYNC
    ============================================================ */

    function syncAuthPlayer(data) {

        if (!data) {
            return;
        }

        authState.loggedIn =
            true;

        authState.player =
            data;

        player.name =
            data.name ||
            player.name;

        player.age =
            data.age ||
            player.age;

        player.xp =
            Number(data.xp) ||
            player.xp;

        player.points =
            Number(data.points) ||
            player.points;

        player.level =
            Number(data.level) ||
            player.level;

        saveGuestPlayer();

        updateUI();

    }


    window.addEventListener(
        "zivozone-auth",
        function (event) {

            const detail =
                event.detail || {};

            authState =
                detail;

            if (
                detail.loggedIn &&
                detail.player
            ) {

                syncAuthPlayer(
                    detail.player
                );

            }

            updateUI();

        }
    );


    /* ============================================================
       START NORMAL GAME
    ============================================================ */

    function startGame(id) {

        const challenge =
            getChallenge(id);

        if (!challenge) {

            showToast(
                "هذا التحدي غير موجود."
            );

            return;

        }

        if (
            challenge.special
        ) {

            startHorror();

            return;

        }


        const questions =
            buildNormalQuestions(
                challenge
            );

        if (!questions.length) {

            showToast(
                "لا توجد أسئلة متاحة."
            );

            return;

        }


        currentGame = {

            type: id,

            title:
                challenge.title ||
                id,

            questions,

            index: 0,

            correct: 0,

            score: 0,

            totalTime: 0,

            startedAt: 0,

            locked: false,

            horror: false

        };


        showQuiz();

    }


    /* ============================================================
       HORROR
    ============================================================ */

    function startHorror() {

        const saved =
            loadSavedGame();

        if (
            saved &&
            saved.type === "horror" &&
            saved.index <
                saved.questions.length
        ) {

            openResumeModal(
                saved
            );

            return;

        }


        const questions =
            buildHorrorQuestions();

        if (
            questions.length !== 30
        ) {

            showToast(
                "تعذر تحميل الغرفة المظلمة."
            );

            return;

        }


        currentGame = {

            type: "horror",

            title:
                t("horror"),

            questions,

            index: 0,

            correct: 0,

            score: 0,

            totalTime: 0,

            startedAt: 0,

            locked: false,

            horror: true

        };


        document.body.classList.add(
            "horror-active"
        );

        showQuiz();

    }


    function openResumeModal(saved) {

        openModal(`

            <div class="resume-box">

                <div class="guardian-eye">
                    👁️
                </div>

                <h2>
                    ${t("resume")}
                </h2>

                <p>
                    ${t("resumeText")}
                </p>

                <strong>
                    السؤال
                    ${saved.index + 1}
                    /
                    ${saved.questions.length}
                </strong>

                <div class="resume-actions">

                    <button
                        class="btn btn-primary"
                        id="resume-game">
                        ${t("continue")}
                    </button>

                    <button
                        class="btn btn-ghost"
                        id="restart-horror">
                        ${t("restart")}
                    </button>

                    <button
                        class="btn btn-danger"
                        id="delete-horror-save">
                        ${t("deleteSave")}
                    </button>

                </div>

            </div>

        `);


        document.getElementById(
            "resume-game"
        ).onclick =
            function () {

                closeModal();

                currentGame =
                    saved;

                currentGame.locked =
                    false;

                if (
                    currentGame.horror
                ) {

                    document.body.classList
                        .add(
                            "horror-active"
                        );

                }

                showQuiz();

            };


        document.getElementById(
            "restart-horror"
        ).onclick =
            function () {

                clearSavedGame();

                closeModal();

                startHorrorFresh();

            };


        document.getElementById(
            "delete-horror-save"
        ).onclick =
            function () {

                clearSavedGame();

                closeModal();

                showToast(
                    "تم حذف التقدم."
                );

            };

    }


    function startHorrorFresh() {

        const questions =
            buildHorrorQuestions();

        currentGame = {

            type: "horror",

            title:
                t("horror"),

            questions,

            index: 0,

            correct: 0,

            score: 0,

            totalTime: 0,

            startedAt: 0,

            locked: false,

            horror: true

        };

        document.body.classList.add(
            "horror-active"
        );

        showQuiz();

    }


    /* ============================================================
       QUIZ UI
    ============================================================ */

    function showQuiz() {

        clearTimer();

        const root =
            modal();

        const q =
            currentGame.questions[
                currentGame.index
            ];

        const total =
            currentGame.questions.length;

        const phase =
            currentGame.horror
                ? getHorrorPhase(
                    currentGame.index + 1
                )
                : null;


        root.innerHTML = `

            <div class="
                zz-modal-backdrop
                quiz-backdrop
                ${currentGame.horror
                    ? "horror-quiz"
                    : ""}
            ">

                <div class="
                    zz-modal
                    quiz-modal
                ">

                    <div class="quiz-top">

                        <button
                            id="quiz-back"
                            class="icon-button"
                            type="button">
                            ←
                        </button>

                        <div>

                            <span
                                class="quiz-type">
                                ${
                                    currentGame.horror
                                    ? "👁️ HORROR"
                                    : "🧠 ZIVO CHALLENGE"
                                }
                            </span>

                            <h2>
                                ${
                                    currentGame.horror
                                    ? t("horror")
                                    : currentGame.title
                                }
                            </h2>

                        </div>

                        <div class="quiz-counter">
                            ${currentGame.index + 1}
                            /
                            ${total}
                        </div>

                    </div>


                    ${
                        currentGame.horror
                        ? `
                            <div class="horror-phase">
                                ${phase.name}
                            </div>

                            <div
                                class="guardian-message">
                                ${escapeHTML(
                                    guardianMessage(
                                        currentGame.index + 1
                                    )
                                )}
                            </div>
                        `
                        : ""
                    }


                    <div class="quiz-progress">

                        <span
                            style="
                                width:
                                ${
                                    (
                                        currentGame.index /
                                        total
                                    ) * 100
                                }%;
                            ">
                        </span>

                    </div>


                    <div class="timer-box">

                        <span>
                            ⏱
                        </span>

                        <strong
                            id="zz-timer">
                            --
                        </strong>

                    </div>


                    <div class="question-box">

                        <span class="difficulty">
                            ${difficultyLabel(
                                q.difficulty
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                q.question
                            )}
                        </h3>

                    </div>


                    <div
                        id="zz-answers"
                        class="answers-grid">
                    </div>


                    <div
                        id="zz-feedback"
                        class="zz-feedback">
                    </div>


                    <div class="quiz-actions">

                        <button
                            id="save-current-game"
                            class="btn btn-ghost"
                            type="button">
                            💾 ${t("save")}
                        </button>

                        <button
                            id="exit-current-game"
                            class="btn btn-ghost"
                            type="button">
                            ${t("back")}
                        </button>

                    </div>

                </div>

            </div>

        `;


        renderAnswers(q);

        bindQuizEvents();

        startTimerForQuestion();

    }


    function getHorrorPhase(number) {

        if (number <= 10) {

            return {
                name:
                    t("phase1"),
                className:
                    "phase-one"
            };

        }

        if (number <= 20) {

            return {
                name:
                    t("phase2"),
                className:
                    "phase-two"
            };

        }

        return {

            name:
                t("phase3"),

            className:
                "phase-three"

        };

    }


    function guardianMessage(number) {

        const messages = [

            "أنت دخلت فقط... لماذا لا تخرج؟",

            "أنا أراك.",

            "السؤال التالي ليس كما يبدو.",

            "لقد وصلت أبعد مما توقعت.",

            "لا تحاول تخمين ما أريد.",

            "بقي القليل.",

            "أنت تعرف أنني هنا.",

            "آخر ثلاث مراحل... لا تخطئ."

        ];

        if (
            number <= 3
        ) {

            return messages[0];

        }

        if (
            number <= 8
        ) {

            return messages[1];

        }

        if (
            number <= 12
        ) {

            return messages[2];

        }

        if (
            number <= 16
        ) {

            return messages[3];

        }

        if (
            number <= 20
        ) {

            return messages[4];

        }

        if (
            number <= 25
        ) {

            return messages[5];

        }

        if (
            number <= 28
        ) {

            return messages[6];

        }

        return messages[7];

    }


    function renderAnswers(q) {

        const container =
            document.getElementById(
                "zz-answers"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        shuffle(
            q.answers
        )
        .forEach(
            function (answer) {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "answer";

                button.textContent =
                    answer.text;

                button.dataset.correct =
                    answer.correct
                        ? "true"
                        : "false";

                button.onclick =
                    function () {

                        submitAnswer(
                            answer.correct,
                            button
                        );

                    };

                container.appendChild(
                    button
                );

            }
        );

    }


    /* ============================================================
       TIMER
    ============================================================ */

    function getQuestionTime() {

        const q =
            currentGame.questions[
                currentGame.index
            ];

        if (
            currentGame.horror
        ) {

            if (
                q.difficulty >= 28
            ) {
                return 12;
            }

            if (
                q.difficulty >= 21
            ) {
                return 15;
            }

            if (
                q.difficulty >= 11
            ) {
                return 18;
            }

            return 22;

        }


        return Math.max(
            12,
            30 -
            Math.floor(
                q.difficulty / 2
            )
        );

    }


    function startTimerForQuestion() {

        clearTimer();

        timeLeft =
            getQuestionTime();

        const element =
            document.getElementById(
                "zz-timer"
            );

        if (!element) {
            return;
        }

        element.textContent =
            timeLeft;

        timer =
            setInterval(
                function () {

                    timeLeft--;

                    element.textContent =
                        timeLeft;

                    if (
                        timeLeft <= 5
                    ) {

                        element.classList.add(
                            "danger"
                        );

                        if (
                            currentGame.horror
                        ) {

                            document.body.classList
                                .add(
                                    "horror-pulse"
                                );

                        }

                    }

                    if (
                        timeLeft <= 0
                    ) {

                        clearTimer();

                        submitAnswer(
                            false,
                            null,
                            true
                        );

                    }

                },
                1000
            );

    }


    function clearTimer() {

        if (timer) {

            clearInterval(
                timer
            );

            timer = null;

        }

    }


    /* ============================================================
       ANSWER
    ============================================================ */

    function submitAnswer(
        correct,
        selectedButton,
        timeout
    ) {

        if (
            !currentGame ||
            currentGame.locked
        ) {
            return;
        }

        currentGame.locked =
            true;

        clearTimer();

        const buttons =
            document.querySelectorAll(
                "#zz-answers .answer"
            );

        buttons.forEach(
            button => {

                button.disabled =
                    true;

                if (
                    button.dataset.correct
                    === "true"
                ) {

                    button.classList.add(
                        "correct"
                    );

                }

            }
        );


        if (
            selectedButton &&
            !correct
        ) {

            selectedButton.classList.add(
                "wrong"
            );

        }


        const elapsed =
            Math.max(
                0.5,
                getQuestionTime() -
                timeLeft
            );

        currentGame.totalTime +=
            elapsed;


        const q =
            currentGame.questions[
                currentGame.index
            ];


        let earned =
            0;


        if (correct) {

            currentGame.correct++;

            earned =
                (
                    q.difficulty *
                    20
                ) +
                Math.max(
                    0,
                    Math.round(
                        (
                            getQuestionTime() -
                            elapsed
                        ) * 2
                    )
                );

            if (
                currentGame.horror
            ) {

                earned *=
                    Math.min(
                        3,
                        1 +
                        (
                            q.difficulty /
                            20
                        )
                    );

                earned =
                    Math.round(
                        earned
                    );

            }

            currentGame.score +=
                earned;

        }


        const feedback =
            document.getElementById(
                "zz-feedback"
            );

        if (feedback) {

            if (correct) {

                feedback.textContent =
                    `${t("correct")} +${earned}`;

                feedback.className =
                    "zz-feedback success";

            }

            else if (timeout) {

                feedback.textContent =
                    t("timeout");

                feedback.className =
                    "zz-feedback danger";

            }

            else {

                feedback.textContent =
                    t("wrong");

                feedback.className =
                    "zz-feedback danger";

            }

        }


        if (
            currentGame.horror
        ) {

            horrorReaction(
                correct
            );

        }


        setTimeout(
            function () {

                currentGame.index++;

                saveSilentProgress();

                if (
                    currentGame.index >=
                    currentGame.questions.length
                ) {

                    finishGame();

                }

                else {

                    renderQuizAgain();

                }

            },
            currentGame.horror
                ? 1500
                : 1000
        );

    }


    function renderQuizAgain() {

        if (
            currentGame.horror
        ) {

            showQuiz();

        }
        else {

            showQuiz();

        }

    }


    /* ============================================================
       HORROR EFFECTS
    ============================================================ */

    function horrorReaction(correct) {

        document.body.classList.remove(
            "horror-pulse"
        );

        if (!correct) {

            document.body.classList.add(
                "horror-error"
            );

            setTimeout(
                function () {

                    document.body.classList.remove(
                        "horror-error"
                    );

                },
                900
            );

        }

        if (
            currentGame.index >= 20
        ) {

            document.body.classList.add(
                "horror-extreme"
            );

        }

    }


    /* ============================================================
       FINISH
    ============================================================ */

    function finishGame() {

        clearTimer();

        clearSavedGame();

        document.body.classList.remove(
            "horror-active",
            "horror-pulse",
            "horror-error",
            "horror-extreme"
        );


        const total =
            currentGame.questions.length;

        const accuracy =
            total
                ? Math.round(
                    (
                        currentGame.correct /
                        total
                    ) * 100
                )
                : 0;


        player.points +=
            Math.round(
                currentGame.score
            );

        player.xp +=
            Math.round(
                currentGame.score
            );

        player.games++;

        player.correct +=
            currentGame.correct;

        player.answered +=
            total;

        calculateLevel();

        saveGuestPlayer();


        showResult(
            accuracy
        );

    }


    function showResult(accuracy) {

        const horror =
            currentGame.horror;


        openModal(`

            <div class="
                result-screen
                ${horror
                    ? "horror-result"
                    : ""}
            ">

                ${
                    horror
                    ? `
                        <div class="result-eye">
                            👁️
                        </div>
                    `
                    : `
                        <div class="result-icon">
                            🧠
                        </div>
                    `
                }


                <span class="eyebrow">
                    ${t("result")}
                </span>


                <h2>

                    ${
                        horror
                        ? "لقد خرجت... أم أنك تظن ذلك؟"
                        : "أداء رائع"
                    }

                </h2>


                <div class="result-grid">

                    <div>
                        <strong>
                            ${currentGame.score}
                        </strong>
                        <span>
                            ${t("points")}
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${currentGame.correct}/${currentGame.questions.length}
                        </strong>
                        <span>
                            ${t("correct")}
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${accuracy}%
                        </strong>
                        <span>
                            ${t("level")}
                        </span>
                    </div>

                    <div>
                        <strong>
                            ${player.level}
                        </strong>
                        <span>
                            ${t("xp")}
                        </span>
                    </div>

                </div>


                ${
                    !authState.loggedIn
                    ? `
                        <div class="guest-save-box">

                            <strong>
                                ${t("visitor")}
                            </strong>

                            <p>
                                ${t("guestSave")}
                            </p>

                            <button
                                class="btn btn-primary"
                                id="result-create-account">
                                ${t("register")}
                            </button>

                        </div>
                    `
                    : ""
                }


                <div class="result-actions">

                    <button
                        class="btn btn-primary"
                        id="result-again">
                        ${t("restart")}
                    </button>

                    <button
                        class="btn btn-ghost"
                        id="result-back">
                        ${t("back")}
                    </button>

                    <button
                        class="btn btn-ghost"
                        id="result-share">
                        ${t("challengeFriend")}
                    </button>

                </div>

            </div>

        `);


        const again =
            document.getElementById(
                "result-again"
            );

        if (again) {

            again.onclick =
                function () {

                    closeModal();

                    if (horror) {

                        startHorrorFresh();

                    }
                    else {

                        startGame(
                            currentGame.type
                        );

                    }

                };

        }


        const back =
            document.getElementById(
                "result-back"
            );

        if (back) {

            back.onclick =
                function () {

                    closeModal();

                    window.location.hash =
                        "games";

                };

        }


        const share =
            document.getElementById(
                "result-share"
            );

        if (share) {

            share.onclick =
                shareChallenge;

        }


        const account =
            document.getElementById(
                "result-create-account"
            );

        if (account) {

            account.onclick =
                requestAccount;

        }

    }


    /* ============================================================
       SHARE
    ============================================================ */

    async function shareChallenge() {

        const url =
            window.location.origin +
            window.location.pathname +
            "#challenge=" +
            encodeURIComponent(
                currentGame.type
            );

        try {

            if (
                navigator.share
            ) {

                await navigator.share({

                    title:
                        "ZIVOZONE Challenge",

                    text:
                        "هل تستطيع التغلب علي في ZIVOZONE؟",

                    url

                });

            }

            else {

                await navigator.clipboard
                    .writeText(
                        url
                    );

                showToast(
                    t("shareCopied")
                );

            }

        } catch {

            try {

                await navigator.clipboard
                    .writeText(
                        url
                    );

                showToast(
                    t("shareCopied")
                );

            } catch {

                showToast(
                    url
                );

            }

        }

    }


    /* ============================================================
       SAVE SILENTLY
    ============================================================ */

    function saveSilentProgress() {

        if (
            !currentGame
        ) {
            return;
        }

        localStorage.setItem(
            STATE_KEY,
            JSON.stringify(
                currentGame
            )
        );

    }


    /* ============================================================
       QUIZ EVENTS
    ============================================================ */

    function bindQuizEvents() {

        const save =
            document.getElementById(
                "save-current-game"
            );

        if (save) {

            save.onclick =
                saveGameState;

        }


        const exit =
            document.getElementById(
                "exit-current-game"
            );

        if (exit) {

            exit.onclick =
                function () {

                    saveSilentProgress();

                    clearTimer();

                    document.body.classList
                        .remove(
                            "horror-active"
                        );

                    closeModal();

                    showToast(
                        t("saved")
                    );

                };

        }


        const back =
            document.getElementById(
                "quiz-back"
            );

        if (back) {

            back.onclick =
                function () {

                    saveSilentProgress();

                    clearTimer();

                    document.body.classList
                        .remove(
                            "horror-active"
                        );

                    closeModal();

                };

        }

    }


    /* ============================================================
       DIFFICULTY
    ============================================================ */

    function difficultyLabel(level) {

        if (level >= 28) {

            return "☠️ EXTREME";

        }

        if (level >= 21) {

            return "🔥 VERY HARD";

        }

        if (level >= 11) {

            return "⚠️ HARD";

        }

        if (level >= 7) {

            return "🟠 HARD";

        }

        if (level >= 4) {

            return "🟡 MEDIUM";

        }

        return "🟢 EASY";

    }


    /* ============================================================
       UI
    ============================================================ */

    function updateUI() {

        const name =
            authState.loggedIn &&
            authState.player
                ? authState.player.name
                : player.name ||
                  t("guest");


        document
            .querySelectorAll(
                "[data-player-name]"
            )
            .forEach(
                element =>
                    element.textContent =
                        name
            );


        document
            .querySelectorAll(
                "[data-player-xp]"
            )
            .forEach(
                element =>
                    element.textContent =
                        player.xp
            );


        document
            .querySelectorAll(
                "[data-player-level]"
            )
            .forEach(
                element =>
                    element.textContent =
                        player.level
            );


        document
            .querySelectorAll(
                "[data-player-points]"
            )
            .forEach(
                element =>
                    element.textContent =
                        player.points
            );


        const login =
            document.getElementById(
                "login-btn"
            );

        if (login) {

            login.textContent =
                authState.loggedIn
                    ? (
                        player.name ||
                        "الحساب"
                    )
                    : t("login");

        }

    }


    /* ============================================================
       GENERAL CLICK ROUTER
    ============================================================ */

    function bindGlobalEvents() {

        document.addEventListener(
            "click",
            function (event) {

                const game =
                    event.target.closest(
                        "[data-game]"
                    );

                if (game) {

                    event.preventDefault();

                    startGame(
                        game.dataset.game
                    );

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
                    type ===
                    "login"
                ) {

                    requestAccount();

                }


                if (
                    type ===
                    "scroll-games"
                ) {

                    document
                        .getElementById(
                            "games"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                }


                if (
                    type ===
                    "open-identity"
                ) {

                    showToast(
                        "قسم اكتشاف الشخصية جاهز للتطوير."
                    );

                }


                if (
                    type ===
                    "ad-info"
                ) {

                    showToast(
                        "مساحة إعلانية مستقبلية."
                    );

                }

            }
        );


        const languageSelect =
            document.getElementById(
                "language-select"
            );

        if (languageSelect) {

            languageSelect.value =
                language;

            languageSelect.onchange =
                function () {

                    language =
                        this.value;

                    localStorage.setItem(
                        LANGUAGE_KEY,
                        language
                    );

                    document.documentElement
                        .lang =
                        language;

                    document.documentElement
                        .dir =
                        language === "ar"
                            ? "rtl"
                            : "ltr";

                    updateUI();

                };

        }


        const login =
            document.getElementById(
                "login-btn"
            );

        if (login) {

            login.onclick =
                requestAccount;

        }

    }


    /* ============================================================
       LOADER
    ============================================================ */

    function hideLoader() {

        const loader =
            document.getElementById(
                "app-loader"
            );

        if (!loader) {
            return;
        }

        setTimeout(
            function () {

                loader.classList.add(
                    "hidden"
                );

            },
            500
        );

    }


    /* ============================================================
       INITIALIZE
    ============================================================ */

    function initialize() {

        document.documentElement
            .lang =
            language;

        document.documentElement
            .dir =
            language === "ar"
                ? "rtl"
                : "ltr";


        bindGlobalEvents();

        updateUI();

        hideLoader();


        console.log(
            "🚀 ZIVOZONE 2.0 READY"
        );

        console.log(
            "Guest Mode: ENABLED"
        );

        console.log(
            "Horror 30: ENABLED"
        );

    }


    /* ============================================================
       PUBLIC API
    ============================================================ */

    window.ZIVOZONE_APP = {

        startGame,

        startHorror,

        saveGameState,

        loadSavedGame,

        clearSavedGame,

        requestAccount

    };


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    }
    else {

        initialize();

    }

})();
