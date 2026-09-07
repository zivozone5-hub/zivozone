"use strict";

/*
 * =========================================================
 * ZIVOZONE — app.js
 * Version 3.0
 *
 * Front-end prototype
 * لا يحتوي هذا الملف على مفاتيح API أو كلمات مرور أو بيانات حساسة.
 * جميع بيانات النسخة التجريبية تحفظ محلياً بواسطة localStorage.
 * =========================================================
 */

(() => {
    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const CONFIG = Object.freeze({
        storageKey: "zivozone_player_v3",
        languageKey: "zivozone_language_v3",
        dailyKey: "zivozone_daily_v3",
        maxAiMessages: 30,
        maxNameLength: 40,
        maxEmailLength: 120
    });


    /* =====================================================
       TRANSLATIONS
    ===================================================== */

    const translations = {
        ar: {
            loading: "جاري تجهيز عالمك...",
            home: "الرئيسية",
            games: "الألعاب",
            challenges: "التحديات",
            ai: "ZIVO AI",
            identity: "من أنا؟",
            sports: "الرياضة",
            profile: "ملفي",
            login: "تسجيل الدخول",
            heroTitle: "عالمك يبدأ من هنا",
            heroText:
                "ألعاب وتحديات وذكاء ورعب وعلوم ورياضة واكتشاف للشخصية في عالم رقمي واحد.",
            startPlaying: "ابدأ اللعب",
            discoverMe: "اكتشف نفسك",
            languages: "لغات",
            gameModes: "أنماط ألعاب",
            ad: "إعلان",
            adTitle: "مساحتك الإعلانية هنا",
            adText: "مكان جاهز للإعلانات والرعاة عند إطلاق المنصة.",
            details: "التفاصيل",
            gamesTitle: "العب وارفع مستواك",
            speedTitle: "اختبار سرعة الذكاء",
            speedDesc: "أسئلة تتدرج حسب مستوى اللاعب وعمره.",
            horrorTitle: "الغرفة المظلمة",
            horrorDesc: "قصة تفاعلية، اختياراتك تغيّر النهاية.",
            scienceTitle: "تحدي العلوم",
            scienceDesc: "معلومات علمية متدرجة وممتعة.",
            dailyTitle: "تحدي ZIVO اليومي",
            dailyDesc: "مهمة يومية واحدة مع مكافأة خاصة.",
            playNow: "العب الآن",
            start: "ابدأ",
            challengeTitle: "مركز التحديات",
            identityTitle: "اكتشف شخصيتك داخل ZIVOZONE",
            identityText:
                "اختبار ترفيهي يعتمد على اختياراتك داخل التجربة، ثم يعطيك وصفًا عامًا لنمط اللعب والتفكير. ليس تشخيصًا نفسيًا أو طبيًا.",
            takeTest: "ابدأ الاختبار",
            aiTitle: "مساعد ZIVO الذكي",
            aiWelcome:
                "أهلاً بك في ZIVO AI 🤖 اسألني عن الألعاب أو مستواك أو اطلب فكرة لتحدٍ جديد.",
            aiPlaceholder: "اكتب سؤالك...",
            send: "إرسال",
            aiNote:
                "نسخة ZIVO AI الحالية تجريبية وتعمل من الواجهة. سيتم لاحقًا ربط نموذج ذكاء اصطناعي حقيقي من خلال Backend آمن.",
            sportsTitle: "أخبار الرياضة العالمية",
            refresh: "تحديث",
            editProfile: "إنشاء/تعديل الملف",
            profileNote:
                "بيانات النسخة التجريبية محفوظة محليًا على جهازك. لا تضع كلمات مرور أو بيانات حساسة هنا."
        },

        en: {
            loading: "Preparing your world...",
            home: "Home",
            games: "Games",
            challenges: "Challenges",
            ai: "ZIVO AI",
            identity: "Who Am I?",
            sports: "Sports",
            profile: "Profile",
            login: "Login",
            heroTitle: "Your world starts here",
            heroText:
                "Games, challenges, intelligence, horror, science, sports and self-discovery in one digital world.",
            startPlaying: "Start Playing",
            discoverMe: "Discover Yourself",
            languages: "Languages",
            gameModes: "Game Modes",
            ad: "Advertisement",
            adTitle: "Your Advertisement Here",
            adText: "A ready advertising space for future sponsors.",
            details: "Details",
            gamesTitle: "Play & Level Up",
            speedTitle: "Speed IQ",
            speedDesc: "Questions adapt to your age and level.",
            horrorTitle: "The Dark Room",
            horrorDesc: "An interactive story where your choices change the ending.",
            scienceTitle: "Science Challenge",
            scienceDesc: "Progressive and fun science questions.",
            dailyTitle: "ZIVO Daily Challenge",
            dailyDesc: "One daily mission with a special reward.",
            playNow: "Play Now",
            start: "Start",
            challengeTitle: "Challenge Center",
            identityTitle: "Discover Your ZIVO Personality",
            identityText:
                "A fun entertainment test based on your choices. It provides a general gaming and thinking profile, not a psychological or medical diagnosis.",
            takeTest: "Take the Test",
            aiTitle: "ZIVO AI Assistant",
            aiWelcome:
                "Welcome to ZIVO AI 🤖 Ask me about games, your level, or request a new challenge idea.",
            aiPlaceholder: "Write your question...",
            send: "Send",
            aiNote:
                "The current ZIVO AI version is a front-end prototype. A real AI model can later be connected through a secure backend.",
            sportsTitle: "Global Sports News",
            refresh: "Refresh",
            editProfile: "Create/Edit Profile",
            profileNote:
                "Prototype data is stored locally on your device. Do not enter passwords or sensitive information here."
        },

        fr: {
            loading: "Préparation de votre monde...",
            home: "Accueil",
            games: "Jeux",
            challenges: "Défis",
            ai: "ZIVO AI",
            identity: "Qui suis-je ?",
            sports: "Sport",
            profile: "Profil",
            login: "Connexion",
            heroTitle: "Votre monde commence ici",
            heroText: "Jeux, défis, intelligence, horreur, science, sport et découverte de soi.",
            startPlaying: "Jouer",
            discoverMe: "Me découvrir",
            languages: "Langues",
            gameModes: "Modes de jeu",
            ad: "Publicité",
            adTitle: "Votre publicité ici",
            adText: "Espace publicitaire prêt pour les futurs sponsors.",
            details: "Détails",
            gamesTitle: "Jouez et progressez",
            speedTitle: "QI Rapide",
            speedDesc: "Questions adaptées à votre âge et votre niveau.",
            horrorTitle: "La chambre sombre",
            horrorDesc: "Une histoire interactive où vos choix changent la fin.",
            scienceTitle: "Défi scientifique",
            scienceDesc: "Questions scientifiques progressives et amusantes.",
            dailyTitle: "Défi quotidien ZIVO",
            dailyDesc: "Une mission quotidienne avec une récompense.",
            playNow: "Jouer",
            start: "Commencer",
            challengeTitle: "Centre des défis",
            identityTitle: "Découvrez votre personnalité ZIVO",
            identityText: "Un test ludique basé sur vos choix. Il ne constitue pas un diagnostic médical ou psychologique.",
            takeTest: "Commencer le test",
            aiTitle: "Assistant ZIVO AI",
            aiWelcome: "Bienvenue sur ZIVO AI 🤖",
            aiPlaceholder: "Écrivez votre question...",
            send: "Envoyer",
            aiNote: "Version expérimentale de ZIVO AI.",
            sportsTitle: "Actualités sportives mondiales",
            refresh: "Actualiser",
            editProfile: "Créer/Modifier le profil",
            profileNote: "Les données de démonstration sont enregistrées localement."
        },

        es: {
            loading: "Preparando tu mundo...",
            home: "Inicio",
            games: "Juegos",
            challenges: "Desafíos",
            ai: "ZIVO AI",
            identity: "¿Quién soy?",
            sports: "Deportes",
            profile: "Perfil",
            login: "Iniciar sesión",
            heroTitle: "Tu mundo comienza aquí",
            heroText: "Juegos, desafíos, inteligencia, terror, ciencia, deportes y autodescubrimiento.",
            startPlaying: "Jugar",
            discoverMe: "Descubrirme",
            languages: "Idiomas",
            gameModes: "Modos de juego",
            ad: "Publicidad",
            adTitle: "Tu publicidad aquí",
            adText: "Espacio publicitario preparado para futuros patrocinadores.",
            details: "Detalles",
            gamesTitle: "Juega y sube de nivel",
            speedTitle: "IQ Rápido",
            speedDesc: "Preguntas adaptadas a tu edad y nivel.",
            horrorTitle: "La habitación oscura",
            horrorDesc: "Historia interactiva donde tus decisiones cambian el final.",
            scienceTitle: "Desafío científico",
            scienceDesc: "Preguntas científicas progresivas y divertidas.",
            dailyTitle: "Desafío diario ZIVO",
            dailyDesc: "Una misión diaria con recompensa especial.",
            playNow: "Jugar ahora",
            start: "Comenzar",
            challengeTitle: "Centro de desafíos",
            identityTitle: "Descubre tu personalidad ZIVO",
            identityText: "Un test divertido basado en tus elecciones. No es un diagnóstico médico o psicológico.",
            takeTest: "Hacer el test",
            aiTitle: "Asistente ZIVO AI",
            aiWelcome: "Bienvenido a ZIVO AI 🤖",
            aiPlaceholder: "Escribe tu pregunta...",
            send: "Enviar",
            aiNote: "Versión experimental de ZIVO AI.",
            sportsTitle: "Noticias deportivas mundiales",
            refresh: "Actualizar",
            editProfile: "Crear/Editar perfil",
            profileNote: "Los datos de demostración se guardan localmente."
        },

        tr: {
            loading: "Dünyanız hazırlanıyor...",
            home: "Ana Sayfa",
            games: "Oyunlar",
            challenges: "Meydan Okumalar",
            ai: "ZIVO AI",
            identity: "Ben Kimim?",
            sports: "Spor",
            profile: "Profil",
            login: "Giriş",
            heroTitle: "Dünyan burada başlıyor",
            heroText: "Oyunlar, meydan okumalar, zeka, korku, bilim, spor ve kendini keşfetme.",
            startPlaying: "Oyna",
            discoverMe: "Kendini Keşfet",
            languages: "Diller",
            gameModes: "Oyun Modları",
            ad: "Reklam",
            adTitle: "Reklam Alanınız",
            adText: "Gelecekteki sponsorlar için hazır reklam alanı.",
            details: "Detaylar",
            gamesTitle: "Oyna ve Seviye Atla",
            speedTitle: "Hızlı Zeka",
            speedDesc: "Sorular yaşınıza ve seviyenize göre uyarlanır.",
            horrorTitle: "Karanlık Oda",
            horrorDesc: "Seçimlerinizin sonu değiştirdiği interaktif hikâye.",
            scienceTitle: "Bilim Mücadelesi",
            scienceDesc: "Eğlenceli ve seviyeli bilim soruları.",
            dailyTitle: "ZIVO Günlük Mücadelesi",
            dailyDesc: "Özel ödüllü günlük görev.",
            playNow: "Şimdi Oyna",
            start: "Başla",
            challengeTitle: "Meydan Okuma Merkezi",
            identityTitle: "ZIVO Kişiliğini Keşfet",
            identityText: "Seçimlerinize dayalı eğlenceli bir test. Tıbbi veya psikolojik teşhis değildir.",
            takeTest: "Teste Başla",
            aiTitle: "ZIVO AI Asistanı",
            aiWelcome: "ZIVO AI'a hoş geldiniz 🤖",
            aiPlaceholder: "Sorunuzu yazın...",
            send: "Gönder",
            aiNote: "ZIVO AI deneysel sürüm.",
            sportsTitle: "Dünya Spor Haberleri",
            refresh: "Yenile",
            editProfile: "Profil Oluştur/Düzenle",
            profileNote: "Demo verileri cihazınızda yerel olarak saklanır."
        },

        de: {
            loading: "Deine Welt wird vorbereitet...",
            home: "Startseite",
            games: "Spiele",
            challenges: "Herausforderungen",
            ai: "ZIVO AI",
            identity: "Wer bin ich?",
            sports: "Sport",
            profile: "Profil",
            login: "Anmelden",
            heroTitle: "Deine Welt beginnt hier",
            heroText: "Spiele, Herausforderungen, Intelligenz, Horror, Wissenschaft, Sport und Selbstentdeckung.",
            startPlaying: "Spielen",
            discoverMe: "Mich entdecken",
            languages: "Sprachen",
            gameModes: "Spielmodi",
            ad: "Werbung",
            adTitle: "Ihre Werbefläche",
            adText: "Bereite Werbefläche für zukünftige Sponsoren.",
            details: "Details",
            gamesTitle: "Spielen & Leveln",
            speedTitle: "Schnell-IQ",
            speedDesc: "Fragen passen sich Alter und Level an.",
            horrorTitle: "Der dunkle Raum",
            horrorDesc: "Interaktive Geschichte, deren Ende von deinen Entscheidungen abhängt.",
            scienceTitle: "Wissenschafts-Challenge",
            scienceDesc: "Fortschrittliche und unterhaltsame Wissenschaftsfragen.",
            dailyTitle: "ZIVO Tages-Challenge",
            dailyDesc: "Eine tägliche Mission mit besonderer Belohnung.",
            playNow: "Jetzt spielen",
            start: "Start",
            challengeTitle: "Challenge Center",
            identityTitle: "Entdecke deine ZIVO-Persönlichkeit",
            identityText: "Ein unterhaltsamer Test basierend auf deinen Entscheidungen. Keine medizinische oder psychologische Diagnose.",
            takeTest: "Test starten",
            aiTitle: "ZIVO AI Assistent",
            aiWelcome: "Willkommen bei ZIVO AI 🤖",
            aiPlaceholder: "Frage eingeben...",
            send: "Senden",
            aiNote: "Experimentelle ZIVO AI Version.",
            sportsTitle: "Globale Sportnachrichten",
            refresh: "Aktualisieren",
            editProfile: "Profil erstellen/bearbeiten",
            profileNote: "Demodaten werden lokal auf deinem Gerät gespeichert."
        }
    };


    /* =====================================================
       QUESTIONS
       ===================================================== */

    const questionBank = {
        easy: [
            {
                question: "ما هو الكوكب المعروف بالكوكب الأحمر؟",
                answers: ["الأرض", "المريخ", "المشتري", "الزهرة"],
                correct: 1
            },
            {
                question: "كم عدد أيام الأسبوع؟",
                answers: ["5", "6", "7", "8"],
                correct: 2
            },
            {
                question: "أي حيوان يُعرف بأنه ملك الغابة؟",
                answers: ["النمر", "الأسد", "الفيل", "الذئب"],
                correct: 1
            },
            {
                question: "كم يساوي 5 + 7؟",
                answers: ["10", "11", "12", "13"],
                correct: 2
            }
        ],

        medium: [
            {
                question: "إذا كان لديك 3 صناديق وفي كل صندوق 4 كرات، كم كرة لديك؟",
                answers: ["7", "10", "12", "14"],
                correct: 2
            },
            {
                question: "ما الغاز الأكثر وجودًا في الغلاف الجوي للأرض؟",
                answers: ["الأكسجين", "النيتروجين", "الهيدروجين", "ثاني أكسيد الكربون"],
                correct: 1
            },
            {
                question: "أي رقم يأتي بعد 2، 4، 8، 16؟",
                answers: ["20", "24", "30", "32"],
                correct: 3
            },
            {
                question: "ما العضو المسؤول بشكل أساسي عن ضخ الدم؟",
                answers: ["الرئة", "الكبد", "القلب", "المعدة"],
                correct: 2
            }
        ],

        hard: [
            {
                question: "ما العدد التالي في السلسلة: 3، 6، 12، 24، ؟",
                answers: ["36", "42", "48", "52"],
                correct: 2
            },
            {
                question: "أي جزء من الخلية يحتوي عادةً على المادة الوراثية؟",
                answers: ["النواة", "الغشاء", "السيتوبلازم", "الجدار"],
                correct: 0
            },
            {
                question: "إذا كانت كل A هي B، وبعض B هي C، فهل يلزم أن تكون كل A هي C؟",
                answers: ["نعم دائمًا", "لا يلزم", "فقط أحيانًا", "لا يمكن معرفة B"],
                correct: 1
            },
            {
                question: "ما ناتج 15 × 8؟",
                answers: ["100", "110", "120", "130"],
                correct: 2
            }
        ]
    };


    const scienceQuestions = [
        {
            question: "ما أقرب نجم إلى الأرض بعد الشمس؟",
            answers: ["سيريوس", "بروكسيما سنتوري", "فيغا", "الشعرى"],
            correct: 1
        },
        {
            question: "ما الوحدة الأساسية لقياس القوة في النظام الدولي؟",
            answers: ["جول", "واط", "نيوتن", "باسكال"],
            correct: 2
        },
        {
            question: "أي عضو يساعد الإنسان على التنفس؟",
            answers: ["القلب", "الرئتان", "المعدة", "الكلى"],
            correct: 1
        },
        {
            question: "ما حالة الماء عند درجة تجمده الطبيعية؟",
            answers: ["غاز", "بلازما", "سائل", "صلب"],
            correct: 3
        },
        {
            question: "ما مركز النظام الشمسي؟",
            answers: ["الأرض", "القمر", "الشمس", "المشتري"],
            correct: 2
        }
    ];


    /* =====================================================
       HORROR STORY
    ===================================================== */

    const horrorScenes = [
        {
            text: "تدخل غرفة مظلمة وتسمع صوتًا خلفك. أمامك بابان.",
            choices: [
                {
                    text: "افتح الباب الأيسر",
                    next: 1,
                    xp: 15
                },
                {
                    text: "ابقَ مكانك واستمع",
                    next: 2,
                    xp: 20
                }
            ]
        },

        {
            text: "الباب يفتح ببطء. ترى ممرًا طويلًا وفي نهايته ضوء خافت.",
            choices: [
                {
                    text: "اتجه نحو الضوء",
                    next: 3,
                    xp: 20
                },
                {
                    text: "عد إلى الغرفة",
                    next: 2,
                    xp: 10
                }
            ]
        },

        {
            text: "تسكت تمامًا. الصوت يقترب ثم يتوقف فجأة.",
            choices: [
                {
                    text: "افتح الباب خلفك",
                    next: 3,
                    xp: 25
                },
                {
                    text: "انتظر",
                    next: 4,
                    xp: 15
                }
            ]
        },

        {
            text: "تصل إلى غرفة صغيرة فيها شاشة تعرض اسمك. يظهر سؤال: هل ستكمل؟",
            choices: [
                {
                    text: "نعم، أكمل",
                    next: 5,
                    xp: 30
                },
                {
                    text: "أعود",
                    next: 4,
                    xp: 10
                }
            ]
        },

        {
            text: "الظلام يزداد، لكنك تكتشف أن الصوت كان تسجيلًا قديمًا.",
            choices: [
                {
                    text: "أكمل البحث",
                    next: 5,
                    xp: 25
                },
                {
                    text: "أنهي التجربة",
                    next: 5,
                    xp: 15
                }
            ]
        },

        {
            text: "تصل إلى النهاية. لقد واجهت الخوف واتخذت قراراتك بنفسك.",
            choices: []
        }
    ];


    /* =====================================================
       IDENTITY QUESTIONS
    ===================================================== */

    const identityQuestions = [
        {
            question: "عندما تواجه مشكلة صعبة، ماذا تفعل أولًا؟",
            answers: [
                { text: "أحللها بهدوء", type: "analyst" },
                { text: "أجرب بسرعة", type: "explorer" },
                { text: "أسأل الآخرين", type: "social" },
                { text: "أبحث عن طريقة مختلفة", type: "creative" }
            ]
        },

        {
            question: "أي نوع من الألعاب يجذبك أكثر؟",
            answers: [
                { text: "الألغاز", type: "analyst" },
                { text: "المغامرة", type: "explorer" },
                { text: "المنافسة", type: "social" },
                { text: "الإبداع", type: "creative" }
            ]
        },

        {
            question: "إذا خسرت تحديًا، ماذا تفعل؟",
            answers: [
                { text: "أراجع أخطائي", type: "analyst" },
                { text: "أعيد المحاولة فورًا", type: "explorer" },
                { text: "أتحدى شخصًا آخر", type: "social" },
                { text: "أغير الاستراتيجية", type: "creative" }
            ]
        },

        {
            question: "اختر الوصف الأقرب لك.",
            answers: [
                { text: "أحب التفاصيل", type: "analyst" },
                { text: "أحب التجربة", type: "explorer" },
                { text: "أحب التفاعل", type: "social" },
                { text: "أحب الأفكار الجديدة", type: "creative" }
            ]
        }
    ];


    /* =====================================================
       SPORTS DEMO DATA
    ===================================================== */

    const sportsNews = [
        {
            category: "FOOTBALL",
            title: "آخر أخبار كرة القدم العالمية",
            text: "قسم رياضي تجريبي جاهز للربط لاحقًا بمصدر أخبار رياضي مباشر."
        },
        {
            category: "CHAMPIONS",
            title: "مباريات ونتائج وبطولات",
            text: "سيتم تطوير هذا القسم ليعرض الأخبار والنتائج والجداول بشكل مباشر."
        },
        {
            category: "WORLD",
            title: "رياضة حول العالم",
            text: "مساحة مخصصة لأهم الأحداث الرياضية العالمية."
        }
    ];


    /* =====================================================
       STATE
    ===================================================== */

    const defaultPlayer = {
        id: createPlayerId(),
        name: "Guest",
        email: "",
        age: 18,
        xp: 0,
        coins: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        identity: null,
        createdAt: new Date().toISOString()
    };

    let player = loadPlayer();

    let currentLanguage =
        localStorage.getItem(CONFIG.languageKey) || "ar";

    let currentQuiz = null;
    let currentHorrorScene = 0;
    let identityState = null;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ = (selector, parent = document) => {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.error("ZIVOZONE selector error:", error);
            return null;
        }
    };


    const $$ = (selector, parent = document) => {
        try {
            return Array.from(parent.querySelectorAll(selector));
        } catch (error) {
            console.error("ZIVOZONE selectors error:", error);
            return [];
        }
    };


    const createElement = (tag, className = "") => {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        return element;
    };


    /* =====================================================
       STORAGE
    ===================================================== */

    function createPlayerId() {
        try {
            if (window.crypto && crypto.randomUUID) {
                return crypto.randomUUID();
            }
        } catch (error) {
            console.warn("Crypto UUID unavailable:", error);
        }

        return `zivo-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;
    }


    function loadPlayer() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);

            if (!saved) {
                return { ...defaultPlayer };
            }

            const parsed = JSON.parse(saved);

            if (!parsed || typeof parsed !== "object") {
                return { ...defaultPlayer };
            }

            return {
                ...defaultPlayer,
                ...parsed,
                xp: sanitizeNumber(parsed.xp, 0),
                coins: sanitizeNumber(parsed.coins, 0),
                gamesPlayed: sanitizeNumber(parsed.gamesPlayed, 0),
                gamesWon: sanitizeNumber(parsed.gamesWon, 0),
                age: sanitizeAge(parsed.age)
            };
        } catch (error) {
            console.error("Unable to load player:", error);
            return { ...defaultPlayer };
        }
    }


    function savePlayer() {
        try {
            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(player)
            );
        } catch (error) {
            console.error("Unable to save player:", error);

            showToast(
                "تعذر حفظ البيانات محليًا.",
                "error"
            );
        }
    }


    function sanitizeNumber(value, fallback = 0) {
        const number = Number(value);

        if (!Number.isFinite(number) || number < 0) {
            return fallback;
        }

        return Math.floor(number);
    }


    function sanitizeAge(value) {
        const age = Number(value);

        if (!Number.isFinite(age)) {
            return 18;
        }

        return Math.min(
            100,
            Math.max(6, Math.floor(age))
        );
    }


    function escapeText(value, maxLength = 500) {
        return String(value ?? "")
            .slice(0, maxLength)
            .replace(/[<>]/g, "");
    }


    /* =====================================================
       LEVEL SYSTEM
    ===================================================== */

    function getLevel(xp) {
        return Math.max(
            1,
            Math.floor(xp / 250) + 1
        );
    }


    function getLevelName(level) {
        if (level <= 2) return "Rookie";
        if (level <= 4) return "Explorer";
        if (level <= 7) return "Pro";
        if (level <= 10) return "Master";

        return "ZIVO Legend";
    }


    function getDifficulty() {
        const level = getLevel(player.xp);

        if (level <= 2) {
            return "easy";
        }

        if (level <= 5) {
            return "medium";
        }

        return "hard";
    }


    function addReward(xp, coins) {
        const oldLevel = getLevel(player.xp);

        player.xp += sanitizeNumber(xp);
        player.coins += sanitizeNumber(coins);

        const newLevel = getLevel(player.xp);

        savePlayer();
        updateProfile();

        if (newLevel > oldLevel) {
            showToast(
                `🎉 Level Up! أصبحت ${getLevelName(newLevel)} — Level ${newLevel}`,
                "success"
            );
        }
    }


    /* =====================================================
       PROFILE UI
    ===================================================== */

    function updateProfile() {
        const level = getLevel(player.xp);

        const profileName = $("#profile-name");
        const profileLevel = $("#profile-level");
        const profileXP = $("#profile-xp");
        const profileCoins = $("#profile-coins");
        const progress = $("#xp-progress");
        const levelChip = $("#player-level-chip");

        if (profileName) {
            profileName.textContent =
                escapeText(player.name || "Guest", 40);
        }

        if (profileLevel) {
            profileLevel.textContent = String(level);
        }

        if (profileXP) {
            profileXP.textContent = String(player.xp);
        }

        if (profileCoins) {
            profileCoins.textContent = String(player.coins);
        }

        if (levelChip) {
            levelChip.textContent =
                `Level ${level} • ${getLevelName(level)}`;
        }

        if (progress) {
            const currentLevelXP =
                (level - 1) * 250;

            const progressValue =
                Math.min(
                    100,
                    Math.max(
                        0,
                        ((player.xp - currentLevelXP) / 250) * 100
                    )
                );

            progress.style.width =
                `${progressValue}%`;

            const parent =
                progress.closest('[role="progressbar"]');

            if (parent) {
                parent.setAttribute(
                    "aria-valuenow",
                    String(Math.round(progressValue))
                );
            }
        }
    }


    /* =====================================================
       LANGUAGE
    ===================================================== */

    function setLanguage(language) {
        try {
            if (!translations[language]) {
                language = "ar";
            }

            currentLanguage = language;

            localStorage.setItem(
                CONFIG.languageKey,
                language
            );

            const direction =
                language === "ar" ? "rtl" : "ltr";

            document.documentElement.lang = language;
            document.documentElement.dir = direction;

            $$("[data-i18n]").forEach((element) => {
                const key = element.dataset.i18n;
                const value = translations[language][key];

                if (value) {
                    element.textContent = value;
                }
            });

            $$("[data-i18n-placeholder]").forEach((element) => {
                const key =
                    element.dataset.i18nPlaceholder;

                const value =
                    translations[language][key];

                if (value) {
                    element.placeholder = value;
                }
            });

            const selector =
                $("#language-select");

            if (selector) {
                selector.value = language;
            }
        } catch (error) {
            console.error(
                "Language system error:",
                error
            );
        }
    }


    /* =====================================================
       MODAL SYSTEM
    ===================================================== */

    function getModalRoot() {
        return $("#modal-root");
    }


    function closeModal() {
        const root = getModalRoot();

        if (!root) {
            return;
        }

        root.classList.remove("open");
        root.setAttribute("aria-hidden", "true");
        root.replaceChildren();

        document.body.style.overflow = "";
    }


    function openModal(title, contentBuilder) {
        const root = getModalRoot();

        if (!root) {
            showToast(
                "تعذر فتح النافذة.",
                "error"
            );
            return null;
        }

        root.replaceChildren();

        const modal = createElement("div", "modal");

        const closeButton =
            createElement("button", "modal-close");

        closeButton.type = "button";
        closeButton.setAttribute(
            "aria-label",
            "Close"
        );
        closeButton.textContent = "×";

        closeButton.addEventListener(
            "click",
            closeModal
        );

        const heading =
            createElement("h2");

        heading.textContent =
            escapeText(title, 100);

        modal.append(
            closeButton,
            heading
        );

        try {
            const content =
                contentBuilder();

            if (content) {
                modal.appendChild(content);
            }
        } catch (error) {
            console.error(
                "Modal content error:",
                error
            );

            const errorMessage =
                createElement("p");

            errorMessage.className = "modal-subtitle";
            errorMessage.textContent =
                "حدث خطأ أثناء تحميل المحتوى.";

            modal.appendChild(errorMessage);
        }

        root.appendChild(modal);

        root.classList.add("open");
        root.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        return modal;
    }


    function setupModalClosing() {
        const root = getModalRoot();

        if (!root) {
            return;
        }

        root.addEventListener("click", (event) => {
            if (event.target === root) {
                closeModal();
            }
        });
    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message, type = "success") {
        try {
            let container =
                $(".toast-container");

            if (!container) {
                container =
                    createElement(
                        "div",
                        "toast-container"
                    );

                document.body.appendChild(container);
            }

            const toast =
                createElement(
                    "div",
                    `toast ${type}`
                );

            toast.textContent =
                escapeText(message, 300);

            container.appendChild(toast);

            window.setTimeout(() => {
                toast.remove();

                if (
                    container.children.length === 0
                ) {
                    container.remove();
                }
            }, 3500);
        } catch (error) {
            console.error(
                "Toast error:",
                error
            );
        }
    }


    /* =====================================================
       LOGIN / PROFILE
    ===================================================== */

    function openLoginModal() {
        openModal(
            "ZIVOZONE • ملف اللاعب",
            () => {
                const form =
                    createElement(
                        "form",
                        "modal-form"
                    );

                form.noValidate = true;

                const nameLabel =
                    createElement("label");

                nameLabel.textContent =
                    "اسم اللاعب";

                const nameInput =
                    createElement("input");

                nameInput.type = "text";
                nameInput.maxLength =
                    CONFIG.maxNameLength;
                nameInput.required = true;
                nameInput.value =
                    player.name === "Guest"
                        ? ""
                        : player.name;

                const emailLabel =
                    createElement("label");

                emailLabel.textContent =
                    "البريد الإلكتروني";

                const emailInput =
                    createElement("input");

                emailInput.type = "email";
                emailInput.maxLength =
                    CONFIG.maxEmailLength;
                emailInput.autocomplete = "email";
                emailInput.value =
                    player.email || "";

                const ageLabel =
                    createElement("label");

                ageLabel.textContent =
                    "العمر";

                const ageInput =
                    createElement("input");

                ageInput.type = "number";
                ageInput.min = "6";
                ageInput.max = "100";
                ageInput.required = true;
                ageInput.value =
                    String(player.age || 18);

                const actions =
                    createElement(
                        "div",
                        "modal-actions"
                    );

                const cancel =
                    createElement(
                        "button",
                        "btn btn-ghost"
                    );

                cancel.type = "button";
                cancel.textContent = "إلغاء";

                cancel.addEventListener(
                    "click",
                    closeModal
                );

                const save =
                    createElement(
                        "button",
                        "btn btn-primary"
                    );

                save.type = "submit";
                save.textContent =
                    "حفظ الملف";

                actions.append(
                    cancel,
                    save
                );

                form.append(
                    nameLabel,
                    nameInput,
                    emailLabel,
                    emailInput,
                    ageLabel,
                    ageInput,
                    actions
                );

                form.addEventListener(
                    "submit",
                    (event) => {
                        event.preventDefault();

                        try {
                            const name =
                                escapeText(
                                    nameInput.value.trim(),
                                    CONFIG.maxNameLength
                                );

                            const email =
                                escapeText(
                                    emailInput.value.trim(),
                                    CONFIG.maxEmailLength
                                );

                            const age =
                                sanitizeAge(
                                    ageInput.value
                                );

                            if (name.length < 2) {
                                showToast(
                                    "اكتب اسمًا صحيحًا.",
                                    "error"
                                );
                                return;
                            }

                            if (
                                email &&
                                !isValidEmail(email)
                            ) {
                                showToast(
                                    "البريد الإلكتروني غير صحيح.",
                                    "error"
                                );
                                return;
                            }

                            player.name = name;
                            player.email = email;
                            player.age = age;

                            savePlayer();
                            updateProfile();
                            closeModal();

                            showToast(
                                "تم حفظ ملفك بنجاح 🎉",
                                "success"
                            );
                        } catch (error) {
                            console.error(
                                "Profile save error:",
                                error
                            );

                            showToast(
                                "حدث خطأ أثناء حفظ الملف.",
                                "error"
                            );
                        }
                    }
                );

                return form;
            }
        );
    }


    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );
    }


    /* =====================================================
       QUIZ ENGINE
    ===================================================== */

    function getQuestionsForPlayer() {
        const difficulty =
            getDifficulty();

        let questions =
            questionBank[difficulty] ||
            questionBank.easy;

        /*
         * في النسخة القادمة يمكن توسيع بنك الأسئلة
         * ليصبح ديناميكيًا حسب العمر، المنطقة والمستوى.
         * هنا نضمن تجربة مختلفة في كل جولة.
         */

        questions =
            [...questions].sort(
                () => Math.random() - 0.5
            );

        return questions.slice(0, 4);
    }


    function startQuiz(type = "quiz") {
        try {
            const questions =
                type === "science"
                    ? [...scienceQuestions]
                    : getQuestionsForPlayer();

            currentQuiz = {
                type,
                questions,
                index: 0,
                score: 0,
                locked: false
            };

            player.gamesPlayed += 1;
            savePlayer();

            renderQuizQuestion();
        } catch (error) {
            console.error(
                "Quiz start error:",
                error
            );

            showToast(
                "تعذر تشغيل اللعبة.",
                "error"
            );
        }
    }


    function renderQuizQuestion() {
        if (!currentQuiz) {
            return;
        }

        const question =
            currentQuiz.questions[
                currentQuiz.index
            ];

        if (!question) {
            finishQuiz();
            return;
        }

        const modal =
            openModal(
                currentQuiz.type === "science"
                    ? "🔬 تحدي العلوم"
                    : "🧠 اختبار الذكاء",
                () => {
                    const wrapper =
                        createElement("div");

                    const progress =
                        createElement(
                            "div",
                            "game-progress"
                        );

                    const current =
                        createElement("span");

                    current.textContent =
                        `السؤال ${
                            currentQuiz.index + 1
                        } / ${
                            currentQuiz.questions.length
                        }`;

                    const difficulty =
                        createElement("span");

                    difficulty.textContent =
                        getDifficulty()
                            .toUpperCase();

                    progress.append(
                        current,
                        difficulty
                    );

                    const questionBox =
                        createElement(
                            "div",
                            "game-question"
                        );

                    const heading =
                        createElement("h3");

                    heading.textContent =
                        question.question;

                    const answers =
                        createElement(
                            "div",
                            "answers"
                        );

                    question.answers.forEach(
                        (answer, index) => {
                            const button =
                                createElement(
                                    "button",
                                    "answer-btn"
                                );

                            button.type = "button";
                            button.textContent =
                                answer;

                            button.addEventListener(
                                "click",
                                () => {
                                    handleAnswer(
                                        index,
                                        button,
                                        answers
                                    );
                                }
                            );

                            answers.appendChild(button);
                        }
                    );

                    questionBox.append(
                        heading,
                        answers
                    );

                    wrapper.append(
                        progress,
                        questionBox
                    );

                    return wrapper;
                }
            );

        if (modal) {
            modal.dataset.game = "quiz";
        }
    }


    function handleAnswer(
        selectedIndex,
        selectedButton,
        answersContainer
    ) {
        if (
            !currentQuiz ||
            currentQuiz.locked
        ) {
            return;
        }

        currentQuiz.locked = true;

        const question =
            currentQuiz.questions[
                currentQuiz.index
            ];

        const buttons =
            Array.from(
                answersContainer.children
            );

        buttons.forEach(
            (button, index) => {
                button.disabled = true;

                if (
                    index === question.correct
                ) {
                    button.classList.add(
                        "correct"
                    );
                }
            }
        );

        const correct =
            selectedIndex === question.correct;

        if (correct) {
            selectedButton.classList.add(
                "correct"
            );

            currentQuiz.score += 1;

            showToast(
                "إجابة صحيحة! +XP 🎯",
                "success"
            );
        } else {
            selectedButton.classList.add(
                "wrong"
            );

            showToast(
                "إجابة غير صحيحة، حاول مرة أخرى.",
                "error"
            );
        }

        window.setTimeout(() => {
            currentQuiz.index += 1;
            currentQuiz.locked = false;

            closeModal();

            if (
                currentQuiz.index <
                currentQuiz.questions.length
            ) {
                renderQuizQuestion();
            } else {
                finishQuiz();
            }
        }, 850);
    }


    function finishQuiz() {
        if (!currentQuiz) {
            return;
        }

        const total =
            currentQuiz.questions.length;

        const score =
            currentQuiz.score;

        const won =
            score >= Math.ceil(total / 2);

        let xp = 10 + score * 15;
        let coins = won ? 3 + score : 1;

        if (currentQuiz.type === "science") {
            xp += 10;
        }

        if (won) {
            player.gamesWon += 1;
        }

        addReward(xp, coins);

        const resultScore =
            `${score} / ${total}`;

        currentQuiz = null;

        openModal(
            won
                ? "🎉 أحسنت!"
                : "💪 جولة جيدة!",
            () => {
                const box =
                    createElement(
                        "div",
                        "result-box"
                    );

                const icon =
                    createElement(
                        "div",
                        "result-icon"
                    );

                icon.textContent =
                    won ? "🏆" : "🧠";

                const heading =
                    createElement("h3");

                heading.textContent =
                    `نتيجتك: ${resultScore}`;

                const text =
                    createElement("p");

                text.textContent =
                    won
                        ? "لقد نجحت في التحدي وحصلت على مكافآتك."
                        : "استمر في اللعب وارفع مستواك.";

                const rewards =
                    createElement(
                        "div",
                        "reward-line"
                    );

                const xpReward =
                    createElement(
                        "span",
                        "reward"
                    );

                xpReward.textContent =
                    `+${xp} XP`;

                const coinReward =
                    createElement(
                        "span",
                        "reward"
                    );

                coinReward.textContent =
                    `🪙 +${coins} ZIVO`;

                rewards.append(
                    xpReward,
                    coinReward
                );

                const actions =
                    createElement(
                        "div",
                        "modal-actions"
                    );

                const again =
                    createElement(
                        "button",
                        "btn btn-primary"
                    );

                again.type = "button";
                again.textContent =
                    "جولة جديدة";

                again.addEventListener(
                    "click",
                    () => {
                        closeModal();
                        startQuiz(
                            currentQuiz?.type ||
                            "quiz"
                        );
                    }
                );

                const close =
                    createElement(
                        "button",
                        "btn btn-ghost"
                    );

                close.type = "button";
                close.textContent =
                    "إغلاق";

                close.addEventListener(
                    "click",
                    closeModal
                );

                actions.append(
                    again,
                    close
                );

                box.append(
                    icon,
                    heading,
                    text,
                    rewards,
                    actions
                );

                return box;
            }
        );
    }


    /* =====================================================
       HORROR GAME
    ===================================================== */

    function startHorror() {
        currentHorrorScene = 0;

        player.gamesPlayed += 1;
        savePlayer();

        renderHorrorScene();
    }


    function renderHorrorScene() {
        const scene =
            horrorScenes[
                currentHorrorScene
            ];

        if (!scene) {
            return;
        }

        openModal(
            "👻 الغرفة المظلمة",
            () => {
                const wrapper =
                    createElement("div");

                const sceneBox =
                    createElement(
                        "div",
                        "horror-scene"
                    );

                const title =
                    createElement("h3");

                title.textContent =
                    "الغرفة المظلمة";

                const text =
                    createElement("p");

                text.textContent =
                    scene.text;

                sceneBox.append(
                    title,
                    text
                );

                if (
                    scene.choices &&
                    scene.choices.length
                ) {
                    const choices =
                        createElement(
                            "div",
                            "answers"
                        );

                    scene.choices.forEach(
                        (choice) => {
                            const button =
                                createElement(
                                    "button",
                                    "answer-btn"
                                );

                            button.type = "button";
                            button.textContent =
                                choice.text;

                            button.addEventListener(
                                "click",
                                () => {
                                    addReward(
                                        choice.xp,
                                        1
                                    );

                                    currentHorrorScene =
                                        choice.next;

                                    closeModal();

                                    window.setTimeout(
                                        renderHorrorScene,
                                        180
                                    );
                                }
                            );

                            choices.appendChild(
                                button
                            );
                        }
                    );

                    sceneBox.appendChild(
                        choices
                    );
                } else {
                    const finish =
                        createElement(
                            "button",
                            "btn btn-primary full"
                        );

                    finish.type = "button";
                    finish.textContent =
                        "إنهاء التجربة";

                    finish.style.marginTop =
                        "20px";

                    finish.addEventListener(
                        "click",
                        () => {
                            addReward(25, 5);
                            closeModal();

                            showToast(
                                "أنهيت تجربة الرعب 👻 +25 XP",
                                "success"
                            );
                        }
                    );

                    sceneBox.appendChild(
                        finish
                    );
                }

                wrapper.appendChild(
                    sceneBox
                );

                return wrapper;
            }
        );
    }


    /* =====================================================
       DAILY CHALLENGE
    ===================================================== */

    function getTodayKey() {
        const now = new Date();

        return [
            now.getFullYear(),
            String(now.getMonth() + 1)
                .padStart(2, "0"),
            String(now.getDate())
                .padStart(2, "0")
        ].join("-");
    }


    function getDailyState() {
        try {
            const raw =
                localStorage.getItem(
                    CONFIG.dailyKey
                );

            if (!raw) {
                return {
                    date: getTodayKey(),
                    completed: false
                };
            }

            const parsed =
                JSON.parse(raw);

            if (
                !parsed ||
                parsed.date !== getTodayKey()
            ) {
                return {
                    date: getTodayKey(),
                    completed: false
                };
            }

            return {
                date: getTodayKey(),
                completed:
                    Boolean(parsed.completed)
            };
        } catch (error) {
            console.error(
                "Daily state error:",
                error
            );

            return {
                date: getTodayKey(),
                completed: false
            };
        }
    }


    function setDailyCompleted() {
        try {
            localStorage.setItem(
                CONFIG.dailyKey,
                JSON.stringify({
                    date: getTodayKey(),
                    completed: true
                })
            );
        } catch (error) {
            console.error(
                "Daily save error:",
                error
            );
        }
    }


    function renderChallenges() {
        const container =
            $("#challenge-list");

        if (!container) {
            return;
        }

        container.replaceChildren();

        const daily =
            getDailyState();

        const challenges = [
            {
                title: "🧠 أكمل اختبار الذكاء",
                text: "أجب عن الأسئلة وحاول تحقيق نصف الإجابات أو أكثر.",
                reward: "+50 XP • +5 ZIVO",
                action: () => startQuiz("quiz")
            },
            {
                title: "🔬 تحدي العلوم",
                text: "اختبر معلوماتك العلمية في جولة قصيرة.",
                reward: "+60 XP • +6 ZIVO",
                action: () => startQuiz("science")
            },
            {
                title: daily.completed
                    ? "✅ التحدي اليومي مكتمل"
                    : "⚡ التحدي اليومي",
                text: daily.completed
                    ? "عد غدًا للحصول على تحدٍ جديد."
                    : "أكمل مهمتك اليومية واحصل على مكافأة.",
                reward: daily.completed
                    ? "تم الاستلام"
                    : "+30 XP • +3 ZIVO",
                action: daily.completed
                    ? null
                    : completeDailyChallenge
            }
        ];

        challenges.forEach(
            (challenge) => {
                const card =
                    createElement(
                        "article",
                        "challenge-card"
                    );

                const title =
                    createElement("h3");

                title.textContent =
                    challenge.title;

                const text =
                    createElement("p");

                text.textContent =
                    challenge.text;

                const reward =
                    createElement(
                        "div",
                        "challenge-reward"
                    );

                reward.textContent =
                    `🎁 ${challenge.reward}`;

                card.append(
                    title,
                    text,
                    reward
                );

                if (challenge.action) {
                    const button =
                        createElement(
                            "button",
                            "btn btn-primary full"
                        );

                    button.type = "button";
                    button.textContent =
                        "ابدأ التحدي";

                    button.style.marginTop =
                        "15px";

                    button.addEventListener(
                        "click",
                        challenge.action
                    );

                    card.appendChild(button);
                }

                container.appendChild(card);
            }
        );
    }


    function completeDailyChallenge() {
        const daily =
            getDailyState();

        if (daily.completed) {
            showToast(
                "لقد أكملت تحدي اليوم بالفعل.",
                "error"
            );
            return;
        }

        setDailyCompleted();

        player.gamesPlayed += 1;
        player.gamesWon += 1;

        addReward(30, 3);

        renderChallenges();

        openModal(
            "⚡ تحدي اليوم",
            () => {
                const box =
                    createElement(
                        "div",
                        "result-box"
                    );

                const icon =
                    createElement(
                        "div",
                        "result-icon"
                    );

                icon.textContent = "🏆";

                const title =
                    createElement("h3");

                title.textContent =
                    "تم إنجاز التحدي اليومي!";

                const text =
                    createElement("p");

                text.textContent =
                    "مكافأتك محفوظة في حسابك.";

                const rewards =
                    createElement(
                        "div",
                        "reward-line"
                    );

                const xp =
                    createElement(
                        "span",
                        "reward"
                    );

                xp.textContent =
                    "+30 XP";

                const coins =
                    createElement(
                        "span",
                        "reward"
                    );

                coins.textContent =
                    "🪙 +3 ZIVO";

                rewards.append(
                    xp,
                    coins
                );

                box.append(
                    icon,
                    title,
                    text,
                    rewards
                );

                return box;
            }
        );
    }


    /* =====================================================
       IDENTITY TEST
    ===================================================== */

    function startIdentityTest() {
        identityState = {
            index: 0,
            scores: {
                analyst: 0,
                explorer: 0,
                social: 0,
                creative: 0
            }
        };

        renderIdentityQuestion();
    }


    function renderIdentityQuestion() {
        if (!identityState) {
            return;
        }

        const item =
            identityQuestions[
                identityState.index
            ];

        if (!item) {
            finishIdentityTest();
            return;
        }

        openModal(
            "🧩 من أنا؟",
            () => {
                const wrapper =
                    createElement("div");

                const progress =
                    createElement(
                        "div",
                        "game-progress"
                    );

                const left =
                    createElement("span");

                left.textContent =
                    `السؤال ${
                        identityState.index + 1
                    } / ${
                        identityQuestions.length
                    }`;

                const right =
                    createElement("span");

                right.textContent =
                    "ZIVO PROFILE";

                progress.append(
                    left,
                    right
                );

                const box =
                    createElement(
                        "div",
                        "game-question"
                    );

                const heading =
                    createElement("h3");

                heading.textContent =
                    item.question;

                const answers =
                    createElement(
                        "div",
                        "answers"
                    );

                item.answers.forEach(
                    (answer) => {
                        const button =
                            createElement(
                                "button",
                                "answer-btn"
                            );

                        button.type = "button";
                        button.textContent =
                            answer.text;

                        button.addEventListener(
                            "click",
                            () => {
                                identityState.scores[
                                    answer.type
                                ] += 1;

                                identityState.index += 1;

                                closeModal();

                                window.setTimeout(
                                    renderIdentityQuestion,
                                    120
                                );
                            }
                        );

                        answers.appendChild(
                            button
                        );
                    }
                );

                box.append(
                    heading,
                    answers
                );

                wrapper.append(
                    progress,
                    box
                );

                return wrapper;
            }
        );
    }


    function finishIdentityTest() {
        if (!identityState) {
            return;
        }

        const scores =
            identityState.scores;

        const entries =
            Object.entries(scores);

        entries.sort(
            (a, b) => b[1] - a[1]
        );

        const type =
            entries[0][0];

        const profile =
            getIdentityProfile(type);

        player.identity =
            profile.name;

        addReward(80, 8);

        identityState = null;

        openModal(
            "✨ نتيجة من أنا؟",
            () => {
                const wrapper =
                    createElement(
                        "div",
                        "identity-result"
                    );

                const typeElement =
                    createElement(
                        "div",
                        "identity-type"
                    );

                typeElement.textContent =
                    profile.name;

                const description =
                    createElement("p");

                description.className =
                    "modal-subtitle";

                description.textContent =
                    profile.description;

                const bars =
                    createElement(
                        "div",
                        "identity-bars"
                    );

                entries.forEach(
                    ([key, value]) => {
                        const row =
                            createElement("div");

                        const label =
                            createElement(
                                "div",
                                "identity-bar-label"
                            );

                        const name =
                            createElement("span");

                        name.textContent =
                            getIdentityName(key);

                        const score =
                            createElement("span");

                        score.textContent =
                            `${value}/${identityQuestions.length}`;

                        label.append(
                            name,
                            score
                        );

                        const bar =
                            createElement(
                                "div",
                                "identity-bar"
                            );

                        const fill =
                            createElement("span");

                        fill.style.width =
                            `${Math.min(
                                100,
                                (value /
                                    identityQuestions.length) *
                                    100
                            )}%`;

                        bar.appendChild(fill);

                        row.append(
                            label,
                            bar
                        );

                        bars.appendChild(row);
                    }
                );

                const note =
                    createElement(
                        "p",
                        "modal-subtitle"
                    );

                note.style.marginTop =
                    "18px";

                note.textContent =
                    "هذه نتيجة ترفيهية مبنية على إجاباتك داخل ZIVOZONE وليست تشخيصًا نفسيًا أو طبيًا.";

                wrapper.append(
                    typeElement,
                    description,
                    bars,
                    note
                );

                return wrapper;
            }
        );
    }


    function getIdentityProfile(type) {
        const profiles = {
            analyst: {
                name: "العقل المحلل 🧠",
                description:
                    "تميل إلى التفكير المنظم وتحليل التفاصيل قبل اتخاذ القرار."
            },

            explorer: {
                name: "المستكشف ⚡",
                description:
                    "تحب التجربة والمغامرة وتتعلم كثيرًا من خوض التجارب الجديدة."
            },

            social: {
                name: "القائد الاجتماعي 🤝",
                description:
                    "تستمتع بالمنافسة والتفاعل وتميل إلى مشاركة الآخرين."
            },

            creative: {
                name: "المبدع 💡",
                description:
                    "تنجذب إلى الأفكار الجديدة والحلول غير التقليدية."
            }
        };

        return profiles[type] ||
            profiles.analyst;
    }


    function getIdentityName(type) {
        const names = {
            analyst: "تحليل",
            explorer: "استكشاف",
            social: "اجتماعي",
            creative: "إبداع"
        };

        return names[type] || type;
    }


    /* =====================================================
       ZIVO AI — LOCAL PROTOTYPE
    ===================================================== */

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
            (event) => {
                event.preventDefault();

                try {
                    const text =
                        escapeText(
                            input.value.trim(),
                            500
                        );

                    if (!text) {
                        return;
                    }

                    addAIMessage(
                        text,
                        "user"
                    );

                    input.value = "";

                    window.setTimeout(() => {
                        const response =
                            generateAIResponse(text);

                        addAIMessage(
                            response,
                            "bot"
                        );
                    }, 350);
                } catch (error) {
                    console.error(
                        "AI error:",
                        error
                    );

                    showToast(
                        "تعذر معالجة الرسالة.",
                        "error"
                    );
                }
            }
        );
    }


    function addAIMessage(text, type) {
        const messages =
            $("#ai-messages");

        if (!messages) {
            return;
        }

        const message =
            createElement(
                "div",
                `ai-message ${type}`
            );

        message.textContent =
            escapeText(text, 700);

        messages.appendChild(message);

        while (
            messages.children.length >
            CONFIG.maxAiMessages
        ) {
            messages.firstElementChild.remove();
        }

        messages.scrollTop =
            messages.scrollHeight;
    }


    function generateAIResponse(input) {
        const text =
            input.toLowerCase();

        if (
            text.includes("مستوى") ||
            text.includes("level")
        ) {
            return `مستواك الحالي Level ${getLevel(
                player.xp
            )} ولديك ${player.xp} XP. استمر بالتحديات لفتح مستويات أعلى.`;
        }

        if (
            text.includes("عملة") ||
            text.includes("zivo") ||
            text.includes("coin")
        ) {
            return `رصيدك الحالي هو ${player.coins} ZIVO. في هذه النسخة العملة تجريبية داخل الموقع، وسيتم لاحقًا تصميم نظام اقتصادي حقيقي بشكل منفصل وآمن.`;
        }

        if (
            text.includes("لعبة") ||
            text.includes("game")
        ) {
            return "أنصحك بتجربة اختبار الذكاء ثم تحدي العلوم، وبعدها جرّب الغرفة المظلمة 👻.";
        }

        if (
            text.includes("شخص") ||
            text.includes("نفسي") ||
            text.includes("who am i")
        ) {
            return "جرّب قسم «من أنا؟». سيجمع إجاباتك داخل الاختبار ويعطيك ملفًا ترفيهيًا عن أسلوب تفكيرك.";
        }

        if (
            text.includes("رياض") ||
            text.includes("sport")
        ) {
            return "قسم الرياضة في ZIVOZONE مجهز حاليًا ليتم ربطه لاحقًا بمصادر أخبار ونتائج رياضية مباشرة.";
        }

        return "أنا ZIVO AI 🤖. أستطيع في هذه النسخة مساعدتك في فهم نظام ZIVOZONE والألعاب والمستويات والتحديات. في المرحلة القادمة سنربطني بنموذج ذكاء اصطناعي حقيقي عبر Backend آمن.";
    }


    /* =====================================================
       SPORTS
    ===================================================== */

    function renderSports() {
        const container =
            $("#sports-list");

        if (!container) {
            return;
        }

        container.replaceChildren();

        sportsNews.forEach(
            (item) => {
                const card =
                    createElement(
                        "article",
                        "sport-card"
                    );

                const category =
                    createElement(
                        "span",
                        "sport-category"
                    );

                category.textContent =
                    item.category;

                const title =
                    createElement("h3");

                title.textContent =
                    item.title;

                const text =
                    createElement("p");

                text.textContent =
                    item.text;

                card.append(
                    category,
                    title,
                    text
                );

                container.appendChild(card);
            }
        );
    }


    /* =====================================================
       ACTIONS
    ===================================================== */

    function handleAction(action) {
        switch (action) {
            case "login":
                openLoginModal();
                break;

            case "scroll-games":
                scrollToElement("#games");
                break;

            case "open-identity":
                startIdentityTest();
                break;

            case "refresh-sports":
                renderSports();

                showToast(
                    "تم تحديث قسم الرياضة.",
                    "success"
                );
                break;

            case "ad-info":
                showAdInfo();
                break;

            default:
                console.warn(
                    `Unknown action: ${action}`
                );
        }
    }


    function scrollToElement(selector) {
        const element =
            $(selector);

        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    function showAdInfo() {
        openModal(
            "📢 الإعلانات في ZIVOZONE",
            () => {
                const wrapper =
                    createElement("div");

                const text =
                    createElement(
                        "p",
                        "modal-subtitle"
                    );

                text.textContent =
                    "هذه المساحة مصممة لتصبح لاحقًا منطقة إعلانية حقيقية يمكن ربطها بشبكة إعلانات أو رعاة مباشرة.";

                wrapper.appendChild(text);

                return wrapper;
            }
        );
    }


    /* =====================================================
       EVENT DELEGATION
    ===================================================== */

    function setupActions() {
        document.addEventListener(
            "click",
            (event) => {
                const actionElement =
                    event.target.closest(
                        "[data-action]"
                    );

                if (actionElement) {
                    handleAction(
                        actionElement.dataset.action
                    );

                    return;
                }

                const gameElement =
                    event.target.closest(
                        "[data-game]"
                    );

                if (gameElement) {
                    const game =
                        gameElement.dataset.game;

                    switch (game) {
                        case "quiz":
                            startQuiz("quiz");
                            break;

                        case "science":
                            startQuiz("science");
                            break;

                        case "horror":
                            startHorror();
                            break;

                        case "daily":
                            completeDailyChallenge();
                            break;

                        default:
                            console.warn(
                                "Unknown game:",
                                game
                            );
                    }
                }
            }
        );
    }


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    function setupKeyboard() {
        document.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Escape") {
                    closeModal();
                }
            }
        );
    }


    /* =====================================================
       LANGUAGE SELECT
    ===================================================== */

    function setupLanguage() {
        const selector =
            $("#language-select");

        if (!selector) {
            return;
        }

        selector.addEventListener(
            "change",
            () => {
                setLanguage(
                    selector.value
                );
            }
        );
    }


    /* =====================================================
       LOADER
    ===================================================== */

    function hideLoader() {
        const loader =
            $("#app-loader");

        if (!loader) {
            return;
        }

        window.setTimeout(() => {
            loader.classList.add(
                "hidden"
            );
        }, 500);
    }


    /* =====================================================
       DAILY RESET / MIDNIGHT CHECK
    ===================================================== */

    function scheduleDailyRefresh() {
        window.setInterval(
            () => {
                renderChallenges();
            },
            60 * 1000
        );
    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {
        try {
            setLanguage(
                currentLanguage
            );

            updateProfile();

            renderChallenges();

            renderSports();

            setupActions();

            setupKeyboard();

            setupLanguage();

            setupAI();

            setupModalClosing();

            scheduleDailyRefresh();

            hideLoader();

            console.info(
                "ZIVOZONE initialized successfully."
            );
        } catch (error) {
            console.error(
                "ZIVOZONE initialization failed:",
                error
            );

            hideLoader();

            showToast(
                "حدث خطأ في تشغيل بعض وظائف الموقع. يرجى تحديث الصفحة.",
                "error"
            );
        }
    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
