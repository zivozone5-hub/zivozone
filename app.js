/* ============================================================
   ZIVOZONE APP ENGINE
   Games
   Challenges
   Guest Mode
   XP
   Player Profile
   Horror Experience
============================================================ */

(() => {

    "use strict";


    /* ========================================================
       REFERENCES
    ======================================================== */

    const AUTH =
        window.ZIVOZONE_AUTH;

    const CHALLENGES =
        window.ZIVOZONE_CHALLENGES;


    const $ =
        selector =>
            document.querySelector(selector);


    const $$ =
        selector =>
            [...document.querySelectorAll(selector)];


    /* ========================================================
       STORAGE
    ======================================================== */

    const STATE_KEY =
        "zivozone_game_state_v7";


    const DAILY_KEY =
        "zivozone_daily_v7";


    /* ========================================================
       PLAYER STATE
    ======================================================== */

    let state = {

        level:
            1,

        xp:
            0,

        coins:
            0,

        wins:
            0,

        gamesPlayed:
            0,

        identity:
            null

    };


    /* ========================================================
       CURRENT GAME
    ======================================================== */

    let game = {

        id:
            null,

        questions:
            [],

        index:
            0,

        score:
            0,

        answers:
            [],

        guest:
            true,

        startedAt:
            null

    };


    /* ========================================================
       HELPERS
    ======================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;

    }


    function todayKey() {

        const now =
            new Date();

        return [
            now.getFullYear(),
            String(
                now.getMonth() + 1
            ).padStart(2, "0"),
            String(
                now.getDate()
            ).padStart(2, "0")
        ].join("-");

    }


    /* ========================================================
       TOAST
    ======================================================== */

    function toast(
        message,
        type = "info"
    ) {

        const container =
            $("#toast-container");

        if (!container)
            return;


        const element =
            document.createElement("div");


        element.className =
            `toast ${type}`;


        element.textContent =
            message;


        container.appendChild(
            element
        );


        setTimeout(
            () => {

                element.classList.add(
                    "toast-out"
                );

                setTimeout(
                    () => element.remove(),
                    250
                );

            },
            3000
        );

    }


    /* ========================================================
       MODAL
    ======================================================== */

    function closeModal() {

        const root =
            $("#modal-root");

        if (!root)
            return;


        root.setAttribute(
            "aria-hidden",
            "true"
        );


        root.innerHTML =
            "";

        document.body.classList.remove(
            "modal-open"
        );

    }


    function openModal(
        content,
        extraClass = ""
    ) {

        const root =
            $("#modal-root");

        if (!root)
            return;


        root.innerHTML = `

            <div class="modal-backdrop">

                <div class="modal-card ${extraClass}">

                    ${content}

                </div>

            </div>

        `;


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );


        root
            .querySelectorAll(
                "[data-close]"
            )
            .forEach(
                button => {

                    button.onclick =
                        closeModal;

                }
            );


        const backdrop =
            root.querySelector(
                ".modal-backdrop"
            );


        if (backdrop) {

            backdrop.onclick =
                event => {

                    if (
                        event.target ===
                        backdrop
                    ) {

                        closeModal();

                    }

                };

        }

    }


    /* ========================================================
       LOAD STATE
    ======================================================== */

    function loadState() {

        try {

            const saved =
                localStorage.getItem(
                    STATE_KEY
                );


            if (!saved)
                return;


            const parsed =
                JSON.parse(saved);


            state = {

                ...state,

                ...parsed

            };


        } catch (error) {

            console.warn(
                "State load error:",
                error
            );

        }

    }


    /* ========================================================
       SAVE STATE
    ======================================================== */

    function saveState() {

        state.level =
            Math.floor(
                Number(state.xp || 0) / 100
            ) + 1;


        try {

            localStorage.setItem(
                STATE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.warn(
                "State save error:",
                error
            );

        }

    }


    /* ========================================================
       SYNC WITH ACCOUNT
    ======================================================== */

    function syncFromAccount() {

        const player =
            AUTH.getPlayer();


        if (!player)
            return;


        state.xp =
            Number(player.xp) || 0;


        state.coins =
            Number(player.coins) || 0;


        state.wins =
            Number(player.wins) || 0;


        state.gamesPlayed =
            Number(
                player.gamesPlayed
            ) || 0;


        state.level =
            Number(player.level) ||
            (
                Math.floor(
                    state.xp / 100
                ) + 1
            );


        saveState();

    }


    /* ========================================================
       PROFILE UI
    ======================================================== */

    function renderProfile() {

        const player =
            AUTH.getPlayer();


        const logged =
            AUTH.isLoggedIn();


        const level =
            state.level || 1;


        const baseXP =
            (level - 1) * 100;


        const progress =
            Math.max(

                0,

                Math.min(

                    100,

                    state.xp -
                    baseXP

                )

            );


        const name =
            player?.name ||
            "زائر";


        const email =
            player?.email ||
            "يمكنك اللعب كزائر وحفظ تقدمك لاحقًا.";


        const nameElement =
            $("#profile-name");


        if (nameElement)
            nameElement.textContent =
                name;


        const emailElement =
            $("#profile-email");


        if (emailElement)
            emailElement.textContent =
                email;


        const levelElement =
            $("#profile-level");


        if (levelElement)
            levelElement.textContent =
                level;


        const xpElement =
            $("#profile-xp");


        if (xpElement)
            xpElement.textContent =
                state.xp;


        const coinsElement =
            $("#profile-coins");


        if (coinsElement)
            coinsElement.textContent =
                state.coins;


        const winsElement =
            $("#profile-wins");


        if (winsElement)
            winsElement.textContent =
                state.wins;


        const gamesElement =
            $("#profile-games");


        if (gamesElement)
            gamesElement.textContent =
                state.gamesPlayed;


        const chip =
            $("#player-level-chip");


        if (chip)
            chip.textContent =
                `Level ${level}`;


        const progressElement =
            $("#xp-progress");


        if (progressElement)
            progressElement.style.width =
                `${progress}%`;


        const loginButton =
            $("#login-btn");


        if (loginButton) {

            loginButton.textContent =
                logged

                    ? `👤 ${name}`

                    : "🔐 إنشاء حساب / دخول";

        }


        const logoutButton =
            $("#logout-btn");


        if (logoutButton)
            logoutButton.hidden =
                !logged;

    }


    /* ========================================================
       REWARD
    ======================================================== */

    async function reward(
        xp,
        coins,
        won
    ) {

        state.xp +=
            Number(xp) || 0;


        state.coins +=
            Number(coins) || 0;


        state.gamesPlayed +=
            1;


        if (won)
            state.wins += 1;


        saveState();


        if (
            AUTH.isLoggedIn()
        ) {

            await AUTH.update({

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

        }


        renderProfile();

    }


    /* ========================================================
       AUTH MODAL
    ======================================================== */

    function openAuthModal(
        afterSuccess
    ) {

        let mode =
            "register";


        function render() {

            openModal(`

                <button
                    class="modal-close"
                    data-close
                    type="button"
                >
                    ×
                </button>


                <span class="eyebrow">
                    ZIVO ACCOUNT
                </span>


                <h2>
                    ${
                        mode === "register"
                            ? "أنشئ حسابك مجانًا"
                            : "مرحبًا بعودتك"
                    }
                </h2>


                <p class="muted">
                    ${
                        mode === "register"
                            ? "العب كزائر، وأنشئ حسابًا عندما تريد حفظ تقدمك."
                            : "سجّل الدخول للمتابعة من حيث توقفت."
                    }
                </p>


                <div class="auth-tabs">

                    <button
                        id="auth-register-tab"
                        class="btn ${
                            mode === "register"
                                ? "btn-primary"
                                : "btn-ghost"
                        }"
                        type="button"
                    >
                        إنشاء حساب
                    </button>


                    <button
                        id="auth-login-tab"
                        class="btn ${
                            mode === "login"
                                ? "btn-primary"
                                : "btn-ghost"
                        }"
                        type="button"
                    >
                        تسجيل الدخول
                    </button>

                </div>


                <form
                    id="auth-form"
                    autocomplete="on"
                >

                    ${
                        mode === "register"

                            ? `

                                <div>

                                    <label>
                                        اسم اللاعب
                                    </label>

                                    <input
                                        id="auth-name"
                                        type="text"
                                        minlength="2"
                                        maxlength="40"
                                        required
                                        autocomplete="name"
                                        placeholder="اسمك"
                                    >

                                </div>


                                <div>

                                    <label>
                                        العمر
                                    </label>

                                    <input
                                        id="auth-age"
                                        type="number"
                                        min="5"
                                        max="100"
                                        value="18"
                                        required
                                    >

                                </div>

                            `

                            : ""

                    }


                    <div>

                        <label>
                            البريد الإلكتروني
                        </label>

                        <input
                            id="auth-email"
                            type="email"
                            required
                            autocomplete="email"
                            placeholder="name@example.com"
                        >

                    </div>


                    <div>

                        <label>
                            كلمة المرور
                        </label>

                        <input
                            id="auth-password"
                            type="password"
                            minlength="6"
                            required
                            autocomplete={
                                mode === "register"
                                    ? "new-password"
                                    : "current-password"
                            }
                            placeholder="6 أحرف على الأقل"
                        >

                    </div>


                    <button
                        class="btn btn-primary full"
                        type="submit"
                    >
                        ${
                            mode === "register"
                                ? "🚀 إنشاء الحساب والبدء"
                                : "🔐 تسجيل الدخول"
                        }
                    </button>

                </form>


                <div class="auth-note">

                    🔒
                    الحساب يستخدم Firebase Authentication
                    لحماية تسجيل الدخول.

                </div>

            `);


            $("#auth-register-tab").onclick =
                () => {

                    mode =
                        "register";

                    render();

                };


            $("#auth-login-tab").onclick =
                () => {

                    mode =
                        "login";

                    render();

                };


            const form =
                $("#auth-form");


            if (!form)
                return;


            form.onsubmit =
                async event => {

                    event.preventDefault();


                    const submit =
                        form.querySelector(
                            'button[type="submit"]'
                        );


                    if (submit)
                        submit.disabled =
                            true;


                    try {

                        if (
                            mode ===
                            "register"
                        ) {

                            const name =
                                $("#auth-name")
                                    .value;


                            const age =
                                $("#auth-age")
                                    .value;


                            const email =
                                $("#auth-email")
                                    .value;


                            const password =
                                $("#auth-password")
                                    .value;


                            await AUTH.register({

                                name,

                                age,

                                email,

                                password

                            });


                            /*
                             * إذا كان اللاعب قد لعب كزائر،
                             * ننقل تقدمه الأولي إلى الحساب.
                             */

                            await AUTH.update({

                                xp:
                                    Math.max(
                                        0,
                                        state.xp
                                    ),

                                coins:
                                    Math.max(
                                        0,
                                        state.coins
                                    ),

                                wins:
                                    Math.max(
                                        0,
                                        state.wins
                                    ),

                                gamesPlayed:
                                    Math.max(
                                        0,
                                        state.gamesPlayed
                                    ),

                                level:
                                    Math.floor(
                                        Math.max(
                                            0,
                                            state.xp
                                        ) / 100
                                    ) + 1

                            });

                        } else {

                            await AUTH.login(

                                $("#auth-email")
                                    .value,

                                $("#auth-password")
                                    .value

                            );

                        }


                        syncFromAccount();

                        renderProfile();

                        closeModal();


                        toast(
                            "تم تسجيل الدخول بنجاح 🎉",
                            "success"
                        );


                        if (
                            typeof afterSuccess ===
                            "function"
                        ) {

                            afterSuccess();

                        }


                    } catch (error) {

                        console.error(
                            error
                        );


                        let message =
                            error?.message ||
                            "حدث خطأ غير متوقع.";


                        if (
                            error?.code ===
                            "auth/email-already-in-use"
                        ) {

                            message =
                                "هذا البريد مستخدم مسبقًا.";

                        }


                        if (
                            error?.code ===
                            "auth/invalid-email"
                        ) {

                            message =
                                "البريد الإلكتروني غير صحيح.";

                        }


                        if (
                            error?.code ===
                            "auth/weak-password"
                        ) {

                            message =
                                "كلمة المرور ضعيفة.";

                        }


                        if (
                            error?.code ===
                            "auth/invalid-credential"
                        ) {

                            message =
                                "البريد أو كلمة المرور غير صحيحة.";

                        }


                        if (
                            error?.code ===
                            "auth/operation-not-allowed"
                        ) {

                            message =
                                "طريقة البريد وكلمة المرور غير مفعلة في Firebase.";

                        }


                        if (
                            error?.code ===
                            "auth/unauthorized-domain"
                        ) {

                            message =
                                "دومين الموقع غير مضاف إلى Authorized domains في Firebase.";

                        }


                        toast(
                            message,
                            "error"
                        );


                        if (submit)
                            submit.disabled =
                                false;

                    }

                };

        }


        render();

    }


    /* ========================================================
       GUEST GATE
    ======================================================== */

    function startGameWithGuestChoice(
        id
    ) {

        game.id =
            id;


        openModal(`

            <button
                class="modal-close"
                data-close
                type="button"
            >
                ×
            </button>


            <span class="eyebrow">
                ZIVOZONE MODE
            </span>


            <h2>
                جاهز للجولة؟
            </h2>


            <p class="muted">
                تستطيع اللعب الآن بدون حساب.
                إذا أعجبتك التجربة، أنشئ حسابًا مجانيًا
                لحفظ تقدمك وXP ونتائجك.
            </p>


            <div class="guest-choice">

                <button
                    id="guest-play"
                    class="btn btn-primary"
                    type="button"
                >
                    🎮 العب كزائر
                </button>


                <button
                    id="guest-account"
                    class="btn btn-ghost"
                    type="button"
                >
                    🔐 إنشاء حساب
                </button>

            </div>

        `);


        $("#guest-play").onclick =
            () => {

                closeModal();

                startGame(
                    id,
                    true
                );

            };


        $("#guest-account").onclick =
            () => {

                openAuthModal(

                    () => {

                        startGame(
                            id,
                            false
                        );

                    }

                );

            };

    }


    /* ========================================================
       PREPARE QUESTIONS
    ======================================================== */

    function prepareQuestions(
        id
    ) {

        const source =
            CHALLENGES.get(id);


        if (!source)
            return [];


        const questions =
            CHALLENGES
                .cloneQuestions(id);


        /*
         * Horror keeps its narrative order.
         */

        if (id === "horror")
            return questions;


        /*
         * باقي التحديات:
         * نحافظ على تصاعد الصعوبة
         * مع عشوائية داخل المستويات.
         */

        return questions.sort(
            (a, b) => {

                if (a.d !== b.d)
                    return a.d - b.d;


                return (
                    Math.random() -
                    0.5
                );

            }
        );

    }


    /* ========================================================
       START GAME
    ======================================================== */

    function startGame(
        id,
        guest = false
    ) {

        const challenge =
            CHALLENGES.get(id);


        if (!challenge) {

            toast(
                "هذا التحدي غير متاح.",
                "error"
            );

            return;

        }


        game = {

            id,

            questions:
                prepareQuestions(id),

            index:
                0,

            score:
                0,

            answers:
                [],

            guest:
                guest ||
                !AUTH.isLoggedIn(),

            startedAt:
                Date.now()

        };


        renderQuestion();

    }


    /* ========================================================
       HORROR PHASE
    ======================================================== */

    function horrorPhase(
        index
    ) {

        if (index < 4)
            return 1;


        if (index < 7)
            return 2;


        return 3;

    }


    /* ========================================================
       HORROR MESSAGE
    ======================================================== */

    function horrorMessage(
        index
    ) {

        const messages = {

            6:
                "الحارس: بدأت تفهم اللعبة... وهذا لا يعجبني.",

            7:
                "الحارس: لا تحاول أن تتوقع السؤال القادم.",

            8:
                "الحارس: أنت لا تختار وحدك.",

            9:
                "الحارس: آخر إجابة... فكر قبل أن تضغط."

        };


        return messages[index] || "";

    }


    /* ========================================================
       RENDER QUESTION
    ======================================================== */

    function renderQuestion() {

        const challenge =
            CHALLENGES.get(
                game.id
            );


        const question =
            game.questions[
                game.index
            ];


        if (
            !challenge ||
            !question
        ) {

            finishGame();

            return;

        }


        const labels =
            [
                "A",
                "B",
                "C",
                "D"
            ];


        let phaseClass =
            "";


        if (
            game.id ===
            "horror"
        ) {

            phaseClass =
                `horror-phase-${horrorPhase(
                    game.index
                )}`;

        }


        const horrorText =
            game.id ===
                "horror"

                ? `

                    <div class="horror-status">

                        <span>
                            SIGNAL
                        </span>

                        <span>
                            ${game.index + 1}/10
                        </span>

                    </div>

                    ${
                        horrorMessage(
                            game.index
                        )

                            ? `

                                <div class="warden">
                                    ${escapeHTML(
                                        horrorMessage(
                                            game.index
                                        )
                                    )}
                                </div>

                            `

                            : ""

                    }

                `

                : "";


        const answerHTML =
            question.a
                .map(

                    (answer, index) => `

                        <button
                            class="btn btn-ghost answer"
                            type="button"
                            data-answer="${index}"
                        >

                            <span>
                                ${labels[index]}
                            </span>

                            ${escapeHTML(answer)}

                        </button>

                    `

                )
                .join("");


        openModal(

            `

                <button
                    class="modal-close"
                    data-close
                    type="button"
                >
                    ×
                </button>


                ${horrorText}


                <div class="game-head">

                    <span class="eyebrow">
                        ${escapeHTML(
                            challenge.title
                        )}
                    </span>


                    <strong>
                        ${game.index + 1}
                        /
                        ${game.questions.length}
                    </strong>

                </div>


                <div class="question-progress">

                    <span
                        style="
                            width:${
                                (
                                    (
                                        game.index + 1
                                    )
                                    /
                                    game.questions.length
                                )
                                * 100
                            }%;
                        "
                    ></span>

                </div>


                <h2 class="question-title">
                    ${escapeHTML(
                        question.q
                    )}
                </h2>


                <div class="difficulty">

                    مستوى الصعوبة:
                    ${question.d}
                    / 10

                </div>


                <div class="answers">

                    ${answerHTML}

                </div>


                <div class="game-footer">

                    <span>
                        ✓ ${game.score} صحيحة
                    </span>


                    <button
                        class="btn btn-small btn-ghost"
                        type="button"
                        data-quit-game
                    >
                        خروج
                    </button>

                </div>

            `,

            game.id === "horror"
                ? `horror-modal ${phaseClass}`
                : ""

        );


        $$("#modal-root [data-answer]")
            .forEach(

                button => {

                    button.onclick =
                        () => {

                            answerQuestion(
                                Number(
                                    button.dataset.answer
                                )
                            );

                        };

                }

            );


        const quitButton =
            $("#modal-root [data-quit-game]");


        if (quitButton) {

            quitButton.onclick =
                () => {

                    closeModal();

                    toast(
                        "تم إيقاف التحدي."
                    );

                };

        }

    }


    /* ========================================================
       ANSWER
    ======================================================== */

    function answerQuestion(
        selectedIndex
    ) {

        const question =
            game.questions[
                game.index
            ];


        if (!question)
            return;


        const buttons =
            $$("#modal-root [data-answer]");


        buttons.forEach(
            button => {

                button.disabled =
                    true;

            }
        );


        const correct =
            selectedIndex ===
            question.c;


        if (correct) {

            game.score +=
                1;

        }


        game.answers.push({

            question:
                game.index,

            selected:
                selectedIndex,

            correct

        });


        /*
         * تأثير سريع قبل السؤال التالي.
         */

        setTimeout(

            () => {

                game.index +=
                    1;


                renderQuestion();

            },

            280

        );

    }


    /* ========================================================
       FINISH
    ======================================================== */

    async function finishGame() {

        const challenge =
            CHALLENGES.get(
                game.id
            );


        if (!challenge) {

            closeModal();

            return;

        }


        const total =
            game.questions.length;


        const score =
            game.score;


        const percentage =
            total
                ? score / total
                : 0;


        const xp =
            Math.max(

                10,

                Math.round(
                    percentage *
                    challenge.xp
                )

            );


        const coins =
            Math.max(

                1,

                Math.ceil(
                    score / 2
                )

            );


        const won =
            percentage >= 0.5;


        const guest =
            game.guest;


        await reward(
            xp,
            coins,
            won
        );


        const message =
            percentage >= 0.8

                ? "مستوى ممتاز جدًا 🔥"

                : percentage >= 0.5

                    ? "أحسنت! الجولة ناجحة."

                    : "انتهت الجولة — تستطيع المحاولة مرة أخرى.";


        closeModal();


        openModal(`

            <button
                class="modal-close"
                data-close
                type="button"
            >
                ×
            </button>


            <span class="eyebrow">
                ZIVO RESULT
            </span>


            <h2>
                ${message}
            </h2>


            <div class="result-score">

                <strong>
                    ${score}/${total}
                </strong>

                <span>
                    الإجابات الصحيحة
                </span>

            </div>


            <div class="reward-box">

                <span>
                    +${xp} XP
                </span>

                <span>
                    +${coins} 🪙 ZIVO
                </span>

            </div>


            ${
                guest

                    ? `

                        <div class="save-call">

                            <strong>
                                لا تضيع تقدمك 👀
                            </strong>

                            <br>

                            أنت تلعب كزائر.
                            أنشئ حسابًا مجانيًا لحفظ تقدمك
                            ونتائجك ومستواك.

                        </div>

                    `

                    : ""

            }


            <div class="modal-actions">

                <button
                    id="play-again"
                    class="btn btn-primary"
                    type="button"
                >
                    🔄 إعادة اللعب
                </button>


                ${
                    guest

                        ? `

                            <button
                                id="save-progress"
                                class="btn btn-ghost"
                                type="button"
                            >
                                🔐 حفظ تقدمي
                            </button>

                        `

                        : ""

                }


                <button
                    class="btn btn-ghost"
                    type="button"
                    data-close
                >
                    إغلاق
                </button>

            </div>

        `);


        $("#play-again").onclick =
            () => {

                closeModal();

                startGame(
                    game.id,
                    !AUTH.isLoggedIn()
                );

            };


        const saveButton =
            $("#save-progress");


        if (saveButton) {

            saveButton.onclick =
                () => {

                    openAuthModal(
                        () => {

                            syncFromAccount();

                            renderProfile();

                            toast(
                                "تم حفظ تقدمك بالحساب 🎉",
                                "success"
                            );

                        }
                    );

                };

        }

    }


    /* ========================================================
       CHALLENGE LIST
    ======================================================== */

    function renderChallenges() {

        const container =
            $("#challenge-list");


        if (!container)
            return;


        const dailyDone =
            localStorage.getItem(
                `${DAILY_KEY}_${todayKey()}`
            ) === "1";


        const normal =
            CHALLENGES.getAll();


        let html =
            "";


        normal.forEach(

            challenge => {

                const disabled =
                    challenge.id === "daily" &&
                    dailyDone;


                html += `

                    <article
                        class="challenge-card"
                    >

                        <div class="challenge-icon">
                            ${challenge.icon}
                        </div>


                        <div>

                            <span class="card-tag">
                                ${challenge.id.toUpperCase()}
                            </span>


                            <h3>
                                ${escapeHTML(
                                    challenge.title
                                )}
                            </h3>


                            <p>
                                ${challenge.questions.length}
                                أسئلة —
                                تصاعد من السهل إلى الصعب.
                            </p>

                        </div>


                        <button
                            class="btn ${
                                disabled
                                    ? "btn-disabled"
                                    : "btn-primary"
                            }"
                            type="button"
                            data-challenge="${
                                challenge.id
                            }"
                            ${
                                disabled
                                    ? "disabled"
                                    : ""
                            }
                        >

                            ${
                                disabled
                                    ? "✓ تم اليوم"
                                    : "ابدأ"
                            }

                        </button>

                    </article>

                `;

            }

        );


        /*
         * Horror special card
         */

        const horror =
            CHALLENGES.get(
                "horror"
            );


        if (horror) {

            html += `

                <article
                    class="challenge-card special"
                >

                    <div class="challenge-icon">
                        👁️
                    </div>


                    <div>

                        <span class="card-tag danger">
                            SPECIAL
                        </span>


                        <h3>
                            الغرفة المظلمة
                        </h3>


                        <p>
                            10 مراحل نفسية.
                            كل مرحلة تصبح أكثر ضغطًا.
                        </p>

                    </div>


                    <button
                        class="btn btn-danger"
                        type="button"
                        data-challenge="horror"
                    >
                        ادخل
                    </button>

                </article>

            `;

        }


        container.innerHTML =
            html;


        $$("[data-challenge]")
            .forEach(

                button => {

                    button.onclick =
                        () => {

                            const id =
                                button.dataset.challenge;


                            if (
                                id ===
                                "daily"
                            ) {

                                localStorage.setItem(

                                    `${DAILY_KEY}_${todayKey()}`,

                                    "1"

                                );

                            }


                            startGameWithGuestChoice(
                                id
                            );

                        };

                }

            );

    }


    /* ========================================================
       IDENTITY TEST
    ======================================================== */

    function identityTest() {

        const questions = [

            {
                q:
                    "عندما تواجه مشكلة جديدة، ماذا تفعل؟",

                a:
                    [
                        "أحللها بهدوء",
                        "أجرب بسرعة",
                        "أسأل الآخرين"
                    ]
            },


            {
                q:
                    "في المنافسة، ماذا يهمك أكثر؟",

                a:
                    [
                        "الدقة",
                        "السرعة",
                        "الإبداع"
                    ]
            },


            {
                q:
                    "عندما تتغير الخطة فجأة؟",

                a:
                    [
                        "أعيد التخطيط",
                        "أتكيف فورًا",
                        "أبحث عن بديل"
                    ]
            },


            {
                q:
                    "أي تجربة تجذبك أكثر؟",

                a:
                    [
                        "التحديات المنطقية",
                        "المغامرة",
                        "التعاون"
                    ]
            }

        ];


        let index =
            0;


        const scores =
            [
                0,
                0,
                0
            ];


        function next() {

            if (
                index >=
                questions.length
            ) {

                const winner =
                    scores.indexOf(
                        Math.max(
                            ...scores
                        )
                    );


                const names = [

                    "العقل المحلل 🧠",

                    "المغامر ⚡",

                    "اللاعب المتعاون 🤝"

                ];


                state.identity =
                    names[winner];


                saveState();


                openModal(`

                    <button
                        class="modal-close"
                        data-close
                        type="button"
                    >
                        ×
                    </button>


                    <span class="eyebrow">
                        YOUR ZIVO PROFILE
                    </span>


                    <h2>
                        ${names[winner]}
                    </h2>


                    <p class="muted">
                        هذه نتيجة ترفيهية مبنية على اختياراتك داخل الاختبار.
                    </p>


                    <div class="identity-result">

                        ${
                            scores
                                .map(
                                    (score, i) => `

                                        <div>

                                            <span>
                                                ${names[i]}
                                            </span>

                                            <b>
                                                ${score}
                                            </b>

                                        </div>

                                    `
                                )
                                .join("")
                        }

                    </div>


                    <button
                        class="btn btn-primary full"
                        type="button"
                        data-close
                    >
                        متابعة
                    </button>

                `);


                return;

            }


            const current =
                questions[index];


            openModal(`

                <button
                    class="modal-close"
                    data-close
                    type="button"
                >
                    ×
                </button>


                <span class="eyebrow">
                    WHO AM I?
                </span>


                <div class="question-progress">

                    <span
                        style="
                            width:${
                                (
                                    index + 1
                                ) /
                                questions.length *
                                100
                            }%;
                        "
                    ></span>

                </div>


                <h2>
                    ${current.q}
                </h2>


                <div class="answers">

                    ${
                        current.a
                            .map(

                                (answer, i) => `

                                    <button
                                        class="btn btn-ghost identity-choice"
                                        type="button"
                                        data-index="${i}"
                                    >
                                        ${answer}
                                    </button>

                                `

                            )
                            .join("")
                    }

                </div>

            `);


            $$(".identity-choice")
                .forEach(

                    button => {

                        button.onclick =
                            () => {

                                scores[
                                    Number(
                                        button.dataset.index
                                    )
                                ] += 1;


                                index +=
                                    1;


                                next();

                            };

                    }

                );

        }


        next();

    }


    /* ========================================================
       SPORTS
    ======================================================== */

    function renderSports() {

        const container =
            $("#sports-list");


        if (!container)
            return;


        const sports = [

            [
                "⚽",
                "كرة القدم",
                "نتائج وتحليلات وتحديات لعشاق اللعبة."
            ],

            [
                "🏀",
                "كرة السلة",
                "أسئلة ومعلومات سريعة لمحبي السلة."
            ],

            [
                "🎾",
                "التنس",
                "تحديات ومعلومات عن عالم التنس."
            ],

            [
                "🏆",
                "البطولات",
                "عالم المنافسة والإنجاز."
            ]

        ];


        container.innerHTML =
            sports
                .map(

                    sport => `

                        <article
                            class="sports-card"
                        >

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
                                class="btn btn-ghost"
                                type="button"
                                data-sport="${sport[1]}"
                            >
                                فتح
                            </button>

                        </article>

                    `

                )
                .join("");


        $$("[data-sport]")
            .forEach(

                button => {

                    button.onclick =
                        () => {

                            toast(
                                `قسم ${button.dataset.sport} قيد التوسع.`
                            );

                        };

                }

            );

    }


    /* ========================================================
       AI
    ======================================================== */

    function aiReply(
        message
    ) {

        const text =
            message.toLowerCase();


        if (
            text.includes("مستوى") ||
            text.includes("level")
        ) {

            return `
                مستواك الحالي ${state.level}.
                لديك ${state.xp} XP،
                ${state.coins} ZIVO،
                و${state.wins} انتصار.
            `;

        }


        if (
            text.includes("تحد") ||
            text.includes("لعب")
        ) {

            return `
                أنصحك تبدأ باختبار الذكاء،
                وبعدها العلوم.
                وإذا بدك تجربة مختلفة تمامًا،
                ادخل الغرفة المظلمة 👁️.
            `;

        }


        if (
            text.includes("حساب")
        ) {

            return `
                يمكنك اللعب كزائر.
                الحساب المجاني يحفظ مستواك وXP ونتائجك.
            `;

        }


        if (
            text.includes("zivo")
        ) {

            return `
                ZIVO هي عملة التقدم داخل عالم ZIVOZONE.
            `;

        }


        return `
            أنا ZIVO AI 🤖
            اسألني عن مستواك أو الألعاب أو التحديات.
        `;

    }


    /* ========================================================
       BIND EVENTS
    ======================================================== */

    function bindEvents() {


        /* ====================================================
           LOGIN
        ==================================================== */

        const loginButton =
            $("#login-btn");


        if (loginButton) {

            loginButton.onclick =
                () => {

                    if (
                        AUTH.isLoggedIn()
                    ) {

                        location.hash =
                            "#profile";

                        return;

                    }


                    openAuthModal();

                };

        }


        /* ====================================================
           ACCOUNT BUTTONS
        ==================================================== */

        $$('[data-action="login"]')
            .forEach(

                button => {

                    button.onclick =
                        () => {

                            if (
                                AUTH.isLoggedIn()
                            ) {

                                location.hash =
                                    "#profile";

                            } else {

                                openAuthModal();

                            }

                        };

                }

            );


        /* ====================================================
           GAMES
        ==================================================== */

        $$("[data-game]")
            .forEach(

                button => {

                    button.onclick =
                        () => {

                            startGameWithGuestChoice(
                                button.dataset.game
                            );

                        };

                }

            );


        /* ====================================================
           SCROLL
        ==================================================== */

        $$(
            '[data-action="scroll-games"]'
        )
            .forEach(

                button => {

                    button.onclick =
                        () => {

                            $("#games")
                                ?.scrollIntoView({

                                    behavior:
                                        "smooth",

                                    block:
                                        "start"

                                });

                        };

                }

            );


        /* ====================================================
           IDENTITY
        ==================================================== */

        $$(
            '[data-action="open-identity"]'
        )
            .forEach(

                button => {

                    button.onclick =
                        identityTest;

                }

            );


        /* ====================================================
           LOGOUT
        ==================================================== */

        $$(
            '[data-action="logout"]'
        )
            .forEach(

                button => {

                    button.onclick =
                        async () => {

                            try {

                                await AUTH.logout();


                                state = {

                                    level:
                                        1,

                                    xp:
                                        0,

                                    coins:
                                        0,

                                    wins:
                                        0,

                                    gamesPlayed:
                                        0,

                                    identity:
                                        null

                                };


                                saveState();

                                renderProfile();


                                toast(
                                    "تم تسجيل الخروج."
                                );


                            } catch (error) {

                                toast(
                                    "تعذر تسجيل الخروج.",
                                    "error"
                                );

                            }

                        };

                }

            );


        /* ====================================================
           SPORTS
        ==================================================== */

        $$(
            '[data-action="refresh-sports"]'
        )
            .forEach(

                button => {

                    button.onclick =
                        () => {

                            renderSports();

                            toast(
                                "تم تحديث قسم الرياضة.",
                                "success"
                            );

                        };

                }

            );


        /* ====================================================
           AD
        ==================================================== */

        $$(
            '[data-action="ad-info"]'
        )
            .forEach(

                button => {

                    button.onclick =
                        () => {

                            toast(
                                "مساحات الإعلانات والرعاية ستكون متاحة عند إطلاق النظام التجاري."
                            );

                        };

                }

            );


        /* ====================================================
           AI
        ==================================================== */

        const aiForm =
            $("#ai-form");


        if (aiForm) {

            aiForm.onsubmit =
                event => {

                    event.preventDefault();


                    const input =
                        $("#ai-input");


                    const value =
                        input.value.trim();


                    if (!value)
                        return;


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


                    messages.appendChild(
                        userMessage
                    );


                    messages.appendChild(
                        botMessage
                    );


                    input.value =
                        "";


                    messages.scrollTop =
                        messages.scrollHeight;

                };

        }


        /* ====================================================
           LANGUAGE
        ==================================================== */

        const language =
            $("#language-select");


        if (language) {

            language.onchange =
                () => {

                    localStorage.setItem(

                        "zivozone_language",

                        language.value

                    );


                    toast(
                        "سيتم توسيع دعم اللغات تدريجيًا."
                    );

                };

        }


        /* ====================================================
           ESCAPE KEY
        ==================================================== */

        document.addEventListener(

            "keydown",

            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeModal();

                }

            }

        );

    }


    /* ========================================================
       AUTH EVENT
    ======================================================== */

    window.addEventListener(

        "zivozone-auth",

        event => {

            const detail =
                event.detail || {};


            if (
                detail.player &&
                detail.user
            ) {

                syncFromAccount();

            }


            renderProfile();

        }

    );


    /* ========================================================
       INIT
    ======================================================== */

    function init() {

        loadState();

        bindEvents();

        renderChallenges();

        renderSports();

        renderProfile();


        const savedLanguage =
            localStorage.getItem(
                "zivozone_language"
            );


        if (
            savedLanguage &&
            $("#language-select")
        ) {

            $("#language-select").value =
                savedLanguage;

        }


        setTimeout(

            () => {

                const loader =
                    $("#app-loader");


                if (loader)
                    loader.classList.add(
                        "hidden"
                    );

            },

            700

        );

    }


    /* ========================================================
       START
    ======================================================== */

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
