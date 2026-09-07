"use strict";

/*
 * ============================================================
 * ZIVOZONE - Application Core
 * Version: 2.0
 * ============================================================
 *
 * هذا الملف مسؤول عن:
 * - نظام اللاعب
 * - XP / Levels
 * - Z-Coin
 * - الألعاب
 * - التحدي اليومي
 * - من أنا؟
 * - ZIVO AI التجريبي
 * - اللغات
 * - حفظ البيانات
 * - التنقل والتفاعل
 *
 * ملاحظة أمنية:
 * لا يتم وضع أي API Key أو Secret داخل هذا الملف.
 * عند ربط ZIVO AI الحقيقي سيتم استخدام Backend.
 * ============================================================
 */

(() => {
    "use strict";

    /* ============================================================
       1. CONFIGURATION
    ============================================================ */

    const CONFIG = {
        storageKey: "zivozone_player_v2",
        languageKey: "zivozone_language_v2",

        defaultLanguage: "ar",

        maxNameLength: 40,
        maxEmailLength: 120,

        baseXPPerLevel: 100,

        coinRewards: {
            correct: 2,
            gameComplete: 5,
            daily: 10,
            streak: 5,
            profile: 3
        },

        supportedLanguages: ["ar", "en", "fr", "es", "tr"],

        languages: {
            ar: "العربية",
            en: "English",
            fr: "Français",
            es: "Español",
            tr: "Türkçe"
        }
    };

    /* ============================================================
       2. TRANSLATIONS
    ============================================================ */

    const TRANSLATIONS = {
        ar: {
            home: "الرئيسية",
            games: "الألعاب",
            challenges: "التحديات",
            ai: "الذكاء الاصطناعي",
            whoami: "من أنا؟",
            sports: "الرياضة",
            profile: "ملفي",

            start: "ابدأ",
            playNow: "العب الآن",
            discover: "اكتشف",
            close: "إغلاق",
            next: "التالي",
            finish: "إنهاء",
            save: "حفظ",
            login: "تسجيل الدخول",
            logout: "تسجيل الخروج",

            player: "اللاعب",
            level: "المستوى",
            xp: "XP",
            coins: "Z-Coin",
            streak: "سلسلة الأيام",

            correct: "إجابة صحيحة!",
            wrong: "إجابة غير صحيحة",
            excellent: "ممتاز!",
            gameCompleted: "أكملت اللعبة!",
            dailyCompleted: "أكملت تحدي اليوم!",

            writeQuestion: "اكتب سؤالك...",
            aiThinking: "ZIVO AI يفكر...",

            nameRequired: "يرجى إدخال اسم صحيح.",
            emailRequired: "يرجى إدخال بريد إلكتروني صحيح.",
            ageRequired: "يرجى إدخال عمرك.",

            profileSaved: "تم حفظ ملفك بنجاح.",

            whoTitle: "من أنت داخل ZIVOZONE؟",
            whoDescription:
                "هذا التحليل ترفيهي مبني على إجاباتك داخل الاختبار، وليس تشخيصًا نفسيًا أو طبيًا.",

            dailyTitle: "تحدي اليوم",
            dailyDone: "لقد أكملت تحدي اليوم. عد غدًا!",

            intelligence: "ذكاء",
            science: "علوم",
            horror: "رعب",
            psychology: "شخصية",

            explorer: "مستكشف",
            thinker: "مفكر",
            challenger: "متحدي",
            strategist: "استراتيجي",
            analyst: "محلل",

            noProfile:
                "أنشئ ملفك أولًا حتى نستطيع حفظ تقدمك وXP والعملات.",

            demoAI:
                "أنا ZIVO AI التجريبي 🤖. أستطيع مساعدتك في الألعاب والأفكار والتحليل داخل النسخة الحالية."
        },

        en: {
            home: "Home",
            games: "Games",
            challenges: "Challenges",
            ai: "AI",
            whoami: "Who Am I?",
            sports: "Sports",
            profile: "Profile",

            start: "Start",
            playNow: "Play Now",
            discover: "Discover",
            close: "Close",
            next: "Next",
            finish: "Finish",
            save: "Save",
            login: "Login",
            logout: "Logout",

            player: "Player",
            level: "Level",
            xp: "XP",
            coins: "Z-Coin",
            streak: "Streak",

            correct: "Correct!",
            wrong: "Incorrect",
            excellent: "Excellent!",
            gameCompleted: "Game completed!",
            dailyCompleted: "Daily challenge completed!",

            writeQuestion: "Write your question...",
            aiThinking: "ZIVO AI is thinking...",

            nameRequired: "Please enter a valid name.",
            emailRequired: "Please enter a valid email.",
            ageRequired: "Please enter your age.",

            profileSaved: "Profile saved successfully.",

            whoTitle: "Who are you inside ZIVOZONE?",
            whoDescription:
                "This is an entertainment analysis based on your answers. It is not a medical or psychological diagnosis.",

            dailyTitle: "Daily Challenge",
            dailyDone: "You completed today's challenge. Come back tomorrow!",

            intelligence: "Intelligence",
            science: "Science",
            horror: "Horror",
            psychology: "Personality",

            explorer: "Explorer",
            thinker: "Thinker",
            challenger: "Challenger",
            strategist: "Strategist",
            analyst: "Analyst",

            noProfile:
                "Create your profile first so we can save your progress, XP and coins.",

            demoAI:
                "I am ZIVO AI 🤖. I can help you with games, ideas and analysis in the current version."
        },

        fr: {
            home: "Accueil",
            games: "Jeux",
            challenges: "Défis",
            ai: "IA",
            whoami: "Qui suis-je ?",
            sports: "Sports",
            profile: "Profil",

            start: "Commencer",
            playNow: "Jouer",
            discover: "Découvrir",
            close: "Fermer",
            next: "Suivant",
            finish: "Terminer",
            save: "Enregistrer",
            login: "Connexion",
            logout: "Déconnexion",

            player: "Joueur",
            level: "Niveau",
            xp: "XP",
            coins: "Z-Coin",
            streak: "Série",

            correct: "Bonne réponse !",
            wrong: "Mauvaise réponse",
            excellent: "Excellent !",

            gameCompleted: "Jeu terminé !",
            dailyCompleted: "Défi quotidien terminé !",

            writeQuestion: "Écrivez votre question...",
            aiThinking: "ZIVO AI réfléchit...",

            nameRequired: "Veuillez entrer un nom valide.",
            emailRequired: "Veuillez entrer un e-mail valide.",
            ageRequired: "Veuillez entrer votre âge.",

            profileSaved: "Profil enregistré.",

            whoTitle: "Qui êtes-vous dans ZIVOZONE ?",
            whoDescription:
                "Cette analyse est destinée au divertissement et ne constitue pas un diagnostic médical ou psychologique.",

            dailyTitle: "Défi du jour",
            dailyDone: "Vous avez terminé le défi du jour. Revenez demain !",

            intelligence: "Intelligence",
            science: "Sciences",
            horror: "Horreur",
            psychology: "Personnalité",

            explorer: "Explorateur",
            thinker: "Penseur",
            challenger: "Compétiteur",
            strategist: "Stratège",
            analyst: "Analyste",

            noProfile:
                "Créez d'abord votre profil pour sauvegarder votre progression.",

            demoAI:
                "Je suis ZIVO AI 🤖. Je peux vous aider avec les jeux et les idées."
        },

        es: {
            home: "Inicio",
            games: "Juegos",
            challenges: "Desafíos",
            ai: "IA",
            whoami: "¿Quién soy?",
            sports: "Deportes",
            profile: "Perfil",

            start: "Comenzar",
            playNow: "Jugar",
            discover: "Descubrir",
            close: "Cerrar",
            next: "Siguiente",
            finish: "Finalizar",
            save: "Guardar",
            login: "Iniciar sesión",
            logout: "Cerrar sesión",

            player: "Jugador",
            level: "Nivel",
            xp: "XP",
            coins: "Z-Coin",
            streak: "Racha",

            correct: "¡Correcto!",
            wrong: "Incorrecto",
            excellent: "¡Excelente!",

            gameCompleted: "¡Juego completado!",
            dailyCompleted: "¡Desafío diario completado!",

            writeQuestion: "Escribe tu pregunta...",
            aiThinking: "ZIVO AI está pensando...",

            nameRequired: "Introduce un nombre válido.",
            emailRequired: "Introduce un correo válido.",
            ageRequired: "Introduce tu edad.",

            profileSaved: "Perfil guardado correctamente.",

            whoTitle: "¿Quién eres dentro de ZIVOZONE?",
            whoDescription:
                "Este análisis es recreativo y no representa un diagnóstico médico o psicológico.",

            dailyTitle: "Desafío diario",
            dailyDone: "Ya completaste el desafío de hoy. ¡Vuelve mañana!",

            intelligence: "Inteligencia",
            science: "Ciencia",
            horror: "Terror",
            psychology: "Personalidad",

            explorer: "Explorador",
            thinker: "Pensador",
            challenger: "Competidor",
            strategist: "Estratega",
            analyst: "Analista",

            noProfile:
                "Crea tu perfil primero para guardar tu progreso.",

            demoAI:
                "Soy ZIVO AI 🤖. Puedo ayudarte con juegos, ideas y análisis."
        },

        tr: {
            home: "Ana Sayfa",
            games: "Oyunlar",
            challenges: "Görevler",
            ai: "Yapay Zeka",
            whoami: "Ben Kimim?",
            sports: "Spor",
            profile: "Profil",

            start: "Başla",
            playNow: "Oyna",
            discover: "Keşfet",
            close: "Kapat",
            next: "Sonraki",
            finish: "Bitir",
            save: "Kaydet",
            login: "Giriş",
            logout: "Çıkış",

            player: "Oyuncu",
            level: "Seviye",
            xp: "XP",
            coins: "Z-Coin",
            streak: "Seri",

            correct: "Doğru!",
            wrong: "Yanlış",
            excellent: "Mükemmel!",

            gameCompleted: "Oyun tamamlandı!",
            dailyCompleted: "Günlük görev tamamlandı!",

            writeQuestion: "Sorunuzu yazın...",
            aiThinking: "ZIVO AI düşünüyor...",

            nameRequired: "Geçerli bir isim girin.",
            emailRequired: "Geçerli bir e-posta girin.",
            ageRequired: "Yaşınızı girin.",

            profileSaved: "Profil başarıyla kaydedildi.",

            whoTitle: "ZIVOZONE içinde sen kimsin?",
            whoDescription:
                "Bu eğlence amaçlı bir analizdir ve tıbbi veya psikolojik teşhis değildir.",

            dailyTitle: "Günün Görevi",
            dailyDone: "Bugünkü görevi tamamladın. Yarın tekrar gel!",

            intelligence: "Zeka",
            science: "Bilim",
            horror: "Korku",
            psychology: "Kişilik",

            explorer: "Kaşif",
            thinker: "Düşünür",
            challenger: "Rakip",
            strategist: "Stratejist",
            analyst: "Analist",

            noProfile:
                "İlerlemeni kaydetmek için önce profil oluştur.",

            demoAI:
                "Ben ZIVO AI 🤖. Oyunlar, fikirler ve analiz konusunda yardımcı olabilirim."
        }
    };

    /* ============================================================
       3. QUESTION DATABASE
    ============================================================ */

    const QUESTION_BANK = {

        intelligence: [
            {
                level: 1,
                question: "إذا كان لديك 3 تفاحات وأخذت تفاحتين، كم تفاحة أصبحت تملك؟",
                options: ["1", "2", "3", "5"],
                answer: 1
            },
            {
                level: 1,
                question: "ما الرقم التالي: 2، 4، 6، 8، ؟",
                options: ["9", "10", "11", "12"],
                answer: 1
            },
            {
                level: 2,
                question: "ما الرقم التالي: 3، 6، 12، 24، ؟",
                options: ["30", "36", "48", "60"],
                answer: 2
            },
            {
                level: 2,
                question: "إذا كان جميع A هم B، وبعض B هم C، فما العبارة المؤكدة؟",
                options: [
                    "كل A هم C",
                    "بعض A قد يكونون C",
                    "لا يوجد A",
                    "كل C هم A"
                ],
                answer: 1
            },
            {
                level: 3,
                question: "ما الرقم الذي يكمل النمط: 1، 4، 9، 16، ؟",
                options: ["20", "24", "25", "30"],
                answer: 2
            },
            {
                level: 4,
                question: "إذا كان 5 عمال ينجزون عملاً في 10 أيام، فكم يومًا يحتاج 10 عمال بنفس الكفاءة؟",
                options: ["2", "5", "10", "20"],
                answer: 1
            }
        ],

        science: [
            {
                level: 1,
                question: "ما الكوكب المعروف بالكوكب الأحمر؟",
                options: ["الأرض", "المريخ", "الزهرة", "المشتري"],
                answer: 1
            },
            {
                level: 1,
                question: "ما الغاز الذي يحتاجه الإنسان للتنفس؟",
                options: ["الأكسجين", "الهيليوم", "الهيدروجين", "النيتروجين فقط"],
                answer: 0
            },
            {
                level: 2,
                question: "ما العضو الذي يضخ الدم في جسم الإنسان؟",
                options: ["الكبد", "الرئة", "القلب", "المعدة"],
                answer: 2
            },
            {
                level: 3,
                question: "ما الوحدة الأساسية للحياة؟",
                options: ["الذرة", "الخلية", "العضلة", "الأنسجة"],
                answer: 1
            },
            {
                level: 4,
                question: "ما القوة التي تجذب الأجسام نحو الأرض؟",
                options: ["المغناطيسية", "الاحتكاك", "الجاذبية", "الضغط"],
                answer: 2
            }
        ],

        horror: [
            {
                level: 1,
                question: "أنت في منزل مظلم وسمعت صوتًا من الطابق العلوي. ماذا تفعل؟",
                options: [
                    "أصعد فورًا",
                    "أخرج من المنزل",
                    "أشعل الأنوار وأتحقق بحذر",
                    "أتجاهل الصوت"
                ]
            },
            {
                level: 2,
                question: "وجدت بابًا عليه عبارة «لا تفتح». ماذا تختار؟",
                options: [
                    "أفتحه فورًا",
                    "أبحث عن سبب التحذير",
                    "أكسر الباب",
                    "أترك المكان"
                ]
            },
            {
                level: 3,
                question: "الهاتف يرن من غرفة فارغة. ماذا تفعل؟",
                options: [
                    "أذهب إليه",
                    "أتصل بالطوارئ",
                    "أتحقق من مصدر الصوت بحذر",
                    "أهرب"
                ]
            }
        ]
    };

    /* ============================================================
       4. WHO AM I QUESTIONS
    ============================================================ */

    const WHO_AM_I_QUESTIONS = [
        {
            question: "عندما تواجه مشكلة صعبة، ماذا تفعل غالبًا؟",
            options: [
                {
                    text: "أحللها بهدوء",
                    type: "analyst"
                },
                {
                    text: "أجرب عدة حلول بسرعة",
                    type: "challenger"
                },
                {
                    text: "أبحث عن معلومات أولًا",
                    type: "thinker"
                },
                {
                    text: "أستكشف الاحتمالات المختلفة",
                    type: "explorer"
                }
            ]
        },

        {
            question: "في المنافسة، ما الشيء الذي يحفزك أكثر؟",
            options: [
                {
                    text: "الفوز",
                    type: "challenger"
                },
                {
                    text: "اكتشاف شيء جديد",
                    type: "explorer"
                },
                {
                    text: "فهم اللعبة",
                    type: "analyst"
                },
                {
                    text: "التخطيط",
                    type: "strategist"
                }
            ]
        },

        {
            question: "عندما تتعلم شيئًا جديدًا...",
            options: [
                {
                    text: "أتعلم بالتجربة",
                    type: "challenger"
                },
                {
                    text: "أقرأ وأبحث",
                    type: "thinker"
                },
                {
                    text: "أحلل التفاصيل",
                    type: "analyst"
                },
                {
                    text: "أجرب أشياء مختلفة",
                    type: "explorer"
                }
            ]
        },

        {
            question: "إذا كان لديك وقت فراغ طويل...",
            options: [
                {
                    text: "أتعلم شيئًا جديدًا",
                    type: "thinker"
                },
                {
                    text: "ألعب أو أتحدى شخصًا",
                    type: "challenger"
                },
                {
                    text: "أبحث وأستكشف",
                    type: "explorer"
                },
                {
                    text: "أخطط لمشروع جديد",
                    type: "strategist"
                }
            ]
        },

        {
            question: "هل تتخذ قراراتك بسرعة؟",
            options: [
                {
                    text: "نعم غالبًا",
                    type: "challenger"
                },
                {
                    text: "أحتاج وقتًا للتفكير",
                    type: "thinker"
                },
                {
                    text: "أدرس الاحتمالات",
                    type: "analyst"
                },
                {
                    text: "يعتمد على الموقف",
                    type: "strategist"
                }
            ]
        }
    ];

    /* ============================================================
       5. PLAYER STATE
    ============================================================ */

    let player = loadPlayer();

    let currentGame = null;

    let currentQuestionIndex = 0;

    let currentGameQuestions = [];

    let gameScore = 0;

    let whoAmIAnswers = [];

    let currentWhoQuestion = 0;

    /* ============================================================
       6. SAFE HELPERS
    ============================================================ */

    function safeText(value, fallback = "") {
        if (typeof value !== "string") {
            return fallback;
        }

        return value
            .replace(/[<>]/g, "")
            .trim();
    }

    function safeNumber(value, fallback = 0) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return number;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function getTodayKey() {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function getTranslation(key) {
        const language = player.language || CONFIG.defaultLanguage;

        return (
            TRANSLATIONS[language]?.[key] ||
            TRANSLATIONS[CONFIG.defaultLanguage]?.[key] ||
            key
        );
    }

    /* ============================================================
       7. PLAYER DEFAULT
    ============================================================ */

    function createDefaultPlayer() {
        return {
            id: createPlayerId(),

            name: "",

            email: "",

            age: 18,

            language: CONFIG.defaultLanguage,

            xp: 0,

            coins: 0,

            level: 1,

            streak: 0,

            lastVisit: null,

            dailyCompleted: null,

            gamesPlayed: 0,

            correctAnswers: 0,

            totalAnswers: 0,

            profileCompleted: false,

            achievements: [],

            personality: null,

            stats: {
                intelligence: 0,
                science: 0,
                horror: 0,
                psychology: 0
            }
        };
    }

    function createPlayerId() {
        try {
            return (
                "ZP-" +
                Date.now().toString(36) +
                "-" +
                Math.random().toString(36).substring(2, 8)
            ).toUpperCase();
        } catch (error) {
            return "ZP-" + Date.now();
        }
    }

    /* ============================================================
       8. STORAGE
    ============================================================ */

    function loadPlayer() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);

            if (!saved) {
                return createDefaultPlayer();
            }

            const parsed = JSON.parse(saved);

            return {
                ...createDefaultPlayer(),
                ...parsed,
                stats: {
                    ...createDefaultPlayer().stats,
                    ...(parsed.stats || {})
                }
            };
        } catch (error) {
            console.error("ZIVOZONE: Failed to load player.", error);

            return createDefaultPlayer();
        }
    }

    function savePlayer() {
        try {
            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(player)
            );

            return true;
        } catch (error) {
            console.error("ZIVOZONE: Failed to save player.", error);

            showToast("تعذر حفظ البيانات على هذا المتصفح.");

            return false;
        }
    }

    /* ============================================================
       9. LEVEL SYSTEM
    ============================================================ */

    function calculateLevel(xp) {
        const safeXP = Math.max(0, safeNumber(xp));

        return Math.floor(
            safeXP / CONFIG.baseXPPerLevel
        ) + 1;
    }

    function xpForNextLevel() {
        return player.level * CONFIG.baseXPPerLevel;
    }

    function addXP(amount) {
        try {
            const value = Math.max(0, safeNumber(amount));

            player.xp += value;

            const oldLevel = player.level;

            player.level = calculateLevel(player.xp);

            if (player.level > oldLevel) {
                showToast(
                    `🎉 ارتقيت إلى المستوى ${player.level}!`
                );

                addAchievement("level_up");
            }

            savePlayer();

            updatePlayerUI();

            return true;
        } catch (error) {
            console.error("ZIVOZONE XP Error:", error);

            return false;
        }
    }

    /* ============================================================
       10. Z-COIN SYSTEM
    ============================================================ */

    function addCoins(amount) {
        try {
            const value = Math.max(0, safeNumber(amount));

            player.coins += value;

            savePlayer();

            updatePlayerUI();

            return true;
        } catch (error) {
            console.error("ZIVOZONE Coin Error:", error);

            return false;
        }
    }

    /* ============================================================
       11. ACHIEVEMENTS
    ============================================================ */

    function addAchievement(id) {
        try {
            if (!player.achievements.includes(id)) {
                player.achievements.push(id);

                savePlayer();

                showToast("🏆 إنجاز جديد!");
            }
        } catch (error) {
            console.error(
                "ZIVOZONE Achievement Error:",
                error
            );
        }
    }

    /* ============================================================
       12. STREAK
    ============================================================ */

    function updateStreak() {
        try {
            const today = getTodayKey();

            if (player.lastVisit === today) {
                return;
            }

            const previous = player.lastVisit;

            if (!previous) {
                player.streak = 1;
            } else {
                const previousDate = new Date(previous);
                const currentDate = new Date(today);

                const difference =
                    Math.floor(
                        (currentDate - previousDate) /
                        (1000 * 60 * 60 * 24)
                    );

                if (difference === 1) {
                    player.streak += 1;
                } else {
                    player.streak = 1;
                }
            }

            player.lastVisit = today;

            if (player.streak >= 3) {
                addAchievement("streak_3");
            }

            if (player.streak >= 7) {
                addAchievement("streak_7");
            }

            savePlayer();
        } catch (error) {
            console.error(
                "ZIVOZONE Streak Error:",
                error
            );
        }
    }

    /* ============================================================
       13. DOM HELPERS
    ============================================================ */

    function $(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            return null;
        }
    }

    function $$(selector, parent = document) {
        try {
            return Array.from(
                parent.querySelectorAll(selector)
            );
        } catch (error) {
            return [];
        }
    }

    function setText(selector, value) {
        const element = $(selector);

        if (element) {
            element.textContent = value;
        }
    }

    /* ============================================================
       14. TOAST SYSTEM
    ============================================================ */

    function showToast(message) {
        try {
            let toast = document.getElementById(
                "zivo-toast"
            );

            if (!toast) {
                toast = document.createElement("div");

                toast.id = "zivo-toast";

                Object.assign(toast.style, {
                    position: "fixed",
                    bottom: "25px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: "999999",
                    background: "#111827",
                    color: "#ffffff",
                    padding: "14px 22px",
                    borderRadius: "14px",
                    boxShadow:
                        "0 15px 40px rgba(0,0,0,.35)",
                    fontWeight: "700",
                    maxWidth: "90%",
                    textAlign: "center",
                    transition: "opacity .3s ease"
                });

                document.body.appendChild(toast);
            }

            toast.textContent = safeText(message);

            toast.style.opacity = "1";

            clearTimeout(toast._timer);

            toast._timer = setTimeout(() => {
                toast.style.opacity = "0";
            }, 3000);
        } catch (error) {
            console.error(
                "ZIVOZONE Toast Error:",
                error
            );
        }
    }

    /* ============================================================
       15. MODAL SYSTEM
    ============================================================ */

    function createModal() {
        try {
            let modal =
                document.getElementById("zivo-modal");

            if (modal) {
                return modal;
            }

            modal = document.createElement("div");

            modal.id = "zivo-modal";

            Object.assign(modal.style, {
                position: "fixed",
                inset: "0",
                zIndex: "999990",
                background: "rgba(0,0,0,.78)",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            });

            modal.innerHTML = `
                <div
                    id="zivo-modal-content"
                    style="
                        width:min(720px,100%);
                        max-height:90vh;
                        overflow:auto;
                        background:#0b1220;
                        color:white;
                        border:1px solid rgba(255,255,255,.1);
                        border-radius:24px;
                        padding:25px;
                        position:relative;
                        box-shadow:0 30px 80px rgba(0,0,0,.5);
                    "
                >
                    <button
                        id="zivo-modal-close"
                        type="button"
                        aria-label="Close"
                        style="
                            position:absolute;
                            top:15px;
                            right:15px;
                            width:40px;
                            height:40px;
                            border:0;
                            border-radius:50%;
                            cursor:pointer;
                            font-size:20px;
                        "
                    >×</button>

                    <div id="zivo-modal-body"></div>
                </div>
            `;

            document.body.appendChild(modal);

            const closeButton =
                document.getElementById(
                    "zivo-modal-close"
                );

            closeButton?.addEventListener(
                "click",
                closeModal
            );

            modal.addEventListener(
                "click",
                (event) => {
                    if (event.target === modal) {
                        closeModal();
                    }
                }
            );

            return modal;
        } catch (error) {
            console.error(
                "ZIVOZONE Modal Error:",
                error
            );

            return null;
        }
    }

    function openModal(html) {
        try {
            const modal = createModal();

            if (!modal) {
                return;
            }

            const body =
                document.getElementById(
                    "zivo-modal-body"
                );

            if (!body) {
                return;
            }

            body.innerHTML = html;

            modal.style.display = "flex";

            document.body.style.overflow = "hidden";
        } catch (error) {
            console.error(
                "ZIVOZONE Open Modal Error:",
                error
            );
        }
    }

    function closeModal() {
        try {
            const modal =
                document.getElementById(
                    "zivo-modal"
                );

            if (modal) {
                modal.style.display = "none";
            }

            document.body.style.overflow = "";
        } catch (error) {
            console.error(
                "ZIVOZONE Close Modal Error:",
                error
            );
        }
    }

    /* ============================================================
       16. PLAYER UI
    ============================================================ */

    function updatePlayerUI() {
        try {
            player.level = calculateLevel(player.xp);

            const levelElements = $$(
                "[data-player-level], .player-level"
            );

            levelElements.forEach((element) => {
                element.textContent =
                    `المستوى ${player.level}`;
            });

            const xpElements = $$(
                "[data-player-xp], .player-xp"
            );

            xpElements.forEach((element) => {
                element.textContent =
                    `${player.xp} XP`;
            });

            const coinElements = $$(
                "[data-player-coins], .player-coins"
            );

            coinElements.forEach((element) => {
                element.textContent =
                    `${player.coins} Z`;
            });

            const nameElements = $$(
                "[data-player-name], .player-name"
            );

            nameElements.forEach((element) => {
                element.textContent =
                    player.name || "ZIVO Player";
            });

            const streakElements = $$(
                "[data-player-streak], .player-streak"
            );

            streakElements.forEach((element) => {
                element.textContent =
                    `${player.streak}`;
            });

            updateProgressBar();
        } catch (error) {
            console.error(
                "ZIVOZONE UI Error:",
                error
            );
        }
    }

    function updateProgressBar() {
        const progress =
            player.xp % CONFIG.baseXPPerLevel;

        const percentage =
            Math.min(
                100,
                (progress / CONFIG.baseXPPerLevel) *
                100
            );

        const bars = $$(
            "[data-xp-progress], .xp-progress"
        );

        bars.forEach((bar) => {
            bar.style.width =
                `${percentage}%`;
        });
    }

    /* ============================================================
       17. PROFILE SYSTEM
    ============================================================ */

    function openProfile() {
        try {
            openModal(`
                <div dir="${player.language === "ar" ? "rtl" : "ltr"}">
                    <h2>👤 ${getTranslation("profile")}</h2>

                    <p>
                        ${getTranslation("level")}:
                        <strong>${player.level}</strong>
                    </p>

                    <p>
                        ${getTranslation("xp")}:
                        <strong>${player.xp}</strong>
                    </p>

                    <p>
                        ${getTranslation("coins")}:
                        <strong>${player.coins}</strong>
                    </p>

                    <p>
                        ${getTranslation("streak")}:
                        <strong>${player.streak}</strong>
                    </p>

                    <hr>

                    <form id="zivo-profile-form">

                        <label>
                            الاسم
                            <input
                                id="zivo-profile-name"
                                type="text"
                                maxlength="40"
                                value="${escapeAttribute(player.name)}"
                                required
                            >
                        </label>

                        <br>

                        <label>
                            البريد الإلكتروني
                            <input
                                id="zivo-profile-email"
                                type="email"
                                maxlength="120"
                                value="${escapeAttribute(player.email)}"
                                required
                            >
                        </label>

                        <br>

                        <label>
                            العمر
                            <input
                                id="zivo-profile-age"
                                type="number"
                                min="6"
                                max="100"
                                value="${player.age}"
                                required
                            >
                        </label>

                        <br>

                        <button
                            type="submit"
                            style="
                                padding:12px 20px;
                                border:0;
                                border-radius:12px;
                                cursor:pointer;
                            "
                        >
                            ${getTranslation("save")}
                        </button>

                    </form>

                    <br>

                    <button
                        id="zivo-logout-button"
                        type="button"
                        style="
                            padding:10px 18px;
                            border:0;
                            border-radius:12px;
                            cursor:pointer;
                        "
                    >
                        ${getTranslation("logout")}
                    </button>
                </div>
            `);

            const form =
                document.getElementById(
                    "zivo-profile-form"
                );

            form?.addEventListener(
                "submit",
                handleProfileSave
            );

            document
                .getElementById(
                    "zivo-logout-button"
                )
                ?.addEventListener(
                    "click",
                    logout
                );
        } catch (error) {
            console.error(
                "ZIVOZONE Profile Error:",
                error
            );
        }
    }

    function handleProfileSave(event) {
        event.preventDefault();

        try {
            const name = safeText(
                document.getElementById(
                    "zivo-profile-name"
                )?.value
            );

            const email = safeText(
                document.getElementById(
                    "zivo-profile-email"
                )?.value
            );

            const age = safeNumber(
                document.getElementById(
                    "zivo-profile-age"
                )?.value
            );

            if (
                name.length < 2 ||
                name.length > CONFIG.maxNameLength
            ) {
                showToast(
                    getTranslation("nameRequired")
                );

                return;
            }

            if (
                !isValidEmail(email) ||
                email.length > CONFIG.maxEmailLength
            ) {
                showToast(
                    getTranslation("emailRequired")
                );

                return;
            }

            if (
                age < 6 ||
                age > 100
            ) {
                showToast(
                    getTranslation("ageRequired")
                );

                return;
            }

            const wasCompleted =
                player.profileCompleted;

            player.name = name;
            player.email = email;
            player.age = age;

            player.profileCompleted = true;

            if (!wasCompleted) {
                addXP(20);

                addCoins(
                    CONFIG.coinRewards.profile
                );

                addAchievement(
                    "profile_complete"
                );
            }

            savePlayer();

            updatePlayerUI();

            showToast(
                getTranslation("profileSaved")
            );

            closeModal();
        } catch (error) {
            console.error(
                "ZIVOZONE Profile Save Error:",
                error
            );

            showToast(
                "حدث خطأ أثناء حفظ الملف."
            );
        }
    }

    function logout() {
        try {
            player = createDefaultPlayer();

            savePlayer();

            closeModal();

            updatePlayerUI();

            showToast("تم تسجيل الخروج.");

            setTimeout(() => {
                location.reload();
            }, 500);
        } catch (error) {
            console.error(
                "ZIVOZONE Logout Error:",
                error
            );
        }
    }

    /* ============================================================
       18. GAME ENGINE
    ============================================================ */

    function startGame(type) {
        try {
            if (!player.profileCompleted) {
                showToast(
                    getTranslation("noProfile")
                );

                openProfile();

                return;
            }

            currentGame = type;

            currentQuestionIndex = 0;

            gameScore = 0;

            const difficulty =
                Math.min(
                    4,
                    Math.max(
                        1,
                        player.level
                    )
                );

            let questions =
                QUESTION_BANK[type] || [];

            if (type === "horror") {
                questions = questions.filter(
                    (question) =>
                        question.level <=
                        difficulty
                );
            } else {
                questions = questions.filter(
                    (question) =>
                        question.level <=
                        difficulty
                );
            }

            if (!questions.length) {
                questions =
                    QUESTION_BANK[type] || [];
            }

            currentGameQuestions =
                shuffle(
                    [...questions]
                ).slice(
                    0,
                    Math.min(
                        5,
                        questions.length
                    )
                );

            renderGameQuestion();
        } catch (error) {
            console.error(
                "ZIVOZONE Start Game Error:",
                error
            );

            showToast(
                "تعذر تشغيل اللعبة."
            );
        }
    }

    function renderGameQuestion() {
        try {
            const question =
                currentGameQuestions[
                    currentQuestionIndex
                ];

            if (!question) {
                finishGame();

                return;
            }

            const categoryName =
                getCategoryName(
                    currentGame
                );

            const optionsHTML =
                question.options
                    .map(
                        (option, index) => `
                            <button
                                class="zivo-game-option"
                                data-option-index="${index}"
                                type="button"
                                style="
                                    display:block;
                                    width:100%;
                                    margin:10px 0;
                                    padding:14px;
                                    border:1px solid rgba(255,255,255,.12);
                                    border-radius:14px;
                                    cursor:pointer;
                                    background:#111827;
                                    color:white;
                                    text-align:right;
                                "
                            >
                                ${escapeHTML(option)}
                            </button>
                        `
                    )
                    .join("");

            openModal(`
                <div dir="rtl">

                    <div style="opacity:.7;">
                        ${categoryName}
                    </div>

                    <h2>
                        ${escapeHTML(
                            question.question
                        )}
                    </h2>

                    <p>
                        سؤال
                        ${currentQuestionIndex + 1}
                        /
                        ${currentGameQuestions.length}
                    </p>

                    <div id="zivo-game-options">
                        ${optionsHTML}
                    </div>

                    <div
                        id="zivo-game-feedback"
                        style="
                            margin-top:15px;
                            min-height:30px;
                            font-weight:700;
                        "
                    ></div>

                </div>
            `);

            $$(".zivo-game-option").forEach(
                (button) => {
                    button.addEventListener(
                        "click",
                        () =>
                            handleGameAnswer(
                                Number(
                                    button.dataset
                                        .optionIndex
                                )
                            )
                    );
                }
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Render Game Error:",
                error
            );
        }
    }

    function handleGameAnswer(selectedIndex) {
        try {
            const question =
                currentGameQuestions[
                    currentQuestionIndex
                ];

            if (!question) {
                return;
            }

            const buttons =
                $$(".zivo-game-option");

            buttons.forEach(
                (button) => {
                    button.disabled = true;
                    button.style.opacity = "0.65";
                }
            );

            player.totalAnswers += 1;

            const feedback =
                document.getElementById(
                    "zivo-game-feedback"
                );

            if (
                currentGame !== "horror" &&
                selectedIndex === question.answer
            ) {
                gameScore += 1;

                player.correctAnswers += 1;

                addXP(15);

                addCoins(
                    CONFIG.coinRewards.correct
                );

                if (feedback) {
                    feedback.textContent =
                        `✅ ${getTranslation(
                            "correct"
                        )} +15 XP`;
                }
            } else if (
                currentGame === "horror"
            ) {
                gameScore += 1;

                addXP(10);

                addCoins(1);

                if (feedback) {
                    feedback.textContent =
                        `👻 اختيارك غيّر القصة`;
                }
            } else {
                if (feedback) {
                    feedback.textContent =
                        `❌ ${getTranslation(
                            "wrong"
                        )}`;
                }
            }

            savePlayer();

            setTimeout(() => {
                currentQuestionIndex += 1;

                renderGameQuestion();
            }, 1000);
        } catch (error) {
            console.error(
                "ZIVOZONE Answer Error:",
                error
            );

            showToast(
                "حدث خطأ أثناء معالجة الإجابة."
            );
        }
    }

    function finishGame() {
        try {
            const bonusXP =
                currentGame === "horror"
                    ? 20
                    : 25;

            const bonusCoins =
                CONFIG.coinRewards.gameComplete;

            addXP(bonusXP);

            addCoins(bonusCoins);

            player.gamesPlayed += 1;

            if (player.gamesPlayed >= 1) {
                addAchievement(
                    "first_game"
                );
            }

            if (player.gamesPlayed >= 5) {
                addAchievement(
                    "five_games"
                );
            }

            if (
                player.correctAnswers >= 10
            ) {
                addAchievement(
                    "ten_correct"
                );
            }

            savePlayer();

            openModal(`
                <div
                    dir="rtl"
                    style="text-align:center;"
                >

                    <div style="font-size:60px;">
                        🏆
                    </div>

                    <h2>
                        ${getTranslation(
                            "gameCompleted"
                        )}
                    </h2>

                    <p>
                        النتيجة:
                        <strong>
                            ${gameScore}
                        </strong>
                    </p>

                    <p>
                        +${bonusXP} XP
                    </p>

                    <p>
                        +${bonusCoins} Z-Coin
                    </p>

                    <button
                        id="zivo-finish-close"
                        type="button"
                        style="
                            padding:12px 25px;
                            border:0;
                            border-radius:12px;
                            cursor:pointer;
                        "
                    >
                        ${getTranslation(
                            "close"
                        )}
                    </button>

                </div>
            `);

            document
                .getElementById(
                    "zivo-finish-close"
                )
                ?.addEventListener(
                    "click",
                    closeModal
                );
        } catch (error) {
            console.error(
                "ZIVOZONE Finish Game Error:",
                error
            );
        }
    }

    /* ============================================================
       19. DAILY CHALLENGE
    ============================================================ */

    function startDailyChallenge() {
        try {
            if (!player.profileCompleted) {
                showToast(
                    getTranslation("noProfile")
                );

                openProfile();

                return;
            }

            const today =
                getTodayKey();

            if (
                player.dailyCompleted === today
            ) {
                openModal(`
                    <div
                        dir="rtl"
                        style="text-align:center;"
                    >
                        <div style="font-size:60px;">
                            🔥
                        </div>

                        <h2>
                            ${getTranslation(
                                "dailyTitle"
                            )}
                        </h2>

                        <p>
                            ${getTranslation(
                                "dailyDone"
                            )}
                        </p>
                    </div>
                `);

                return;
            }

            const dailyQuestions =
                getDailyQuestions();

            currentGame =
                "daily";

            currentQuestionIndex = 0;

            currentGameQuestions =
                dailyQuestions;

            gameScore = 0;

            renderDailyQuestion();
        } catch (error) {
            console.error(
                "ZIVOZONE Daily Error:",
                error
            );
        }
    }

    function getDailyQuestions() {
        try {
            const all = [
                ...QUESTION_BANK.intelligence,
                ...QUESTION_BANK.science
            ];

            const seed =
                getDateSeed();

            const shuffled =
                deterministicShuffle(
                    all,
                    seed
                );

            return shuffled.slice(0, 3);
        } catch (error) {
            console.error(
                "ZIVOZONE Daily Question Error:",
                error
            );

            return [];
        }
    }

    function renderDailyQuestion() {
        try {
            const question =
                currentGameQuestions[
                    currentQuestionIndex
                ];

            if (!question) {
                finishDailyChallenge();

                return;
            }

            const optionsHTML =
                question.options
                    .map(
                        (option, index) => `
                            <button
                                class="zivo-daily-option"
                                data-option-index="${index}"
                                type="button"
                                style="
                                    display:block;
                                    width:100%;
                                    margin:10px 0;
                                    padding:14px;
                                    border-radius:14px;
                                    cursor:pointer;
                                    background:#111827;
                                    color:white;
                                    border:1px solid rgba(255,255,255,.12);
                                "
                            >
                                ${escapeHTML(option)}
                            </button>
                        `
                    )
                    .join("");

            openModal(`
                <div dir="rtl">

                    <h2>
                        🔥
                        ${getTranslation(
                            "dailyTitle"
                        )}
                    </h2>

                    <p>
                        السؤال
                        ${currentQuestionIndex + 1}
                        /
                        ${currentGameQuestions.length}
                    </p>

                    <h3>
                        ${escapeHTML(
                            question.question
                        )}
                    </h3>

                    <div>
                        ${optionsHTML}
                    </div>

                    <div
                        id="zivo-daily-feedback"
                        style="min-height:30px;"
                    ></div>

                </div>
            `);

            $$(".zivo-daily-option").forEach(
                (button) => {
                    button.addEventListener(
                        "click",
                        () =>
                            handleDailyAnswer(
                                Number(
                                    button.dataset
                                        .optionIndex
                                )
                            )
                    );
                }
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Daily Render Error:",
                error
            );
        }
    }

    function handleDailyAnswer(selectedIndex) {
        try {
            const question =
                currentGameQuestions[
                    currentQuestionIndex
                ];

            const buttons =
                $$(".zivo-daily-option");

            buttons.forEach(
                (button) => {
                    button.disabled = true;
                }
            );

            player.totalAnswers += 1;

            const feedback =
                document.getElementById(
                    "zivo-daily-feedback"
                );

            if (
                selectedIndex ===
                question.answer
            ) {
                gameScore += 1;

                player.correctAnswers += 1;

                addXP(20);

                addCoins(3);

                if (feedback) {
                    feedback.textContent =
                        `✅ ${getTranslation(
                            "correct"
                        )} +20 XP`;
                }
            } else {
                if (feedback) {
                    feedback.textContent =
                        `❌ ${getTranslation(
                            "wrong"
                        )}`;
                }
            }

            savePlayer();

            setTimeout(() => {
                currentQuestionIndex += 1;

                renderDailyQuestion();
            }, 900);
        } catch (error) {
            console.error(
                "ZIVOZONE Daily Answer Error:",
                error
            );
        }
    }

    function finishDailyChallenge() {
        try {
            const today =
                getTodayKey();

            player.dailyCompleted =
                today;

            addXP(
                CONFIG.coinRewards.daily
            );

            addCoins(
                CONFIG.coinRewards.daily
            );

            addAchievement(
                "daily_challenge"
            );

            savePlayer();

            openModal(`
                <div
                    dir="rtl"
                    style="text-align:center;"
                >

                    <div style="font-size:60px;">
                        🔥
                    </div>

                    <h2>
                        ${getTranslation(
                            "dailyCompleted"
                        )}
                    </h2>

                    <p>
                        نتيجتك:
                        <strong>
                            ${gameScore}
                        </strong>
                    </p>

                    <p>
                        +10 XP
                    </p>

                    <p>
                        +10 Z-Coin
                    </p>

                </div>
            `);
        } catch (error) {
            console.error(
                "ZIVOZONE Daily Finish Error:",
                error
            );
        }
    }

    /* ============================================================
       20. WHO AM I SYSTEM
    ============================================================ */

    function startWhoAmI() {
        try {
            if (!player.profileCompleted) {
                showToast(
                    getTranslation("noProfile")
                );

                openProfile();

                return;
            }

            currentWhoQuestion = 0;

            whoAmIAnswers = [];

            renderWhoQuestion();
        } catch (error) {
            console.error(
                "ZIVOZONE WhoAmI Error:",
                error
            );
        }
    }

    function renderWhoQuestion() {
        try {
            const question =
                WHO_AM_I_QUESTIONS[
                    currentWhoQuestion
                ];

            if (!question) {
                finishWhoAmI();

                return;
            }

            const options =
                question.options
                    .map(
                        (option, index) => `
                            <button
                                class="zivo-who-option"
                                data-option-index="${index}"
                                type="button"
                                style="
                                    display:block;
                                    width:100%;
                                    padding:14px;
                                    margin:10px 0;
                                    border-radius:14px;
                                    border:1px solid rgba(255,255,255,.12);
                                    background:#111827;
                                    color:white;
                                    cursor:pointer;
                                "
                            >
                                ${escapeHTML(
                                    option.text
                                )}
                            </button>
                        `
                    )
                    .join("");

            openModal(`
                <div dir="rtl">

                    <h2>
                        🧠
                        ${getTranslation(
                            "whoTitle"
                        )}
                    </h2>

                    <p>
                        ${currentWhoQuestion + 1}
                        /
                        ${WHO_AM_I_QUESTIONS.length}
                    </p>

                    <h3>
                        ${escapeHTML(
                            question.question
                        )}
                    </h3>

                    ${options}

                </div>
            `);

            $$(".zivo-who-option").forEach(
                (button) => {
                    button.addEventListener(
                        "click",
                        () =>
                            handleWhoAnswer(
                                Number(
                                    button.dataset
                                        .optionIndex
                                )
                            )
                    );
                }
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Who Render Error:",
                error
            );
        }
    }

    function handleWhoAnswer(index) {
        try {
            const question =
                WHO_AM_I_QUESTIONS[
                    currentWhoQuestion
                ];

            const answer =
                question.options[index];

            if (!answer) {
                return;
            }

            whoAmIAnswers.push(
                answer.type
            );

            currentWhoQuestion += 1;

            renderWhoQuestion();
        } catch (error) {
            console.error(
                "ZIVOZONE Who Answer Error:",
                error
            );
        }
    }

    function finishWhoAmI() {
        try {
            const counts = {};

            whoAmIAnswers.forEach(
                (type) => {
                    counts[type] =
                        (counts[type] || 0) + 1;
                }
            );

            let personality =
                "explorer";

            let highest = 0;

            Object.entries(counts).forEach(
                ([type, count]) => {
                    if (count > highest) {
                        highest = count;
                        personality = type;
                    }
                }
            );

            player.personality =
                personality;

            player.stats.psychology += 1;

            addXP(50);

            addCoins(8);

            addAchievement(
                "who_am_i"
            );

            savePlayer();

            const result =
                getPersonalityResult(
                    personality
                );

            openModal(`
                <div
                    dir="rtl"
                    style="text-align:center;"
                >

                    <div style="font-size:65px;">
                        🧠
                    </div>

                    <h2>
                        ${escapeHTML(
                            result.title
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            result.description
                        )}
                    </p>

                    <hr>

                    <p>
                        نقاطك:
                        ${escapeHTML(
                            result.traits
                        )}
                    </p>

                    <small>
                        ${getTranslation(
                            "whoDescription"
                        )}
                    </small>

                </div>
            `);
        } catch (error) {
            console.error(
                "ZIVOZONE Personality Error:",
                error
            );
        }
    }

    function getPersonalityResult(type) {
        const results = {
            analyst: {
                title: "أنت المحلل 🔍",
                description:
                    "تميل إلى التفكير العميق وتحليل التفاصيل قبل اتخاذ القرارات.",
                traits:
                    "تحليل • ملاحظة • منطق"
            },

            thinker: {
                title: "أنت المفكر 🧠",
                description:
                    "تحب التعلم وفهم الأشياء من جذورها ولا تتسرع في الحكم.",
                traits:
                    "تعلم • تفكير • معرفة"
            },

            challenger: {
                title: "أنت المتحدي ⚔️",
                description:
                    "تحب المنافسة والإنجاز واختبار قدراتك باستمرار.",
                traits:
                    "منافسة • سرعة • جرأة"
            },

            explorer: {
                title: "أنت المستكشف 🌍",
                description:
                    "فضولي وتحب اكتشاف التجارب والاحتمالات الجديدة.",
                traits:
                    "فضول • تجربة • اكتشاف"
            },

            strategist: {
                title: "أنت الاستراتيجي ♟️",
                description:
                    "تميل إلى التخطيط والتفكير في الخطوة القادمة قبل التحرك.",
                traits:
                    "تخطيط • رؤية • قرار"
            }
        };

        return (
            results[type] ||
            results.explorer
        );
    }

    /* ============================================================
       21. ZIVO AI - LOCAL DEMO
    ============================================================ */

    function openAI() {
        try {
            openModal(`
                <div dir="rtl">

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                        "
                    >
                        <div
                            style="
                                width:50px;
                                height:50px;
                                border-radius:50%;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                background:#111827;
                                font-size:25px;
                            "
                        >
                            🤖
                        </div>

                        <div>
                            <h2>
                                ZIVO AI
                            </h2>

                            <small>
                                Online • Demo
                            </small>
                        </div>
                    </div>

                    <div
                        id="zivo-ai-messages"
                        style="
                            margin-top:20px;
                            min-height:220px;
                            max-height:350px;
                            overflow:auto;
                            padding:15px;
                            background:#050914;
                            border-radius:18px;
                        "
                    >
                        <div
                            style="
                                padding:12px;
                                background:#111827;
                                border-radius:12px;
                                margin-bottom:10px;
                            "
                        >
                            ${getTranslation(
                                "demoAI"
                            )}
                        </div>
                    </div>

                    <form
                        id="zivo-ai-form"
                        style="
                            display:flex;
                            gap:8px;
                            margin-top:15px;
                        "
                    >

                        <input
                            id="zivo-ai-input"
                            type="text"
                            maxlength="500"
                            placeholder="${getTranslation(
                                "writeQuestion"
                            )}"
                            autocomplete="off"
                            style="
                                flex:1;
                                padding:13px;
                                border-radius:12px;
                                border:1px solid #334155;
                            "
                        >

                        <button
                            type="submit"
                            style="
                                padding:12px 18px;
                                border:0;
                                border-radius:12px;
                                cursor:pointer;
                            "
                        >
                            إرسال
                        </button>

                    </form>

                </div>
            `);

            document
                .getElementById(
                    "zivo-ai-form"
                )
                ?.addEventListener(
                    "submit",
                    handleAIMessage
                );
        } catch (error) {
            console.error(
                "ZIVOZONE AI Error:",
                error
            );
        }
    }

    function handleAIMessage(event) {
        event.preventDefault();

        try {
            const input =
                document.getElementById(
                    "zivo-ai-input"
                );

            const messages =
                document.getElementById(
                    "zivo-ai-messages"
                );

            if (!input || !messages) {
                return;
            }

            const question =
                safeText(input.value);

            if (!question) {
                return;
            }

            const userMessage =
                document.createElement("div");

            userMessage.style.cssText = `
                padding:12px;
                background:#172554;
                border-radius:12px;
                margin-bottom:10px;
            `;

            userMessage.textContent =
                question;

            messages.appendChild(
                userMessage
            );

            input.value = "";

            const thinking =
                document.createElement("div");

            thinking.id =
                "zivo-ai-thinking";

            thinking.style.cssText = `
                padding:12px;
                background:#111827;
                border-radius:12px;
                margin-bottom:10px;
            `;

            thinking.textContent =
                getTranslation(
                    "aiThinking"
                );

            messages.appendChild(
                thinking
            );

            messages.scrollTop =
                messages.scrollHeight;

            setTimeout(() => {
                thinking.remove();

                const response =
                    generateLocalAIResponse(
                        question
                    );

                const aiMessage =
                    document.createElement(
                        "div"
                    );

                aiMessage.style.cssText = `
                    padding:12px;
                    background:#111827;
                    border-radius:12px;
                    margin-bottom:10px;
                `;

                aiMessage.textContent =
                    response;

                messages.appendChild(
                    aiMessage
                );

                messages.scrollTop =
                    messages.scrollHeight;
            }, 700);
        } catch (error) {
            console.error(
                "ZIVOZONE AI Message Error:",
                error
            );
        }
    }

    function generateLocalAIResponse(question) {
        const lower =
            question.toLowerCase();

        if (
            lower.includes("لعبة") ||
            lower.includes("game")
        ) {
            return "🎮 أنصحك بتجربة الألعاب والتحديات ورفع XP حتى تفتح مستويات جديدة داخل ZIVOZONE.";
        }

        if (
            lower.includes("من أنا") ||
            lower.includes("personality")
        ) {
            return "🧠 يمكنك تشغيل اختبار «من أنا؟» وسأحلل نمط إجاباتك بشكل ترفيهي.";
        }

        if (
            lower.includes("xp") ||
            lower.includes("مستوى")
        ) {
            return `⭐ مستواك الحالي هو ${player.level} ولديك ${player.xp} XP.`;
        }

        if (
            lower.includes("عملة") ||
            lower.includes("coin")
        ) {
            return `🪙 لديك حاليًا ${player.coins} Z-Coin تجريبية.`;
        }

        if (
            lower.includes("رياضة") ||
            lower.includes("football")
        ) {
            return "⚽ قسم الرياضة في ZIVOZONE سيكون مركزًا للأخبار والنتائج والتحليلات الرياضية.";
        }

        return `🤖 سؤال ممتاز! في النسخة الحالية أستطيع مساعدتك داخل عالم ZIVOZONE. سؤالك كان: "${question}"`;
    }

    /* ============================================================
       22. LANGUAGE SYSTEM
    ============================================================ */

    function changeLanguage(language) {
        try {
            if (
                !CONFIG.supportedLanguages.includes(
                    language
                )
            ) {
                return;
            }

            player.language =
                language;

            localStorage.setItem(
                CONFIG.languageKey,
                language
            );

            savePlayer();

            applyLanguage();

            updatePlayerUI();

            showToast(
                CONFIG.languages[language]
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Language Error:",
                error
            );
        }
    }

    function applyLanguage() {
        try {
            const language =
                player.language ||
                CONFIG.defaultLanguage;

            document.documentElement.lang =
                language;

            document.documentElement.dir =
                language === "ar"
                    ? "rtl"
                    : "ltr";

            $$("[data-i18n]").forEach(
                (element) => {
                    const key =
                        element.dataset.i18n;

                    element.textContent =
                        getTranslation(key);
                }
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Apply Language Error:",
                error
            );
        }
    }

    /* ============================================================
       23. NAVIGATION
    ============================================================ */

    function setupNavigation() {
        try {
            const links =
                $$("a[href^='#']");

            links.forEach(
                (link) => {
                    link.addEventListener(
                        "click",
                        (event) => {
                            const href =
                                link.getAttribute(
                                    "href"
                                );

                            if (
                                !href ||
                                href === "#"
                            ) {
                                return;
                            }

                            const target =
                                document.querySelector(
                                    href
                                );

                            if (target) {
                                event.preventDefault();

                                target.scrollIntoView(
                                    {
                                        behavior:
                                            "smooth",
                                        block:
                                            "start"
                                    }
                                );
                            }
                        }
                    );
                }
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Navigation Error:",
                error
            );
        }
    }

    /* ============================================================
       24. AUTO BUTTON DETECTION
    ============================================================ */

    function setupButtons() {
        try {
            $$("button").forEach(
                (button) => {
                    if (
                        button.dataset
                            .zivoBound ===
                        "true"
                    ) {
                        return;
                    }

                    const text =
                        safeText(
                            button.textContent
                        ).toLowerCase();

                    if (
                        text.includes("اختبر عقلك") ||
                        text === "العب الآن" ||
                        text.includes("ذكاء")
                    ) {
                        button.addEventListener(
                            "click",
                            () =>
                                startGame(
                                    "intelligence"
                                )
                        );
                    }

                    if (
                        text.includes("الغرفة") ||
                        text.includes("رعب") ||
                        text.includes("هل تجرؤ")
                    ) {
                        button.addEventListener(
                            "click",
                            () =>
                                startGame(
                                    "horror"
                                )
                        );
                    }

                    if (
                        text.includes("العلوم") ||
                        text.includes("علم")
                    ) {
                        button.addEventListener(
                            "click",
                            () =>
                                startGame(
                                    "science"
                                )
                        );
                    }

                    if (
                        text.includes("تحدي اليوم") ||
                        text.includes("اليوم") ||
                        text.includes("daily")
                    ) {
                        button.addEventListener(
                            "click",
                            startDailyChallenge
                        );
                    }

                    if (
                        text.includes("من أنا") ||
                        text.includes("اكتشف")
                    ) {
                        button.addEventListener(
                            "click",
                            startWhoAmI
                        );
                    }

                    if (
                        text.includes("ai") ||
                        text.includes(
                            "الذكاء الاصطناعي"
                        )
                    ) {
                        button.addEventListener(
                            "click",
                            openAI
                        );
                    }

                    if (
                        text.includes("ملفي") ||
                        text.includes("profile")
                    ) {
                        button.addEventListener(
                            "click",
                            openProfile
                        );
                    }

                    button.dataset.zivoBound =
                        "true";
                }
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Button Error:",
                error
            );
        }
    }

    /* ============================================================
       25. LANGUAGE SELECTOR
    ============================================================ */

    function setupLanguageSelector() {
        try {
            const selectors =
                $$(
                    "#languageSelector, [data-language-selector]"
                );

            selectors.forEach(
                (selector) => {
                    selector.value =
                        player.language;

                    selector.addEventListener(
                        "change",
                        (event) => {
                            changeLanguage(
                                event.target.value
                            );
                        }
                    );
                }
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Language Selector Error:",
                error
            );
        }
    }

    /* ============================================================
       26. LOGIN BUTTON
    ============================================================ */

    function setupLogin() {
        try {
            const loginButtons =
                $$(
                    "#loginButton, [data-login]"
                );

            loginButtons.forEach(
                (button) => {
                    button.addEventListener(
                        "click",
                        openProfile
                    );
                }
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Login Error:",
                error
            );
        }
    }

    /* ============================================================
       27. DATE SEED
    ============================================================ */

    function getDateSeed() {
        const today =
            getTodayKey();

        let hash = 0;

        for (
            let index = 0;
            index < today.length;
            index++
        ) {
            hash =
                (
                    (hash << 5) -
                    hash +
                    today.charCodeAt(index)
                ) |
                0;
        }

        return Math.abs(hash);
    }

    /* ============================================================
       28. SHUFFLE
    ============================================================ */

    function shuffle(array) {
        try {
            for (
                let index =
                    array.length - 1;
                index > 0;
                index--
            ) {
                const randomIndex =
                    Math.floor(
                        Math.random() *
                        (index + 1)
                    );

                [
                    array[index],
                    array[randomIndex]
                ] = [
                    array[randomIndex],
                    array[index]
                ];
            }

            return array;
        } catch (error) {
            console.error(
                "ZIVOZONE Shuffle Error:",
                error
            );

            return array;
        }
    }

    function deterministicShuffle(
        array,
        seed
    ) {
        const result =
            [...array];

        let value = seed;

        for (
            let index =
                result.length - 1;
            index > 0;
            index--
        ) {
            value =
                (
                    value * 9301 +
                    49297
                ) %
                233280;

            const random =
                value /
                233280;

            const randomIndex =
                Math.floor(
                    random *
                    (index + 1)
                );

            [
                result[index],
                result[randomIndex]
            ] = [
                result[randomIndex],
                result[index]
            ];
        }

        return result;
    }

    /* ============================================================
       29. CATEGORY NAMES
    ============================================================ */

    function getCategoryName(type) {
        const names = {
            intelligence:
                getTranslation(
                    "intelligence"
                ),

            science:
                getTranslation(
                    "science"
                ),

            horror:
                getTranslation(
                    "horror"
                ),

            psychology:
                getTranslation(
                    "psychology"
                ),

            daily:
                getTranslation(
                    "dailyTitle"
                )
        };

        return (
            names[type] ||
            "ZIVOZONE"
        );
    }

    /* ============================================================
       30. SECURITY HELPERS
    ============================================================ */

    function escapeHTML(value) {
        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            String(value);

        return div.innerHTML;
    }

    function escapeAttribute(value) {
        return escapeHTML(
            value
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

    /* ============================================================
       31. GLOBAL ZIVO API
    ============================================================ */

    window.ZIVOZONE = {
        getPlayer: () => ({
            ...player,
            stats: {
                ...player.stats
            }
        }),

        startGame,

        startDailyChallenge,

        startWhoAmI,

        openAI,

        openProfile,

        addXP,

        addCoins,

        changeLanguage,

        showToast
    };

    /* ============================================================
       32. INITIALIZATION
    ============================================================ */

    function initializeZivozone() {
        try {
            const savedLanguage =
                localStorage.getItem(
                    CONFIG.languageKey
                );

            if (
                CONFIG.supportedLanguages.includes(
                    savedLanguage
                )
            ) {
                player.language =
                    savedLanguage;
            }

            updateStreak();

            applyLanguage();

            updatePlayerUI();

            setupNavigation();

            setupButtons();

            setupLanguageSelector();

            setupLogin();

            createModal();

            console.log(
                "ZIVOZONE initialized successfully."
            );

            console.log(
                "Player:",
                player
            );
        } catch (error) {
            console.error(
                "ZIVOZONE Initialization Error:",
                error
            );
        }
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeZivozone
        );
    } else {
        initializeZivozone();
    }

})();
