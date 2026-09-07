"use strict";

/*
=========================================================
ZIVOZONE V2
Main Application Engine
=========================================================

المسؤوليات:
1. Navigation
2. Languages
3. Local user account
4. XP / Levels
5. Games
6. Challenges
7. Personality analysis
8. Local AI assistant
9. Notifications
10. UI state

ملاحظة أمنية:
لا يتم وضع مفاتيح API أو أسرار داخل هذا الملف.
أي اتصال حقيقي بالذكاء الاصطناعي أو قاعدة البيانات
يجب أن يمر لاحقاً من خلال Backend آمن.
=========================================================
*/


/* ========================================================
   01. GLOBAL CONFIG
   ======================================================== */

const ZIVO_CONFIG = Object.freeze({

    storageKey: "zivozone_state_v2",

    supportedLanguages: [
        "ar",
        "en",
        "fr",
        "es",
        "tr"
    ],

    defaultLanguage: "ar",

    xpPerLevel: 1000,

    maxStoredMessages: 50

});


/* ========================================================
   02. APPLICATION STATE
   ======================================================== */

const defaultState = {

    language: "ar",

    user: null,

    xp: 0,

    level: 1,

    gamesPlayed: 0,

    challengesCompleted: 0,

    personalityAnswers: [],

    achievements: [],

    dailyChallenge: null,

    aiMessages: [],

    statistics: {

        memoryBest: 0,

        reactionBest: 0,

        mathBest: 0,

        personalityCompleted: false

    }

};


let state = loadState();


/* ========================================================
   03. SAFE STORAGE
   ======================================================== */

function loadState() {

    try {

        const saved = localStorage.getItem(
            ZIVO_CONFIG.storageKey
        );

        if (!saved) {

            return structuredClone(defaultState);

        }

        const parsed = JSON.parse(saved);

        return sanitizeState(parsed);

    } catch (error) {

        console.error(
            "ZIVOZONE state loading failed:",
            error
        );

        return structuredClone(defaultState);

    }

}


function sanitizeState(input) {

    try {

        if (!input || typeof input !== "object") {

            return structuredClone(defaultState);

        }

        const safe = structuredClone(defaultState);

        if (
            typeof input.language === "string" &&
            ZIVO_CONFIG.supportedLanguages.includes(
                input.language
            )
        ) {

            safe.language = input.language;

        }

        if (
            input.user &&
            typeof input.user === "object"
        ) {

            safe.user = {

                name:
                    typeof input.user.name === "string"
                        ? input.user.name.slice(0, 80)
                        : "",

                email:
                    typeof input.user.email === "string"
                        ? input.user.email.slice(0, 150)
                        : ""

            };

        }

        safe.xp = Number.isFinite(
            Number(input.xp)
        )
            ? Math.max(0, Number(input.xp))
            : 0;

        safe.level = Math.max(
            1,
            Number.isFinite(Number(input.level))
                ? Number(input.level)
                : 1
        );

        safe.gamesPlayed = Math.max(
            0,
            Number(input.gamesPlayed) || 0
        );

        safe.challengesCompleted = Math.max(
            0,
            Number(input.challengesCompleted) || 0
        );

        if (
            Array.isArray(input.personalityAnswers)
        ) {

            safe.personalityAnswers =
                input.personalityAnswers
                    .filter(
                        item =>
                            item &&
                            typeof item === "object"
                    )
                    .slice(0, 100);

        }

        if (
            Array.isArray(input.achievements)
        ) {

            safe.achievements =
                input.achievements
                    .filter(
                        item =>
                            typeof item === "string"
                    )
                    .slice(0, 100);

        }

        if (
            input.statistics &&
            typeof input.statistics === "object"
        ) {

            safe.statistics.memoryBest =
                Number(input.statistics.memoryBest) || 0;

            safe.statistics.reactionBest =
                Number(input.statistics.reactionBest) || 0;

            safe.statistics.mathBest =
                Number(input.statistics.mathBest) || 0;

            safe.statistics.personalityCompleted =
                Boolean(
                    input.statistics.personalityCompleted
                );

        }

        if (Array.isArray(input.aiMessages)) {

            safe.aiMessages =
                input.aiMessages
                    .filter(
                        message =>
                            message &&
                            typeof message === "object"
                    )
                    .slice(
                        -ZIVO_CONFIG.maxStoredMessages
                    );

        }

        return safe;

    } catch (error) {

        console.error(
            "State sanitization failed:",
            error
        );

        return structuredClone(defaultState);

    }

}


function saveState() {

    try {

        localStorage.setItem(
            ZIVO_CONFIG.storageKey,
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            "ZIVOZONE state saving failed:",
            error
        );

        notify(
            "تعذر حفظ بعض البيانات على هذا الجهاز.",
            "error"
        );

    }

}


/* ========================================================
   04. DOM HELPERS
   ======================================================== */

function $(selector, parent = document) {

    try {

        return parent.querySelector(selector);

    } catch (error) {

        console.error(
            "Invalid selector:",
            selector,
            error
        );

        return null;

    }

}


function $$(selector, parent = document) {

    try {

        return Array.from(
            parent.querySelectorAll(selector)
        );

    } catch (error) {

        console.error(
            "Invalid selector:",
            selector,
            error
        );

        return [];

    }

}


function escapeHTML(value) {

    const text =
        value === null ||
        value === undefined
            ? ""
            : String(value);

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ========================================================
   05. LANGUAGE SYSTEM
   ======================================================== */

const translations = {

    ar: {

        login: "تسجيل الدخول",
        logout: "تسجيل الخروج",
        home: "الرئيسية",
        games: "الألعاب",
        challenges: "التحديات",
        personality: "من أنا؟",
        ai: "ZIVO AI",
        profile: "حسابي",

        welcome:
            "أهلاً بك في ZIVOZONE",

        loginRequired:
            "سجل دخولك للاستفادة من خدمات ZIVOZONE.",

        invalidEmail:
            "يرجى إدخال بريد إلكتروني صحيح.",

        loginSuccess:
            "تم تسجيل الدخول بنجاح.",

        logoutSuccess:
            "تم تسجيل الخروج.",

        xpEarned:
            "حصلت على XP!",

        gameFinished:
            "انتهت اللعبة.",

        error:
            "حدث خطأ غير متوقع.",

        aiWelcome:
            "مرحباً! أنا ZIVO AI. اسألني عن الألعاب أو التحديات أو ZIVOZONE.",

        noUser:
            "زائر",

        send:
            "إرسال"

    },

    en: {

        login: "Login",
        logout: "Logout",
        home: "Home",
        games: "Games",
        challenges: "Challenges",
        personality: "Who Am I?",
        ai: "ZIVO AI",
        profile: "My Profile",

        welcome:
            "Welcome to ZIVOZONE",

        loginRequired:
            "Log in to access ZIVOZONE services.",

        invalidEmail:
            "Please enter a valid email address.",

        loginSuccess:
            "Logged in successfully.",

        logoutSuccess:
            "Logged out successfully.",

        xpEarned:
            "XP earned!",

        gameFinished:
            "Game finished.",

        error:
            "An unexpected error occurred.",

        aiWelcome:
            "Hello! I am ZIVO AI. Ask me about games, challenges or ZIVOZONE.",

        noUser:
            "Guest",

        send:
            "Send"

    },

    fr: {

        login: "Connexion",
        logout: "Déconnexion",
        home: "Accueil",
        games: "Jeux",
        challenges: "Défis",
        personality: "Qui suis-je ?",
        ai: "ZIVO AI",
        profile: "Mon profil",

        welcome:
            "Bienvenue sur ZIVOZONE",

        loginRequired:
            "Connectez-vous pour utiliser les services ZIVOZONE.",

        invalidEmail:
            "Veuillez saisir une adresse e-mail valide.",

        loginSuccess:
            "Connexion réussie.",

        logoutSuccess:
            "Déconnexion réussie.",

        xpEarned:
            "XP gagné !",

        gameFinished:
            "Jeu terminé.",

        error:
            "Une erreur inattendue est survenue.",

        aiWelcome:
            "Bonjour ! Je suis ZIVO AI. Posez-moi une question sur ZIVOZONE.",

        noUser:
            "Visiteur",

        send:
            "Envoyer"

    },

    es: {

        login: "Iniciar sesión",
        logout: "Cerrar sesión",
        home: "Inicio",
        games: "Juegos",
        challenges: "Desafíos",
        personality: "¿Quién soy?",
        ai: "ZIVO AI",
        profile: "Mi perfil",

        welcome:
            "Bienvenido a ZIVOZONE",

        loginRequired:
            "Inicia sesión para utilizar los servicios de ZIVOZONE.",

        invalidEmail:
            "Introduce un correo electrónico válido.",

        loginSuccess:
            "Inicio de sesión correcto.",

        logoutSuccess:
            "Sesión cerrada.",

        xpEarned:
            "¡XP conseguido!",

        gameFinished:
            "Juego terminado.",

        error:
            "Ha ocurrido un error inesperado.",

        aiWelcome:
            "¡Hola! Soy ZIVO AI. Pregúntame sobre ZIVOZONE.",

        noUser:
            "Visitante",

        send:
            "Enviar"

    },

    tr: {

        login: "Giriş",
        logout: "Çıkış",
        home: "Ana Sayfa",
        games: "Oyunlar",
        challenges: "Görevler",
        personality: "Ben Kimim?",
        ai: "ZIVO AI",
        profile: "Profilim",

        welcome:
            "ZIVOZONE'a hoş geldiniz",

        loginRequired:
            "ZIVOZONE hizmetlerinden yararlanmak için giriş yapın.",

        invalidEmail:
            "Lütfen geçerli bir e-posta adresi girin.",

        loginSuccess:
            "Başarıyla giriş yapıldı.",

        logoutSuccess:
            "Çıkış yapıldı.",

        xpEarned:
            "XP kazandınız!",

        gameFinished:
            "Oyun bitti.",

        error:
            "Beklenmeyen bir hata oluştu.",

        aiWelcome:
            "Merhaba! Ben ZIVO AI. ZIVOZONE hakkında bana soru sorabilirsiniz.",

        noUser:
            "Misafir",

        send:
            "Gönder"

    }

};


function t(key) {

    try {

        return (
            translations[state.language]?.[key] ||
            translations.ar[key] ||
            key
        );

    } catch (error) {

        return key;

    }

}


function applyLanguage() {

    try {

        const lang =
            ZIVO_CONFIG.supportedLanguages.includes(
                state.language
            )
                ? state.language
                : ZIVO_CONFIG.defaultLanguage;

        const direction =
            lang === "ar"
                ? "rtl"
                : "ltr";

        document.documentElement.lang = lang;

        document.documentElement.dir = direction;

        const selector =
            $("#languageSelector");

        if (selector) {

            selector.value = lang;

        }

        $$("[data-i18n]").forEach(element => {

            const key =
                element.dataset.i18n;

            if (
                key &&
                translations[lang]?.[key]
            ) {

                element.textContent =
                    translations[lang][key];

            }

        });

        updateUserUI();

        saveState();

    } catch (error) {

        console.error(
            "Language application failed:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


/* ========================================================
   06. NAVIGATION
   ======================================================== */

function initializeNavigation() {

    try {

        $$("[data-page]").forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const page =
                        link.dataset.page;

                    if (!page) {
                        return;
                    }

                    navigateTo(page);

                }
            );

        });

    } catch (error) {

        console.error(
            "Navigation initialization failed:",
            error
        );

    }

}


function navigateTo(pageId) {

    try {

        const pages =
            $$(".page-section");

        if (!pages.length) {

            return;

        }

        let found = false;

        pages.forEach(page => {

            const active =
                page.id === pageId;

            page.classList.toggle(
                "active",
                active
            );

            if (active) {
                found = true;
            }

        });

        if (!found) {

            console.warn(
                "Page not found:",
                pageId
            );

            return;

        }

        $$("[data-page]").forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.page === pageId
            );

        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (
            pageId === "gamesPage"
        ) {

            renderGames();

        }

        if (
            pageId === "challengesPage"
        ) {

            renderChallenges();

        }

        if (
            pageId === "personalityPage"
        ) {

            renderPersonality();

        }

        if (
            pageId === "profilePage"
        ) {

            updateProfile();

        }

        if (
            pageId === "aiPage"
        ) {

            renderAIMessages();

        }

    } catch (error) {

        console.error(
            "Navigation error:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


/* ========================================================
   07. USER ACCOUNT
   ======================================================== */

function initializeAuthentication() {

    try {

        const loginButton =
            $("#loginButton");

        const logoutButton =
            $("#logoutButton");

        const loginModal =
            $("#loginModal");

        const closeButton =
            $("#closeLoginModal");

        const overlay =
            $(".modal-overlay", loginModal);

        const loginForm =
            $("#loginForm");

        if (loginButton) {

            loginButton.addEventListener(
                "click",
                () => openLoginModal()
            );

        }

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logout
            );

        }

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeLoginModal
            );

        }

        if (overlay) {

            overlay.addEventListener(
                "click",
                closeLoginModal
            );

        }

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                handleLogin
            );

        }

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    closeLoginModal();

                }

            }
        );

        updateUserUI();

    } catch (error) {

        console.error(
            "Authentication initialization failed:",
            error
        );

    }

}


function openLoginModal() {

    try {

        const modal =
            $("#loginModal");

        if (!modal) {
            return;
        }

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        const email =
            $("#loginEmail");

        if (email) {

            setTimeout(
                () => email.focus(),
                100
            );

        }

    } catch (error) {

        console.error(
            "Could not open login modal:",
            error
        );

    }

}


function closeLoginModal() {

    try {

        const modal =
            $("#loginModal");

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    } catch (error) {

        console.error(
            "Could not close login modal:",
            error
        );

    }

}


function handleLogin(event) {

    event.preventDefault();

    try {

        const nameInput =
            $("#loginName");

        const emailInput =
            $("#loginEmail");

        if (!emailInput) {

            return;

        }

        const name =
            nameInput?.value.trim() || "ZIVO Player";

        const email =
            emailInput.value.trim();

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

        if (!emailPattern.test(email)) {

            notify(
                t("invalidEmail"),
                "error"
            );

            emailInput.focus();

            return;

        }

        state.user = {

            name:
                name.slice(0, 80),

            email:
                email.slice(0, 150)

        };

        saveState();

        closeLoginModal();

        updateUserUI();

        notify(
            t("loginSuccess"),
            "success"
        );

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


function logout() {

    try {

        state.user = null;

        saveState();

        updateUserUI();

        notify(
            t("logoutSuccess"),
            "success"
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


function updateUserUI() {

    try {

        const loginButton =
            $("#loginButton");

        const logoutButton =
            $("#logoutButton");

        const userName =
            $("#profileName");

        const userEmail =
            $("#profileEmail");

        if (state.user) {

            if (loginButton) {

                loginButton.style.display =
                    "none";

            }

            if (logoutButton) {

                logoutButton.style.display =
                    "inline-flex";

            }

            if (userName) {

                userName.textContent =
                    state.user.name;

            }

            if (userEmail) {

                userEmail.textContent =
                    state.user.email;

            }

        } else {

            if (loginButton) {

                loginButton.style.display =
                    "inline-flex";

            }

            if (logoutButton) {

                logoutButton.style.display =
                    "none";

            }

            if (userName) {

                userName.textContent =
                    t("noUser");

            }

            if (userEmail) {

                userEmail.textContent =
                    "";

            }

        }

        updateProfile();

    } catch (error) {

        console.error(
            "User UI update failed:",
            error
        );

    }

}


/* ========================================================
   08. XP SYSTEM
   ======================================================== */

function addXP(amount, reason = "") {

    try {

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return;

        }

        const previousLevel =
            calculateLevel(state.xp);

        state.xp += Math.floor(amount);

        state.level =
            calculateLevel(state.xp);

        saveState();

        updateXPUI();

        notify(
            `${reason ? reason + " — " : ""}${amount} ${t("xpEarned")}`,
            "success"
        );

        if (
            state.level > previousLevel
        ) {

            unlockAchievement(
                `level_${state.level}`
            );

            notify(
                `🎉 Level ${state.level}!`,
                "success"
            );

        }

    } catch (error) {

        console.error(
            "XP error:",
            error
        );

    }

}


function calculateLevel(xp) {

    return Math.max(
        1,
        Math.floor(
            Number(xp || 0) /
            ZIVO_CONFIG.xpPerLevel
        ) + 1
    );

}


function updateXPUI() {

    try {

        state.level =
            calculateLevel(state.xp);

        const levelElements =
            $$(".user-level");

        levelElements.forEach(element => {

            element.textContent =
                state.level;

        });

        const xpElements =
            $$(".user-xp");

        xpElements.forEach(element => {

            element.textContent =
                state.xp;

        });

        const progressBars =
            $$(".xp-progress-bar");

        const currentLevelXP =
            state.xp %
            ZIVO_CONFIG.xpPerLevel;

        const percentage =
            (
                currentLevelXP /
                ZIVO_CONFIG.xpPerLevel
            ) * 100;

        progressBars.forEach(bar => {

            bar.style.width =
                `${percentage}%`;

        });

    } catch (error) {

        console.error(
            "XP UI update failed:",
            error
        );

    }

}


/* ========================================================
   09. ACHIEVEMENTS
   ======================================================== */

function unlockAchievement(id) {

    try {

        if (
            typeof id !== "string" ||
            !id
        ) {

            return;

        }

        if (
            state.achievements.includes(id)
        ) {

            return;

        }

        state.achievements.push(id);

        saveState();

    } catch (error) {

        console.error(
            "Achievement error:",
            error
        );

    }

}


/* ========================================================
   10. GAMES DATABASE
   ======================================================== */

const games = [

    {

        id: "memory",

        icon: "🧠",

        title: "اختبار الذاكرة",

        description:
            "احفظ الرموز ثم اكتشف الأزواج المتطابقة.",

        category: "ذكاء",

        xp: 80

    },

    {

        id: "math",

        icon: "⚡",

        title: "تحدي الحساب السريع",

        description:
            "أجب عن أكبر عدد من العمليات خلال الوقت.",

        category: "سرعة",

        xp: 100

    },

    {

        id: "reaction",

        icon: "🎯",

        title: "اختبار رد الفعل",

        description:
            "اختبر سرعة استجابتك.",

        category: "تركيز",

        xp: 70

    },

    {

        id: "psychology",

        icon: "🧩",

        title: "مختبر النفس",

        description:
            "مجموعة أسئلة تكشف طريقة تفكيرك.",

        category: "نفس",

        xp: 120

    },

    {

        id: "horror",

        icon: "👻",

        title: "غرفة الرعب",

        description:
            "تجربة تفاعلية تعتمد على الاختيارات.",

        category: "رعب",

        xp: 150

    },

    {

        id: "whoami",

        icon: "🔍",

        title: "من أنا؟",

        description:
            "تحليل شخصيتك بناءً على إجاباتك.",

        category: "تحليل",

        xp: 200

    }

];


function renderGames() {

    try {

        const container =
            $("#gamesGrid");

        if (!container) {
            return;
        }

        container.innerHTML =
            games.map(game => `

                <article class="game-card-preview">

                    <div class="game-preview-icon">
                        ${escapeHTML(game.icon)}
                    </div>

                    <span>
                        ${escapeHTML(game.category)}
                    </span>

                    <h2>
                        ${escapeHTML(game.title)}
                    </h2>

                    <p>
                        ${escapeHTML(game.description)}
                    </p>

                    <div class="game-meta">

                        <span>
                            +${game.xp} XP
                        </span>

                        <span>
                            ZIVOZONE
                        </span>

                    </div>

                    <button
                        class="primary-button full-width"
                        data-game="${escapeHTML(game.id)}"
                        type="button"
                    >
                        العب الآن
                    </button>

                </article>

            `).join("");

        $$("[data-game]", container)
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        launchGame(
                            button.dataset.game
                        );

                    }
                );

            });

    } catch (error) {

        console.error(
            "Games rendering failed:",
            error
        );

    }

}


/* ========================================================
   11. GAME ENGINE
   ======================================================== */

function launchGame(gameId) {

    try {

        if (!state.user) {

            notify(
                t("loginRequired"),
                "warning"
            );

            openLoginModal();

            return;

        }

        const game =
            games.find(
                item =>
                    item.id === gameId
            );

        if (!game) {

            notify(
                "اللعبة غير موجودة.",
                "error"
            );

            return;

        }

        const container =
            $("#gameContainer");

        if (!container) {

            notify(
                "مساحة اللعبة غير موجودة.",
                "error"
            );

            return;

        }

        navigateTo("gamesPage");

        if (gameId === "memory") {

            startMemoryGame(container);

        } else if (gameId === "math") {

            startMathGame(container);

        } else if (gameId === "reaction") {

            startReactionGame(container);

        } else if (gameId === "psychology") {

            startPsychologyGame(container);

        } else if (gameId === "horror") {

            startHorrorGame(container);

        } else if (gameId === "whoami") {

            navigateTo(
                "personalityPage"
            );

        }

    } catch (error) {

        console.error(
            "Game launch failed:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


/* ========================================================
   12. MEMORY GAME
   ======================================================== */

function startMemoryGame(container) {

    try {

        const symbols = [
            "⚽",
            "🧠",
            "👻",
            "🚀",
            "🎯",
            "🔥"
        ];

        const cards =
            [...symbols, ...symbols]
                .sort(
                    () =>
                        Math.random() - 0.5
                );

        let firstCard = null;
        let secondCard = null;
        let locked = false;
        let matched = 0;

        container.innerHTML = `

            <div class="page-hero">

                <span class="section-kicker">
                    ZIVO MEMORY
                </span>

                <h1>
                    اختبار الذاكرة
                </h1>

                <p>
                    اكتشف جميع الأزواج بأقل عدد ممكن من المحاولات.
                </p>

            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:repeat(4,1fr);
                    gap:12px;
                    max-width:600px;
                    margin:auto;
                "
                id="memoryBoard"
            >

                ${cards.map(
                    (_, index) => `

                        <button
                            type="button"
                            data-index="${index}"
                            style="
                                aspect-ratio:1;
                                border-radius:16px;
                                background:rgba(124,60,255,.12);
                                border:1px solid rgba(255,255,255,.1);
                                color:white;
                                font-size:2rem;
                                cursor:pointer;
                            "
                        >
                            ?
                        </button>

                    `
                ).join("")}

            </div>

        `;

        const board =
            $("#memoryBoard", container);

        if (!board) {
            return;
        }

        const buttons =
            $$("button", board);

        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        if (
                            locked ||
                            button === firstCard ||
                            button.dataset.matched === "true"
                        ) {

                            return;

                        }

                        const index =
                            Number(
                                button.dataset.index
                            );

                        button.textContent =
                            cards[index];

                        button.style.background =
                            "rgba(124,60,255,.3)";

                        if (!firstCard) {

                            firstCard =
                                button;

                            return;

                        }

                        secondCard =
                            button;

                        locked = true;

                        const firstIndex =
                            Number(
                                firstCard.dataset.index
                            );

                        const secondIndex =
                            Number(
                                secondCard.dataset.index
                            );

                        if (
                            cards[firstIndex] ===
                            cards[secondIndex]
                        ) {

                            firstCard.dataset.matched =
                                "true";

                            secondCard.dataset.matched =
                                "true";

                            matched += 2;

                            resetSelection();

                            if (
                                matched ===
                                cards.length
                            ) {

                                finishGame(
                                    80,
                                    "memory"
                                );

                            }

                        } else {

                            setTimeout(
                                () => {

                                    if (firstCard) {
                                        firstCard.textContent =
                                            "?";
                                    }

                                    if (secondCard) {
                                        secondCard.textContent =
                                            "?";
                                    }

                                    resetSelection();

                                },
                                700
                            );

                        }

                    }
                );

            }
        );


        function resetSelection() {

            firstCard = null;

            secondCard = null;

            locked = false;

        }

    } catch (error) {

        console.error(
            "Memory game error:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


/* ========================================================
   13. MATH GAME
   ======================================================== */

function startMathGame(container) {

    try {

        let score = 0;
        let question = 0;
        let correctAnswer = 0;

        const totalQuestions = 10;

        container.innerHTML = `

            <div style="max-width:650px;margin:auto;text-align:center">

                <span class="section-kicker">
                    ZIVO MATH
                </span>

                <h1>
                    تحدي الحساب السريع
                </h1>

                <p
                    id="mathQuestion"
                    style="font-size:2rem;margin:30px 0"
                >
                    جاهز؟
                </p>

                <div
                    id="mathAnswers"
                    style="
                        display:grid;
                        grid-template-columns:repeat(2,1fr);
                        gap:12px;
                    "
                ></div>

                <p
                    id="mathScore"
                    style="margin-top:25px;color:#aeb8cc"
                >
                    0 / ${totalQuestions}
                </p>

            </div>

        `;

        const questionElement =
            $("#mathQuestion", container);

        const answersElement =
            $("#mathAnswers", container);

        const scoreElement =
            $("#mathScore", container);


        function nextQuestion() {

            if (
                question >=
                totalQuestions
            ) {

                finishGame(
                    score * 10,
                    "math"
                );

                return;

            }

            question++;

            const a =
                Math.floor(
                    Math.random() * 20
                ) + 1;

            const b =
                Math.floor(
                    Math.random() * 20
                ) + 1;

            const operations = [
                "+",
                "-",
                "×"
            ];

            const operation =
                operations[
                    Math.floor(
                        Math.random() *
                        operations.length
                    )
                ];

            if (operation === "+") {

                correctAnswer =
                    a + b;

            } else if (
                operation === "-"
            ) {

                correctAnswer =
                    a - b;

            } else {

                correctAnswer =
                    a * b;

            }

            questionElement.textContent =
                `${a} ${operation} ${b} = ؟`;

            const options =
                generateMathOptions(
                    correctAnswer
                );

            answersElement.innerHTML =
                options.map(
                    option => `

                        <button
                            type="button"
                            class="primary-button"
                            data-answer="${option}"
                        >
                            ${option}
                        </button>

                    `
                ).join("");

            $$(
                "[data-answer]",
                answersElement
            ).forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        if (
                            Number(
                                button.dataset.answer
                            ) === correctAnswer
                        ) {

                            score++;

                        }

                        scoreElement.textContent =
                            `${score} / ${totalQuestions}`;

                        nextQuestion();

                    }
                );

            });

        }


        nextQuestion();

    } catch (error) {

        console.error(
            "Math game error:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


function generateMathOptions(correct) {

    const options =
        new Set([correct]);

    let attempts = 0;

    while (
        options.size < 4 &&
        attempts < 50
    ) {

        attempts++;

        const variation =
            Math.floor(
                Math.random() * 21
            ) - 10;

        options.add(
            correct + variation
        );

    }

    return Array.from(options)
        .sort(
            () =>
                Math.random() - 0.5
        );

}


/* ========================================================
   14. REACTION GAME
   ======================================================== */

function startReactionGame(container) {

    try {

        let startTime = 0;
        let waiting = true;
        let timer = null;

        container.innerHTML = `

            <div style="max-width:650px;margin:auto;text-align:center">

                <span class="section-kicker">
                    ZIVO REACTION
                </span>

                <h1>
                    اختبار رد الفعل
                </h1>

                <p
                    id="reactionText"
                    style="margin:25px 0;color:#aeb8cc"
                >
                    اضغط على الزر وكن مستعداً.
                </p>

                <button
                    id="reactionButton"
                    class="primary-button"
                    type="button"
                    style="min-width:240px;min-height:100px;font-size:1.2rem"
                >
                    ابدأ
                </button>

            </div>

        `;

        const button =
            $("#reactionButton", container);

        const text =
            $("#reactionText", container);

        button.addEventListener(
            "click",
            () => {

                if (!waiting) {

                    return;

                }

                if (
                    button.dataset.started ===
                    "true"
                ) {

                    return;

                }

                button.dataset.started =
                    "true";

                button.textContent =
                    "انتظر...";

                text.textContent =
                    "لا تضغط حتى تتغير الإشارة.";

                const delay =
                    1500 +
                    Math.random() * 3500;

                timer = setTimeout(
                    () => {

                        waiting = false;

                        startTime =
                            performance.now();

                        button.textContent =
                            "اضغط الآن!";

                        button.style.background =
                            "#22df88";

                    },
                    delay
                );

            }
        );

        button.addEventListener(
            "click",
            () => {

                if (
                    button.dataset.started !==
                    "true"
                ) {

                    return;

                }

                if (waiting) {

                    clearTimeout(timer);

                    button.dataset.started =
                        "false";

                    button.textContent =
                        "ابدأ من جديد";

                    text.textContent =
                        "ضغطت مبكراً! حاول مرة أخرى.";

                    return;

                }

                const reactionTime =
                    Math.round(
                        performance.now() -
                        startTime
                    );

                state.statistics.reactionBest =
                    state.statistics.reactionBest === 0
                        ? reactionTime
                        : Math.min(
                            state.statistics.reactionBest,
                            reactionTime
                        );

                saveState();

                finishGame(
                    Math.max(
                        20,
                        Math.floor(
                            150 -
                            reactionTime / 5
                        )
                    ),
                    "reaction"
                );

            }
        );

    } catch (error) {

        console.error(
            "Reaction game error:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


/* ========================================================
   15. PSYCHOLOGY GAME
   ======================================================== */

function startPsychologyGame(container) {

    try {

        const questions = [

            {
                q:
                    "عندما تواجه مشكلة صعبة، ماذا تفعل أولاً؟",

                options: [
                    "أحلل المشكلة",
                    "أستشير شخصاً",
                    "أجرب مباشرة",
                    "أبتعد قليلاً"
                ]

            },

            {
                q:
                    "في المنافسة، ما الذي يحفزك أكثر؟",

                options: [
                    "الفوز",
                    "التعلم",
                    "إثبات نفسي",
                    "التجربة"
                ]

            },

            {
                q:
                    "إذا أخطأت أمام الآخرين؟",

                options: [
                    "أتعلم من الخطأ",
                    "أشعر بالإحراج",
                    "أحاول بسرعة مرة أخرى",
                    "أفكر في سبب الخطأ"
                ]

            },

            {
                q:
                    "أي وصف أقرب لك؟",

                options: [
                    "هادئ",
                    "مغامر",
                    "تحليلي",
                    "اجتماعي"
                ]

            }

        ];

        let current = 0;
        let answers = [];

        function renderQuestion() {

            const item =
                questions[current];

            container.innerHTML = `

                <div style="max-width:700px;margin:auto">

                    <span class="section-kicker">
                        ZIVO PSYCHOLOGY
                    </span>

                    <h1>
                        مختبر النفس
                    </h1>

                    <p style="margin:20px 0">
                        السؤال ${current + 1}
                        من ${questions.length}
                    </p>

                    <h2 style="margin:25px 0">
                        ${escapeHTML(item.q)}
                    </h2>

                    <div style="display:grid;gap:12px">

                        ${item.options.map(
                            option => `

                                <button
                                    type="button"
                                    class="secondary-button"
                                    data-option="${escapeHTML(option)}"
                                >
                                    ${escapeHTML(option)}
                                </button>

                            `
                        ).join("")}

                    </div>

                </div>

            `;

            $$(
                "[data-option]",
                container
            ).forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        answers.push(
                            button.dataset.option
                        );

                        current++;

                        if (
                            current >=
                            questions.length
                        ) {

                            const result =
                                analyzePsychology(
                                    answers
                                );

                            container.innerHTML = `

                                <div style="max-width:700px;margin:auto;text-align:center">

                                    <span class="section-kicker">
                                        ZIVO RESULT
                                    </span>

                                    <h1>
                                        ${escapeHTML(result.title)}
                                    </h1>

                                    <p style="margin:20px 0;color:#aeb8cc">
                                        ${escapeHTML(result.description)}
                                    </p>

                                    <button
                                        type="button"
                                        class="primary-button"
                                        id="psychologyDone"
                                    >
                                        متابعة
                                    </button>

                                </div>

                            `;

                            $("#psychologyDone")
                                ?.addEventListener(
                                    "click",
                                    () => {

                                        addXP(
                                            120,
                                            "مختبر النفس"
                                        );

                                    }
                                );

                        } else {

                            renderQuestion();

                        }

                    }
                );

            });

        }

        renderQuestion();

    } catch (error) {

        console.error(
            "Psychology game error:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


function analyzePsychology(answers) {

    try {

        const counts = {

            analytical: 0,
            social: 0,
            adventurous: 0,
            reflective: 0

        };

        answers.forEach(answer => {

            if (
                /حلل|أفكر|تحليلي/.test(
                    answer
                )
            ) {

                counts.analytical++;

            } else if (
                /شخص|اجتماعي/.test(
                    answer
                )
            ) {

                counts.social++;

            } else if (
                /أجرب|مغامر|مرة أخرى/.test(
                    answer
                )
            ) {

                counts.adventurous++;

            } else {

                counts.reflective++;

            }

        });

        const winner =
            Object.entries(counts)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )[0][0];

        const results = {

            analytical: {

                title:
                    "العقل التحليلي",

                description:
                    "تميل إلى فهم التفاصيل وربط المعلومات قبل اتخاذ القرار."

            },

            social: {

                title:
                    "الشخصية الاجتماعية",

                description:
                    "تميل إلى التفاعل والتواصل والاستفادة من الآخرين."

            },

            adventurous: {

                title:
                    "الشخصية المغامرة",

                description:
                    "تحب التجربة والمبادرة ولا تخاف من المحاولة."

            },

            reflective: {

                title:
                    "الشخصية التأملية",

                description:
                    "تميل إلى التفكير الهادئ ومراجعة التجارب قبل الحكم."

            }

        };

        return results[winner];

    } catch (error) {

        console.error(
            "Psychology analysis failed:",
            error
        );

        return {

            title:
                "نتيجة أولية",

            description:
                "لم نتمكن من بناء التحليل الكامل."

        };

    }

}


/* ========================================================
   16. HORROR GAME
   ======================================================== */

function startHorrorGame(container) {

    try {

        let stage = 0;

        const scenes = [

            {

                title:
                    "الباب الأسود",

                text:
                    "أنت داخل ممر مظلم. أمامك بابان. تسمع صوتاً خلف الباب الأيسر.",

                choices: [
                    "أفتح الباب الأيسر",
                    "أفتح الباب الأيمن"
                ]

            },

            {

                title:
                    "الغرفة",

                text:
                    "دخلت الغرفة. هناك مرآة قديمة وضوء أحمر يومض.",

                choices: [
                    "أنظر في المرآة",
                    "أطفئ الضوء"
                ]

            },

            {

                title:
                    "النهاية",

                text:
                    "تتوقف الأصوات فجأة. يظهر على الحائط اسمك... ثم ينطفئ كل شيء.",

                choices: [
                    "الخروج",
                    "البقاء"
                ]

            }

        ];


        function renderScene() {

            const scene =
                scenes[stage];

            container.innerHTML = `

                <div style="max-width:750px;margin:auto;text-align:center">

                    <span
                        class="section-kicker"
                        style="color:#ff456f"
                    >
                        ZIVO HORROR
                    </span>

                    <h1>
                        ${escapeHTML(scene.title)}
                    </h1>

                    <p style="
                        margin:30px 0;
                        font-size:1.1rem;
                        color:#c2c8d5;
                    ">
                        ${escapeHTML(scene.text)}
                    </p>

                    <div style="
                        display:grid;
                        gap:12px;
                    ">

                        ${scene.choices.map(
                            choice => `

                                <button
                                    type="button"
                                    class="secondary-button"
                                    data-horror-choice
                                >
                                    ${escapeHTML(choice)}
                                </button>

                            `
                        ).join("")}

                    </div>

                </div>

            `;

            $$(
                "[data-horror-choice]",
                container
            ).forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            stage++;

                            if (
                                stage >=
                                scenes.length
                            ) {

                                container.innerHTML = `

                                    <div class="empty-state">

                                        <div>
                                            👁️
                                        </div>

                                        <h2>
                                            هل كنت ستختار نفس الشيء؟
                                        </h2>

                                        <p>
                                            هذه التجربة مصممة لاختبار قراراتك تحت الضغط.
                                        </p>

                                        <button
                                            type="button"
                                            class="primary-button"
                                            id="horrorFinish"
                                        >
                                            إنهاء التجربة
                                        </button>

                                    </div>

                                `;

                                $("#horrorFinish")
                                    ?.addEventListener(
                                        "click",
                                        () => {

                                            finishGame(
                                                150,
                                                "horror"
                                            );

                                        }
                                    );

                                return;

                            }

                            renderScene();

                        }
                    );

                }
            );

        }

        renderScene();

    } catch (error) {

        console.error(
            "Horror game error:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


/* ========================================================
   17. GAME FINISH
   ======================================================== */

function finishGame(xp, gameId) {

    try {

        state.gamesPlayed++;

        addXP(
            xp,
            "انتهت اللعبة"
        );

        if (gameId) {

            unlockAchievement(
                `played_${gameId}`
            );

        }

        notify(
            t("gameFinished"),
            "success"
        );

        navigateTo(
            "gamesPage"
        );

    } catch (error) {

        console.error(
            "Game finish error:",
            error
        );

    }

}


/* ========================================================
   18. DAILY CHALLENGES
   ======================================================== */

function getTodayKey() {

    const date =
        new Date();

    return date.toISOString()
        .slice(0, 10);

}


function getDailyChallenge() {

    const challenges = [

        {
            title:
                "تحدي التركيز",

            description:
                "العب اختبار رد الفعل وحاول تحطيم رقمك.",

            xp: 100
        },

        {
            title:
                "تحدي الذكاء",

            description:
                "أنهِ اختبار الذاكرة دون أخطاء.",

            xp: 120
        },

        {
            title:
                "تحدي الحساب",

            description:
                "حقق نتيجة ممتازة في الحساب السريع.",

            xp: 100
        }

    ];

    const seed =
        getTodayKey()
            .split("")
            .reduce(
                (sum, char) =>
                    sum + char.charCodeAt(0),
                0
            );

    return challenges[
        seed % challenges.length
    ];

}


function renderChallenges() {

    try {

        const container =
            $("#challengeGrid");

        if (!container) {
            return;
        }

        const challenge =
            getDailyChallenge();

        container.innerHTML = `

            <article class="challenge-card">

                <div class="challenge-number">
                    01
                </div>

                <h2>
                    ${escapeHTML(challenge.title)}
                </h2>

                <p>
                    ${escapeHTML(challenge.description)}
                </p>

                <strong>
                    +${challenge.xp} XP
                </strong>

                <button
                    type="button"
                    class="primary-button"
                    id="dailyChallengeButton"
                >
                    ابدأ التحدي
                </button>

            </article>

        `;

        $("#dailyChallengeButton")
            ?.addEventListener(
                "click",
                () => {

                    if (!state.user) {

                        notify(
                            t("loginRequired"),
                            "warning"
                        );

                        openLoginModal();

                        return;

                    }

                    navigateTo(
                        "gamesPage"
                    );

                    startMathGame(
                        $("#gameContainer")
                    );

                }
            );

    } catch (error) {

        console.error(
            "Challenges rendering failed:",
            error
        );

    }

}


/* ========================================================
   19. PERSONALITY / WHO AM I
   ======================================================== */

const personalityQuestions = [

    {

        question:
            "عندما تواجه قراراً مهماً، ماذا تعتمد أكثر؟",

        answers: [

            "المنطق",

            "المشاعر",

            "الحدس",

            "آراء الآخرين"

        ]

    },

    {

        question:
            "كيف تتعامل مع المخاطر؟",

        answers: [

            "أتجنبها",

            "أدرسها",

            "أحب المخاطرة",

            "أقرر حسب الموقف"

        ]

    },

    {

        question:
            "في المجموعة أنت غالباً؟",

        answers: [

            "القائد",

            "المحلل",

            "المحفز",

            "المراقب"

        ]

    }

];


function renderPersonality() {

    try {

        const container =
            $("#personalityContainer");

        if (!container) {
            return;
        }

        let current = 0;

        const answers = [];

        function draw() {

            if (
                current >=
                personalityQuestions.length
            ) {

                completePersonality(
                    answers,
                    container
                );

                return;

            }

            const item =
                personalityQuestions[current];

            container.innerHTML = `

                <div style="max-width:750px;margin:auto">

                    <span class="section-kicker">
                        ZIVO PERSONALITY ENGINE
                    </span>

                    <h2>
                        ${escapeHTML(item.question)}
                    </h2>

                    <p style="margin:10px 0 25px;color:#707b91">
                        السؤال ${current + 1}
                        من ${personalityQuestions.length}
                    </p>

                    <div style="display:grid;gap:12px">

                        ${item.answers.map(
                            answer => `

                                <button
                                    type="button"
                                    class="secondary-button"
                                    data-personality-answer
                                >
                                    ${escapeHTML(answer)}
                                </button>

                            `
                        ).join("")}

                    </div>

                </div>

            `;

            $$(
                "[data-personality-answer]",
                container
            ).forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        answers.push(
                            button.textContent.trim()
                        );

                        current++;

                        draw();

                    }
                );

            });

        }

        draw();

    } catch (error) {

        console.error(
            "Personality initialization failed:",
            error
        );

    }

}


function completePersonality(
    answers,
    container
) {

    try {

        const result =
            buildPersonalityResult(
                answers
            );

        state.personalityAnswers =
            answers;

        state.statistics.personalityCompleted =
            true;

        saveState();

        container.innerHTML = `

            <div
                style="
                    max-width:800px;
                    margin:auto;
                    text-align:center;
                "
            >

                <span class="section-kicker">
                    ZIVO ANALYSIS
                </span>

                <h1>
                    ${escapeHTML(result.title)}
                </h1>

                <p style="
                    margin:25px 0;
                    color:#aeb8cc;
                    font-size:1.05rem;
                ">
                    ${escapeHTML(result.description)}
                </p>

                <div
                    style="
                        display:grid;
                        grid-template-columns:repeat(3,1fr);
                        gap:12px;
                        margin:30px 0;
                    "
                >

                    <div class="news-card">

                        <span>
                            التفكير
                        </span>

                        <h3>
                            ${escapeHTML(result.thinking)}
                        </h3>

                    </div>

                    <div class="news-card">

                        <span>
                            القرارات
                        </span>

                        <h3>
                            ${escapeHTML(result.decisions)}
                        </h3>

                    </div>

                    <div class="news-card">

                        <span>
                            التفاعل
                        </span>

                        <h3>
                            ${escapeHTML(result.social)}
                        </h3>

                    </div>

                </div>

                <p style="
                    color:#707b91;
                    font-size:.75rem;
                ">
                    هذا تحليل ترفيهي وليس تشخيصاً نفسياً أو طبياً.
                </p>

            </div>

        `;

        addXP(
            200,
            "تحليل الشخصية"
        );

    } catch (error) {

        console.error(
            "Personality completion failed:",
            error
        );

        notify(
            t("error"),
            "error"
        );

    }

}


function buildPersonalityResult(answers) {

    try {

        const joined =
            answers.join(" ");

        let title =
            "الشخصية المتوازنة";

        let description =
            "تجمع بين أكثر من أسلوب في التفكير واتخاذ القرار.";

        let thinking =
            "متنوع";

        let decisions =
            "متوازن";

        let social =
            "مرن";

        if (
            joined.includes("المنطق")
        ) {

            title =
                "العقل الاستراتيجي";

            description =
                "تميل إلى التحليل والمنطق وترتيب الأفكار قبل اتخاذ القرارات.";

            thinking =
                "تحليلي";

            decisions =
                "منطقي";

        }

        if (
            joined.includes("المشاعر")
        ) {

            title =
                "الشخصية الإنسانية";

            description =
                "تولي أهمية كبيرة للمشاعر والعلاقات وتأثير قراراتك على الآخرين.";

            social =
                "إنساني";

        }

        if (
            joined.includes("الحدس")
        ) {

            title =
                "الشخصية الحدسية";

            description =
                "تميل إلى قراءة المواقف بسرعة والثقة بإحساسك الداخلي.";

            thinking =
                "حدسي";

        }

        if (
            joined.includes("القائد")
        ) {

            social =
                "قيادي";

        }

        if (
            joined.includes("المخاطرة")
        ) {

            decisions =
                "جريء";

        }

        return {

            title,
            description,
            thinking,
            decisions,
            social

        };

    } catch (error) {

        console.error(
            "Personality result failed:",
            error
        );

        return {

            title:
                "شخصية متوازنة",

            description:
                "تحليل أولي لشخصيتك.",

            thinking:
                "متنوع",

            decisions:
                "متوازن",

            social:
                "مرن"

        };

    }

}


/* ========================================================
   20. AI LOCAL ENGINE
   ======================================================== */

function initializeAI() {

    try {

        const form =
            $("#aiForm");

        if (!form) {
            return;
        }

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const input =
                    $("#aiInput");

                if (!input) {
                    return;
                }

                const message =
                    input.value.trim();

                if (!message) {
                    return;
                }

                addAIMessage(
                    "user",
                    message
                );

                input.value = "";

                setTimeout(
                    () => {

                        const response =
                            generateLocalAIResponse(
                                message
                            );

                        addAIMessage(
                            "ai",
                            response
                        );

                    },
                    350
                );

            }
        );

        if (
            state.aiMessages.length === 0
        ) {

            addAIMessage(
                "ai",
                t("aiWelcome")
            );

        } else {

            renderAIMessages();

        }

    } catch (error) {

        console.error(
            "AI initialization failed:",
            error
        );

    }

}


function generateLocalAIResponse(message) {

    try {

        const normalized =
            message
                .toLowerCase()
                .trim();

        if (
            normalized.includes("لعبة") ||
            normalized.includes("game")
        ) {

            return "يمكنك تجربة ألعاب الذاكرة والحساب ورد الفعل والرعب ومختبر النفس داخل ZIVOZONE.";

        }

        if (
            normalized.includes("xp") ||
            normalized.includes("خبرة")
        ) {

            return `لديك حالياً ${state.xp} XP وأنت في المستوى ${state.level}.`;

        }

        if (
            normalized.includes("من أنا") ||
            normalized.includes("personality")
        ) {

            return "اذهب إلى قسم «من أنا؟» وأجب عن الأسئلة لننشئ لك تحليلاً ترفيهياً أولياً.";

        }

        if (
            normalized.includes("zivo")
        ) {

            return "ZIVOZONE منصة ترفيهية رقمية تجمع الألعاب والتحديات والذكاء والتحليل والمحتوى في تجربة واحدة.";

        }

        if (
            normalized.includes("مرحبا") ||
            normalized.includes("hello") ||
            normalized.includes("hi")
        ) {

            return "أهلاً بك! ماذا تريد أن تجرب اليوم؟";

        }

        return "فهمت سؤالك. أنا حالياً في النسخة المحلية التجريبية من ZIVO AI. في المرحلة التالية سنربطني بمحرك ذكاء اصطناعي حقيقي عبر Backend آمن.";

    } catch (error) {

        console.error(
            "AI response generation failed:",
            error
        );

        return t("error");

    }

}


function addAIMessage(
    role,
    message
) {

    try {

        if (
            !["user", "ai"].includes(role)
        ) {

            return;

        }

        state.aiMessages.push({

            role,

            message:
                String(message)
                    .slice(0, 2000),

            timestamp:
                Date.now()

        });

        state.aiMessages =
            state.aiMessages.slice(
                -ZIVO_CONFIG.maxStoredMessages
            );

        saveState();

        renderAIMessages();

    } catch (error) {

        console.error(
            "AI message error:",
            error
        );

    }

}


function renderAIMessages() {

    try {

        const container =
            $("#aiMessages");

        if (!container) {
            return;
        }

        container.innerHTML =
            state.aiMessages
                .map(message => `

                    <div
                        class="ai-message ${message.role === "user" ? "user" : ""}"
                    >
                        ${escapeHTML(
                            message.message
                        )}
                    </div>

                `)
                .join("");

        container.scrollTop =
            container.scrollHeight;

    } catch (error) {

        console.error(
            "AI messages rendering failed:",
            error
        );

    }

}


/* ========================================================
   21. PROFILE
   ======================================================== */

function updateProfile() {

    try {

        const name =
            $("#profileName");

        const email =
            $("#profileEmail");

        const level =
            $("#profileLevel");

        const xp =
            $("#profileXP");

        if (name) {

            name.textContent =
                state.user?.name ||
                t("noUser");

        }

        if (email) {

            email.textContent =
                state.user?.email ||
                "";

        }

        if (level) {

            level.textContent =
                state.level;

        }

        if (xp) {

            xp.textContent =
                state.xp;

        }

        updateXPUI();

    } catch (error) {

        console.error(
            "Profile update failed:",
            error
        );

    }

}


/* ========================================================
   22. NOTIFICATIONS
   ======================================================== */

function notify(
    message,
    type = "info"
) {

    try {

        let wrapper =
            $(".zivo-notifications");

        if (!wrapper) {

            wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "zivo-notifications";

            document.body.appendChild(
                wrapper
            );

        }

        const notification =
            document.createElement(
                "div"
            );

        notification.className =
            "zivo-notification";

        notification.dataset.type =
            type;

        notification.textContent =
            String(message)
                .slice(0, 500);

        wrapper.appendChild(
            notification
        );

        setTimeout(
            () => {

                notification.style.opacity =
                    "0";

                notification.style.transform =
                    "translateY(-8px)";

                setTimeout(
                    () => {

                        notification.remove();

                    },
                    250
                );

            },
            3500
        );

    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

    }

}


/* ========================================================
   23. LANGUAGE SELECTOR
   ======================================================== */

function initializeLanguageSelector() {

    try {

        const selector =
            $("#languageSelector");

        if (!selector) {
            return;
        }

        selector.value =
            state.language;

        selector.addEventListener(
            "change",
            event => {

                const language =
                    event.target.value;

                if (
                    !ZIVO_CONFIG.supportedLanguages
                        .includes(language)
                ) {

                    return;

                }

                state.language =
                    language;

                applyLanguage();

                notify(
                    `Language: ${language.toUpperCase()}`,
                    "success"
                );

            }
        );

    } catch (error) {

        console.error(
            "Language selector error:",
            error
        );

    }

}


/* ========================================================
   24. HERO ACTIONS
   ======================================================== */

function initializeHeroActions() {

    try {

        const startButton =
            $("#startPlayingButton");

        const exploreButton =
            $("#exploreGamesButton");

        startButton?.addEventListener(
            "click",
            () => {

                if (!state.user) {

                    openLoginModal();

                    return;

                }

                navigateTo(
                    "gamesPage"
                );

            }
        );

        exploreButton?.addEventListener(
            "click",
            () => {

                navigateTo(
                    "gamesPage"
                );

            }
        );

    } catch (error) {

        console.error(
            "Hero actions error:",
            error
        );

    }

}


/* ========================================================
   25. GLOBAL EVENTS
   ======================================================== */

function initializeGlobalEvents() {

    try {

        document.addEventListener(
            "click",
            event => {

                const target =
                    event.target.closest(
                        "[data-navigate]"
                    );

                if (!target) {
                    return;
                }

                const page =
                    target.dataset.navigate;

                if (page) {

                    navigateTo(page);

                }

            }
        );

    } catch (error) {

        console.error(
            "Global events initialization failed:",
            error
        );

    }

}


/* ========================================================
   26. INITIALIZATION
   ======================================================== */

function initializeZivoZone() {

    try {

        state.level =
            calculateLevel(state.xp);

        applyLanguage();

        initializeNavigation();

        initializeAuthentication();

        initializeLanguageSelector();

        initializeHeroActions();

        initializeGlobalEvents();

        initializeAI();

        renderGames();

        renderChallenges();

        updateXPUI();

        updateProfile();

        navigateTo(
            "homePage"
        );

        setTimeout(
            () => {

                const loading =
                    $("#loadingScreen");

                if (loading) {

                    loading.classList.add(
                        "hidden"
                    );

                }

            },
            500
        );

    } catch (error) {

        console.error(
            "ZIVOZONE initialization failed:",
            error
        );

        const loading =
            $("#loadingScreen");

        if (loading) {

            loading.classList.add(
                "hidden"
            );

        }

    }

}


/* ========================================================
   27. START
   ======================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeZivoZone,
        {
            once: true
        }
    );

} else {

    initializeZivoZone();

}
