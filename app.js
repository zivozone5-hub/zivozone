"use strict";

/*
 * ============================================================
 * ZIVOZONE - Main Application
 * Version: 1.0.0
 * ============================================================
 *
 * مسؤوليات هذا الملف:
 * 1. إدارة المستخدم.
 * 2. اللغات.
 * 3. XP / Levels.
 * 4. الألعاب والتحديات.
 * 5. اختبار الشخصية.
 * 6. تحليل "من أنا؟".
 * 7. الذكاء الاصطناعي - واجهة جاهزة للربط مع Backend.
 * 8. الإشعارات.
 * 9. التنقل.
 * 10. التخزين المحلي.
 *
 * ملاحظة أمنية:
 * لا يتم وضع أي API Secret أو API Key داخل هذا الملف.
 * ============================================================
 */


/* ============================================================
   1. CONFIGURATION
============================================================ */

const ZIVO_CONFIG = Object.freeze({
    appName: "ZIVOZONE",
    version: "1.0.0",

    storageKeys: Object.freeze({
        user: "zivozone_user",
        settings: "zivozone_settings",
        xp: "zivozone_xp",
        completedGames: "zivozone_completed_games",
        personality: "zivozone_personality",
        history: "zivozone_history"
    }),

    levels: Object.freeze([
        { level: 1, name: "Explorer", xp: 0 },
        { level: 2, name: "Rookie", xp: 100 },
        { level: 3, name: "Thinker", xp: 250 },
        { level: 4, name: "Challenger", xp: 500 },
        { level: 5, name: "Master", xp: 900 },
        { level: 6, name: "Elite", xp: 1500 },
        { level: 7, name: "Legend", xp: 2500 },
        { level: 8, name: "ZIVO Master", xp: 4000 }
    ])
});


/* ============================================================
   2. SUPPORTED LANGUAGES
============================================================ */

const LANGUAGES = Object.freeze({
    ar: {
        name: "العربية",
        direction: "rtl"
    },

    en: {
        name: "English",
        direction: "ltr"
    },

    fr: {
        name: "Français",
        direction: "ltr"
    },

    es: {
        name: "Español",
        direction: "ltr"
    },

    tr: {
        name: "Türkçe",
        direction: "ltr"
    }
});


/* ============================================================
   3. TRANSLATIONS
============================================================ */

const TRANSLATIONS = {

    ar: {
        welcome: "أهلاً بك في ZIVOZONE",
        login: "تسجيل الدخول",
        logout: "تسجيل الخروج",
        games: "الألعاب",
        challenges: "التحديات",
        ai: "الذكاء الاصطناعي",
        personality: "من أنا؟",
        sports: "أخبار الرياضة",
        profile: "ملفي",
        points: "النقاط",
        xp: "XP",
        level: "المستوى",
        play: "العب الآن",
        start: "ابدأ",
        next: "التالي",
        finish: "إنهاء",
        close: "إغلاق",
        email: "البريد الإلكتروني",
        name: "الاسم",
        save: "حفظ",
        result: "النتيجة",
        correct: "إجابة صحيحة!",
        wrong: "إجابة خاطئة!",
        loading: "جاري التحميل...",
        error: "حدث خطأ غير متوقع.",
        loginSuccess: "تم تسجيل الدخول بنجاح.",
        logoutSuccess: "تم تسجيل الخروج.",
        xpEarned: "حصلت على",
        levelUp: "مبروك! ارتقيت إلى مستوى جديد!",
        chooseLanguage: "اختر اللغة",
        aiPlaceholder: "اكتب سؤالك للذكاء الاصطناعي...",
        aiUnavailable: "الذكاء الاصطناعي يحتاج إلى ربط الخادم أولاً.",
        noUser: "يجب تسجيل الدخول أولاً.",
        personalityTitle: "اكتشف شخصيتك",
        personalityIntro: "أجب عن الأسئلة بصراحة لتحصل على تحليل أولي لشخصيتك.",
        submit: "تحليل شخصيتي",
        report: "تقرير شخصيتك",
        danger: "الخطر",
        intelligence: "الذكاء",
        psychology: "علم النفس",
        horror: "الرعب",
        science: "العلوم",
        completed: "مكتمل",
        pointsEarned: "النقاط المكتسبة"
    },

    en: {
        welcome: "Welcome to ZIVOZONE",
        login: "Login",
        logout: "Logout",
        games: "Games",
        challenges: "Challenges",
        ai: "AI",
        personality: "Who Am I?",
        sports: "Sports News",
        profile: "My Profile",
        points: "Points",
        xp: "XP",
        level: "Level",
        play: "Play Now",
        start: "Start",
        next: "Next",
        finish: "Finish",
        close: "Close",
        email: "Email",
        name: "Name",
        save: "Save",
        result: "Result",
        correct: "Correct answer!",
        wrong: "Wrong answer!",
        loading: "Loading...",
        error: "An unexpected error occurred.",
        loginSuccess: "Login successful.",
        logoutSuccess: "Logged out successfully.",
        xpEarned: "You earned",
        levelUp: "Congratulations! You reached a new level!",
        chooseLanguage: "Choose language",
        aiPlaceholder: "Ask AI a question...",
        aiUnavailable: "AI requires a backend connection first.",
        noUser: "Please login first.",
        personalityTitle: "Discover Your Personality",
        personalityIntro: "Answer honestly to receive a personality analysis.",
        submit: "Analyze My Personality",
        report: "Your Personality Report",
        danger: "Danger",
        intelligence: "Intelligence",
        psychology: "Psychology",
        horror: "Horror",
        science: "Science",
        completed: "Completed",
        pointsEarned: "Points earned"
    },

    fr: {
        welcome: "Bienvenue sur ZIVOZONE",
        login: "Connexion",
        logout: "Déconnexion",
        games: "Jeux",
        challenges: "Défis",
        ai: "IA",
        personality: "Qui suis-je ?",
        sports: "Actualités sportives",
        profile: "Mon profil",
        points: "Points",
        xp: "XP",
        level: "Niveau",
        play: "Jouer",
        start: "Commencer",
        next: "Suivant",
        finish: "Terminer",
        close: "Fermer",
        email: "E-mail",
        name: "Nom",
        save: "Enregistrer",
        result: "Résultat",
        correct: "Bonne réponse !",
        wrong: "Mauvaise réponse !",
        loading: "Chargement...",
        error: "Une erreur inattendue est survenue.",
        loginSuccess: "Connexion réussie.",
        logoutSuccess: "Déconnexion réussie.",
        xpEarned: "Vous avez gagné",
        levelUp: "Félicitations ! Nouveau niveau !",
        chooseLanguage: "Choisir la langue",
        aiPlaceholder: "Posez une question à l'IA...",
        aiUnavailable: "L'IA nécessite d'abord une connexion au serveur.",
        noUser: "Veuillez vous connecter.",
        personalityTitle: "Découvrez votre personnalité",
        personalityIntro: "Répondez honnêtement pour obtenir une analyse.",
        submit: "Analyser ma personnalité",
        report: "Votre rapport",
        danger: "Danger",
        intelligence: "Intelligence",
        psychology: "Psychologie",
        horror: "Horreur",
        science: "Sciences",
        completed: "Terminé",
        pointsEarned: "Points gagnés"
    },

    es: {
        welcome: "Bienvenido a ZIVOZONE",
        login: "Iniciar sesión",
        logout: "Cerrar sesión",
        games: "Juegos",
        challenges: "Desafíos",
        ai: "IA",
        personality: "¿Quién soy?",
        sports: "Noticias deportivas",
        profile: "Mi perfil",
        points: "Puntos",
        xp: "XP",
        level: "Nivel",
        play: "Jugar ahora",
        start: "Comenzar",
        next: "Siguiente",
        finish: "Finalizar",
        close: "Cerrar",
        email: "Correo electrónico",
        name: "Nombre",
        save: "Guardar",
        result: "Resultado",
        correct: "¡Respuesta correcta!",
        wrong: "¡Respuesta incorrecta!",
        loading: "Cargando...",
        error: "Ocurrió un error inesperado.",
        loginSuccess: "Inicio de sesión exitoso.",
        logoutSuccess: "Sesión cerrada.",
        chooseLanguage: "Elegir idioma",
        aiPlaceholder: "Escribe una pregunta para la IA...",
        aiUnavailable: "La IA requiere conexión con el servidor.",
        noUser: "Debes iniciar sesión.",
        personalityTitle: "Descubre tu personalidad",
        personalityIntro: "Responde honestamente para obtener un análisis.",
        submit: "Analizar mi personalidad",
        report: "Tu informe",
        danger: "Peligro",
        intelligence: "Inteligencia",
        psychology: "Psicología",
        horror: "Terror",
        science: "Ciencia",
        completed: "Completado",
        pointsEarned: "Puntos ganados"
    },

    tr: {
        welcome: "ZIVOZONE'a Hoş Geldiniz",
        login: "Giriş Yap",
        logout: "Çıkış Yap",
        games: "Oyunlar",
        challenges: "Meydan Okumalar",
        ai: "Yapay Zeka",
        personality: "Ben Kimim?",
        sports: "Spor Haberleri",
        profile: "Profilim",
        points: "Puan",
        xp: "XP",
        level: "Seviye",
        play: "Şimdi Oyna",
        start: "Başla",
        next: "Sonraki",
        finish: "Bitir",
        close: "Kapat",
        email: "E-posta",
        name: "İsim",
        save: "Kaydet",
        result: "Sonuç",
        correct: "Doğru cevap!",
        wrong: "Yanlış cevap!",
        loading: "Yükleniyor...",
        error: "Beklenmeyen bir hata oluştu.",
        loginSuccess: "Giriş başarılı.",
        logoutSuccess: "Çıkış yapıldı.",
        chooseLanguage: "Dil seç",
        aiPlaceholder: "Yapay zekaya soru sor...",
        aiUnavailable: "Yapay zeka için önce sunucu bağlantısı gerekir.",
        noUser: "Lütfen giriş yapın.",
        personalityTitle: "Kişiliğini Keşfet",
        personalityIntro: "Analiz almak için soruları dürüstçe cevapla.",
        submit: "Kişiliğimi Analiz Et",
        report: "Kişilik Raporun",
        danger: "Tehlike",
        intelligence: "Zeka",
        psychology: "Psikoloji",
        horror: "Korku",
        science: "Bilim",
        completed: "Tamamlandı",
        pointsEarned: "Kazanılan puan"
    }
};


/* ============================================================
   4. APPLICATION STATE
============================================================ */

const state = {
    language: "ar",
    user: null,
    xp: 0,
    completedGames: [],
    personalityAnswers: [],
    history: [],
    currentGame: null,
    currentQuestion: 0,
    gameScore: 0,
    gameTimer: null,
    aiMessages: []
};


/* ============================================================
   5. SAFE STORAGE
============================================================ */

const Storage = {

    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);
        } catch (error) {
            console.error("ZIVOZONE Storage GET Error:", error);
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("ZIVOZONE Storage SET Error:", error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error("ZIVOZONE Storage REMOVE Error:", error);
            return false;
        }
    }
};


/* ============================================================
   6. SECURITY HELPERS
============================================================ */

/*
 * يمنع إدخال HTML أو JavaScript عند عرض بيانات المستخدم.
 */
function escapeHTML(value) {

    try {

        const div = document.createElement("div");
        div.textContent = String(value ?? "");

        return div.innerHTML;

    } catch (error) {

        console.error("escapeHTML Error:", error);

        return "";
    }
}


/*
 * تنظيف البريد الإلكتروني قبل استخدامه في الواجهة.
 */
function sanitizeEmail(email) {

    try {

        const cleaned = String(email || "")
            .trim()
            .toLowerCase();

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailRegex.test(cleaned)) {
            return null;
        }

        return cleaned;

    } catch (error) {

        console.error("sanitizeEmail Error:", error);

        return null;
    }
}


/* ============================================================
   7. INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    try {

        loadApplication();

        initializeNavigation();

        initializeLanguage();

        initializeUserInterface();

        initializeGames();

        initializePersonality();

        initializeAI();

        initializeSports();

        updateUI();

        console.log(
            `ZIVOZONE ${ZIVO_CONFIG.version} initialized successfully.`
        );

    } catch (error) {

        console.error("ZIVOZONE initialization error:", error);

        showNotification(
            getTranslation("error"),
            "error"
        );
    }
});


/* ============================================================
   8. LOAD APPLICATION
============================================================ */

function loadApplication() {

    try {

        const settings =
            Storage.get(
                ZIVO_CONFIG.storageKeys.settings,
                {}
            );

        state.language =
            LANGUAGES[settings.language]
                ? settings.language
                : "ar";

        state.user =
            Storage.get(
                ZIVO_CONFIG.storageKeys.user,
                null
            );

        state.xp =
            Number(
                Storage.get(
                    ZIVO_CONFIG.storageKeys.xp,
                    0
                )
            ) || 0;

        state.completedGames =
            Storage.get(
                ZIVO_CONFIG.storageKeys.completedGames,
                []
            );

        state.personalityAnswers =
            Storage.get(
                ZIVO_CONFIG.storageKeys.personality,
                []
            );

        state.history =
            Storage.get(
                ZIVO_CONFIG.storageKeys.history,
                []
            );

    } catch (error) {

        console.error("loadApplication Error:", error);

        state.language = "ar";
        state.user = null;
        state.xp = 0;
        state.completedGames = [];
        state.personalityAnswers = [];
        state.history = [];
    }
}


/* ============================================================
   9. TRANSLATION FUNCTIONS
============================================================ */

function getTranslation(key) {

    try {

        const language =
            TRANSLATIONS[state.language] ||
            TRANSLATIONS.ar;

        return language[key] || TRANSLATIONS.ar[key] || key;

    } catch (error) {

        console.error("Translation Error:", error);

        return key;
    }
}


function translatePage() {

    try {

        const elements =
            document.querySelectorAll("[data-i18n]");

        elements.forEach(element => {

            const key =
                element.getAttribute("data-i18n");

            if (key) {
                element.textContent =
                    getTranslation(key);
            }
        });


        const placeholders =
            document.querySelectorAll("[data-i18n-placeholder]");

        placeholders.forEach(element => {

            const key =
                element.getAttribute(
                    "data-i18n-placeholder"
                );

            if (key) {
                element.setAttribute(
                    "placeholder",
                    getTranslation(key)
                );
            }
        });

    } catch (error) {

        console.error("translatePage Error:", error);
    }
}


/* ============================================================
   10. LANGUAGE SYSTEM
============================================================ */

function initializeLanguage() {

    try {

        const languageSelectors =
            document.querySelectorAll(
                "[data-language]"
            );

        languageSelectors.forEach(button => {

            button.addEventListener("click", () => {

                const language =
                    button.getAttribute("data-language");

                changeLanguage(language);
            });
        });

        applyLanguage();

    } catch (error) {

        console.error("initializeLanguage Error:", error);
    }
}


function changeLanguage(language) {

    try {

        if (!LANGUAGES[language]) {
            return;
        }

        state.language = language;

        Storage.set(
            ZIVO_CONFIG.storageKeys.settings,
            {
                language
            }
        );

        applyLanguage();

        updateUI();

    } catch (error) {

        console.error("changeLanguage Error:", error);

        showNotification(
            getTranslation("error"),
            "error"
        );
    }
}


function applyLanguage() {

    try {

        const language =
            LANGUAGES[state.language];

        document.documentElement.lang =
            state.language;

        document.documentElement.dir =
            language.direction;

        translatePage();

        const selector =
            document.querySelector(
                "#languageSelector"
            );

        if (selector) {
            selector.value =
                state.language;
        }

    } catch (error) {

        console.error("applyLanguage Error:", error);
    }
}


/* ============================================================
   11. NAVIGATION
============================================================ */

function initializeNavigation() {

    try {

        const links =
            document.querySelectorAll(
                "[data-section]"
            );

        links.forEach(link => {

            link.addEventListener("click", event => {

                event.preventDefault();

                const section =
                    link.getAttribute("data-section");

                navigateTo(section);
            });
        });

    } catch (error) {

        console.error("initializeNavigation Error:", error);
    }
}


function navigateTo(sectionId) {

    try {

        if (!sectionId) {
            return;
        }

        const sections =
            document.querySelectorAll(
                "[data-page-section]"
            );

        sections.forEach(section => {
            section.classList.remove("active");
        });

        const target =
            document.querySelector(
                `[data-page-section="${CSS.escape(sectionId)}"]`
            );

        if (target) {

            target.classList.add("active");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } else {

            const fallback =
                document.getElementById(sectionId);

            if (fallback) {

                fallback.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }

    } catch (error) {

        console.error("navigateTo Error:", error);
    }
}


/* ============================================================
   12. USER ACCOUNT
============================================================ */

function initializeUserInterface() {

    try {

        const loginButtons =
            document.querySelectorAll(
                "[data-action='login']"
            );

        loginButtons.forEach(button => {

            button.addEventListener(
                "click",
                openLoginModal
            );
        });


        const logoutButtons =
            document.querySelectorAll(
                "[data-action='logout']"
            );

        logoutButtons.forEach(button => {

            button.addEventListener(
                "click",
                logoutUser
            );
        });


        const loginForm =
            document.querySelector(
                "#loginForm"
            );

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                handleLogin
            );
        }

    } catch (error) {

        console.error(
            "initializeUserInterface Error:",
            error
        );
    }
}


function openLoginModal() {

    try {

        const modal =
            document.querySelector(
                "#loginModal"
            );

        if (modal) {
            modal.classList.add("active");
        }

    } catch (error) {

        console.error(
            "openLoginModal Error:",
            error
        );
    }
}


function closeModal(modalId) {

    try {

        const modal =
            document.getElementById(modalId);

        if (modal) {
            modal.classList.remove("active");
        }

    } catch (error) {

        console.error(
            "closeModal Error:",
            error
        );
    }
}


function handleLogin(event) {

    event.preventDefault();

    try {

        const form =
            event.currentTarget;

        const emailInput =
            form.querySelector(
                "input[name='email']"
            );

        const nameInput =
            form.querySelector(
                "input[name='name']"
            );

        const email =
            sanitizeEmail(
                emailInput?.value
            );

        const name =
            String(
                nameInput?.value || "ZIVO Player"
            )
            .trim()
            .slice(0, 50);


        if (!email) {

            showNotification(
                "البريد الإلكتروني غير صالح.",
                "error"
            );

            return;
        }


        state.user = {
            id: generateUserId(),
            name: name || "ZIVO Player",
            email,
            joinedAt:
                new Date().toISOString()
        };


        Storage.set(
            ZIVO_CONFIG.storageKeys.user,
            state.user
        );


        closeModal("loginModal");

        updateUI();

        showNotification(
            getTranslation("loginSuccess"),
            "success"
        );

    } catch (error) {

        console.error(
            "handleLogin Error:",
            error
        );

        showNotification(
            getTranslation("error"),
            "error"
        );
    }
}


function logoutUser() {

    try {

        state.user = null;

        Storage.remove(
            ZIVO_CONFIG.storageKeys.user
        );

        updateUI();

        showNotification(
            getTranslation("logoutSuccess"),
            "success"
        );

    } catch (error) {

        console.error(
            "logoutUser Error:",
            error
        );
    }
}


function generateUserId() {

    try {

        if (
            typeof crypto !== "undefined" &&
            crypto.randomUUID
        ) {
            return crypto.randomUUID();
        }

        return (
            "zivo-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10)
        );

    } catch (error) {

        console.error(
            "generateUserId Error:",
            error
        );

        return `zivo-${Date.now()}`;
    }
}


/* ============================================================
   13. XP SYSTEM
============================================================ */

function addXP(amount, reason = "activity") {

    try {

        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const previousLevel =
            calculateLevel(state.xp);

        state.xp += Math.floor(amount);

        Storage.set(
            ZIVO_CONFIG.storageKeys.xp,
            state.xp
        );


        const newLevel =
            calculateLevel(state.xp);


        state.history.push({
            type: "xp",
            amount,
            reason,
            date:
                new Date().toISOString()
        });


        Storage.set(
            ZIVO_CONFIG.storageKeys.history,
            state.history.slice(-100)
        );


        updateUI();


        showNotification(
            `${getTranslation("xpEarned")} ${amount} XP`,
            "success"
        );


        if (
            newLevel.level >
            previousLevel.level
        ) {

            setTimeout(() => {

                showNotification(
                    getTranslation("levelUp"),
                    "success"
                );

            }, 700);
        }

    } catch (error) {

        console.error(
            "addXP Error:",
            error
        );
    }
}


function calculateLevel(xp) {

    try {

        let currentLevel =
            ZIVO_CONFIG.levels[0];

        for (
            const level
            of ZIVO_CONFIG.levels
        ) {

            if (xp >= level.xp) {
                currentLevel = level;
            }
        }

        return currentLevel;

    } catch (error) {

        console.error(
            "calculateLevel Error:",
            error
        );

        return ZIVO_CONFIG.levels[0];
    }
}


function getNextLevel() {

    try {

        const current =
            calculateLevel(state.xp);

        const index =
            ZIVO_CONFIG.levels.findIndex(
                item =>
                    item.level === current.level
            );

        if (
            index === -1 ||
            index >=
                ZIVO_CONFIG.levels.length - 1
        ) {
            return null;
        }

        return ZIVO_CONFIG.levels[index + 1];

    } catch (error) {

        console.error(
            "getNextLevel Error:",
            error
        );

        return null;
    }
}


function getLevelProgress() {

    try {

        const current =
            calculateLevel(state.xp);

        const next =
            getNextLevel();

        if (!next) {
            return 100;
        }

        const currentXP =
            state.xp - current.xp;

        const requiredXP =
            next.xp - current.xp;

        return Math.min(
            100,
            Math.max(
                0,
                Math.round(
                    (currentXP / requiredXP) * 100
                )
            )
        );

    } catch (error) {

        console.error(
            "getLevelProgress Error:",
            error
        );

        return 0;
    }
}


/* ============================================================
   14. UPDATE USER INTERFACE
============================================================ */

function updateUI() {

    try {

        const level =
            calculateLevel(state.xp);

        const nextLevel =
            getNextLevel();

        const elements =
            document.querySelectorAll(
                "[data-user-name]"
            );

        elements.forEach(element => {

            element.textContent =
                state.user
                    ? escapeHTML(state.user.name)
                    : "ZIVO Player";
        });


        document
            .querySelectorAll("[data-user-email]")
            .forEach(element => {

                element.textContent =
                    state.user
                        ? escapeHTML(state.user.email)
                        : "";
            });


        document
            .querySelectorAll("[data-xp]")
            .forEach(element => {

                element.textContent =
                    String(state.xp);
            });


        document
            .querySelectorAll("[data-level]")
            .forEach(element => {

                element.textContent =
                    String(level.level);
            });


        document
            .querySelectorAll("[data-level-name]")
            .forEach(element => {

                element.textContent =
                    level.name;
            });


        document
            .querySelectorAll("[data-xp-progress]")
            .forEach(element => {

                element.style.width =
                    `${getLevelProgress()}%`;
            });


        document
            .querySelectorAll("[data-next-level]")
            .forEach(element => {

                element.textContent =
                    nextLevel
                        ? String(nextLevel.xp)
                        : "MAX";
            });


        updateAuthenticationButtons();

    } catch (error) {

        console.error(
            "updateUI Error:",
            error
        );
    }
}


function updateAuthenticationButtons() {

    try {

        const loginButtons =
            document.querySelectorAll(
                "[data-action='login']"
            );

        const logoutButtons =
            document.querySelectorAll(
                "[data-action='logout']"
            );


        loginButtons.forEach(button => {

            button.style.display =
                state.user
                    ? "none"
                    : "";
        });


        logoutButtons.forEach(button => {

            button.style.display =
                state.user
                    ? ""
                    : "none";
        });

    } catch (error) {

        console.error(
            "updateAuthenticationButtons Error:",
            error
        );
    }
}


/* ============================================================
   15. GAMES DATABASE
============================================================ */

const GAMES = Object.freeze({

    brain: {
        id: "brain",
        category: "intelligence",
        title: "اختبار سرعة الذكاء",
        xp: 50,

        questions: [

            {
                question:
                    "ما الرقم التالي؟ 2 - 4 - 8 - 16 - ؟",

                answers: [
                    "24",
                    "30",
                    "32",
                    "36"
                ],

                correct: 2
            },

            {
                question:
                    "إذا كان لديك 3 تفاحات وأخذت تفاحتين، كم تفاحة أصبحت تملك؟",

                answers: [
                    "1",
                    "2",
                    "3",
                    "5"
                ],

                correct: 1
            },

            {
                question:
                    "أي كلمة مختلفة عن البقية؟",

                answers: [
                    "أسد",
                    "نمر",
                    "حصان",
                    "قلم"
                ],

                correct: 3
            }
        ]
    },


    science: {
        id: "science",
        category: "science",
        title: "تحدي العلوم",
        xp: 60,

        questions: [

            {
                question:
                    "ما الكوكب الأقرب إلى الشمس؟",

                answers: [
                    "الأرض",
                    "المريخ",
                    "عطارد",
                    "المشتري"
                ],

                correct: 2
            },

            {
                question:
                    "ما الغاز الذي يحتاجه الإنسان للتنفس؟",

                answers: [
                    "الأكسجين",
                    "الهيدروجين",
                    "الهيليوم",
                    "النيتروجين"
                ],

                correct: 0
            }
        ]
    },


    horror: {
        id: "horror",
        category: "horror",
        title: "الغرفة المظلمة",
        xp: 75,

        questions: [

            {
                question:
                    "أنت داخل غرفة مظلمة. أمامك ثلاثة أبواب. أي باب تختار؟",

                answers: [
                    "الباب الذي تسمع خلفه أصواتاً",
                    "الباب الصامت",
                    "الباب المفتوح",
                    "العودة للخلف"
                ],

                correct: null
            },

            {
                question:
                    "تسمع طرقاً خلفك. ماذا تفعل؟",

                answers: [
                    "ألتفت فوراً",
                    "أهرب",
                    "أبحث عن مصدر الصوت",
                    "أتجاهل الصوت"
                ],

                correct: null
            }
        ]
    }

});


/* ============================================================
   16. GAME ENGINE
============================================================ */

function initializeGames() {

    try {

        const playButtons =
            document.querySelectorAll(
                "[data-game]"
            );

        playButtons.forEach(button => {

            button.addEventListener("click", () => {

                const gameId =
                    button.getAttribute(
                        "data-game"
                    );

                startGame(gameId);
            });
        });

    } catch (error) {

        console.error(
            "initializeGames Error:",
            error
        );
    }
}


function startGame(gameId) {

    try {

        const game =
            GAMES[gameId];

        if (!game) {

            showNotification(
                "اللعبة غير موجودة.",
                "error"
            );

            return;
        }

        state.currentGame = game;
        state.currentQuestion = 0;
        state.gameScore = 0;

        renderGameQuestion();

        navigateTo("game");

    } catch (error) {

        console.error(
            "startGame Error:",
            error
        );

        showNotification(
            getTranslation("error"),
            "error"
        );
    }
}


function renderGameQuestion() {

    try {

        if (!state.currentGame) {
            return;
        }

        const container =
            document.querySelector(
                "#gameContainer"
            );

        if (!container) {
            console.warn(
                "#gameContainer was not found."
            );
            return;
        }

        const question =
            state.currentGame.questions[
                state.currentQuestion
            ];


        if (!question) {

            finishGame();

            return;
        }


        const answersHTML =
            question.answers
                .map(
                    (answer, index) => `
                        <button
                            type="button"
                            class="game-answer"
                            data-answer-index="${index}"
                        >
                            ${escapeHTML(answer)}
                        </button>
                    `
                )
                .join("");


        container.innerHTML = `
            <div class="game-card">

                <div class="game-header">

                    <span>
                        ${escapeHTML(
                            state.currentGame.title
                        )}
                    </span>

                    <span>
                        ${state.currentQuestion + 1}
                        /
                        ${state.currentGame.questions.length}
                    </span>

                </div>

                <div class="game-question">
                    ${escapeHTML(
                        question.question
                    )}
                </div>

                <div class="game-answers">
                    ${answersHTML}
                </div>

            </div>
        `;


        container
            .querySelectorAll(
                "[data-answer-index]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    handleGameAnswer
                );
            });

    } catch (error) {

        console.error(
            "renderGameQuestion Error:",
            error
        );
    }
}


function handleGameAnswer(event) {

    try {

        if (!state.currentGame) {
            return;
        }

        const selectedIndex =
            Number(
                event.currentTarget
                    .getAttribute(
                        "data-answer-index"
                    )
            );


        const question =
            state.currentGame.questions[
                state.currentQuestion
            ];


        /*
         * ألعاب الرعب والاختيارات لا تحتوي على
         * إجابة صحيحة واحدة، بل تعتمد على التحليل.
         */
        if (question.correct === null) {

            state.gameScore += 10;

        } else if (
            selectedIndex ===
            question.correct
        ) {

            state.gameScore += 25;

            event.currentTarget.classList.add(
                "correct"
            );

            showNotification(
                getTranslation("correct"),
                "success"
            );

        } else {

            event.currentTarget.classList.add(
                "wrong"
            );

            showNotification(
                getTranslation("wrong"),
                "error"
            );
        }


        state.currentQuestion++;

        setTimeout(
            renderGameQuestion,
            500
        );

    } catch (error) {

        console.error(
            "handleGameAnswer Error:",
            error
        );
    }
}


function finishGame() {

    try {

        const earnedXP =
            Math.max(
                10,
                Math.floor(
                    state.gameScore +
                    state.currentGame.xp / 2
                )
            );


        addXP(
            earnedXP,
            state.currentGame.id
        );


        if (
            !state.completedGames.includes(
                state.currentGame.id
            )
        ) {

            state.completedGames.push(
                state.currentGame.id
            );

            Storage.set(
                ZIVO_CONFIG.storageKeys.completedGames,
                state.completedGames
            );
        }


        const container =
            document.querySelector(
                "#gameContainer"
            );


        if (container) {

            container.innerHTML = `
                <div class="game-result">

                    <h2>
                        ${escapeHTML(
                            getTranslation("result")
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            getTranslation("pointsEarned")
                        )}:
                        ${state.gameScore}
                    </p>

                    <p>
                        XP:
                        ${earnedXP}
                    </p>

                    <button
                        type="button"
                        data-section="games"
                    >
                        ${escapeHTML(
                            getTranslation("games")
                        )}
                    </button>

                </div>
            `;


            const backButton =
                container.querySelector(
                    "[data-section='games']"
                );

            if (backButton) {

                backButton.addEventListener(
                    "click",
                    () => navigateTo("games")
                );
            }
        }

    } catch (error) {

        console.error(
            "finishGame Error:",
            error
        );
    }
}


/* ============================================================
   17. PERSONALITY SYSTEM
============================================================ */

const PERSONALITY_QUESTIONS = [

    {
        id: "risk",
        question:
            "عندما تواجه موقفاً خطيراً، ماذا تفعل؟",

        options: [
            {
                text: "أدخل مباشرة",
                traits: {
                    courage: 3,
                    risk: 3
                }
            },

            {
                text: "أفكر أولاً",
                traits: {
                    logic: 3,
                    caution: 2
                }
            },

            {
                text: "أبتعد",
                traits: {
                    caution: 3
                }
            }
        ]
    },


    {
        id: "social",
        question:
            "عندما تكون بين أشخاص لا تعرفهم، ماذا تفعل؟",

        options: [
            {
                text: "أبدأ الحديث",
                traits: {
                    social: 3,
                    leadership: 2
                }
            },

            {
                text: "أراقب أولاً",
                traits: {
                    observation: 3,
                    logic: 1
                }
            },

            {
                text: "أفضل البقاء هادئاً",
                traits: {
                    introversion: 3
                }
            }
        ]
    },


    {
        id: "decision",
        question:
            "كيف تتخذ قراراتك؟",

        options: [
            {
                text: "بسرعة",
                traits: {
                    confidence: 3,
                    risk: 2
                }
            },

            {
                text: "بعد تحليل التفاصيل",
                traits: {
                    logic: 3,
                    observation: 2
                }
            },

            {
                text: "أسأل الآخرين",
                traits: {
                    social: 2
                }
            ]
        ]
    },


    {
        id: "failure",
        question:
            "عندما تفشل في شيء، ماذا تفعل؟",

        options: [
            {
                text: "أعيد المحاولة",
                traits: {
                    persistence: 3,
                    courage: 2
                }
            },

            {
                text: "أحلل سبب الفشل",
                traits: {
                    logic: 3,
                    observation: 2
                }
            },

            {
                text: "أترك الأمر",
                traits: {
                    caution: 2
                }
            ]
        ]
    },


    {
        id: "competition",
        question:
            "أثناء المنافسة، ما الذي يهمك أكثر؟",

        options: [
            {
                text: "الفوز",
                traits: {
                    competitiveness: 3,
                    leadership: 2
                }
            },

            {
                text: "التعلم",
                traits: {
                    logic: 2,
                    persistence: 2
                }
            },

            {
                text: "الاستمتاع",
                traits: {
                    social: 2
                }
            }
        ]
    }
];


function initializePersonality() {

    try {

        const container =
            document.querySelector(
                "#personalityContainer"
            );

        if (!container) {
            return;
        }

        renderPersonalityQuestion();

    } catch (error) {

        console.error(
            "initializePersonality Error:",
            error
        );
    }
}


function renderPersonalityQuestion() {

    try {

        const container =
            document.querySelector(
                "#personalityContainer"
            );

        if (!container) {
            return;
        }


        if (
            state.personalityAnswers.length >=
            PERSONALITY_QUESTIONS.length
        ) {

            renderPersonalityResult();

            return;
        }


        const index =
            state.personalityAnswers.length;

        const question =
            PERSONALITY_QUESTIONS[index];


        container.innerHTML = `

            <div class="personality-card">

                <div class="personality-progress">

                    ${index + 1}
                    /
                    ${PERSONALITY_QUESTIONS.length}

                </div>

                <h3>
                    ${escapeHTML(
                        question.question
                    )}
                </h3>

                <div class="personality-options">

                    ${question.options
                        .map(
                            (option, optionIndex) => `
                                <button
                                    type="button"
                                    data-personality-answer="${optionIndex}"
                                >
                                    ${escapeHTML(
                                        option.text
                                    )}
                                </button>
                            `
                        )
                        .join("")}

                </div>

            </div>
        `;


        container
            .querySelectorAll(
                "[data-personality-answer]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    handlePersonalityAnswer
                );
            });

    } catch (error) {

        console.error(
            "renderPersonalityQuestion Error:",
            error
        );
    }
}


function handlePersonalityAnswer(event) {

    try {

        const questionIndex =
            state.personalityAnswers.length;

        const question =
            PERSONALITY_QUESTIONS[
                questionIndex
            ];


        const selectedIndex =
            Number(
                event.currentTarget.getAttribute(
                    "data-personality-answer"
                )
            );


        if (
            !question ||
            !question.options[selectedIndex]
        ) {
            return;
        }


        state.personalityAnswers.push({
            questionId: question.id,
            selectedIndex,
            traits:
                question
                    .options[selectedIndex]
                    .traits
        });


        Storage.set(
            ZIVO_CONFIG.storageKeys.personality,
            state.personalityAnswers
        );


        addXP(
            15,
            "personality"
        );


        renderPersonalityQuestion();

    } catch (error) {

        console.error(
            "handlePersonalityAnswer Error:",
            error
        );
    }
}


/* ============================================================
   18. PERSONALITY ANALYSIS
============================================================ */

function calculatePersonalityProfile() {

    try {

        const scores = {};

        state.personalityAnswers.forEach(answer => {

            Object.entries(
                answer.traits || {}
            ).forEach(
                ([trait, value]) => {

                    scores[trait] =
                        (scores[trait] || 0) +
                        Number(value);

                }
            );
        });


        const sortedTraits =
            Object.entries(scores)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );


        const primaryTrait =
            sortedTraits[0]?.[0] ||
            "balanced";


        return {
            scores,
            primaryTrait
        };

    } catch (error) {

        console.error(
            "calculatePersonalityProfile Error:",
            error
        );

        return {
            scores: {},
            primaryTrait: "balanced"
        };
    }
}


function getPersonalityTitle(trait) {

    const titles = {

        courage:
            "الشخصية الجريئة",

        risk:
            "المغامر",

        logic:
            "المحلل",

        caution:
            "الحذر الذكي",

        social:
            "الشخصية الاجتماعية",

        leadership:
            "القائد",

        observation:
            "المراقب",

        introversion:
            "المفكر الهادئ",

        confidence:
            "الواثق",

        persistence:
            "المثابر",

        competitiveness:
            "المنافس",

        balanced:
            "الشخصية المتوازنة"
    };

    return titles[trait] ||
        titles.balanced;
}


function getPersonalityDescription(trait) {

    const descriptions = {

        courage:
            "تميل إلى مواجهة المواقف وعدم الهروب من التحديات.",

        risk:
            "تحب التجربة والمغامرة واتخاذ القرارات الجريئة.",

        logic:
            "تميل إلى تحليل التفاصيل قبل الوصول إلى القرار.",

        caution:
            "تحب دراسة المخاطر قبل اتخاذ خطوات كبيرة.",

        social:
            "تتفاعل بسهولة مع الآخرين وتستمتع بالتواصل.",

        leadership:
            "تميل إلى تحمل المسؤولية وقيادة الآخرين.",

        observation:
            "تلاحظ التفاصيل قبل أن تتصرف.",

        introversion:
            "تميل إلى التفكير الداخلي والهدوء قبل التفاعل.",

        confidence:
            "لديك قدرة جيدة على اتخاذ القرار والثقة بنفسك.",

        persistence:
            "لا تستسلم بسهولة عندما تواجه العقبات.",

        competitiveness:
            "تحب التحدي وتحفيز نفسك للوصول إلى نتائج أفضل.",

        balanced:
            "تظهر إجاباتك مزيجاً متوازناً من عدة صفات."
    };

    return descriptions[trait] ||
        descriptions.balanced;
}


function renderPersonalityResult() {

    try {

        const container =
            document.querySelector(
                "#personalityContainer"
            );

        if (!container) {
            return;
        }


        const profile =
            calculatePersonalityProfile();


        const title =
            getPersonalityTitle(
                profile.primaryTrait
            );


        const description =
            getPersonalityDescription(
                profile.primaryTrait
            );


        const scoresHTML =
            Object.entries(
                profile.scores
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 6)
            .map(
                ([trait, score]) => `

                    <div class="trait-row">

                        <span>
                            ${escapeHTML(trait)}
                        </span>

                        <div class="trait-bar">

                            <span
                                style="width:${Math.min(
                                    100,
                                    score * 10
                                )}%"
                            ></span>

                        </div>

                        <strong>
                            ${score}
                        </strong>

                    </div>
                `
            )
            .join("");


        container.innerHTML = `

            <div class="personality-result">

                <div class="result-icon">
                    🧠
                </div>

                <h2>
                    ${escapeHTML(title)}
                </h2>

                <p>
                    ${escapeHTML(description)}
                </p>

                <div class="personality-scores">
                    ${scoresHTML}
                </div>

                <button
                    type="button"
                    id="resetPersonality"
                >
                    إعادة الاختبار
                </button>

            </div>
        `;


        const resetButton =
            document.querySelector(
                "#resetPersonality"
            );

        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetPersonality
            );
        }

    } catch (error) {

        console.error(
            "renderPersonalityResult Error:",
            error
        );
    }
}


function resetPersonality() {

    try {

        state.personalityAnswers = [];

        Storage.remove(
            ZIVO_CONFIG.storageKeys.personality
        );

        renderPersonalityQuestion();

    } catch (error) {

        console.error(
            "resetPersonality Error:",
            error
        );
    }
}


/* ============================================================
   19. AI SYSTEM
============================================================ */

/*
 * هذا الجزء هو نقطة الربط مع الذكاء الاصطناعي الحقيقي.
 *
 * لا تضع مفتاح OpenAI أو أي مزود AI هنا.
 *
 * لاحقاً سنبني:
 *
 * Browser
 *    ↓
 * Secure Backend
 *    ↓
 * AI API
 *    ↓
 * Browser
 */


function initializeAI() {

    try {

        const form =
            document.querySelector(
                "#aiForm"
            );

        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            handleAIQuestion
        );

    } catch (error) {

        console.error(
            "initializeAI Error:",
            error
        );
    }
}


async function handleAIQuestion(event) {

    event.preventDefault();

    try {

        const input =
            document.querySelector(
                "#aiInput"
            );

        const message =
            String(
                input?.value || ""
            )
            .trim()
            .slice(0, 1000);


        if (!message) {
            return;
        }


        addAIMessage(
            "user",
            message
        );


        input.value = "";


        addAIMessage(
            "assistant",
            getTranslation("loading")
        );


        /*
         * في المرحلة الأولى:
         * نستخدم رد تجريبي حتى يتم بناء Backend.
         */
        const response =
            await requestAI(message);


        removeLastAIMessage();


        addAIMessage(
            "assistant",
            response
        );


        addXP(
            10,
            "ai"
        );

    } catch (error) {

        console.error(
            "handleAIQuestion Error:",
            error
        );

        removeLastAIMessage();

        addAIMessage(
            "assistant",
            getTranslation("error")
        );
    }
}


async function requestAI(message) {

    try {

        /*
         * لا يوجد API حقيقي هنا حتى لا نكشف أي Secret.
         *
         * عند إنشاء Backend سيتم استبدال هذا الجزء بطلب:
         *
         * fetch("/api/ai", {...})
         */


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    700
                )
        );


        return `
            أنا مساعد ZIVOZONE الذكي 🤖

            وصلتني رسالتك:
            "${escapeHTML(message)}"

            نظام الذكاء الاصطناعي الحقيقي سيتم ربطه
            في المرحلة التالية بخادم آمن.
        `;

    } catch (error) {

        console.error(
            "requestAI Error:",
            error
        );

        throw new Error(
            "AI request failed."
        );
    }
}


function addAIMessage(role, message) {

    try {

        const container =
            document.querySelector(
                "#aiMessages"
            );

        if (!container) {
            return;
        }


        const messageElement =
            document.createElement("div");

        messageElement.className =
            `ai-message ${role}`;


        /*
         * textContent يمنع XSS.
         */
        messageElement.textContent =
            message;


        container.appendChild(
            messageElement
        );


        container.scrollTop =
            container.scrollHeight;


        state.aiMessages.push({
            role,
            message,
            timestamp:
                new Date().toISOString()
        });

    } catch (error) {

        console.error(
            "addAIMessage Error:",
            error
        );
    }
}


function removeLastAIMessage() {

    try {

        const container =
            document.querySelector(
                "#aiMessages"
            );

        if (!container) {
            return;
        }


        const messages =
            container.querySelectorAll(
                ".ai-message"
            );


        const last =
            messages[messages.length - 1];


        if (
            last &&
            last.classList.contains(
                "assistant"
            )
        ) {

            last.remove();
        }

    } catch (error) {

        console.error(
            "removeLastAIMessage Error:",
            error
        );
    }
}


/* ============================================================
   20. SPORTS NEWS
============================================================ */

/*
 * في النسخة المجانية الأولى:
 * نترك مكان الأخبار جاهزاً.
 *
 * لاحقاً سنربطه بـ API آمن.
 */

function initializeSports() {

    try {

        const refreshButton =
            document.querySelector(
                "[data-action='refresh-sports']"
            );

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadSportsNews
            );
        }


        loadSportsNews();

    } catch (error) {

        console.error(
            "initializeSports Error:",
            error
        );
    }
}


async function loadSportsNews() {

    try {

        const container =
            document.querySelector(
                "#sportsNews"
            );

        if (!container) {
            return;
        }


        container.innerHTML = `
            <div class="loading">
                ${escapeHTML(
                    getTranslation("loading")
                )}
            </div>
        `;


        /*
         * سنربط API الأخبار لاحقاً.
         * لا نعتمد حالياً على API خارجي داخل المتصفح.
         */


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );


        const news = [

            {
                title:
                    "أحدث أخبار كرة القدم العالمية",

                category:
                    "Football"
            },

            {
                title:
                    "أبرز نتائج المباريات",

                category:
                    "Results"
            },

            {
                title:
                    "آخر أخبار النجوم والأندية",

                category:
                    "Stars"
            }
        ];


        container.innerHTML =
            news.map(
                item => `

                    <article class="news-card">

                        <span>
                            ${escapeHTML(
                                item.category
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                item.title
                            )}
                        </h3>

                    </article>
                `
            ).join("");


    } catch (error) {

        console.error(
            "loadSportsNews Error:",
            error
        );

        const container =
            document.querySelector(
                "#sportsNews"
            );

        if (container) {

            container.innerHTML = `
                <p>
                    ${escapeHTML(
                        getTranslation("error")
                    )}
                </p>
            `;
        }
    }
}


/* ============================================================
   21. NOTIFICATION SYSTEM
============================================================ */

function showNotification(
    message,
    type = "info"
) {

    try {

        let container =
            document.querySelector(
                "#zivoNotifications"
            );


        if (!container) {

            container =
                document.createElement(
                    "div"
                );

            container.id =
                "zivoNotifications";

            container.className =
                "zivo-notifications";

            document.body.appendChild(
                container
            );
        }


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            `zivo-notification ${type}`;


        notification.textContent =
            String(message);


        container.appendChild(
            notification
        );


        setTimeout(() => {

            notification.classList.add(
                "hide"
            );

            setTimeout(() => {

                notification.remove();

            }, 300);

        }, 3000);

    } catch (error) {

        console.error(
            "showNotification Error:",
            error
        );
    }
}


/* ============================================================
   22. DAILY CHALLENGE
============================================================ */

function getDailyChallenge() {

    try {

        const challenges = [

            {
                id: "daily-brain",
                title:
                    "تحدي العقل اليومي",
                xp: 30
            },

            {
                id: "daily-science",
                title:
                    "سؤال العلوم اليومي",
                xp: 35
            },

            {
                id: "daily-focus",
                title:
                    "اختبار التركيز",
                xp: 40
            },

            {
                id: "daily-horror",
                title:
                    "اختيار من الظلام",
                xp: 45
            }

        ];


        const day =
            Math.floor(
                Date.now() /
                86400000
            );


        return challenges[
            day % challenges.length
        ];

    } catch (error) {

        console.error(
            "getDailyChallenge Error:",
            error
        );

        return null;
    }
}


/* ============================================================
   23. USER PROFILE DATA
============================================================ */

function getUserProfile() {

    try {

        const level =
            calculateLevel(state.xp);

        return {

            user:
                state.user
                    ? {
                        id:
                            state.user.id,
                        name:
                            state.user.name,
                        email:
                            state.user.email
                    }
                    : null,

            xp:
                state.xp,

            level:
                level.level,

            levelName:
                level.name,

            completedGames:
                [...state.completedGames],

            personalityCompleted:
                state.personalityAnswers.length >=
                PERSONALITY_QUESTIONS.length

        };

    } catch (error) {

        console.error(
            "getUserProfile Error:",
            error
        );

        return null;
    }
}


/* ============================================================
   24. EXPORT PUBLIC API
============================================================ */

window.ZIVOZONE = Object.freeze({

    changeLanguage,

    navigateTo,

    startGame,

    addXP,

    getUserProfile,

    getDailyChallenge,

    showNotification,

    logoutUser

});


/* ============================================================
   25. GLOBAL ERROR HANDLING
============================================================ */

window.addEventListener(
    "error",
    event => {

        try {

            console.error(
                "ZIVOZONE Global Error:",
                event.error || event.message
            );

        } catch (error) {

            console.error(
                "Global error handler failed:",
                error
            );
        }
    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        try {

            console.error(
                "ZIVOZONE Promise Error:",
                event.reason
            );

        } catch (error) {

            console.error(
                "Promise error handler failed:",
                error
            );
        }
    }
);


/* ============================================================
   END OF ZIVOZONE APP.JS
============================================================ */
