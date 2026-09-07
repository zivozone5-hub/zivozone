(() => {

    "use strict";


    // ========================================================
    // ZIVOZONE APPLICATION
    // ========================================================


    const $ =
        (selector, root = document) =>
            root.querySelector(selector);


    const $$ =
        (selector, root = document) =>
            [...root.querySelectorAll(selector)];


    // ========================================================
    // GLOBAL STATE
    // ========================================================

    const state = {

        user:
            null,

        player: {

            level: 1,

            xp: 0,

            coins: 0,

            wins: 0

        },

        currentGame:
            null,

        questionIndex:
            0,

        score:
            0

    };


    // ========================================================
    // DOM READY
    // ========================================================

    document.addEventListener(
        "DOMContentLoaded",
        init
    );


    function init() {

        bindEvents();

        renderChallenges();

        renderSports();

        updateProfileUI();

        setupAuthState();

        hideLoader();

        console.log(
            "✅ ZIVOZONE application initialized."
        );
    }


    // ========================================================
    // AUTH STATE
    // ========================================================

    function setupAuthState() {

        window.addEventListener(
            "zivozone-auth-state",
            async (event) => {

                state.user =
                    event.detail?.user || null;


                if (state.user) {

                    try {

                        if (
                            window.ZIVOZONE_AUTH &&
                            typeof window.ZIVOZONE_AUTH.getPlayer === "function"
                        ) {

                            const player =
                                await window.ZIVOZONE_AUTH.getPlayer();


                            if (player) {

                                state.player =
                                    {

                                        level:
                                            player.level || 1,

                                        xp:
                                            player.xp || 0,

                                        coins:
                                            player.coins || 0,

                                        wins:
                                            player.wins || 0

                                    };

                            }

                        }

                    } catch (error) {

                        console.error(
                            error
                        );

                    }

                } else {

                    state.player = {

                        level: 1,

                        xp: 0,

                        coins: 0,

                        wins: 0

                    };

                }


                updateProfileUI();

            }
        );


        if (
            window.ZIVOZONE_AUTH &&
            typeof window.ZIVOZONE_AUTH.getUser === "function"
        ) {

            state.user =
                window.ZIVOZONE_AUTH.getUser();

        }

    }


    // ========================================================
    // EVENTS
    // ========================================================

    function bindEvents() {


        document.addEventListener(
            "click",
            handleClick
        );


        const aiForm =
            $("#ai-form");


        if (aiForm) {

            aiForm.addEventListener(
                "submit",
                handleAI
            );

        }


        const language =
            $("#language-select");


        if (language) {

            language.addEventListener(
                "change",
                handleLanguage
            );

        }

    }


    // ========================================================
    // CLICK HANDLER
    // ========================================================

    function handleClick(event) {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        const game =
            button.dataset.game;


        // ----------------------------------------------------
        // LOGIN
        // ----------------------------------------------------

        if (
            action === "login"
        ) {

            event.preventDefault();

            openAuthModal();

            return;
        }


        // ----------------------------------------------------
        // LOGOUT
        // ----------------------------------------------------

        if (
            action === "logout"
        ) {

            event.preventDefault();

            logout();

            return;
        }


        // ----------------------------------------------------
        // SCROLL GAMES
        // ----------------------------------------------------

        if (
            action === "scroll-games"
        ) {

            event.preventDefault();

            $("#games")?.scrollIntoView({

                behavior:
                    "smooth"

            });

            return;
        }


        // ----------------------------------------------------
        // IDENTITY
        // ----------------------------------------------------

        if (
            action === "open-identity"
        ) {

            event.preventDefault();

            openIdentity();

            return;
        }


        // ----------------------------------------------------
        // SPORTS
        // ----------------------------------------------------

        if (
            action === "refresh-sports"
        ) {

            renderSports();

            showToast(
                "تم تحديث قسم الرياضة."
            );

            return;
        }


        // ----------------------------------------------------
        // GAME
        // ----------------------------------------------------

        if (game) {

            startGame(
                game
            );

        }

    }


    // ========================================================
    // AUTH MODAL
    // ========================================================

    function openAuthModal() {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.innerHTML = `

            <div class="modal-overlay">

                <div
                    class="modal-card auth-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="auth-title"
                >

                    <button
                        class="modal-close"
                        type="button"
                        data-modal-close
                        aria-label="إغلاق"
                    >
                        ×
                    </button>


                    <div class="auth-header">

                        <div class="auth-logo">
                            Z
                        </div>

                        <h2 id="auth-title">
                            أهلاً بك في ZIVOZONE
                        </h2>

                        <p>
                            أنشئ حسابك مجانًا واحفظ تقدمك.
                        </p>

                    </div>


                    <div
                        id="auth-error"
                        class="auth-message"
                        hidden
                    ></div>


                    <form
                        id="register-form"
                        autocomplete="on"
                    >

                        <input
                            id="auth-name"
                            type="text"
                            placeholder="الاسم"
                            autocomplete="name"
                            required
                        >


                        <input
                            id="auth-email"
                            type="email"
                            placeholder="البريد الإلكتروني"
                            autocomplete="email"
                            required
                        >


                        <input
                            id="auth-password"
                            type="password"
                            placeholder="كلمة المرور"
                            autocomplete="new-password"
                            minlength="6"
                            required
                        >


                        <button
                            class="btn btn-primary full"
                            type="submit"
                        >
                            إنشاء حساب
                        </button>

                    </form>


                    <div class="auth-divider">
                        <span>أو</span>
                    </div>


                    <button
                        class="btn btn-ghost full"
                        type="button"
                        id="show-login"
                    >
                        لدي حساب بالفعل
                    </button>

                </div>

            </div>
        `;


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        const form =
            $("#register-form");


        form?.addEventListener(
            "submit",
            registerUser
        );


        $("#show-login")?.addEventListener(
            "click",
            openLoginForm
        );


        $$(
            "[data-modal-close]",
            root
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    closeModal
                );

            }
        );

    }


    // ========================================================
    // LOGIN FORM
    // ========================================================

    function openLoginForm() {

        const form =
            $("#register-form");


        if (!form) {
            return;
        }


        form.innerHTML = `

            <input
                id="auth-email"
                type="email"
                placeholder="البريد الإلكتروني"
                autocomplete="email"
                required
            >


            <input
                id="auth-password"
                type="password"
                placeholder="كلمة المرور"
                autocomplete="current-password"
                required
            >


            <button
                class="btn btn-primary full"
                type="submit"
            >
                تسجيل الدخول
            </button>

        `;


        form.dataset.mode =
            "login";


        form.removeEventListener(
            "submit",
            registerUser
        );


        form.addEventListener(
            "submit",
            loginUser
        );


        const switchButton =
            $("#show-login");


        if (switchButton) {

            switchButton.textContent =
                "إنشاء حساب جديد";


            switchButton.onclick =
                () => {

                    openAuthModal();

                };

        }

    }


    // ========================================================
    // REGISTER
    // ========================================================

    async function registerUser(event) {

        event.preventDefault();


        const api =
            window.ZIVOZONE_AUTH;


        if (
            !api ||
            typeof api.register !== "function"
        ) {

            showAuthError(
                "خدمة إنشاء الحساب غير جاهزة. أعد تحميل الصفحة."
            );

            return;
        }


        const name =
            $("#auth-name")?.value.trim();


        const email =
            $("#auth-email")?.value.trim();


        const password =
            $("#auth-password")?.value;


        try {

            setAuthLoading(
                true
            );


            await api.register(
                name,
                email,
                password
            );


            showToast(
                "🎉 تم إنشاء حسابك بنجاح."
            );


            closeModal();


        } catch (error) {

            showAuthError(
                error.message ||
                "تعذر إنشاء الحساب."
            );


        } finally {

            setAuthLoading(
                false
            );

        }

    }


    // ========================================================
    // LOGIN
    // ========================================================

    async function loginUser(event) {

        event.preventDefault();


        const api =
            window.ZIVOZONE_AUTH;


        if (
            !api ||
            typeof api.login !== "function"
        ) {

            showAuthError(
                "خدمة تسجيل الدخول غير جاهزة."
            );

            return;
        }


        const email =
            $("#auth-email")?.value.trim();


        const password =
            $("#auth-password")?.value;


        try {

            setAuthLoading(
                true
            );


            await api.login(
                email,
                password
            );


            showToast(
                "👋 تم تسجيل الدخول."
            );


            closeModal();


        } catch (error) {

            showAuthError(
                error.message ||
                "تعذر تسجيل الدخول."
            );


        } finally {

            setAuthLoading(
                false
            );

        }

    }


    // ========================================================
    // LOGOUT
    // ========================================================

    async function logout() {

        const api =
            window.ZIVOZONE_AUTH;


        if (
            !api ||
            typeof api.logout !== "function"
        ) {

            return;
        }


        try {

            await api.logout();

            showToast(
                "تم تسجيل الخروج."
            );

        } catch (error) {

            showToast(
                error.message ||
                "تعذر تسجيل الخروج."
            );

        }

    }


    // ========================================================
    // MODAL
    // ========================================================

    function closeModal() {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.innerHTML =
            "";


        root.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    // ========================================================
    // AUTH UI
    // ========================================================

    function setAuthLoading(
        loading
    ) {

        const button =
            $("#register-form button[type='submit']");


        if (!button) {
            return;
        }


        button.disabled =
            loading;


        button.textContent =
            loading
                ? "جاري التنفيذ..."
                : (
                    $("#register-form")?.dataset.mode === "login"
                        ? "تسجيل الدخول"
                        : "إنشاء حساب"
                );

    }


    function showAuthError(
        message
    ) {

        const box =
            $("#auth-error");


        if (!box) {
            return;
        }


        box.hidden =
            false;


        box.textContent =
            message;

    }


    // ========================================================
    // PROFILE
    // ========================================================

    function updateProfileUI() {

        const name =
            $("#profile-name");


        const email =
            $("#profile-email");


        const level =
            $("#profile-level");


        const xp =
            $("#profile-xp");


        const coins =
            $("#profile-coins");


        const wins =
            $("#profile-wins");


        const levelChip =
            $("#player-level-chip");


        const logoutButton =
            $("#logout-btn");


        if (state.user) {

            if (name) {

                name.textContent =
                    state.user.displayName ||
                    "لاعب ZIVOZONE";

            }


            if (email) {

                email.textContent =
                    state.user.email ||
                    "";

            }


            if (logoutButton) {

                logoutButton.hidden =
                    false;

            }

        } else {

            if (name) {

                name.textContent =
                    "زائر";

            }


            if (email) {

                email.textContent =
                    "سجل حسابك لحفظ تقدمك.";

            }


            if (logoutButton) {

                logoutButton.hidden =
                    true;

            }

        }


        if (level) {

            level.textContent =
                state.player.level;

        }


        if (xp) {

            xp.textContent =
                state.player.xp;

        }


        if (coins) {

            coins.textContent =
                state.player.coins;

        }


        if (wins) {

            wins.textContent =
                state.player.wins;

        }


        if (levelChip) {

            levelChip.textContent =
                `Level ${state.player.level}`;

        }


        const progress =
            $("#xp-progress");


        if (progress) {

            const percentage =
                Math.min(
                    100,
                    state.player.xp % 100
                );


            progress.style.width =
                `${percentage}%`;

        }

    }


    // ========================================================
    // CHALLENGES
    // ========================================================

    function renderChallenges() {

        const container =
            $("#challenge-list");


        if (!container) {
            return;
        }


        const challenges = [

            {
                title:
                    "تحدي السرعة",

                text:
                    "أجب بأسرع وقت ممكن.",

                xp:
                    25
            },

            {
                title:
                    "تحدي المعرفة",

                text:
                    "اختبر معلوماتك.",

                xp:
                    40
            },

            {
                title:
                    "تحدي اليوم",

                text:
                    "مهمة جديدة كل يوم.",

                xp:
                    30
            }

        ];


        container.innerHTML =
            challenges.map(
                challenge => `

                    <article class="challenge-card">

                        <span class="card-tag">
                            CHALLENGE
                        </span>

                        <h3>
                            ${escapeHTML(challenge.title)}
                        </h3>

                        <p>
                            ${escapeHTML(challenge.text)}
                        </p>

                        <strong>
                            +${challenge.xp} XP
                        </strong>

                    </article>

                `
            ).join("");

    }


    // ========================================================
    // SPORTS
    // ========================================================

    function renderSports() {

        const container =
            $("#sports-list");


        if (!container) {
            return;
        }


        const items = [

            {
                title:
                    "أحدث الأخبار الرياضية",

                text:
                    "قسم الرياضة في ZIVOZONE جاهز لإضافة الأخبار والنتائج والمحتوى الرياضي.",

                icon:
                    "⚽"
            },

            {
                title:
                    "عالم كرة القدم",

                text:
                    "تابع التحديات والمحتوى الرياضي داخل المنصة.",

                icon:
                    "🏆"
            },

            {
                title:
                    "ZIVO SPORT",

                text:
                    "قسم مخصص للتفاعل مع الرياضة واللاعبين.",

                icon:
                    "🔥"
            }

        ];


        container.innerHTML =
            items.map(
                item => `

                    <article class="sports-card">

                        <div class="icon">
                            ${item.icon}
                        </div>

                        <h3>
                            ${escapeHTML(item.title)}
                        </h3>

                        <p>
                            ${escapeHTML(item.text)}
                        </p>

                    </article>

                `
            ).join("");

    }


    // ========================================================
    // GAMES
    // ========================================================

    function startGame(
        type
    ) {

        if (
            !state.user
        ) {

            openAuthModal();

            showToast(
                "أنشئ حسابًا مجانيًا أولًا حتى نحفظ تقدمك."
            );

            return;
        }


        state.currentGame =
            type;


        state.questionIndex =
            0;


        state.score =
            0;


        openGameModal(
            type
        );

    }


    function openGameModal(
        type
    ) {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        const titles = {

            quiz:
                "🧠 اختبار الذكاء",

            horror:
                "👻 الغرفة المظلمة",

            science:
                "🔬 تحدي العلوم",

            daily:
                "⚡ تحدي ZIVO اليومي"

        };


        root.innerHTML = `

            <div class="modal-overlay">

                <div class="modal-card">

                    <button
                        class="modal-close"
                        type="button"
                        data-modal-close
                    >
                        ×
                    </button>

                    <span class="eyebrow">
                        ZIVO GAME
                    </span>

                    <h2>
                        ${titles[type] || "ZIVO GAME"}
                    </h2>

                    <div id="game-content">

                        <p>
                            جاهز للتحدي؟
                        </p>

                        <button
                            id="game-start-button"
                            class="btn btn-primary full"
                            type="button"
                        >
                            ابدأ الآن
                        </button>

                    </div>

                </div>

            </div>

        `;


        $$(
            "[data-modal-close]",
            root
        ).forEach(
            button => {

                button.onclick =
                    closeModal;

            }
        );


        $("#game-start-button")
            ?.addEventListener(
                "click",
                playSimpleQuestion
            );

    }


    function playSimpleQuestion() {

        const content =
            $("#game-content");


        if (!content) {
            return;
        }


        const questions = {

            quiz: [

                {
                    q:
                        "ما العدد التالي؟ 2، 4، 6، ؟",

                    answers:
                        ["7", "8", "9"],

                    correct:
                        "8"

                },

                {
                    q:
                        "أي كلمة مختلفة؟",

                    answers:
                        ["تفاح", "موز", "سيارة"],

                    correct:
                        "سيارة"

                }

            ],

            science: [

                {
                    q:
                        "ما الكوكب المعروف بالكوكب الأحمر؟",

                    answers:
                        ["المريخ", "الزهرة", "المشتري"],

                    correct:
                        "المريخ"

                }

            ],

            daily: [

                {
                    q:
                        "كم عدد أيام الأسبوع؟",

                    answers:
                        ["5", "7", "9"],

                    correct:
                        "7"

                }

            ],

            horror: [

                {
                    q:
                        "أنت في غرفة مظلمة. ماذا تفعل؟",

                    answers:
                        [
                            "أفتح الباب",
                            "أبقى مكاني",
                            "أبحث عن الضوء"
                        ],

                    correct:
                        "أبحث عن الضوء"

                }

            ]

        };


        const list =
            questions[
                state.currentGame
            ] || questions.quiz;


        const question =
            list[
                state.questionIndex %
                list.length
            ];


        content.innerHTML = `

            <h3>
                ${escapeHTML(question.q)}
            </h3>

            <div class="game-answers">

                ${question.answers.map(
                    answer => `

                        <button
                            class="btn btn-ghost full game-answer"
                            type="button"
                            data-answer="${escapeHTML(answer)}"
                        >
                            ${escapeHTML(answer)}
                        </button>

                    `
                ).join("")}

            </div>

        `;


        $$(".game-answer")
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const correct =
                                button.dataset.answer ===
                                question.correct;


                            if (correct) {

                                state.score++;

                                showToast(
                                    "✅ إجابة صحيحة!"
                                );

                            } else {

                                showToast(
                                    "❌ إجابة غير صحيحة."
                                );

                            }


                            state.questionIndex++;


                            if (
                                state.questionIndex >=
                                list.length
                            ) {

                                finishGame();

                            } else {

                                playSimpleQuestion();

                            }

                        }
                    );

                }
            );

    }


    async function finishGame() {

        const xpEarned =
            state.score * 25;


        state.player.xp +=
            xpEarned;


        if (
            state.player.xp >= 100
        ) {

            state.player.level++;

            state.player.xp =
                state.player.xp % 100;

        }


        updateProfileUI();


        try {

            if (
                state.user &&
                window.ZIVOZONE_AUTH &&
                typeof window.ZIVOZONE_AUTH.update === "function"
            ) {

                await window.ZIVOZONE_AUTH.update({

                    level:
                        state.player.level,

                    xp:
                        state.player.xp

                });

            }

        } catch (error) {

            console.error(
                error
            );

        }


        const content =
            $("#game-content");


        if (content) {

            content.innerHTML = `

                <div class="game-result">

                    <div class="icon">
                        🏆
                    </div>

                    <h3>
                        انتهى التحدي!
                    </h3>

                    <p>
                        حصلت على
                        <strong>
                            ${xpEarned} XP
                        </strong>
                    </p>

                    <button
                        class="btn btn-primary full"
                        type="button"
                        data-result-close
                    >
                        متابعة
                    </button>

                </div>

            `;


            $(
                "[data-result-close]"
            )?.addEventListener(
                "click",
                closeModal
            );

        }

    }


    // ========================================================
    // WHO AM I
    // ========================================================

    function openIdentity() {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.innerHTML = `

            <div class="modal-overlay">

                <div class="modal-card">

                    <button
                        class="modal-close"
                        type="button"
                        data-modal-close
                    >
                        ×
                    </button>


                    <span class="eyebrow">
                        WHO AM I?
                    </span>


                    <h2>
                        اكتشف نمطك
                    </h2>


                    <p>
                        اختر الإجابة الأقرب لك.
                    </p>


                    <div class="identity-options">

                        <button
                            class="btn btn-ghost full"
                            type="button"
                            data-personality="thinker"
                        >
                            🧠 أحب التفكير والتحليل
                        </button>


                        <button
                            class="btn btn-ghost full"
                            type="button"
                            data-personality="leader"
                        >
                            👑 أحب القيادة والمنافسة
                        </button>


                        <button
                            class="btn btn-ghost full"
                            type="button"
                            data-personality="creator"
                        >
                            🎨 أحب الإبداع والتجربة
                        </button>

                    </div>

                </div>

            </div>

        `;


        $$(
            "[data-modal-close]",
            root
        ).forEach(
            button => {

                button.onclick =
                    closeModal;

            }
        );


        $$(
            "[data-personality]",
            root
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showToast(
                            `أنت تميل إلى نمط ${getPersonalityName(button.dataset.personality)}.`
                        );

                        closeModal();

                    }
                );

            }
        );

    }


    function getPersonalityName(
        type
    ) {

        const names = {

            thinker:
                "المفكر",

            leader:
                "القائد",

            creator:
                "المبدع"

        };


        return names[type] ||
            "المستكشف";

    }


    // ========================================================
    // AI
    // ========================================================

    function handleAI(
        event
    ) {

        event.preventDefault();


        const input =
            $("#ai-input");


        const messages =
            $("#ai-messages");


        if (
            !input ||
            !messages
        ) {

            return;
        }


        const text =
            input.value.trim();


        if (!text) {
            return;
        }


        const safeText =
            escapeHTML(text);


        messages.insertAdjacentHTML(
            "beforeend",
            `

                <div class="ai-message user">
                    ${safeText}
                </div>

                <div class="ai-message bot">
                    🤖 حاليًا أنا النسخة التجريبية من ZIVO AI.
                    سأكون قادرًا على مساعدتك بشكل أوسع
                    عند ربط محرك الذكاء الاصطناعي.
                </div>

            `
        );


        input.value =
            "";


        messages.scrollTop =
            messages.scrollHeight;

    }


    // ========================================================
    // LANGUAGE
    // ========================================================

    function handleLanguage(
        event
    ) {

        const language =
            event.target.value;


        localStorage.setItem(
            "zivozone-language",
            language
        );


        if (
            language !== "ar"
        ) {

            showToast(
                "تم حفظ اللغة. الترجمة الكاملة ستتم إضافتها تدريجيًا."
            );

        }

    }


    // ========================================================
    // TOAST
    // ========================================================

    function showToast(
        message
    ) {

        const container =
            $("#toast-container");


        if (!container) {

            alert(
                message
            );

            return;
        }


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            "toast";


        toast.textContent =
            message;


        container.appendChild(
            toast
        );


        setTimeout(
            () => {

                toast.remove();

            },
            3500
        );

    }


    // ========================================================
    // LOADER
    // ========================================================

    function hideLoader() {

        const loader =
            $("#app-loader");


        if (!loader) {
            return;
        }


        setTimeout(
            () => {

                loader.classList.add(
                    "hidden"
                );

            },
            500
        );

    }


    // ========================================================
    // HTML ESCAPE
    // ========================================================

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
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


})();
