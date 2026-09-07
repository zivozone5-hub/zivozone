/* =========================================================
   ZIVOZONE V3
   Core Game Engine
   Front-end prototype for GitHub Pages

   Responsibilities:
   - Player profile
   - XP / Levels
   - ZIVO Coins
   - Games
   - Daily challenge
   - Streak
   - Achievements
   - Language switching
   - Modal handling
   - Safe DOM rendering
   - Local persistence

   Security note:
   This is a client-side prototype.
   Real authentication, financial balances and AI API keys
   MUST be handled by a secure backend in production.
========================================================= */

(() => {
    "use strict";

    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const APP = {
        name: "ZIVOZONE",
        version: "3.0.0",
        storageKey: "zivozone_player_v3",
        dailyKey: "zivozone_daily_v3",
        settingsKey: "zivozone_settings_v3",
        defaultLanguage: "ar",
        supportedLanguages: ["ar", "en", "fr", "es", "tr", "de"]
    };

    const LEVELS = [
        { level: 1, name: "Beginner", minXP: 0 },
        { level: 2, name: "Explorer", minXP: 100 },
        { level: 3, name: "Challenger", minXP: 300 },
        { level: 4, name: "Master", minXP: 650 },
        { level: 5, name: "Legend", minXP: 1200 },
        { level: 6, name: "ZIVO Elite", minXP: 2000 },
        { level: 7, name: "ZIVO Legend", minXP: 3200 }
    ];

    const REWARDS = {
        correctAnswerXP: 20,
        correctAnswerCoins: 2,
        gameCompletionXP: 50,
        gameCompletionCoins: 5,
        dailyXP: 100,
        dailyCoins: 10
    };

    /* =========================================================
       TRANSLATIONS
    ========================================================= */

    const I18N = {
        ar: {
            welcome: "أهلاً بك في ZIVOZONE",
            login: "تسجيل الدخول",
            register: "إنشاء حساب",
            profile: "ملفي",
            level: "المستوى",
            xp: "XP",
            coins: "ZIVO",
            play: "العب الآن",
            next: "السؤال التالي",
            finish: "إنهاء التحدي",
            correct: "إجابة صحيحة!",
            wrong: "إجابة غير صحيحة",
            score: "النتيجة",
            daily: "التحدي اليومي",
            completed: "تم إكمال التحدي",
            name: "الاسم",
            email: "البريد الإلكتروني",
            age: "العمر",
            save: "حفظ",
            close: "إغلاق",
            reset: "إعادة التقدم",
            intelligence: "الذكاء",
            science: "العلوم",
            horror: "الرعب",
            personality: "من أنا؟",
            noProfile: "أنشئ ملف لاعب أولاً.",
            completeProfile: "أكمل ملفك للبدء.",
            time: "الوقت",
            achievements: "الإنجازات",
            streak: "أيام متتالية",
            result: "نتيجتك",
            start: "ابدأ",
            language: "اللغة",
            dailyDone: "لقد أكملت تحدي اليوم بالفعل."
        },

        en: {
            welcome: "Welcome to ZIVOZONE",
            login: "Login",
            register: "Create Account",
            profile: "My Profile",
            level: "Level",
            xp: "XP",
            coins: "ZIVO",
            play: "Play Now",
            next: "Next Question",
            finish: "Finish Challenge",
            correct: "Correct!",
            wrong: "Incorrect",
            score: "Score",
            daily: "Daily Challenge",
            completed: "Challenge Completed",
            name: "Name",
            email: "Email",
            age: "Age",
            save: "Save",
            close: "Close",
            reset: "Reset Progress",
            intelligence: "Intelligence",
            science: "Science",
            horror: "Horror",
            personality: "Who Am I?",
            noProfile: "Create a player profile first.",
            completeProfile: "Complete your profile to start.",
            time: "Time",
            achievements: "Achievements",
            streak: "Day Streak",
            result: "Your Result",
            start: "Start",
            language: "Language",
            dailyDone: "You already completed today's challenge."
        },

        fr: {
            welcome: "Bienvenue sur ZIVOZONE",
            login: "Connexion",
            register: "Créer un compte",
            profile: "Mon profil",
            level: "Niveau",
            xp: "XP",
            coins: "ZIVO",
            play: "Jouer",
            next: "Question suivante",
            finish: "Terminer",
            correct: "Correct !",
            wrong: "Incorrect",
            score: "Score",
            daily: "Défi quotidien",
            completed: "Défi terminé",
            name: "Nom",
            email: "E-mail",
            age: "Âge",
            save: "Enregistrer",
            close: "Fermer",
            reset: "Réinitialiser",
            intelligence: "Intelligence",
            science: "Sciences",
            horror: "Horreur",
            personality: "Qui suis-je ?",
            noProfile: "Créez d'abord votre profil.",
            completeProfile: "Complétez votre profil pour commencer.",
            time: "Temps",
            achievements: "Succès",
            streak: "Série de jours",
            result: "Votre résultat",
            start: "Commencer",
            language: "Langue",
            dailyDone: "Vous avez déjà terminé le défi du jour."
        },

        es: {
            welcome: "Bienvenido a ZIVOZONE",
            login: "Iniciar sesión",
            register: "Crear cuenta",
            profile: "Mi perfil",
            level: "Nivel",
            xp: "XP",
            coins: "ZIVO",
            play: "Jugar ahora",
            next: "Siguiente pregunta",
            finish: "Finalizar",
            correct: "¡Correcto!",
            wrong: "Incorrecto",
            score: "Puntuación",
            daily: "Desafío diario",
            completed: "Desafío completado",
            name: "Nombre",
            email: "Correo",
            age: "Edad",
            save: "Guardar",
            close: "Cerrar",
            reset: "Reiniciar",
            intelligence: "Inteligencia",
            science: "Ciencia",
            horror: "Terror",
            personality: "¿Quién soy?",
            noProfile: "Crea primero tu perfil.",
            completeProfile: "Completa tu perfil para comenzar.",
            time: "Tiempo",
            achievements: "Logros",
            streak: "Racha",
            result: "Tu resultado",
            start: "Comenzar",
            language: "Idioma",
            dailyDone: "Ya has completado el desafío de hoy."
        },

        tr: {
            welcome: "ZIVOZONE'a Hoş Geldin",
            login: "Giriş",
            register: "Hesap Oluştur",
            profile: "Profilim",
            level: "Seviye",
            xp: "XP",
            coins: "ZIVO",
            play: "Şimdi Oyna",
            next: "Sonraki Soru",
            finish: "Bitir",
            correct: "Doğru!",
            wrong: "Yanlış",
            score: "Puan",
            daily: "Günlük Görev",
            completed: "Görev tamamlandı",
            name: "İsim",
            email: "E-posta",
            age: "Yaş",
            save: "Kaydet",
            close: "Kapat",
            reset: "Sıfırla",
            intelligence: "Zeka",
            science: "Bilim",
            horror: "Korku",
            personality: "Ben Kimim?",
            noProfile: "Önce profil oluştur.",
            completeProfile: "Başlamak için profilini tamamla.",
            time: "Zaman",
            achievements: "Başarımlar",
            streak: "Seri",
            result: "Sonucun",
            start: "Başla",
            language: "Dil",
            dailyDone: "Bugünün görevini zaten tamamladın."
        },

        de: {
            welcome: "Willkommen bei ZIVOZONE",
            login: "Anmelden",
            register: "Konto erstellen",
            profile: "Mein Profil",
            level: "Level",
            xp: "XP",
            coins: "ZIVO",
            play: "Jetzt spielen",
            next: "Nächste Frage",
            finish: "Beenden",
            correct: "Richtig!",
            wrong: "Falsch",
            score: "Punktzahl",
            daily: "Tägliche Herausforderung",
            completed: "Herausforderung abgeschlossen",
            name: "Name",
            email: "E-Mail",
            age: "Alter",
            save: "Speichern",
            close: "Schließen",
            reset: "Fortschritt zurücksetzen",
            intelligence: "Intelligenz",
            science: "Wissenschaft",
            horror: "Horror",
            personality: "Wer bin ich?",
            noProfile: "Erstelle zuerst ein Spielerprofil.",
            completeProfile: "Vervollständige dein Profil.",
            time: "Zeit",
            achievements: "Erfolge",
            streak: "Tages-Serie",
            result: "Dein Ergebnis",
            start: "Start",
            language: "Sprache",
            dailyDone: "Du hast die heutige Herausforderung bereits abgeschlossen."
        }
    };

    /* =========================================================
       QUESTION BANK
       ageGroup:
       - child: under 13
       - teen: 13-17
       - adult: 18+
       difficulty:
       - 1 beginner
       - 2 intermediate
       - 3 advanced
    ========================================================= */

    const QUESTION_BANK = {

        intelligence: [
            {
                id: "iq-001",
                ageGroup: "child",
                difficulty: 1,
                question: {
                    ar: "ما العدد الذي يأتي بعد 2، 4، 6، 8؟",
                    en: "What number comes after 2, 4, 6, 8?",
                    fr: "Quel nombre vient après 2, 4, 6, 8 ?",
                    es: "¿Qué número viene después de 2, 4, 6, 8?",
                    tr: "2, 4, 6, 8 dizisinden sonra hangi sayı gelir?",
                    de: "Welche Zahl kommt nach 2, 4, 6, 8?"
                },
                options: {
                    ar: ["9", "10", "11", "12"],
                    en: ["9", "10", "11", "12"],
                    fr: ["9", "10", "11", "12"],
                    es: ["9", "10", "11", "12"],
                    tr: ["9", "10", "11", "12"],
                    de: ["9", "10", "11", "12"]
                },
                answer: 1
            },

            {
                id: "iq-002",
                ageGroup: "teen",
                difficulty: 2,
                question: {
                    ar: "إذا كان كل مربع يحتوي على 4 نقاط، فكم نقطة في 5 مربعات؟",
                    en: "If every square contains 4 dots, how many dots are in 5 squares?",
                    fr: "Si chaque carré contient 4 points, combien de points dans 5 carrés ?",
                    es: "Si cada cuadrado contiene 4 puntos, ¿cuántos puntos hay en 5 cuadrados?",
                    tr: "Her karede 4 nokta varsa, 5 karede kaç nokta vardır?",
                    de: "Wenn jedes Quadrat 4 Punkte enthält, wie viele Punkte sind in 5 Quadraten?"
                },
                options: {
                    ar: ["10", "15", "20", "25"],
                    en: ["10", "15", "20", "25"],
                    fr: ["10", "15", "20", "25"],
                    es: ["10", "15", "20", "25"],
                    tr: ["10", "15", "20", "25"],
                    de: ["10", "15", "20", "25"]
                },
                answer: 2
            },

            {
                id: "iq-003",
                ageGroup: "adult",
                difficulty: 3,
                question: {
                    ar: "ما الرقم التالي؟ 1، 1، 2، 3، 5، 8، ؟",
                    en: "What is the next number? 1, 1, 2, 3, 5, 8, ?",
                    fr: "Quel est le nombre suivant ? 1, 1, 2, 3, 5, 8, ?",
                    es: "¿Cuál es el siguiente número? 1, 1, 2, 3, 5, 8, ?",
                    tr: "Sıradaki sayı nedir? 1, 1, 2, 3, 5, 8, ?",
                    de: "Welche Zahl kommt als Nächstes? 1, 1, 2, 3, 5, 8, ?"
                },
                options: {
                    ar: ["11", "12", "13", "14"],
                    en: ["11", "12", "13", "14"],
                    fr: ["11", "12", "13", "14"],
                    es: ["11", "12", "13", "14"],
                    tr: ["11", "12", "13", "14"],
                    de: ["11", "12", "13", "14"]
                },
                answer: 2
            },

            {
                id: "iq-004",
                ageGroup: "adult",
                difficulty: 3,
                question: {
                    ar: "رجل لديه 3 صناديق، وفي كل صندوق 4 صناديق أصغر. كم صندوقًا لديه بالمجموع إذا حسبنا الصناديق الداخلية والخارجية؟",
                    en: "A man has 3 boxes. Each contains 4 smaller boxes. How many boxes are there in total?",
                    fr: "Un homme possède 3 boîtes. Chacune contient 4 petites boîtes. Combien de boîtes au total ?",
                    es: "Un hombre tiene 3 cajas. Cada una contiene 4 cajas pequeñas. ¿Cuántas cajas hay en total?",
                    tr: "Bir adamın 3 kutusu var. Her kutuda 4 küçük kutu bulunuyor. Toplam kaç kutu vardır?",
                    de: "Ein Mann hat 3 Kisten. Jede enthält 4 kleinere Kisten. Wie viele Kisten gibt es insgesamt?"
                },
                options: {
                    ar: ["7", "12", "15", "16"],
                    en: ["7", "12", "15", "16"],
                    fr: ["7", "12", "15", "16"],
                    es: ["7", "12", "15", "16"],
                    tr: ["7", "12", "15", "16"],
                    de: ["7", "12", "15", "16"]
                },
                answer: 2
            }
        ],

        science: [
            {
                id: "science-001",
                ageGroup: "child",
                difficulty: 1,
                question: {
                    ar: "أي كوكب نعيش عليه؟",
                    en: "Which planet do we live on?",
                    fr: "Sur quelle planète vivons-nous ?",
                    es: "¿En qué planeta vivimos?",
                    tr: "Hangi gezegende yaşıyoruz?",
                    de: "Auf welchem Planeten leben wir?"
                },
                options: {
                    ar: ["المريخ", "الأرض", "المشتري", "الزهرة"],
                    en: ["Mars", "Earth", "Jupiter", "Venus"],
                    fr: ["Mars", "Terre", "Jupiter", "Vénus"],
                    es: ["Marte", "Tierra", "Júpiter", "Venus"],
                    tr: ["Mars", "Dünya", "Jüpiter", "Venüs"],
                    de: ["Mars", "Erde", "Jupiter", "Venus"]
                },
                answer: 1
            },

            {
                id: "science-002",
                ageGroup: "teen",
                difficulty: 2,
                question: {
                    ar: "ما الغاز الذي تحتاجه الخلايا لإنتاج الطاقة بكفاءة؟",
                    en: "Which gas do cells need for efficient energy production?",
                    fr: "De quel gaz les cellules ont-elles besoin pour produire efficacement de l'énergie ?",
                    es: "¿Qué gas necesitan las células para producir energía eficientemente?",
                    tr: "Hücrelerin verimli enerji üretimi için hangi gaza ihtiyacı vardır?",
                    de: "Welches Gas benötigen Zellen für eine effiziente Energieproduktion?"
                },
                options: {
                    ar: ["الأكسجين", "النيتروجين", "الهيدروجين", "الهيليوم"],
                    en: ["Oxygen", "Nitrogen", "Hydrogen", "Helium"],
                    fr: ["Oxygène", "Azote", "Hydrogène", "Hélium"],
                    es: ["Oxígeno", "Nitrógeno", "Hidrógeno", "Helio"],
                    tr: ["Oksijen", "Azot", "Hidrojen", "Helyum"],
                    de: ["Sauerstoff", "Stickstoff", "Wasserstoff", "Helium"]
                },
                answer: 0
            },

            {
                id: "science-003",
                ageGroup: "adult",
                difficulty: 3,
                question: {
                    ar: "ما الوحدة الأساسية للمعلومات الوراثية؟",
                    en: "What is the basic unit of genetic information?",
                    fr: "Quelle est l'unité fondamentale de l'information génétique ?",
                    es: "¿Cuál es la unidad básica de la información genética?",
                    tr: "Genetik bilginin temel birimi nedir?",
                    de: "Was ist die grundlegende Einheit genetischer Information?"
                },
                options: {
                    ar: ["الخلية", "الجين", "العضلة", "الهرمون"],
                    en: ["Cell", "Gene", "Muscle", "Hormone"],
                    fr: ["Cellule", "Gène", "Muscle", "Hormone"],
                    es: ["Célula", "Gen", "Músculo", "Hormona"],
                    tr: ["Hücre", "Gen", "Kas", "Hormon"],
                    de: ["Zelle", "Gen", "Muskel", "Hormon"]
                },
                answer: 1
            }
        ],

        horror: [
            {
                id: "horror-001",
                ageGroup: "teen",
                difficulty: 1,
                question: {
                    ar: "أنت وحدك في منزل مظلم وسمعت صوتًا خلفك. ما أول شيء ستفعله؟",
                    en: "You are alone in a dark house and hear a sound behind you. What do you do first?",
                    fr: "Vous êtes seul dans une maison sombre et entendez un bruit derrière vous. Que faites-vous ?",
                    es: "Estás solo en una casa oscura y escuchas un ruido detrás de ti. ¿Qué haces primero?",
                    tr: "Karanlık bir evde yalnızsın ve arkandan bir ses duydun. İlk ne yaparsın?",
                    de: "Du bist allein in einem dunklen Haus und hörst ein Geräusch hinter dir. Was tust du zuerst?"
                },
                options: {
                    ar: ["أهرب فورًا", "أتحقق من مصدر الصوت بحذر", "أصرخ", "أطفئ كل الأضواء"],
                    en: ["Run immediately", "Carefully check the source", "Scream", "Turn off all lights"],
                    fr: ["Je cours", "Je vérifie prudemment la source", "Je crie", "J'éteins les lumières"],
                    es: ["Corro", "Compruebo cuidadosamente la fuente", "Grito", "Apago todas las luces"],
                    tr: ["Hemen kaçarım", "Kaynağı dikkatlice kontrol ederim", "Bağırırım", "Tüm ışıkları kapatırım"],
                    de: ["Ich renne sofort", "Ich prüfe vorsichtig die Quelle", "Ich schreie", "Ich schalte alle Lichter aus"]
                },
                answer: 1
            },

            {
                id: "horror-002",
                ageGroup: "adult",
                difficulty: 2,
                question: {
                    ar: "تسمع طرقًا متكررًا على الباب في منتصف الليل. ما التصرف الأكثر عقلانية؟",
                    en: "You hear repeated knocking at midnight. What is the most rational response?",
                    fr: "Vous entendez frapper à la porte au milieu de la nuit. Quelle est la réaction la plus rationnelle ?",
                    es: "Escuchas golpes repetidos en la puerta a medianoche. ¿Cuál es la reacción más racional?",
                    tr: "Gece yarısı kapının sürekli çalındığını duyuyorsun. En mantıklı tepki nedir?",
                    de: "Du hörst um Mitternacht wiederholt Klopfen. Was ist die vernünftigste Reaktion?"
                },
                options: {
                    ar: ["فتح الباب مباشرة", "التحقق بأمان دون فتح الباب", "تجاهل أي خطر", "الخروج وحدك"],
                    en: ["Open immediately", "Check safely without opening", "Ignore all danger", "Go outside alone"],
                    fr: ["Ouvrir immédiatement", "Vérifier sans ouvrir", "Ignorer le danger", "Sortir seul"],
                    es: ["Abrir inmediatamente", "Comprobar sin abrir", "Ignorar el peligro", "Salir solo"],
                    tr: ["Hemen açmak", "Açmadan güvenli şekilde kontrol etmek", "Tehlikeyi görmezden gelmek", "Yalnız çıkmak"],
                    de: ["Sofort öffnen", "Sicher prüfen, ohne zu öffnen", "Gefahr ignorieren", "Allein hinausgehen"]
                },
                answer: 1
            }
        ]
    };

    const PERSONALITY_QUESTIONS = [
        {
            id: "p1",
            text: {
                ar: "عندما تواجه مشكلة صعبة، ماذا تفعل غالبًا؟",
                en: "When facing a difficult problem, what do you usually do?",
                fr: "Que faites-vous généralement face à un problème difficile ?",
                es: "¿Qué haces normalmente ante un problema difícil?",
                tr: "Zor bir problemle karşılaştığında genellikle ne yaparsın?",
                de: "Was tust du normalerweise bei einem schwierigen Problem?"
            },
            answers: [
                { type: "analyst" },
                { type: "leader" },
                { type: "creative" },
                { type: "calm" }
            ],
            options: {
                ar: ["أحلل التفاصيل", "أتخذ القرار", "أبحث عن فكرة مختلفة", "أهدأ وأنتظر"],
                en: ["Analyze details", "Make a decision", "Find a different idea", "Stay calm and wait"],
                fr: ["Analyser les détails", "Prendre une décision", "Chercher une idée différente", "Rester calme"],
                es: ["Analizar detalles", "Tomar una decisión", "Buscar una idea diferente", "Mantener la calma"],
                tr: ["Detayları analiz ederim", "Karar veririm", "Farklı fikir ararım", "Sakin kalırım"],
                de: ["Details analysieren", "Entscheidung treffen", "Neue Idee suchen", "Ruhig bleiben"]
            }
        },

        {
            id: "p2",
            text: {
                ar: "في الفريق، ما الدور الذي تميل إليه؟",
                en: "What role do you prefer in a team?",
                fr: "Quel rôle préférez-vous dans une équipe ?",
                es: "¿Qué papel prefieres en un equipo?",
                tr: "Bir takımda hangi rolü tercih edersin?",
                de: "Welche Rolle bevorzugst du in einem Team?"
            },
            answers: [
                { type: "leader" },
                { type: "analyst" },
                { type: "creative" },
                { type: "calm" }
            ],
            options: {
                ar: ["القائد", "المحلل", "المبدع", "الداعم الهادئ"],
                en: ["Leader", "Analyst", "Creative", "Calm supporter"],
                fr: ["Leader", "Analyste", "Créatif", "Soutien calme"],
                es: ["Líder", "Analista", "Creativo", "Apoyo tranquilo"],
                tr: ["Lider", "Analist", "Yaratıcı", "Sakin destekçi"],
                de: ["Anführer", "Analytiker", "Kreativer", "Ruhiger Unterstützer"]
            }
        },

        {
            id: "p3",
            text: {
                ar: "ما الذي يجذبك أكثر؟",
                en: "What attracts you the most?",
                fr: "Qu'est-ce qui vous attire le plus ?",
                es: "¿Qué te atrae más?",
                tr: "Seni en çok ne çeker?",
                de: "Was zieht dich am meisten an?"
            },
            answers: [
                { type: "creative" },
                { type: "analyst" },
                { type: "leader" },
                { type: "calm" }
            ],
            options: {
                ar: ["الأفكار الجديدة", "الأرقام والمنطق", "التحدي والمنافسة", "الاستقرار"],
                en: ["New ideas", "Numbers and logic", "Challenge and competition", "Stability"],
                fr: ["Nouvelles idées", "Nombres et logique", "Défi et compétition", "Stabilité"],
                es: ["Ideas nuevas", "Números y lógica", "Desafío y competencia", "Estabilidad"],
                tr: ["Yeni fikirler", "Sayılar ve mantık", "Meydan okuma", "Denge"],
                de: ["Neue Ideen", "Zahlen und Logik", "Herausforderung", "Stabilität"]
            }
        }
    ];

    /* =========================================================
       APPLICATION STATE
    ========================================================= */

    let player = createDefaultPlayer();
    let settings = createDefaultSettings();

    const gameState = {
        activeGame: null,
        questions: [],
        currentIndex: 0,
        score: 0,
        answered: false,
        startedAt: null,
        personalityAnswers: [],
        personalityIndex: 0
    };

    /* =========================================================
       INITIALIZATION
    ========================================================= */

    document.addEventListener("DOMContentLoaded", () => {
        safeRun(() => {
            loadState();
            applyLanguage();
            bindEvents();
            updateAllUI();
            showStartupMessage();
        });
    });

    function safeRun(callback) {
        try {
            return callback();
        } catch (error) {
            console.error("[ZIVOZONE ERROR]", error);
            showToast("حدث خطأ غير متوقع. حاول مرة أخرى.", "error");
            return null;
        }
    }

    /* =========================================================
       PLAYER STATE
    ========================================================= */

    function createDefaultPlayer() {
        return {
            id: generateId(),
            name: "",
            email: "",
            age: null,
            language: APP.defaultLanguage,
            xp: 0,
            coins: 0,
            streak: 0,
            lastPlayedDate: null,
            gamesPlayed: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            achievements: [],
            createdAt: new Date().toISOString()
        };
    }

    function createDefaultSettings() {
        return {
            language: APP.defaultLanguage
        };
    }

    function loadState() {
        try {
            const storedPlayer = localStorage.getItem(APP.storageKey);
            const storedSettings = localStorage.getItem(APP.settingsKey);

            if (storedPlayer) {
                const parsed = JSON.parse(storedPlayer);

                if (parsed && typeof parsed === "object") {
                    player = {
                        ...createDefaultPlayer(),
                        ...parsed
                    };
                }
            }

            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);

                if (parsedSettings && typeof parsedSettings === "object") {
                    settings = {
                        ...createDefaultSettings(),
                        ...parsedSettings
                    };
                }
            }

            if (!APP.supportedLanguages.includes(player.language)) {
                player.language = APP.defaultLanguage;
            }

            settings.language = player.language;
        } catch (error) {
            console.error("Failed to load state:", error);

            player = createDefaultPlayer();
            settings = createDefaultSettings();

            try {
                localStorage.removeItem(APP.storageKey);
                localStorage.removeItem(APP.settingsKey);
            } catch (storageError) {
                console.error("Failed to clear corrupted state:", storageError);
            }
        }
    }

    function saveState() {
        try {
            localStorage.setItem(APP.storageKey, JSON.stringify(player));

            settings.language = player.language;

            localStorage.setItem(
                APP.settingsKey,
                JSON.stringify(settings)
            );

            return true;
        } catch (error) {
            console.error("Failed to save state:", error);
            showToast("تعذر حفظ التقدم على هذا الجهاز.", "error");
            return false;
        }
    }

    /* =========================================================
       PLAYER LEVEL SYSTEM
    ========================================================= */

    function getPlayerLevel() {
        let current = LEVELS[0];

        for (const level of LEVELS) {
            if (player.xp >= level.minXP) {
                current = level;
            } else {
                break;
            }
        }

        return current;
    }

    function getNextLevel() {
        const current = getPlayerLevel();

        return LEVELS.find(
            level => level.level === current.level + 1
        ) || null;
    }

    function addXP(amount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        const oldLevel = getPlayerLevel().level;

        player.xp += Math.floor(amount);

        const newLevel = getPlayerLevel().level;

        if (newLevel > oldLevel) {
            unlockAchievement(`level_${newLevel}`);
            showToast(
                `🎉 وصلت إلى المستوى ${newLevel}!`,
                "success"
            );
        }

        saveState();
        updateAllUI();
    }

    function addCoins(amount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            return;
        }

        player.coins += Math.floor(amount);

        saveState();
        updateAllUI();
    }

    /* =========================================================
       EVENT BINDING
    ========================================================= */

    function bindEvents() {
        document.addEventListener("click", handleGlobalClick);

        document.addEventListener("submit", event => {
            const form = event.target;

            if (!(form instanceof HTMLFormElement)) {
                return;
            }

            if (
                form.id === "registerForm" ||
                form.id === "profileForm"
            ) {
                event.preventDefault();

                safeRun(() => saveProfileFromForm(form));
            }
        });

        document.addEventListener("change", event => {
            const target = event.target;

            if (
                target instanceof HTMLSelectElement &&
                (
                    target.id === "languageSelect" ||
                    target.name === "language"
                )
            ) {
                setLanguage(target.value);
            }
        });
    }

    function handleGlobalClick(event) {
        const target = event.target.closest(
            "button, a, [data-game], [data-open-profile], [data-scroll-to], [data-close-modal], [data-language]"
        );

        if (!target) {
            return;
        }

        if (
            target instanceof HTMLAnchorElement &&
            target.getAttribute("href") &&
            target.getAttribute("href") !== "#" &&
            !target.hasAttribute("data-scroll-to")
        ) {
            return;
        }

        event.preventDefault();

        safeRun(() => {
            if (target.dataset.game) {
                startGame(target.dataset.game);
                return;
            }

            if (target.dataset.openProfile !== undefined) {
                openProfileModal();
                return;
            }

            if (target.dataset.scrollTo) {
                scrollToSection(target.dataset.scrollTo);
                return;
            }

            if (target.dataset.closeModal !== undefined) {
                closeModal(target.dataset.closeModal);
                return;
            }

            if (target.dataset.language) {
                setLanguage(target.dataset.language);
                return;
            }

            handleButtonById(target);
        });
    }

    function handleButtonById(button) {
        const id = button.id;

        if (!id) {
            return;
        }

        switch (id) {
            case "loginBtn":
            case "registerBtn":
            case "openRegister":
                openProfileModal();
                break;

            case "profileBtn":
                openProfileModal();
                break;

            case "dailyChallengeBtn":
                startDailyChallenge();
                break;

            case "closeGameModal":
                closeModal("gameModal");
                break;

            case "closeProfileModal":
                closeModal("profileModal");
                break;

            case "closeRegisterModal":
                closeModal("registerModal");
                break;

            case "nextQuestionBtn":
                nextQuestion();
                break;

            case "finishGameBtn":
                finishGame();
                break;

            case "saveProfileBtn":
                saveProfileFromForm(
                    document.getElementById("profileForm") ||
                    document.getElementById("registerForm")
                );
                break;

            case "resetProgressBtn":
                resetProgress();
                break;

            case "personalityBtn":
            case "whoAmIBtn":
                startPersonalityTest();
                break;

            case "aiBtn":
            case "openAIBtn":
                openAIModal();
                break;

            default:
                break;
        }
    }

    /* =========================================================
       PROFILE
    ========================================================= */

    function openProfileModal() {
        const modal =
            document.getElementById("profileModal") ||
            document.getElementById("registerModal");

        if (!modal) {
            openFallbackModal(
                getText("profile"),
                createProfileHTML()
            );
            return;
        }

        const form =
            modal.querySelector("form") ||
            document.getElementById("profileForm") ||
            document.getElementById("registerForm");

        if (form) {
            fillProfileForm(form);
        }

        showModalElement(modal);
    }

    function fillProfileForm(form) {
        const nameInput = form.querySelector(
            '[name="name"], #playerName, #name'
        );

        const emailInput = form.querySelector(
            '[name="email"], #playerEmail, #email'
        );

        const ageInput = form.querySelector(
            '[name="age"], #playerAge, #age'
        );

        const languageInput = form.querySelector(
            '[name="language"], #languageSelect'
        );

        if (nameInput) {
            nameInput.value = player.name;
        }

        if (emailInput) {
            emailInput.value = player.email;
        }

        if (ageInput) {
            ageInput.value = player.age || "";
        }

        if (languageInput) {
            languageInput.value = player.language;
        }
    }

    function saveProfileFromForm(form) {
        if (!form) {
            showToast(getText("completeProfile"), "error");
            return;
        }

        const nameInput = form.querySelector(
            '[name="name"], #playerName, #name'
        );

        const emailInput = form.querySelector(
            '[name="email"], #playerEmail, #email'
        );

        const ageInput = form.querySelector(
            '[name="age"], #playerAge, #age'
        );

        const languageInput = form.querySelector(
            '[name="language"], #languageSelect'
        );

        const name = nameInput
            ? String(nameInput.value).trim()
            : player.name;

        const email = emailInput
            ? String(emailInput.value).trim()
            : player.email;

        const age = ageInput
            ? Number(ageInput.value)
            : player.age;

        const language = languageInput
            ? String(languageInput.value)
            : player.language;

        if (name.length < 2 || name.length > 60) {
            showToast(
                "اكتب اسمًا صحيحًا بين حرفين و60 حرفًا.",
                "error"
            );
            return;
        }

        if (!isValidEmail(email)) {
            showToast(
                "أدخل بريدًا إلكترونيًا صحيحًا.",
                "error"
            );
            return;
        }

        if (
            !Number.isInteger(age) ||
            age < 6 ||
            age > 100
        ) {
            showToast(
                "العمر يجب أن يكون بين 6 و100 سنة.",
                "error"
            );
            return;
        }

        if (!APP.supportedLanguages.includes(language)) {
            showToast("اللغة غير مدعومة.", "error");
            return;
        }

        const isNewPlayer = !player.name;

        player.name = name;
        player.email = email;
        player.age = age;
        player.language = language;

        if (isNewPlayer) {
            unlockAchievement("first_profile");
        }

        saveState();
        applyLanguage();
        updateAllUI();

        closeModal("profileModal");
        closeModal("registerModal");

        showToast(
            "تم حفظ ملفك بنجاح 🎉",
            "success"
        );
    }

    function isValidEmail(email) {
        if (!email || email.length > 254) {
            return false;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /* =========================================================
       GAME ENGINE
    ========================================================= */

    function startGame(gameType) {
        if (!ensurePlayer()) {
            return;
        }

        const normalizedType = normalizeGameType(gameType);

        if (normalizedType === "personality") {
            startPersonalityTest();
            return;
        }

        if (normalizedType === "daily") {
            startDailyChallenge();
            return;
        }

        if (!QUESTION_BANK[normalizedType]) {
            showToast(
                "هذه اللعبة غير متاحة حاليًا.",
                "error"
            );
            return;
        }

        const questions = getQuestionsForPlayer(
            normalizedType
        );

        if (!questions.length) {
            showToast(
                "لا توجد أسئلة مناسبة لهذا المستوى.",
                "error"
            );
            return;
        }

        gameState.activeGame = normalizedType;
        gameState.questions = shuffle(
            questions
        ).slice(0, Math.min(5, questions.length));

        gameState.currentIndex = 0;
        gameState.score = 0;
        gameState.answered = false;
        gameState.startedAt = Date.now();

        openGameModal();

        renderCurrentQuestion();
    }

    function normalizeGameType(type) {
        const value = String(type || "")
            .toLowerCase()
            .trim();

        const aliases = {
            iq: "intelligence",
            intelligence: "intelligence",
            smart: "intelligence",
            ذكاء: "intelligence",

            science: "science",
            علوم: "science",

            horror: "horror",
            fear: "horror",
            رعب: "horror",

            personality: "personality",
            "who-am-i": "personality",
            "من-انا": "personality",

            daily: "daily"
        };

        return aliases[value] || value;
    }

    function getAgeGroup(age) {
        if (!Number.isFinite(age)) {
            return "adult";
        }

        if (age < 13) {
            return "child";
        }

        if (age < 18) {
            return "teen";
        }

        return "adult";
    }

    function getDifficultyForPlayer() {
        const level = getPlayerLevel().level;

        if (level <= 2) {
            return 1;
        }

        if (level <= 4) {
            return 2;
        }

        return 3;
    }

    function getQuestionsForPlayer(gameType) {
        const bank = QUESTION_BANK[gameType];

        if (!Array.isArray(bank)) {
            return [];
        }

        const ageGroup = getAgeGroup(player.age);
        const difficulty = getDifficultyForPlayer();

        let filtered = bank.filter(
            question =>
                question.ageGroup === ageGroup &&
                question.difficulty <= difficulty
        );

        if (!filtered.length) {
            filtered = bank.filter(
                question =>
                    question.ageGroup === ageGroup
            );
        }

        if (!filtered.length) {
            filtered = bank.filter(
                question =>
                    question.difficulty <= difficulty
            );
        }

        return filtered;
    }

    /* =========================================================
       GAME MODAL
    ========================================================= */

    function openGameModal() {
        const modal = document.getElementById("gameModal");

        if (modal) {
            showModalElement(modal);
            return;
        }

        openFallbackModal(
            getGameTitle(gameState.activeGame),
            `<div id="zivoGameFallback"></div>`
        );
    }

    function renderCurrentQuestion() {
        const question =
            gameState.questions[
                gameState.currentIndex
            ];

        if (!question) {
            finishGame();
            return;
        }

        gameState.answered = false;

        const lang = player.language;

        const questionText =
            getLocalized(question.question, lang);

        const options =
            question.options[lang] ||
            question.options.en ||
            [];

        const container =
            document.getElementById("gameContent") ||
            document.getElementById("gameModalContent") ||
            document.getElementById("zivoGameFallback");

        if (!container) {
            openFallbackModal(
                getGameTitle(gameState.activeGame),
                `<div id="zivoGameFallback"></div>`
            );

            setTimeout(
                renderCurrentQuestion,
                0
            );

            return;
        }

        container.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "zivo-game-engine";

        const progress = document.createElement("div");
        progress.className = "zivo-game-progress";
        progress.textContent =
            `${gameState.currentIndex + 1} / ${gameState.questions.length}`;

        const title = document.createElement("h2");
        title.textContent =
            getGameTitle(gameState.activeGame);

        const questionElement =
            document.createElement("h3");

        questionElement.textContent =
            questionText;

        const optionsContainer =
            document.createElement("div");

        optionsContainer.className =
            "zivo-game-options";

        options.forEach((option, index) => {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "zivo-answer-button";
            button.dataset.answerIndex = String(index);

            button.textContent = option;

            button.addEventListener(
                "click",
                () => {
                    answerQuestion(index);
                },
                { once: true }
            );

            optionsContainer.appendChild(button);
        });

        const score = document.createElement("p");
        score.id = "zivoGameScore";
        score.textContent =
            `${getText("score")}: ${gameState.score}`;

        wrapper.appendChild(progress);
        wrapper.appendChild(title);
        wrapper.appendChild(questionElement);
        wrapper.appendChild(optionsContainer);
        wrapper.appendChild(score);

        container.appendChild(wrapper);
    }

    function answerQuestion(selectedIndex) {
        if (gameState.answered) {
            return;
        }

        gameState.answered = true;

        const question =
            gameState.questions[
                gameState.currentIndex
            ];

        if (!question) {
            return;
        }

        const isCorrect =
            selectedIndex === question.answer;

        player.questionsAnswered += 1;

        const buttons = document.querySelectorAll(
            ".zivo-answer-button"
        );

        buttons.forEach(button => {
            button.disabled = true;

            const index = Number(
                button.dataset.answerIndex
            );

            if (index === question.answer) {
                button.classList.add(
                    "correct"
                );
            }

            if (
                index === selectedIndex &&
                !isCorrect
            ) {
                button.classList.add(
                    "wrong"
                );
            }
        });

        if (isCorrect) {
            player.correctAnswers += 1;
            gameState.score += 1;

            addXP(REWARDS.correctAnswerXP);
            addCoins(REWARDS.correctAnswerCoins);

            showToast(
                `✅ ${getText("correct")} +${REWARDS.correctAnswerXP} XP`,
                "success"
            );
        } else {
            showToast(
                `❌ ${getText("wrong")}`,
                "error"
            );
        }

        saveState();

        setTimeout(() => {
            gameState.currentIndex += 1;

            if (
                gameState.currentIndex >=
                gameState.questions.length
            ) {
                finishGame();
            } else {
                renderCurrentQuestion();
            }
        }, 850);
    }

    function nextQuestion() {
        if (!gameState.questions.length) {
            return;
        }

        if (
            gameState.currentIndex <
            gameState.questions.length - 1
        ) {
            gameState.currentIndex += 1;
            renderCurrentQuestion();
        } else {
            finishGame();
        }
    }

    function finishGame() {
        if (!gameState.activeGame) {
            return;
        }

        player.gamesPlayed += 1;

        addXP(REWARDS.gameCompletionXP);
        addCoins(REWARDS.gameCompletionCoins);

        updateStreak();

        if (player.gamesPlayed === 1) {
            unlockAchievement("first_game");
        }

        if (player.correctAnswers >= 10) {
            unlockAchievement("ten_correct");
        }

        const total =
            gameState.questions.length;

        const score =
            gameState.score;

        const percentage =
            total > 0
                ? Math.round(
                    (score / total) * 100
                )
                : 0;

        const resultHTML = buildResultHTML(
            score,
            total,
            percentage
        );

        const container =
            document.getElementById("gameContent") ||
            document.getElementById("gameModalContent") ||
            document.getElementById("zivoGameFallback");

        if (container) {
            container.innerHTML = resultHTML;
        }

        saveState();
        updateAllUI();

        gameState.activeGame = null;
        gameState.questions = [];
        gameState.currentIndex = 0;
        gameState.score = 0;
        gameState.answered = false;
    }

    function buildResultHTML(
        score,
        total,
        percentage
    ) {
        const wrapper =
            document.createElement("div");

        wrapper.className =
            "zivo-result";

        const title =
            document.createElement("h2");

        title.textContent =
            getText("completed");

        const result =
            document.createElement("p");

        result.textContent =
            `${getText("score")}: ${score}/${total} (${percentage}%)`;

        const reward =
            document.createElement("p");

        reward.textContent =
            `+${REWARDS.gameCompletionXP} XP  •  +${REWARDS.gameCompletionCoins} ZIVO`;

        wrapper.appendChild(title);
        wrapper.appendChild(result);
        wrapper.appendChild(reward);

        return wrapper.outerHTML;
    }

    /* =========================================================
       DAILY CHALLENGE
    ========================================================= */

    function startDailyChallenge() {
        if (!ensurePlayer()) {
            return;
        }

        const today =
            getDateKey();

        const dailyData =
            getDailyData();

        if (
            dailyData &&
            dailyData.date === today &&
            dailyData.completed
        ) {
            showToast(
                getText("dailyDone"),
                "info"
            );
            return;
        }

        const allGames =
            Object.keys(QUESTION_BANK);

        const selectedGame =
            allGames[
                Math.floor(
                    Math.random() *
                    allGames.length
                )
            ];

        const questions =
            getQuestionsForPlayer(
                selectedGame
            );

        if (!questions.length) {
            showToast(
                "لا يوجد تحدي يومي متاح حاليًا.",
                "error"
            );
            return;
        }

        gameState.activeGame =
            "daily";

        gameState.questions =
            shuffle(questions).slice(0, 3);

        gameState.currentIndex = 0;
        gameState.score = 0;
        gameState.answered = false;
        gameState.startedAt = Date.now();

        openGameModal();
        renderCurrentQuestion();

        const originalFinish =
            finishGame;
    }

    function completeDailyChallenge() {
        const today = getDateKey();

        try {
            localStorage.setItem(
                APP.dailyKey,
                JSON.stringify({
                    date: today,
                    completed: true
                })
            );
        } catch (error) {
            console.error(
                "Daily challenge storage error:",
                error
            );
        }

        addXP(REWARDS.dailyXP);
        addCoins(REWARDS.dailyCoins);

        unlockAchievement("daily_first");
    }

    function getDailyData() {
        try {
            const raw =
                localStorage.getItem(
                    APP.dailyKey
                );

            if (!raw) {
                return null;
            }

            return JSON.parse(raw);
        } catch (error) {
            console.error(
                "Invalid daily challenge data:",
                error
            );

            return null;
        }
    }

    /* =========================================================
       PERSONALITY / WHO AM I
    ========================================================= */

    function startPersonalityTest() {
        if (!ensurePlayer()) {
            return;
        }

        gameState.personalityAnswers = [];
        gameState.personalityIndex = 0;

        const modal =
            document.getElementById("gameModal");

        if (modal) {
            showModalElement(modal);
        } else {
            openFallbackModal(
                getText("personality"),
                `<div id="personalityContent"></div>`
            );
        }

        renderPersonalityQuestion();
    }

    function renderPersonalityQuestion() {
        const question =
            PERSONALITY_QUESTIONS[
                gameState.personalityIndex
            ];

        if (!question) {
            finishPersonalityTest();
            return;
        }

        const container =
            document.getElementById("gameContent") ||
            document.getElementById("gameModalContent") ||
            document.getElementById("personalityContent") ||
            document.getElementById("zivoGameFallback");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const title =
            document.createElement("h2");

        title.textContent =
            getText("personality");

        const text =
            document.createElement("h3");

        text.textContent =
            getLocalized(
                question.text,
                player.language
            );

        const optionsContainer =
            document.createElement("div");

        optionsContainer.className =
            "zivo-game-options";

        const options =
            question.options[player.language] ||
            question.options.en;

        options.forEach((option, index) => {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className =
                "zivo-answer-button";

            button.textContent = option;

            button.addEventListener(
                "click",
                () => {
                    gameState.personalityAnswers.push(
                        question.answers[index].type
                    );

                    gameState.personalityIndex += 1;

                    renderPersonalityQuestion();
                },
                { once: true }
            );

            optionsContainer.appendChild(button);
        });

        container.appendChild(title);
        container.appendChild(text);
        container.appendChild(optionsContainer);
    }

    function finishPersonalityTest() {
        const counts = {
            analyst: 0,
            leader: 0,
            creative: 0,
            calm: 0
        };

        gameState.personalityAnswers.forEach(
            type => {
                if (
                    Object.prototype.hasOwnProperty.call(
                        counts,
                        type
                    )
                ) {
                    counts[type] += 1;
                }
            }
        );

        const personality =
            Object.entries(counts)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )[0]?.[0] ||
            "balanced";

        const descriptions = {
            analyst: {
                ar: "أنت تميل إلى التحليل والمنطق ودراسة التفاصيل قبل اتخاذ القرار.",
                en: "You tend to analyze details and rely on logic before making decisions.",
                fr: "Vous aimez analyser les détails et vous appuyer sur la logique.",
                es: "Tiendes a analizar los detalles y usar la lógica antes de decidir.",
                tr: "Karar vermeden önce detayları analiz etmeye ve mantığa güvenmeye eğilimlisin.",
                de: "Du analysierst gerne Details und verlässt dich vor Entscheidungen auf Logik."
            },

            leader: {
                ar: "لديك ميول قيادية وتحب المبادرة وتحمل المسؤولية.",
                en: "You have leadership tendencies and like taking initiative.",
                fr: "Vous avez des tendances de leader et aimez prendre des initiatives.",
                es: "Tienes tendencias de liderazgo y te gusta tomar la iniciativa.",
                tr: "Liderlik eğilimin var ve sorumluluk almayı seviyorsun.",
                de: "Du hast Führungsqualitäten und übernimmst gerne Verantwortung."
            },

            creative: {
                ar: "أنت شخص مبدع وتميل إلى الحلول الجديدة وغير التقليدية.",
                en: "You are creative and prefer new, unconventional solutions.",
                fr: "Vous êtes créatif et aimez les solutions originales.",
                es: "Eres creativo y prefieres soluciones nuevas y poco convencionales.",
                tr: "Yaratıcısın ve yeni, alışılmadık çözümleri tercih ediyorsun.",
                de: "Du bist kreativ und bevorzugst neue, ungewöhnliche Lösungen."
            },

            calm: {
                ar: "تميل إلى الهدوء والتوازن وعدم التسرع في المواقف.",
                en: "You tend to stay calm, balanced and avoid rushing decisions.",
                fr: "Vous avez tendance à rester calme et équilibré.",
                es: "Tiendes a mantener la calma y evitar decisiones apresuradas.",
                tr: "Sakin ve dengeli kalmaya, acele karar vermemeye eğilimlisin.",
                de: "Du bleibst meist ruhig und triffst ausgewogene Entscheidungen."
            }
        };

        const result =
            descriptions[personality] ||
            descriptions.calm;

        const container =
            document.getElementById("gameContent") ||
            document.getElementById("gameModalContent") ||
            document.getElementById("personalityContent") ||
            document.getElementById("zivoGameFallback");

        if (!container) {
            return;
        }

        const heading =
            document.createElement("h2");

        heading.textContent =
            getText("result");

        const text =
            document.createElement("p");

        text.textContent =
            getLocalized(
                result,
                player.language
            );

        const note =
            document.createElement("small");

        note.textContent =
            player.language === "ar"
                ? "هذا تحليل ترفيهي مبني على إجاباتك وليس تشخيصًا نفسيًا."
                : "This is an entertainment profile based on your answers, not a psychological diagnosis.";

        container.innerHTML = "";

        container.appendChild(heading);
        container.appendChild(text);
        container.appendChild(note);

        addXP(50);
        addCoins(5);
        unlockAchievement("personality_test");

        saveState();
        updateAllUI();
    }

    /* =========================================================
       ACHIEVEMENTS
    ========================================================= */

    const ACHIEVEMENT_NAMES = {
        first_profile: "First Profile",
        first_game: "First Game",
        ten_correct: "10 Correct Answers",
        personality_test: "Personality Explorer",
        daily_first: "Daily Challenger",
        level_2: "Explorer",
        level_3: "Challenger",
        level_4: "Master",
        level_5: "Legend",
        level_6: "ZIVO Elite",
        level_7: "ZIVO Legend"
    };

    function unlockAchievement(id) {
        if (!id) {
            return;
        }

        if (
            player.achievements.includes(id)
        ) {
            return;
        }

        player.achievements.push(id);

        saveState();

        const name =
            ACHIEVEMENT_NAMES[id] ||
            id;

        showToast(
            `🏆 إنجاز جديد: ${name}`,
            "success"
        );
    }

    /* =========================================================
       STREAK
    ========================================================= */

    function updateStreak() {
        const today = getDateKey();

        if (
            player.lastPlayedDate === today
        ) {
            return;
        }

        const yesterday =
            getDateKey(
                new Date(
                    Date.now() -
                    86400000
                )
            );

        if (
            player.lastPlayedDate === yesterday
        ) {
            player.streak += 1;
        } else {
            player.streak = 1;
        }

        player.lastPlayedDate = today;

        if (player.streak >= 3) {
            unlockAchievement("three_day_streak");
        }

        saveState();
    }

    /* =========================================================
       LANGUAGE
    ========================================================= */

    function setLanguage(language) {
        if (
            !APP.supportedLanguages.includes(
                language
            )
        ) {
            return;
        }

        player.language = language;
        settings.language = language;

        saveState();
        applyLanguage();
        updateAllUI();
    }

    function applyLanguage() {
        const lang =
            APP.supportedLanguages.includes(
                player.language
            )
                ? player.language
                : APP.defaultLanguage;

        document.documentElement.lang =
            lang;

        document.documentElement.dir =
            lang === "ar"
                ? "rtl"
                : "ltr";

        document
            .querySelectorAll(
                "[data-i18n]"
            )
            .forEach(element => {
                const key =
                    element.dataset.i18n;

                const value =
                    getText(key);

                if (value) {
                    element.textContent =
                        value;
                }
            });

        document
            .querySelectorAll(
                "[data-i18n-placeholder]"
            )
            .forEach(element => {
                const key =
                    element.dataset
                        .i18nPlaceholder;

                const value =
                    getText(key);

                if (value) {
                    element.setAttribute(
                        "placeholder",
                        value
                    );
                }
            });

        const selector =
            document.getElementById(
                "languageSelect"
            );

        if (selector) {
            selector.value = lang;
        }
    }

    function getText(key) {
        return (
            I18N[player.language]?.[key] ||
            I18N.en[key] ||
            key
        );
    }

    function getLocalized(
        translations,
        language
    ) {
        if (!translations) {
            return "";
        }

        return (
            translations[language] ||
            translations.en ||
            translations.ar ||
            ""
        );
    }

    /* =========================================================
       UI
    ========================================================= */

    function updateAllUI() {
        updatePlayerUI();
        updateStatsUI();
        updateProfileUI();
    }

    function updatePlayerUI() {
        const level =
            getPlayerLevel();

        const next =
            getNextLevel();

        const xpElements =
            document.querySelectorAll(
                "[data-player-xp], #playerXP"
            );

        xpElements.forEach(
            element => {
                element.textContent =
                    String(player.xp);
            }
        );

        const coinElements =
            document.querySelectorAll(
                "[data-player-coins], #playerCoins"
            );

        coinElements.forEach(
            element => {
                element.textContent =
                    String(player.coins);
            }
        );

        const levelElements =
            document.querySelectorAll(
                "[data-player-level], #playerLevel"
            );

        levelElements.forEach(
            element => {
                element.textContent =
                    String(level.level);
            }
        );

        const nameElements =
            document.querySelectorAll(
                "[data-player-name], #playerDisplayName"
            );

        nameElements.forEach(
            element => {
                element.textContent =
                    player.name ||
                    getText("profile");
            }
        );

        const progressElements =
            document.querySelectorAll(
                "[data-xp-progress]"
            );

        progressElements.forEach(
            element => {
                const progress =
                    calculateXPProgress(
                        next
                    );

                element.style.width =
                    `${progress}%`;

                element.setAttribute(
                    "aria-valuenow",
                    String(progress)
                );
            }
        );
    }

    function updateStatsUI() {
        const stats = {
            xp: player.xp,
            coins: player.coins,
            games: player.gamesPlayed,
            questions:
                player.questionsAnswered,
            correct:
                player.correctAnswers,
            streak: player.streak,
            achievements:
                player.achievements.length
        };

        Object.entries(stats).forEach(
            ([key, value]) => {
                document
                    .querySelectorAll(
                        `[data-stat="${key}"]`
                    )
                    .forEach(
                        element => {
                            element.textContent =
                                String(value);
                        }
                    );
            }
        );
    }

    function updateProfileUI() {
        const profileName =
            document.getElementById(
                "profileName"
            );

        if (profileName) {
            profileName.textContent =
                player.name ||
                getText("profile");
        }

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        if (profileEmail) {
            profileEmail.textContent =
                player.email ||
                "";
        }
    }

    function calculateXPProgress(nextLevel) {
        if (!nextLevel) {
            return 100;
        }

        const current =
            getPlayerLevel();

        const range =
            nextLevel.minXP -
            current.minXP;

        if (range <= 0) {
            return 100;
        }

        const progress =
            player.xp -
            current.minXP;

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    (progress / range) *
                    100
                )
            )
        );
    }

    /* =========================================================
       MODAL SYSTEM
    ========================================================= */

    function showModalElement(modal) {
        if (!modal) {
            return;
        }

        modal.classList.add("active");
        modal.classList.add("show");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        if (
            modal instanceof HTMLElement
        ) {
            modal.style.display = "flex";
        }
    }

    function closeModal(id) {
        const modal =
            document.getElementById(id);

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "active",
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            modal instanceof HTMLElement
        ) {
            modal.style.display = "";
        }
    }

    function openFallbackModal(
        title,
        content
    ) {
        let modal =
            document.getElementById(
                "zivoFallbackModal"
            );

        if (!modal) {
            modal =
                document.createElement("div");

            modal.id =
                "zivoFallbackModal";

            modal.style.cssText = `
                position:fixed;
                inset:0;
                z-index:99999;
                display:flex;
                align-items:center;
                justify-content:center;
                background:rgba(0,0,0,.82);
                padding:20px;
            `;

            document.body.appendChild(
                modal
            );
        }

        modal.innerHTML = `
            <div
                style="
                    width:min(700px,100%);
                    max-height:90vh;
                    overflow:auto;
                    background:#111827;
                    color:#fff;
                    border-radius:20px;
                    padding:24px;
                    position:relative;
                "
            >
                <button
                    type="button"
                    id="zivoFallbackClose"
                    aria-label="${escapeHTML(
                        getText("close")
                    )}"
                    style="
                        position:absolute;
                        top:12px;
                        right:12px;
                        border:0;
                        background:#ffffff18;
                        color:#fff;
                        width:40px;
                        height:40px;
                        border-radius:50%;
                        cursor:pointer;
                    "
                >×</button>

                <h2>${escapeHTML(
                    title
                )}</h2>

                <div id="zivoFallbackContent">
                    ${content}
                </div>
            </div>
        `;

        modal.style.display = "flex";

        document
            .getElementById(
                "zivoFallbackClose"
            )
            ?.addEventListener(
                "click",
                () => {
                    modal.remove();
                }
            );
    }

    /* =========================================================
       AI PLACEHOLDER
       No secret API key is placed in the frontend.
    ========================================================= */

    function openAIModal() {
        openFallbackModal(
            "ZIVO AI",
            `
                <div style="padding:20px 0;">
                    <p>
                        ZIVO AI جاهز للربط بمحرك ذكاء اصطناعي حقيقي.
                    </p>
                    <p>
                        في النسخة الإنتاجية سنضع API في Backend آمن،
                        وليس داخل app.js.
                    </p>
                </div>
            `
        );
    }

    /* =========================================================
       UTILITIES
    ========================================================= */

    function ensurePlayer() {
        if (
            !player.name ||
            !player.email ||
            !player.age
        ) {
            openProfileModal();

            showToast(
                getText("completeProfile"),
                "info"
            );

            return false;
        }

        return true;
    }

    function scrollToSection(id) {
        const target =
            document.getElementById(id);

        if (!target) {
            return;
        }

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function getGameTitle(gameType) {
        const keyMap = {
            intelligence: "intelligence",
            science: "science",
            horror: "horror",
            personality: "personality",
            daily: "daily"
        };

        return getText(
            keyMap[gameType] ||
            gameType
        );
    }

    function getDateKey(
        date = new Date()
    ) {
        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function generateId() {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return (
            "zivo-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2)
        );
    }

    function shuffle(array) {
        const copy = [...array];

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
            ] = [
                copy[j],
                copy[i]
            ];
        }

        return copy;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function showToast(
        message,
        type = "info"
    ) {
        let container =
            document.getElementById(
                "zivoToastContainer"
            );

        if (!container) {
            container =
                document.createElement("div");

            container.id =
                "zivoToastContainer";

            container.style.cssText = `
                position:fixed;
                bottom:20px;
                left:20px;
                z-index:100000;
                display:flex;
                flex-direction:column;
                gap:10px;
                max-width:min(420px,calc(100vw - 40px));
            `;

            document.body.appendChild(
                container
            );
        }

        const toast =
            document.createElement("div");

        toast.textContent =
            message;

        toast.style.cssText = `
            padding:14px 18px;
            border-radius:14px;
            color:#fff;
            background:${
                type === "success"
                    ? "#16a34a"
                    : type === "error"
                        ? "#dc2626"
                        : "#2563eb"
            };
            box-shadow:0 10px 30px rgba(0,0,0,.25);
            font-size:14px;
            line-height:1.5;
        `;

        container.appendChild(
            toast
        );

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform =
                "translateY(10px)";
            toast.style.transition =
                "all .25s ease";

            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2800);
    }

    function showStartupMessage() {
        if (
            player.name
        ) {
            return;
        }

        const hasShown =
            sessionStorage.getItem(
                "zivozone_welcome_shown"
            );

        if (hasShown) {
            return;
        }

        try {
            sessionStorage.setItem(
                "zivozone_welcome_shown",
                "1"
            );
        } catch (error) {
            console.warn(
                "Session storage unavailable:",
                error
            );
        }

        setTimeout(() => {
            showToast(
                getText("welcome"),
                "info"
            );
        }, 500);
    }

    function createProfileHTML() {
        return `
            <form id="zivoFallbackProfileForm">
                <div style="display:grid;gap:14px;">
                    <label>
                        ${escapeHTML(getText("name"))}
                        <input
                            name="name"
                            type="text"
                            maxlength="60"
                            required
                            autocomplete="name"
                        >
                    </label>

                    <label>
                        ${escapeHTML(getText("email"))}
                        <input
                            name="email"
                            type="email"
                            maxlength="254"
                            required
                            autocomplete="email"
                        >
                    </label>

                    <label>
                        ${escapeHTML(getText("age"))}
                        <input
                            name="age"
                            type="number"
                            min="6"
                            max="100"
                            required
                        >
                    </label>

                    <label>
                        ${escapeHTML(getText("language"))}
                        <select name="language">
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                            <option value="es">Español</option>
                            <option value="tr">Türkçe</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </label>

                    <button type="submit">
                        ${escapeHTML(getText("save"))}
                    </button>
                </div>
            </form>
        `;
    }

    /* =========================================================
       RESET
    ========================================================= */

    function resetProgress() {
        const confirmed =
            window.confirm(
                player.language === "ar"
                    ? "هل أنت متأكد؟ سيتم حذف تقدم اللاعب من هذا الجهاز."
                    : "Are you sure? Player progress will be deleted from this device."
            );

        if (!confirmed) {
            return;
        }

        try {
            localStorage.removeItem(
                APP.storageKey
            );

            localStorage.removeItem(
                APP.dailyKey
            );

            localStorage.removeItem(
                APP.settingsKey
            );

            player =
                createDefaultPlayer();

            settings =
                createDefaultSettings();

            updateAllUI();

            showToast(
                player.language === "ar"
                    ? "تمت إعادة التقدم."
                    : "Progress has been reset.",
                "success"
            );
        } catch (error) {
            console.error(
                "Reset error:",
                error
            );

            showToast(
                "تعذر إعادة التقدم.",
                "error"
            );
        }
    }

    /* =========================================================
       OPTIONAL PUBLIC API
       Useful for debugging without exposing sensitive data.
    ========================================================= */

    window.ZIVOZONE = Object.freeze({
        version: APP.version,

        getPlayer() {
            return {
                ...player,
                email:
                    player.email
                        ? "[protected]"
                        : ""
            };
        },

        getLevel() {
            return getPlayerLevel();
        },

        startGame(game) {
            startGame(game);
        },

        startDailyChallenge() {
            startDailyChallenge();
        },

        startPersonalityTest() {
            startPersonalityTest();
        },

        setLanguage(language) {
            setLanguage(language);
        }
    });

})();
