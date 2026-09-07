/* ============================================================
   ZIVOZONE APP ENGINE
   Version: 2.0
   ============================================================ */

(() => {
    "use strict";

    /* ---------------------------------------------------------
       STATE
    --------------------------------------------------------- */

    const state = {
        user: null,
        player: null,
        language: "ar",

        game: {
            active: false,
            type: null,
            questions: [],
            index: 0,
            score: 0,
            xp: 0,
            coins: 0,
            answered: false
        }
    };


    /* ---------------------------------------------------------
       TRANSLATIONS
       --------------------------------------------------------- */

    const translations = {

        ar: {
            guest: "زائر",
            login: "تسجيل الدخول",
            logout: "تسجيل الخروج",
            level: "المستوى",
            xp: "XP",
            coins: "ZIVO",
            correct: "إجابة صحيحة! 🎉",
            wrong: "إجابة غير صحيحة",
            finished: "انتهت اللعبة!",
            loginRequired: "يجب تسجيل الدخول لحفظ تقدمك.",
            question: "السؤال",
            next: "السؤال التالي",
            finish: "إنهاء",
            start: "ابدأ",
            welcome: "أهلاً بك في ZIVOZONE"
        },

        en: {
            guest: "Guest",
            login: "Login",
            logout: "Logout",
            level: "Level",
            xp: "XP",
            coins: "ZIVO",
            correct: "Correct! 🎉",
            wrong: "Wrong answer",
            finished: "Game finished!",
            loginRequired: "Login is required to save progress.",
            question: "Question",
            next: "Next question",
            finish: "Finish",
            start: "Start",
            welcome: "Welcome to ZIVOZONE"
        },

        fr: {
            guest: "Invité",
            login: "Connexion",
            logout: "Déconnexion",
            level: "Niveau",
            xp: "XP",
            coins: "ZIVO",
            correct: "Bonne réponse ! 🎉",
            wrong: "Mauvaise réponse",
            finished: "Jeu terminé !",
            loginRequired: "Connectez-vous pour sauvegarder votre progression.",
            question: "Question",
            next: "Question suivante",
            finish: "Terminer",
            start: "Commencer",
            welcome: "Bienvenue sur ZIVOZONE"
        },

        es: {
            guest: "Invitado",
            login: "Iniciar sesión",
            logout: "Cerrar sesión",
            level: "Nivel",
            xp: "XP",
            coins: "ZIVO",
            correct: "¡Correcto! 🎉",
            wrong: "Respuesta incorrecta",
            finished: "¡Juego terminado!",
            loginRequired: "Inicia sesión para guardar tu progreso.",
            question: "Pregunta",
            next: "Siguiente",
            finish: "Finalizar",
            start: "Empezar",
            welcome: "Bienvenido a ZIVOZONE"
        },

        tr: {
            guest: "Misafir",
            login: "Giriş yap",
            logout: "Çıkış",
            level: "Seviye",
            xp: "XP",
            coins: "ZIVO",
            correct: "Doğru! 🎉",
            wrong: "Yanlış cevap",
            finished: "Oyun bitti!",
            loginRequired: "İlerlemenizi kaydetmek için giriş yapın.",
            question: "Soru",
            next: "Sonraki soru",
            finish: "Bitir",
            start: "Başla",
            welcome: "ZIVOZONE'a hoş geldiniz"
        },

        de: {
            guest: "Gast",
            login: "Anmelden",
            logout: "Abmelden",
            level: "Level",
            xp: "XP",
            coins: "ZIVO",
            correct: "Richtig! 🎉",
            wrong: "Falsche Antwort",
            finished: "Spiel beendet!",
            loginRequired: "Melde dich an, um deinen Fortschritt zu speichern.",
            question: "Frage",
            next: "Nächste Frage",
            finish: "Beenden",
            start: "Start",
            welcome: "Willkommen bei ZIVOZONE"
        }
    };


    function t(key) {

        return (
            translations[state.language]?.[key] ||
            translations.ar[key] ||
            key
        );
    }


    /* ---------------------------------------------------------
       QUESTION BANK
       --------------------------------------------------------- */

    const QUESTIONS = {

        quiz: [

            {
                level: 1,
                question: "ما هو الكوكب الأقرب إلى الشمس؟",
                answers: [
                    "الأرض",
                    "المريخ",
                    "عطارد",
                    "المشتري"
                ],
                correct: 2
            },

            {
                level: 1,
                question: "كم عدد أيام الأسبوع؟",
                answers: [
                    "5",
                    "6",
                    "7",
                    "8"
                ],
                correct: 2
            },

            {
                level: 1,
                question: "ما ناتج 5 + 7؟",
                answers: [
                    "10",
                    "11",
                    "12",
                    "13"
                ],
                correct: 2
            },

            {
                level: 2,
                question: "إذا كان لديك 3 صناديق وفي كل صندوق 4 كرات، كم كرة لديك؟",
                answers: [
                    "7",
                    "10",
                    "12",
                    "14"
                ],
                correct: 2
            },

            {
                level: 2,
                question: "أي رقم يأتي بعد 2، 4، 8، 16؟",
                answers: [
                    "20",
                    "24",
                    "30",
                    "32"
                ],
                correct: 3
            },

            {
                level: 3,
                question: "ما العدد التالي: 3، 6، 12، 24، ؟",
                answers: [
                    "36",
                    "42",
                    "48",
                    "54"
                ],
                correct: 2
            },

            {
                level: 3,
                question: "إذا كان جميع A هم B، وبعض B هم C، هل يجب أن يكون بعض A هم C؟",
                answers: [
                    "نعم دائمًا",
                    "لا، ليس بالضرورة",
                    "نعم فقط إذا كان A كبيرًا",
                    "لا يمكن أن يوجد C"
                ],
                correct: 1
            },

            {
                level: 4,
                question: "لديك 8 كرات متشابهة وواحدة أثقل، ما أقل عدد من الوزنات بميزان كفتين لمعرفة الكرة الثقيلة؟",
                answers: [
                    "1",
                    "2",
                    "3",
                    "4"
                ],
                correct: 1
            },

            {
                level: 5,
                question: "إذا كانت كل X هي Y، ولا توجد أي Y هي Z، فماذا نستنتج عن X و Z؟",
                answers: [
                    "كل X هي Z",
                    "بعض X هي Z",
                    "لا توجد X هي Z",
                    "لا يمكن الاستنتاج"
                ],
                correct: 2
            }
        ],


        science: [

            {
                level: 1,
                question: "ما الغاز الذي يحتاجه الإنسان للتنفس؟",
                answers: [
                    "الأكسجين",
                    "الهيدروجين",
                    "النيتروجين",
                    "الهيليوم"
                ],
                correct: 0
            },

            {
                level: 1,
                question: "ما العضو الذي يضخ الدم؟",
                answers: [
                    "الكبد",
                    "القلب",
                    "الرئة",
                    "المعدة"
                ],
                correct: 1
            },

            {
                level: 2,
                question: "ما القوة التي تجذب الأشياء نحو الأرض؟",
                answers: [
                    "المغناطيسية",
                    "الاحتكاك",
                    "الجاذبية",
                    "الضغط"
                ],
                correct: 2
            },

            {
                level: 2,
                question: "ما حالة الماء عند درجة تجمده؟",
                answers: [
                    "غاز",
                    "سائل",
                    "صلب",
                    "بلازما"
                ],
                correct: 2
            },

            {
                level: 3,
                question: "أي جزء من الخلية يحتوي عادةً على المادة الوراثية؟",
                answers: [
                    "النواة",
                    "الغشاء",
                    "السيتوبلازم",
                    "الجدار"
                ],
                correct: 0
            }
        ],


        daily: [

            {
                level: 1,
                question: "ما هو العدد الذي إذا ضربته بنفسه يعطي 25؟",
                answers: [
                    "3",
                    "4",
                    "5",
                    "6"
                ],
                correct: 2
            },

            {
                level: 2,
                question: "ما الشيء الذي كلما أخذت منه كبر؟",
                answers: [
                    "الحفرة",
                    "الكتاب",
                    "الماء",
                    "الشجرة"
                ],
                correct: 0
            },

            {
                level: 3,
                question: "ما الذي له مفاتيح ولا يفتح أبوابًا؟",
                answers: [
                    "البيانو",
                    "السيارة",
                    "البيت",
                    "القفل"
                ],
                correct: 0
            }
        ]
    };


    /* ---------------------------------------------------------
       DOM HELPERS
       --------------------------------------------------------- */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);


    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* ---------------------------------------------------------
       TOAST
       --------------------------------------------------------- */

    function toast(message, type = "info") {

        const container =
            $("#toast-container");

        if (!container) {
            return;
        }


        const element =
            document.createElement("div");

        element.className =
            `toast toast-${type}`;


        element.textContent =
            message;


        container.appendChild(element);


        setTimeout(() => {

            element.classList.add("hide");

            setTimeout(
                () => element.remove(),
                300
            );

        }, 3000);
    }


    /* ---------------------------------------------------------
       MODAL
       --------------------------------------------------------- */

    function openModal(content) {

        const root =
            $("#modal-root");

        if (!root) {
            return;
        }


        root.innerHTML = `
            <div class="modal-backdrop" data-close-modal>
                <div class="modal-card" role="dialog" aria-modal="true">
                    ${content}
                </div>
            </div>
        `;


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        const backdrop =
            $(".modal-backdrop", root);


        backdrop?.addEventListener(
            "click",
            event => {

                if (
                    event.target === backdrop ||
                    event.target.matches("[data-close-modal]")
                ) {

                    closeModal();
                }
            }
        );
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


    /* ---------------------------------------------------------
       LOGIN MODAL
       --------------------------------------------------------- */

    function showAuthModal() {

        openModal(`
            <div class="auth-box">

                <button
                    class="modal-close"
                    type="button"
                    data-close-modal
                    aria-label="إغلاق"
                >
                    ×
                </button>

                <span class="eyebrow">
                    ZIVO ACCOUNT
                </span>

                <h2>
                    حسابك في ZIVOZONE
                </h2>

                <p>
                    احفظ تقدمك وXP وعملات ZIVO ومستواك.
                </p>

                <div class="auth-tabs">

                    <button
                        class="auth-tab active"
                        type="button"
                        data-auth-tab="login"
                    >
                        تسجيل الدخول
                    </button>

                    <button
                        class="auth-tab"
                        type="button"
                        data-auth-tab="register"
                    >
                        حساب جديد
                    </button>

                </div>


                <form
                    id="login-form"
                    class="auth-form"
                >

                    <label>
                        البريد الإلكتروني

                        <input
                            id="login-email"
                            type="email"
                            required
                            autocomplete="email"
                        >

                    </label>


                    <label>
                        كلمة المرور

                        <input
                            id="login-password"
                            type="password"
                            required
                            minlength="6"
                            autocomplete="current-password"
                        >

                    </label>


                    <button
                        class="btn btn-primary full"
                        type="submit"
                    >
                        تسجيل الدخول
                    </button>

                </form>


                <form
                    id="register-form"
                    class="auth-form"
                    hidden
                >

                    <label>
                        اسم اللاعب

                        <input
                            id="register-name"
                            type="text"
                            required
                            maxlength="50"
                        >

                    </label>


                    <label>
                        العمر

                        <input
                            id="register-age"
                            type="number"
                            min="5"
                            max="100"
                            required
                        >

                    </label>


                    <label>
                        البريد الإلكتروني

                        <input
                            id="register-email"
                            type="email"
                            required
                            autocomplete="email"
                        >

                    </label>


                    <label>
                        كلمة المرور

                        <input
                            id="register-password"
                            type="password"
                            minlength="6"
                            required
                            autocomplete="new-password"
                        >

                    </label>


                    <button
                        class="btn btn-primary full"
                        type="submit"
                    >
                        إنشاء الحساب
                    </button>

                </form>

            </div>
        `);


        setupAuthForms();
    }


    function setupAuthForms() {

        $$("[data-auth-tab]").forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    const mode =
                        tab.dataset.authTab;


                    $$("[data-auth-tab]")
                        .forEach(item =>
                            item.classList.toggle(
                                "active",
                                item === tab
                            )
                        );


                    const login =
                        $("#login-form");

                    const register =
                        $("#register-form");


                    if (mode === "login") {

                        login.hidden = false;
                        register.hidden = true;

                    } else {

                        login.hidden = true;
                        register.hidden = false;
                    }
                }
            );
        });


        $("#login-form")
            ?.addEventListener(
                "submit",
                handleLogin
            );


        $("#register-form")
            ?.addEventListener(
                "submit",
                handleRegister
            );
    }


    async function handleLogin(event) {

        event.preventDefault();


        const email =
            $("#login-email")?.value;


        const password =
            $("#login-password")?.value;


        if (
            !window.ZIVOZONE_AUTH ||
            typeof window.ZIVOZONE_AUTH.loginPlayer !== "function"
        ) {

            toast(
                "نظام الحسابات لم يتم تحميله بعد.",
                "error"
            );

            return;
        }


        try {

            await window.ZIVOZONE_AUTH.loginPlayer(
                email,
                password
            );


            closeModal();

            toast(
                "تم تسجيل الدخول بنجاح 🎉",
                "success"
            );

        } catch (error) {

            toast(
                error.message ||
                "تعذر تسجيل الدخول.",
                "error"
            );
        }
    }


    async function handleRegister(event) {

        event.preventDefault();


        const data = {

            name:
                $("#register-name")?.value,

            age:
                $("#register-age")?.value,

            email:
                $("#register-email")?.value,

            password:
                $("#register-password")?.value,

            language:
                state.language
        };


        if (
            !window.ZIVOZONE_AUTH ||
            typeof window.ZIVOZONE_AUTH.registerPlayer !== "function"
        ) {

            toast(
                "نظام الحسابات لم يتم تحميله بعد.",
                "error"
            );

            return;
        }


        try {

            await window.ZIVOZONE_AUTH.registerPlayer(
                data
            );


            closeModal();

            toast(
                "تم إنشاء حسابك بنجاح 🎉",
                "success"
            );

        } catch (error) {

            toast(
                error.message ||
                "تعذر إنشاء الحساب.",
                "error"
            );
        }
    }


    /* ---------------------------------------------------------
       PLAYER UI
       --------------------------------------------------------- */

    function renderPlayer() {

        const player =
            state.player;


        const name =
            player?.name ||
            t("guest");


        const level =
            Number(player?.level || 1);


        const xp =
            Number(player?.xp || 0);


        const coins =
            Number(player?.coins || 0);


        const wins =
            Number(player?.wins || 0);


        const email =
            player?.email ||
            "لم يتم تسجيل الدخول";


        const elements = {

            quickName:
                $("#quick-player-name"),

            quickLevel:
                $("#quick-level"),

            quickXP:
                $("#quick-xp"),

            quickCoins:
                $("#quick-coins"),

            profileName:
                $("#profile-name"),

            profileEmail:
                $("#profile-email"),

            profileLevel:
                $("#profile-level"),

            profileXP:
                $("#profile-xp"),

            profileCoins:
                $("#profile-coins"),

            profileWins:
                $("#profile-wins"),

            economyCoins:
                $("#economy-coins"),

            economyXP:
                $("#economy-xp"),

            economyWins:
                $("#economy-wins"),

            levelChip:
                $("#player-level-chip")
        };


        if (elements.quickName)
            elements.quickName.textContent = name;

        if (elements.quickLevel)
            elements.quickLevel.textContent = level;

        if (elements.quickXP)
            elements.quickXP.textContent = xp;

        if (elements.quickCoins)
            elements.quickCoins.textContent = coins;

        if (elements.profileName)
            elements.profileName.textContent = name;

        if (elements.profileEmail)
            elements.profileEmail.textContent = email;

        if (elements.profileLevel)
            elements.profileLevel.textContent = level;

        if (elements.profileXP)
            elements.profileXP.textContent = xp;

        if (elements.profileCoins)
            elements.profileCoins.textContent = coins;

        if (elements.profileWins)
            elements.profileWins.textContent = wins;

        if (elements.economyCoins)
            elements.economyCoins.textContent = coins;

        if (elements.economyXP)
            elements.economyXP.textContent = xp;

        if (elements.economyWins)
            elements.economyWins.textContent = wins;

        if (elements.levelChip)
            elements.levelChip.textContent =
                `${t("level")} ${level}`;


        const logout =
            $("#logout-btn");


        if (logout) {

            logout.hidden =
                !state.user;
        }


        const loginButtons =
            $$('[data-action="login"]');


        loginButtons.forEach(button => {

            if (button.id === "logout-btn") {
                return;
            }


            button.textContent =
                state.user
                    ? "حسابي"
                    : t("login");
        });


        updateXPProgress();
    }


    function updateXPProgress() {

        const player =
            state.player;


        const level =
            Number(player?.level || 1);


        const xp =
            Number(player?.xp || 0);


        const currentLevelXP =
            (level - 1) * 100;


        const nextLevelXP =
            level * 100;


        const range =
            nextLevelXP -
            currentLevelXP;


        const progress =
            range > 0
                ? Math.max(
                    0,
                    Math.min(
                        100,
                        (
                            (xp - currentLevelXP) /
                            range
                        ) * 100
                    )
                )
                : 0;


        const bar =
            $("#xp-progress");


        if (bar) {

            bar.style.width =
                `${progress}%`;
        }
    }


    /* ---------------------------------------------------------
       XP / LEVEL SYSTEM
       --------------------------------------------------------- */

    function calculateLevel(xp) {

        return Math.max(
            1,
            Math.floor(
                Number(xp || 0) / 100
            ) + 1
        );
    }


    async function rewardPlayer(
        xp,
        coins,
        win = false
    ) {

        if (!state.user) {

            toast(
                t("loginRequired"),
                "warning"
            );

            return;
        }


        const player =
            state.player || {};


        const oldXP =
            Number(player.xp || 0);


        const oldCoins =
            Number(player.coins || 0);


        const newXP =
            oldXP +
            Math.max(
                0,
                Number(xp || 0)
            );


        const newCoins =
            oldCoins +
            Math.max(
                0,
                Number(coins || 0)
            );


        const newLevel =
            calculateLevel(newXP);


        const updates = {

            xp: newXP,

            coins: newCoins,

            level: newLevel,

            gamesPlayed:
                Number(player.gamesPlayed || 0) + 1,

            wins:
                Number(player.wins || 0) +
                (win ? 1 : 0)
        };


        try {

            const updated =
                await window.ZIVOZONE_AUTH.updatePlayer(
                    updates
                );


            state.player =
                updated;


            renderPlayer();


            if (newLevel > Number(player.level || 1)) {

                toast(
                    `🎉 ارتقيت إلى المستوى ${newLevel}!`,
                    "success"
                );
            }


        } catch (error) {

            console.error(
                "Reward error:",
                error
            );


            toast(
                "تعذر حفظ المكافأة.",
                "error"
            );
        }
    }


    /* ---------------------------------------------------------
       GAME HELPERS
       --------------------------------------------------------- */

    function getPlayerLevel() {

        return Math.max(
            1,
            Number(state.player?.level || 1)
        );
    }


    function getPlayerAge() {

        return Number(
            state.player?.age || 18
        );
    }


    function getQuestions(type) {

        const bank =
            QUESTIONS[type] ||
            QUESTIONS.quiz;


        const level =
            getPlayerLevel();


        const age =
            getPlayerAge();


        /*
         * اختيار الأسئلة يعتمد على مستوى اللاعب
         * مع مراعاة العمر بشكل تدريجي.
         */

        let allowedLevel =
            Math.min(
                5,
                Math.max(
                    1,
                    level
                )
            );


        if (age <= 8) {

            allowedLevel =
                Math.min(
                    allowedLevel,
                    1
                );

        } else if (age <= 12) {

            allowedLevel =
                Math.min(
                    allowedLevel,
                    2
                );
        }


        let questions =
            bank.filter(
                item =>
                    item.level <= allowedLevel
            );


        if (questions.length < 3) {

            questions =
                bank.slice();
        }


        return shuffle(
            questions
        ).slice(
            0,
            Math.min(
                5,
                questions.length
            )
        );
    }


    function shuffle(array) {

        const copy =
            [...array];


        for (
            let i = copy.length - 1;
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
            ] =
            [
                copy[j],
                copy[i]
            ];
        }


        return copy;
    }


    /* ---------------------------------------------------------
       START GAME
       --------------------------------------------------------- */

    function startGame(type) {

        if (
            type !== "horror" &&
            !state.user
        ) {

            showAuthModal();

            toast(
                "أنشئ حسابًا لحفظ نتائج اللعبة.",
                "warning"
            );

            return;
        }


        if (type === "horror") {

            startHorrorGame();

            return;
        }


        const questions =
            getQuestions(type);


        if (!questions.length) {

            toast(
                "لا توجد أسئلة متاحة حاليًا.",
                "error"
            );

            return;
        }


        state.game = {

            active: true,

            type,

            questions,

            index: 0,

            score: 0,

            xp: 0,

            coins: 0,

            answered: false
        };


        renderQuestion();
    }


    /* ---------------------------------------------------------
       RENDER QUESTION
       --------------------------------------------------------- */

    function renderQuestion() {

        const game =
            state.game;


        const question =
            game.questions[
                game.index
            ];


        if (!question) {

            finishGame();

            return;
        }


        const number =
            game.index + 1;


        const total =
            game.questions.length;


        openModal(`
            <div class="game-modal">

                <button
                    class="modal-close"
                    type="button"
                    data-close-modal
                >
                    ×
                </button>

                <span class="eyebrow">
                    ZIVO GAME
                </span>

                <div class="game-progress-text">
                    ${t("question")} ${number} / ${total}
                </div>

                <div class="game-question">

                    <h2>
                        ${escapeHTML(question.question)}
                    </h2>

                </div>

                <div class="answer-grid">

                    ${question.answers
                        .map(
                            (answer, index) => `
                                <button
                                    class="answer-button"
                                    type="button"
                                    data-answer="${index}"
                                >
                                    <span>
                                        ${String.fromCharCode(65 + index)}
                                    </span>

                                    ${escapeHTML(answer)}
                                </button>
                            `
                        )
                        .join("")}

                </div>

                <div
                    id="question-feedback"
                    class="question-feedback"
                ></div>

            </div>
        `);


        $$("[data-answer]").forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const selected =
                        Number(
                            button.dataset.answer
                        );


                    answerQuestion(
                        selected
                    );
                }
            );
        });
    }


    /* ---------------------------------------------------------
       ANSWER
       --------------------------------------------------------- */

    function answerQuestion(selected) {

        if (
            state.game.answered
        ) {
            return;
        }


        state.game.answered =
            true;


        const question =
            state.game.questions[
                state.game.index
            ];


        const correct =
            selected ===
            question.correct;


        const buttons =
            $$("[data-answer]");


        buttons.forEach(button => {

            button.disabled = true;


            const index =
                Number(
                    button.dataset.answer
                );


            if (
                index ===
                question.correct
            ) {

                button.classList.add(
                    "correct"
                );
            }


            if (
                index === selected &&
                !correct
            ) {

                button.classList.add(
                    "wrong"
                );
            }
        });


        const feedback =
            $("#question-feedback");


        if (correct) {

            state.game.score += 1;

            state.game.xp += 10;

            state.game.coins += 2;


            if (feedback) {

                feedback.innerHTML =
                    `<strong>${t("correct")}</strong>`;
            }

        } else {

            if (feedback) {

                feedback.innerHTML =
                    `<strong>${t("wrong")}</strong>`;
            }
        }


        const last =
            state.game.index >=
            state.game.questions.length - 1;


        setTimeout(
            () => {

                if (last) {

                    finishGame();

                } else {

                    state.game.index += 1;

                    state.game.answered =
                        false;

                    renderQuestion();
                }

            },
            800
        );
    }


    /* ---------------------------------------------------------
       FINISH GAME
       --------------------------------------------------------- */

    async function finishGame() {

        const game =
            state.game;


        const bonus =
            game.score >= 4
                ? 10
                : 0;


        const finalXP =
            game.xp +
            bonus;


        const finalCoins =
            game.coins +
            Math.floor(
                game.score / 2
            );


        const won =
            game.score >=
            Math.ceil(
                game.questions.length / 2
            );


        closeModal();


        openModal(`
            <div class="result-modal">

                <span class="eyebrow">
                    ZIVO RESULT
                </span>

                <h2>
                    ${t("finished")}
                </h2>

                <div class="result-score">

                    <strong>
                        ${game.score}
                    </strong>

                    <span>
                        / ${game.questions.length}
                    </span>

                </div>

                <div class="result-rewards">

                    <div>
                        ⭐
                        <strong>
                            +${finalXP}
                        </strong>
                        XP
                    </div>

                    <div>
                        🪙
                        <strong>
                            +${finalCoins}
                        </strong>
                        ZIVO
                    </div>

                </div>

                <button
                    id="result-close"
                    class="btn btn-primary full"
                    type="button"
                >
                    متابعة
                </button>

            </div>
        `);


        $("#result-close")
            ?.addEventListener(
                "click",
                closeModal
            );


        if (state.user) {

            await rewardPlayer(
                finalXP,
                finalCoins,
                won
            );
        }


        state.game.active =
            false;
    }


    /* ---------------------------------------------------------
       HORROR GAME
       --------------------------------------------------------- */

    function startHorrorGame() {

        state.game = {

            active: true,

            type: "horror",

            questions: [],

            index: 0,

            score: 0,

            xp: 0,

            coins: 0,

            answered: false
        };


        renderHorrorScene(
            0
        );
    }


    const HORROR_SCENES = [

        {
            title: "الغرفة المظلمة",
            text: "تستيقظ في غرفة لا تعرفها. أمامك بابان. أحدهما يصدر منه صوت خافت.",
            choices: [
                "أفتح الباب الذي يصدر منه الصوت",
                "أختار الباب الآخر"
            ]
        },

        {
            title: "الممر",
            text: "الممر طويل. ترى ضوءًا في نهايته، لكنك تسمع خطوات خلفك.",
            choices: [
                "أركض نحو الضوء",
                "أختبئ وأراقب"
            ]
        },

        {
            title: "النهاية",
            text: "وصلت إلى مصدر الضوء. تجد مرآة كبيرة تعكس صورتك فقط.",
            choices: [
                "أنظر في المرآة",
                "أغادر المكان"
            ]
        }
    ];


    function renderHorrorScene(index) {

        const scene =
            HORROR_SCENES[index];


        if (!scene) {

            finishHorror();

            return;
        }


        openModal(`
            <div class="horror-modal">

                <button
                    class="modal-close"
                    type="button"
                    data-close-modal
                >
                    ×
                </button>

                <span class="eyebrow">
                    ZIVO HORROR
                </span>

                <h2>
                    ${escapeHTML(scene.title)}
                </h2>

                <p class="horror-text">
                    ${escapeHTML(scene.text)}
                </p>

                <div class="horror-choices">

                    ${scene.choices
                        .map(
                            (choice, i) => `
                                <button
                                    class="btn btn-ghost full"
                                    type="button"
                                    data-horror-choice="${i}"
                                >
                                    ${escapeHTML(choice)}
                                </button>
                            `
                        )
                        .join("")}

                </div>

            </div>
        `);


        $$("[data-horror-choice]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const choice =
                            Number(
                                button.dataset.horrorChoice
                            );


                        state.game.score +=
                            choice === 0
                                ? 1
                                : 0;


                        renderHorrorScene(
                            index + 1
                        );
                    }
                );
            });
    }


    async function finishHorror() {

        const score =
            state.game.score;


        const xp =
            25 +
            (score * 10);


        const coins =
            5 +
            score;


        closeModal();


        openModal(`
            <div class="result-modal">

                <span class="eyebrow">
                    ZIVO HORROR
                </span>

                <h2>
                    نجوت من التجربة 👻
                </h2>

                <p>
                    النتيجة:
                    <strong>
                        ${score}
                    </strong>
                </p>

                <div class="result-rewards">

                    <div>
                        ⭐ +${xp} XP
                    </div>

                    <div>
                        🪙 +${coins} ZIVO
                    </div>

                </div>

                <button
                    id="horror-close"
                    class="btn btn-primary full"
                    type="button"
                >
                    متابعة
                </button>

            </div>
        `);


        $("#horror-close")
            ?.addEventListener(
                "click",
                closeModal
            );


        if (state.user) {

            await rewardPlayer(
                xp,
                coins,
                true
            );
        }


        state.game.active =
            false;
    }


    /* ---------------------------------------------------------
       IDENTITY TEST
       --------------------------------------------------------- */

    const IDENTITY_QUESTIONS = [

        {
            question: "عندما تواجه مشكلة صعبة، ماذا تفعل أولًا؟",
            answers: [
                {
                    text: "أحلل المشكلة",
                    type: "analytical"
                },
                {
                    text: "أبحث عن رأي شخص آخر",
                    type: "social"
                },
                {
                    text: "أجرب شيئًا مباشرة",
                    type: "action"
                },
                {
                    text: "أفكر في الاحتمالات",
                    type: "creative"
                }
            ]
        },

        {
            question: "في المنافسة، ما الذي يحفزك أكثر؟",
            answers: [
                {
                    text: "الفوز",
                    type: "action"
                },
                {
                    text: "التعلم",
                    type: "analytical"
                },
                {
                    text: "التجربة الجديدة",
                    type: "creative"
                },
                {
                    text: "مشاركة الآخرين",
                    type: "social"
                }
            ]
        },

        {
            question: "أي وصف أقرب لك؟",
            answers: [
                {
                    text: "أحب التخطيط",
                    type: "analytical"
                },
                {
                    text: "أحب الناس والتواصل",
                    type: "social"
                },
                {
                    text: "أحب المغامرة",
                    type: "action"
                },
                {
                    text: "أحب الأفكار الجديدة",
                    type: "creative"
                }
            ]
        }
    ];


    let identityIndex = 0;

    let identityScores = {};


    function startIdentity() {

        if (!state.user) {

            showAuthModal();

            toast(
                "أنشئ حسابًا لحفظ تحليل شخصيتك.",
                "warning"
            );

            return;
        }


        identityIndex = 0;


        identityScores = {

            analytical: 0,

            social: 0,

            action: 0,

            creative: 0
        };


        renderIdentityQuestion();
    }


    function renderIdentityQuestion() {

        const item =
            IDENTITY_QUESTIONS[
                identityIndex
            ];


        if (!item) {

            finishIdentity();

            return;
        }


        openModal(`
            <div class="identity-test">

                <button
                    class="modal-close"
                    type="button"
                    data-close-modal
                >
                    ×
                </button>

                <span class="eyebrow">
                    WHO AM I?
                </span>

                <p>
                    السؤال ${identityIndex + 1}
                    من ${IDENTITY_QUESTIONS.length}
                </p>

                <h2>
                    ${escapeHTML(item.question)}
                </h2>

                <div class="identity-answers">

                    ${item.answers
                        .map(
                            (answer, index) => `
                                <button
                                    class="btn btn-ghost full"
                                    type="button"
                                    data-identity-answer="${index}"
                                >
                                    ${escapeHTML(answer.text)}
                                </button>
                            `
                        )
                        .join("")}

                </div>

            </div>
        `);


        $$("[data-identity-answer]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.identityAnswer
                            );


                        const type =
                            item.answers[
                                index
                            ].type;


                        identityScores[type] =
                            (
                                identityScores[type] ||
                                0
                            ) + 1;


                        identityIndex += 1;


                        renderIdentityQuestion();
                    }
                );
            });
    }


    async function finishIdentity() {

        const sorted =
            Object.entries(
                identityScores
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


        const type =
            sorted[0]?.[0] ||
            "analytical";


        const profiles = {

            analytical: {
                title: "العقل المحلل 🧠",
                text: "تميل إلى التفكير المنظم وتحليل التفاصيل قبل اتخاذ القرار."
            },

            social: {
                title: "الشخص الاجتماعي 🤝",
                text: "تميل إلى التواصل والتعاون وتستمد الطاقة من التفاعل مع الآخرين."
            },

            action: {
                title: "المبادر ⚡",
                text: "تميل إلى الحركة والمبادرة واتخاذ القرار بسرعة."
            },

            creative: {
                title: "المبدع 💡",
                text: "تميل إلى الأفكار الجديدة والخيال وتجربة طرق مختلفة."
            }
        };


        const profile =
            profiles[type];


        closeModal();


        openModal(`
            <div class="identity-result">

                <span class="eyebrow">
                    ZIVO IDENTITY
                </span>

                <h2>
                    ${profile.title}
                </h2>

                <p>
                    ${profile.text}
                </p>

                <div class="notice">
                    هذا تحليل ترفيهي مبني على إجاباتك داخل الاختبار،
                    وليس تشخيصًا نفسيًا أو طبيًا.
                </div>

                <button
                    id="identity-done"
                    class="btn btn-primary full"
                    type="button"
                >
                    انتهيت
                </button>

            </div>
        `);


        $("#identity-done")
            ?.addEventListener(
                "click",
                closeModal
            );


        if (state.user) {

            await rewardPlayer(
                20,
                3,
                true
            );
        }
    }


    /* ---------------------------------------------------------
       DAILY CHALLENGE
       --------------------------------------------------------- */

    function getDailyKey() {

        const now =
            new Date();


        return [
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate()
        ].join("-");
    }


    function isDailyCompleted() {

        return (
            localStorage.getItem(
                "zivo_daily_completed"
            ) ===
            getDailyKey()
        );
    }


    function completeDaily() {

        localStorage.setItem(
            "zivo_daily_completed",
            getDailyKey()
        );
    }


    function renderChallenges() {

        const list =
            $("#challenge-list");


        if (!list) {
            return;
        }


        const completed =
            isDailyCompleted();


        list.innerHTML = `

            <article class="challenge-card">

                <div>

                    <span class="card-tag">
                        DAILY
                    </span>

                    <h3>
                        تحدي ZIVO اليومي
                    </h3>

                    <p>
                        تحدٍ جديد كل يوم مع مكافآت XP وZIVO.
                    </p>

                </div>

                <button
                    class="btn btn-primary"
                    type="button"
                    data-game="daily"
                    ${completed ? "disabled" : ""}
                >
                    ${
                        completed
                            ? "تم إنجازه ✓"
                            : "ابدأ التحدي"
                    }
                </button>

            </article>
        `;
    }


    /* ---------------------------------------------------------
       AI DEMO
       --------------------------------------------------------- */

    function setupAI() {

        const form =
            $("#ai-form");


        const input =
            $("#ai-input");


        const messages =
            $("#ai-messages");


        if (!form || !input || !messages) {
            return;
        }


        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const text =
                    input.value.trim();


                if (!text) {
                    return;
                }


                addAIMessage(
                    text,
                    "user"
                );


                input.value = "";


                setTimeout(
                    () => {

                        const answer =
                            generateAIResponse(
                                text
                            );


                        addAIMessage(
                            answer,
                            "bot"
                        );

                    },
                    400
                );
            }
        );
    }


    function addAIMessage(
        text,
        type
    ) {

        const messages =
            $("#ai-messages");


        if (!messages) {
            return;
        }


        const element =
            document.createElement("div");


        element.className =
            `ai-message ${type}`;


        element.textContent =
            text;


        messages.appendChild(
            element
        );


        messages.scrollTop =
            messages.scrollHeight;
    }


    function generateAIResponse(text) {

        const lower =
            text.toLowerCase();


        if (
            lower.includes("لعب") ||
            lower.includes("game")
        ) {

            return "ابدأ من قسم الألعاب واختر التحدي المناسب لمستواك. كل إجابة صحيحة تساعدك على جمع XP وZIVO.";
        }


        if (
            lower.includes("مستوى") ||
            lower.includes("level")
        ) {

            return "كلما جمعت XP أكثر يرتفع مستواك، ومع ارتفاع المستوى تصبح التحديات أكثر صعوبة.";
        }


        if (
            lower.includes("zivo") ||
            lower.includes("عملة")
        ) {

            return "عملة ZIVO هي نظام مكافآت داخلي في النسخة التجريبية، تحصل عليها من الألعاب والتحديات.";
        }


        return "أنا ZIVO AI 🤖. في النسخة الحالية أستطيع مساعدتك داخل تجربة ZIVOZONE، وسيتم لاحقًا ربط النظام بمحرك AI حقيقي عبر خادم آمن.";
    }


    /* ---------------------------------------------------------
       LANGUAGE
       --------------------------------------------------------- */

    function setupLanguage() {

        const select =
            $("#language-select");


        if (!select) {
            return;
        }


        const saved =
            localStorage.getItem(
                "zivo_language"
            );


        if (
            saved &&
            translations[saved]
        ) {

            state.language =
                saved;

            select.value =
                saved;
        }


        select.addEventListener(
            "change",
            async event => {

                const language =
                    event.target.value;


                if (
                    !translations[language]
                ) {
                    return;
                }


                state.language =
                    language;


                localStorage.setItem(
                    "zivo_language",
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


                renderPlayer();

                renderChallenges();


                if (
                    state.user &&
                    window.ZIVOZONE_AUTH
                ) {

                    try {

                        await window.ZIVOZONE_AUTH
                            .updatePlayer({
                                language
                            });

                    } catch (error) {

                        console.error(
                            "Language save:",
                            error
                        );
                    }
                }
            }
        );
    }


    /* ---------------------------------------------------------
       NAVIGATION / ACTIONS
       --------------------------------------------------------- */

    function setupActions() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action], [data-game]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;


                const game =
                    button.dataset.game;


                if (game) {

                    if (game === "daily") {

                        if (isDailyCompleted()) {

                            toast(
                                "أنجزت تحدي اليوم بالفعل.",
                                "info"
                            );

                            return;
                        }


                        startGame(
                            "daily"
                        );


                        setTimeout(
                            completeDaily,
                            100
                        );


                        return;
                    }


                    startGame(
                        game
                    );


                    return;
                }


                switch (action) {

                    case "login":

                        showAuthModal();

                        break;


                    case "logout":

                        handleLogout();

                        break;


                    case "open-identity":

                        startIdentity();

                        break;


                    case "scroll-games":

                        document
                            .querySelector("#games")
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                        break;


                    case "refresh-sports":

                        loadSports();

                        break;


                    case "ad-info":

                        toast(
                            "سيتم تخصيص مساحات الإعلانات والرعاية في مرحلة الإطلاق التجاري.",
                            "info"
                        );

                        break;
                }
            }
        );
    }


    async function handleLogout() {

        if (
            !window.ZIVOZONE_AUTH ||
            typeof window.ZIVOZONE_AUTH.logoutPlayer !== "function"
        ) {
            return;
        }


        try {

            await window.ZIVOZONE_AUTH.logoutPlayer();

            toast(
                "تم تسجيل الخروج.",
                "success"
            );

        } catch (error) {

            toast(
                error.message ||
                "تعذر تسجيل الخروج.",
                "error"
            );
        }
    }


    /* ---------------------------------------------------------
       SPORTS
       --------------------------------------------------------- */

    function loadSports() {

        const list =
            $("#sports-list");


        if (!list) {
            return;
        }


        list.innerHTML = `

            <article class="sport-card">

                <span>
                    ⚽
                </span>

                <h3>
                    كرة القدم العالمية
                </h3>

                <p>
                    سيتم ربط أخبار الرياضة الحية بمصدر أخبار خارجي
                    في مرحلة التكامل القادمة.
                </p>

            </article>

            <article class="sport-card">

                <span>
                    🏆
                </span>

                <h3>
                    البطولات
                </h3>

                <p>
                    مركز موحد لمتابعة البطولات والنتائج والتحديات.
                </p>

            </article>

            <article class="sport-card">

                <span>
                    📊
                </span>

                <h3>
                    التحليل الرياضي
                </h3>

                <p>
                    سيتم تطوير نظام تحليل رياضي داخل ZIVOZONE.
                </p>

            </article>
        `;
    }


    /* ---------------------------------------------------------
       AUTH EVENT
       --------------------------------------------------------- */

    function setupAuthEvents() {

        window.addEventListener(
            "zivozone-auth",
            event => {

                const detail =
                    event.detail || {};


                state.user =
                    detail.user ||
                    null;


                state.player =
                    detail.player ||
                    null;


                renderPlayer();


                if (state.user) {

                    const note =
                        $("#profile-note");


                    if (note) {

                        note.textContent =
                            "حسابك متصل. تقدمك محفوظ في ZIVOZONE.";
                    }
                }
            }
        );


        window.addEventListener(
            "zivozone-auth-ready",
            () => {

                const auth =
                    window.ZIVOZONE_AUTH;


                if (!auth) {
                    return;
                }


                state.user =
                    auth.getCurrentUser();


                state.player =
                    auth.getCurrentPlayer();


                renderPlayer();
            }
        );
    }


    /* ---------------------------------------------------------
       HASH NAVIGATION
       --------------------------------------------------------- */

    function setupHashNavigation() {

        window.addEventListener(
            "hashchange",
            () => {

                const hash =
                    window.location.hash;


                if (!hash) {
                    return;
                }


                const target =
                    document.querySelector(
                        hash
                    );


                target?.scrollIntoView({
                    behavior: "smooth"
                });
            }
        );
    }


    /* ---------------------------------------------------------
       ERROR PROTECTION
       --------------------------------------------------------- */

    window.addEventListener(
        "error",
        event => {

            console.error(
                "ZIVOZONE error:",
                event.error ||
                event.message
            );
        }
    );


    window.addEventListener(
        "unhandledrejection",
        event => {

            console.error(
                "ZIVOZONE promise error:",
                event.reason
            );

            event.preventDefault();
        }
    );


    /* ---------------------------------------------------------
       INIT
       --------------------------------------------------------- */

    function init() {

        try {

            setupLanguage();

            setupActions();

            setupAuthEvents();

            setupAI();

            setupHashNavigation();

            renderPlayer();

            renderChallenges();

            loadSports();


            console.log(
                "🚀 ZIVOZONE APP ENGINE READY"
            );


        } catch (error) {

            console.error(
                "ZIVOZONE initialization failed:",
                error
            );


            toast(
                "حدث خطأ في تشغيل بعض وظائف الموقع.",
                "error"
            );
        }
    }


    /*
     * app.js يستخدم defer،
     * لذلك DOM أصبح جاهزًا عند التنفيذ.
     */

    init();

})();
