'use strict';

(() => {
    /*
     * =========================================================
     * ZIVOZONE APPLICATION ENGINE
     * Version: 3.0.0
     *
     * هذا الملف متوافق مع نسخة index.html الحالية في ZIVOZONE.
     *
     * الوظائف:
     * - Navigation
     * - Login / Logout
     * - Player Profile
     * - XP
     * - Levels
     * - ZIVO internal reward
     * - Brain Game
     * - Science Game
     * - Horror Game
     * - Daily Challenge
     * - Who Am I personality test
     * - ZIVO AI demo
     * - Sports section
     * - Languages
     * - Local persistence
     * - Notifications
     *
     * ملاحظة:
     * ZIVO هنا عملة داخلية تجريبية فقط.
     * لا تمثل حالياً Token على Blockchain.
     * =========================================================
     */

    const CONFIG = {
        storageKey: 'zivozone_player_v3',
        languageKey: 'zivozone_language_v3',
        dailyKey: 'zivozone_daily_v3',

        maxName: 50,
        maxEmail: 254,

        zivoPerCorrect: 0.01,
        dailyBonusZivo: 0.05,

        version: '3.0.0'
    };


    /*
     * =========================================================
     * PLAYER LEVELS
     * =========================================================
     */

    const LEVELS = [
        {
            level: 1,
            minXP: 0,
            name: {
                ar: 'مستكشف',
                en: 'Explorer',
                fr: 'Explorateur',
                es: 'Explorador',
                tr: 'Kaşif'
            }
        },

        {
            level: 2,
            minXP: 100,
            name: {
                ar: 'مبتدئ',
                en: 'Beginner',
                fr: 'Débutant',
                es: 'Principiante',
                tr: 'Başlangıç'
            }
        },

        {
            level: 3,
            minXP: 250,
            name: {
                ar: 'متدرب',
                en: 'Trainee',
                fr: 'Stagiaire',
                es: 'Aprendiz',
                tr: 'Stajyer'
            }
        },

        {
            level: 4,
            minXP: 500,
            name: {
                ar: 'متقدم',
                en: 'Advanced',
                fr: 'Avancé',
                es: 'Avanzado',
                tr: 'İleri'
            }
        },

        {
            level: 5,
            minXP: 900,
            name: {
                ar: 'خبير',
                en: 'Expert',
                fr: 'Expert',
                es: 'Experto',
                tr: 'Uzman'
            }
        },

        {
            level: 6,
            minXP: 1400,
            name: {
                ar: 'محترف',
                en: 'Pro',
                fr: 'Pro',
                es: 'Profesional',
                tr: 'Profesyonel'
            }
        },

        {
            level: 7,
            minXP: 2000,
            name: {
                ar: 'نخبة',
                en: 'Elite',
                fr: 'Élite',
                es: 'Élite',
                tr: 'Elit'
            }
        },

        {
            level: 8,
            minXP: 3000,
            name: {
                ar: 'أسطورة ZIVO',
                en: 'ZIVO Legend',
                fr: 'Légende ZIVO',
                es: 'Leyenda ZIVO',
                tr: 'ZIVO Efsanesi'
            }
        }
    ];


    /*
     * =========================================================
     * LANGUAGES
     * =========================================================
     */

    const I18N = {

        ar: {
            dir: 'rtl',

            login: 'تسجيل الدخول',
            logout: 'تسجيل الخروج',

            welcome: 'الرئيسية',
            games: 'الألعاب',
            challenges: 'التحديات',
            ai: 'الذكاء الاصطناعي',
            personality: 'من أنا؟',
            sports: 'الرياضة',

            play: 'ابدأ اللعب',

            aiPlaceholder:
                'اكتب سؤالك للذكاء الاصطناعي...',

            correct:
                'إجابة صحيحة!',

            wrong:
                'إجابة غير صحيحة',

            saved:
                'تم حفظ ملفك بنجاح',

            loggedOut:
                'تم تسجيل الخروج',

            dailyDone:
                'أنجزت تحدي اليوم بالفعل.',

            dailyReady:
                'تحدي اليوم جاهز!',

            levelUp:
                'مبروك! وصلت إلى مستوى جديد',

            profile:
                'الملف الشخصي',

            chooseGame:
                'اختر لعبة للبدء',

            backGames:
                'العودة للألعاب',

            next:
                'التالي',

            finish:
                'إنهاء',

            start:
                'ابدأ',

            retry:
                'العب مرة أخرى',

            close:
                'إغلاق',

            noProfile:
                'أنشئ ملفك أولاً لتسجيل تقدمك.',

            ad:
                'سيتم تجهيز مساحة الإعلان قريباً. يمكنك التواصل معنا للإعلان.',

            news:
                'تم تحديث الأخبار التجريبية. عند إضافة مصدر أخبار حقيقي سنربطه هنا.',

            aiLocal:
                'أنا ZIVO AI التجريبي. أستطيع مساعدتك في الألعاب والتحديات وZIVOZONE والمعلومات العامة. لربط ذكاء اصطناعي حقيقي سنحتاج Backend آمناً.',

            agePrompt:
                'أضف عمرك في ملف اللاعب لتحسين مستوى الأسئلة.'
        },


        en: {
            dir: 'ltr',

            login: 'Login',
            logout: 'Logout',

            welcome: 'Home',
            games: 'Games',
            challenges: 'Challenges',
            ai: 'AI',
            personality: 'Who Am I?',
            sports: 'Sports',

            play: 'Play Now',

            aiPlaceholder:
                'Ask ZIVO AI...',

            correct:
                'Correct!',

            wrong:
                'Wrong answer',

            saved:
                'Profile saved successfully',

            loggedOut:
                'Logged out',

            dailyDone:
                'You already completed today’s challenge.',

            dailyReady:
                'Today’s challenge is ready!',

            levelUp:
                'Congratulations! You reached a new level',

            profile:
                'Profile',

            chooseGame:
                'Choose a game to start',

            backGames:
                'Back to games',

            next:
                'Next',

            finish:
                'Finish',

            start:
                'Start',

            retry:
                'Play again',

            close:
                'Close',

            noProfile:
                'Create your profile first to save progress.',

            ad:
                'The advertising space will be activated soon.',

            news:
                'Demo sports news refreshed. A real news API can be connected later.',

            aiLocal:
                'I am the ZIVO AI demo. I can help with games, challenges and ZIVOZONE. A secure backend is required for a real AI connection.',

            agePrompt:
                'Add your age to your profile to improve question difficulty.'
        },


        fr: {
            dir: 'ltr',

            login: 'Connexion',
            logout: 'Déconnexion',

            welcome: 'Accueil',
            games: 'Jeux',
            challenges: 'Défis',
            ai: 'IA',
            personality: 'Qui suis-je ?',
            sports: 'Sports',

            play: 'Jouer',

            aiPlaceholder:
                'Demandez à ZIVO AI...',

            correct:
                'Correct !',

            wrong:
                'Mauvaise réponse',

            saved:
                'Profil enregistré',

            loggedOut:
                'Déconnexion réussie',

            dailyDone:
                'Défi du jour déjà terminé.',

            dailyReady:
                'Le défi du jour est prêt !',

            levelUp:
                'Félicitations ! Nouveau niveau',

            profile:
                'Profil',

            chooseGame:
                'Choisissez un jeu',

            backGames:
                'Retour aux jeux',

            next:
                'Suivant',

            finish:
                'Terminer',

            start:
                'Commencer',

            retry:
                'Rejouer',

            close:
                'Fermer',

            noProfile:
                'Créez votre profil pour enregistrer votre progression.',

            ad:
                'L’espace publicitaire sera activé bientôt.',

            news:
                'Actualités sportives de démonstration actualisées.',

            aiLocal:
                'Je suis la démo de ZIVO AI. Une connexion backend sécurisée est nécessaire pour une vraie IA.',

            agePrompt:
                'Ajoutez votre âge pour adapter la difficulté.'
        },


        es: {
            dir: 'ltr',

            login: 'Iniciar sesión',
            logout: 'Cerrar sesión',

            welcome: 'Inicio',
            games: 'Juegos',
            challenges: 'Desafíos',
            ai: 'IA',
            personality: '¿Quién soy?',
            sports: 'Deportes',

            play: 'Jugar',

            aiPlaceholder:
                'Pregunta a ZIVO AI...',

            correct:
                '¡Correcto!',

            wrong:
                'Respuesta incorrecta',

            saved:
                'Perfil guardado',

            loggedOut:
                'Sesión cerrada',

            dailyDone:
                'Ya completaste el desafío de hoy.',

            dailyReady:
                '¡El desafío de hoy está listo!',

            levelUp:
                '¡Felicidades! Nuevo nivel',

            profile:
                'Perfil',

            chooseGame:
                'Elige un juego',

            backGames:
                'Volver a juegos',

            next:
                'Siguiente',

            finish:
                'Terminar',

            start:
                'Empezar',

            retry:
                'Jugar otra vez',

            close:
                'Cerrar',

            noProfile:
                'Crea tu perfil para guardar tu progreso.',

            ad:
                'El espacio publicitario se activará pronto.',

            news:
                'Noticias deportivas de demostración actualizadas.',

            aiLocal:
                'Soy la demo de ZIVO AI. Para una IA real necesitamos un backend seguro.',

            agePrompt:
                'Añade tu edad para adaptar la dificultad.'
        },


        tr: {
            dir: 'ltr',

            login: 'Giriş',
            logout: 'Çıkış',

            welcome: 'Ana Sayfa',
            games: 'Oyunlar',
            challenges: 'Görevler',
            ai: 'Yapay Zeka',
            personality: 'Ben Kimim?',
            sports: 'Spor',

            play: 'Oyna',

            aiPlaceholder:
                'ZIVO AI’ye sor...',

            correct:
                'Doğru!',

            wrong:
                'Yanlış cevap',

            saved:
                'Profil kaydedildi',

            loggedOut:
                'Çıkış yapıldı',

            dailyDone:
                'Bugünün görevi zaten tamamlandı.',

            dailyReady:
                'Bugünün görevi hazır!',

            levelUp:
                'Tebrikler! Yeni seviyeye ulaştın',

            profile:
                'Profil',

            chooseGame:
                'Başlamak için oyun seç',

            backGames:
                'Oyunlara dön',

            next:
                'Sonraki',

            finish:
                'Bitir',

            start:
                'Başla',

            retry:
                'Tekrar oyna',

            close:
                'Kapat',

            noProfile:
                'İlerlemeni kaydetmek için profil oluştur.',

            ad:
                'Reklam alanı yakında etkinleştirilecek.',

            news:
                'Demo spor haberleri yenilendi.',

            aiLocal:
                'Ben ZIVO AI demosuyum. Gerçek AI için güvenli bir backend gerekir.',

            agePrompt:
                'Zorluk seviyesini ayarlamak için yaşını ekle.'
        }
    };


    /*
     * =========================================================
     * QUESTIONS
     * =========================================================
     */

    const QUESTIONS = {

        brain: [

            {
                q: 'ما الرقم التالي: 2، 4، 8، 16، ؟',
                a: ['18', '24', '32', '36'],
                c: 2
            },

            {
                q: 'إذا كان لديك 10 نقاط وخسرت 3، كم بقي؟',
                a: ['5', '6', '7', '8'],
                c: 2
            },

            {
                q: 'ما المختلف: 9، 16، 25، 36، 45؟',
                a: ['9', '16', '36', '45'],
                c: 3
            },

            {
                q: 'ما العدد التالي: 1، 3، 6، 10، ؟',
                a: ['12', '14', '15', '16'],
                c: 2
            },

            {
                q: 'إذا كان كل A هو B، فهل كل B هو A بالضرورة؟',
                a: [
                    'نعم',
                    'لا',
                    'دائماً',
                    'حسب العمر'
                ],
                c: 1
            },

            {
                q: 'ما نصف العدد 48؟',
                a: ['12', '24', '26', '28'],
                c: 1
            }

        ],


        science: [

            {
                q: 'ما الكوكب الذي نعيش عليه؟',
                a: [
                    'المريخ',
                    'الأرض',
                    'الزهرة',
                    'المشتري'
                ],
                c: 1
            },

            {
                q: 'ما العضو الذي يضخ الدم؟',
                a: [
                    'الكبد',
                    'القلب',
                    'الرئة',
                    'المعدة'
                ],
                c: 1
            },

            {
                q: 'أي مصدر طاقة متجدد؟',
                a: [
                    'الفحم',
                    'النفط',
                    'الشمس',
                    'الغاز'
                ],
                c: 2
            },

            {
                q: 'ما الغاز الذي يحتاجه الإنسان للتنفس؟',
                a: [
                    'الأكسجين',
                    'الهيدروجين',
                    'الهيليوم',
                    'النيون'
                ],
                c: 0
            },

            {
                q: 'ما الوحدة الأساسية للكتلة في النظام الدولي؟',
                a: [
                    'متر',
                    'ثانية',
                    'كيلوغرام',
                    'لتر'
                ],
                c: 2
            },

            {
                q: 'أي جزء من الخلية يحتوي المادة الوراثية في الخلايا حقيقية النواة؟',
                a: [
                    'النواة',
                    'الجدار',
                    'السيتوبلازم',
                    'الغشاء فقط'
                ],
                c: 0
            }

        ]
    };


    /*
     * =========================================================
     * PERSONALITY TEST
     * =========================================================
     */

    const PERSONALITY = [

        {
            q: 'عندما تواجه مشكلة جديدة، ماذا تفعل أولاً؟',

            options: [
                ['أحلل التفاصيل', 'analytical'],
                ['أجرب بسرعة', 'adventurous'],
                ['أسأل الآخرين', 'social'],
                ['أفكر بهدوء وأنتظر', 'reflective']
            ]
        },

        {
            q: 'في المنافسة، ما الذي يحفزك أكثر؟',

            options: [
                ['الفوز', 'competitive'],
                ['التعلم', 'growth'],
                ['التعاون', 'social'],
                ['اختبار نفسي', 'adventurous']
            ]
        },

        {
            q: 'عند اتخاذ قرار مهم، تميل إلى:',

            options: [
                ['الأرقام والأدلة', 'analytical'],
                ['الإحساس الداخلي', 'intuitive'],
                ['رأي الأشخاص', 'social'],
                ['الموازنة والانتظار', 'reflective']
            ]
        },

        {
            q: 'في وقت الفراغ تفضل:',

            options: [
                ['تحدياً ذهنياً', 'analytical'],
                ['مغامرة', 'adventurous'],
                ['جلسة مع الأصدقاء', 'social'],
                ['نشاطاً هادئاً', 'reflective']
            ]
        },

        {
            q: 'إذا فشلت في محاولة، ماذا تفعل؟',

            options: [
                ['أحلل الخطأ', 'analytical'],
                ['أعيد المحاولة فوراً', 'adventurous'],
                ['أطلب رأياً', 'social'],
                ['أبتعد قليلاً ثم أعود', 'reflective']
            ]
        }
    ];


    /*
     * =========================================================
     * HORROR STORY
     * =========================================================
     */

    const HORROR = [

        {
            text:
                'أنت في ممر مظلم. تسمع صوتاً خلف الباب الأيسر، بينما الباب الأيمن مفتوح قليلاً. ماذا تختار؟',

            choices: [
                ['أفتح الباب الأيسر', 'left'],
                ['أدخل الباب الأيمن', 'right'],
                ['أعود للخلف', 'back']
            ]
        },

        {
            text:
                'الضوء انطفأ. تسمع خطوات تقترب. أمامك هاتف مضيء ودرج ينزل للأسفل.',

            choices: [
                ['أستخدم الهاتف', 'phone'],
                ['أنزل الدرج', 'stairs'],
                ['أختبئ', 'hide']
            ]
        },

        {
            text:
                'تظهر على الهاتف رسالة: لا تلتفت. ماذا تفعل؟',

            choices: [
                ['ألتزم بالرسالة', 'stay'],
                ['ألتفت فوراً', 'turn'],
                ['أركض', 'run']
            ]
        }
    ];


    /*
     * =========================================================
     * SPORTS DEMO DATA
     * =========================================================
     */

    const SPORTS = [

        [
            'كرة القدم',
            'متابعة نتائج ومباريات وأخبار كرة القدم العالمية.'
        ],

        [
            'النجوم',
            'ملخصات وأحداث وأرقام اللاعبين والفرق.'
        ],

        [
            'ZIVOZONE',
            'هذه بطاقة أخبار تجريبية، وسنربط مصدر أخبار حقيقي في مرحلة الـBackend.'
        ]

    ];


    /*
     * =========================================================
     * APPLICATION STATE
     * =========================================================
     */

    const state = {

        player: null,

        lang:
            localStorage.getItem(CONFIG.languageKey) ||
            'ar',

        game: null,

        questions: [],

        index: 0,

        score: 0,

        startedAt: 0,

        personalityIndex: 0,

        personalityScores: {},

        horrorIndex: 0,

        daily: false,

        busy: false
    };


    /*
     * =========================================================
     * DOM HELPERS
     * =========================================================
     */

    const $ = (
        selector,
        root = document
    ) => root.querySelector(selector);


    const $$ = (
        selector,
        root = document
    ) => Array.from(
        root.querySelectorAll(selector)
    );


    function t(key) {

        try {

            return (
                I18N[state.lang]?.[key] ||
                I18N.ar[key] ||
                key
            );

        } catch (error) {

            console.error(
                'Translation error:',
                error
            );

            return key;
        }
    }


    /*
     * =========================================================
     * SAFE JSON
     * =========================================================
     */

    function safeJSONParse(
        value,
        fallback = null
    ) {

        try {

            return JSON.parse(value);

        } catch (error) {

            return fallback;
        }
    }


    /*
     * =========================================================
     * CLAMP
     * =========================================================
     */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(value, min),
            max
        );
    }


    /*
     * =========================================================
     * TODAY
     * =========================================================
     */

    function today() {

        try {

            const d = new Date();

            return [
                d.getFullYear(),
                String(
                    d.getMonth() + 1
                ).padStart(2, '0'),
                String(
                    d.getDate()
                ).padStart(2, '0')
            ].join('-');

        } catch (error) {

            console.error(
                'Date error:',
                error
            );

            return '';
        }
    }


    /*
     * =========================================================
     * DEFAULT PLAYER
     * =========================================================
     */

    function defaultPlayer() {

        return {

            id:
                `zivo-${Date.now()}`,

            name:
                'ZIVO Player',

            email:
                '',

            age:
                18,

            xp:
                0,

            zivo:
                0,

            games:
                0,

            wins:
                0,

            losses:
                0,

            correct:
                0,

            wrong:
                0,

            streak:
                0,

            bestStreak:
                0,

            achievements:
                [],

            personality:
                null,

            createdAt:
                new Date().toISOString(),

            loggedIn:
                false
        };
    }


    /*
     * =========================================================
     * LOAD PLAYER
     * =========================================================
     */

    function loadPlayer() {

        try {

            const raw =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            state.player =
                raw
                    ? {
                        ...defaultPlayer(),
                        ...safeJSONParse(
                            raw,
                            {}
                        )
                    }
                    : defaultPlayer();

            state.player.xp =
                Math.max(
                    0,
                    Number(
                        state.player.xp
                    ) || 0
                );

            state.player.zivo =
                Math.max(
                    0,
                    Number(
                        state.player.zivo
                    ) || 0
                );

            state.player.age =
                clamp(
                    Number(
                        state.player.age
                    ) || 18,
                    6,
                    100
                );

            return state.player;

        } catch (error) {

            console.error(
                'ZIVOZONE player load error:',
                error
            );

            state.player =
                defaultPlayer();

            return state.player;
        }
    }


    /*
     * =========================================================
     * SAVE PLAYER
     * =========================================================
     */

    function savePlayer() {

        try {

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(
                    state.player
                )
            );

            return true;

        } catch (error) {

            console.error(
                'ZIVOZONE player save error:',
                error
            );

            notify(
                'تعذر حفظ التقدم على هذا الجهاز.',
                'error'
            );

            return false;
        }
    }


    /*
     * =========================================================
     * CURRENT LEVEL
     * =========================================================
     */

    function currentLevel() {

        try {

            let result =
                LEVELS[0];

            for (
                const level
                of LEVELS
            ) {

                if (
                    state.player.xp >=
                    level.minXP
                ) {

                    result =
                        level;
                }
            }

            return result;

        } catch (error) {

            console.error(
                'Level calculation error:',
                error
            );

            return LEVELS[0];
        }
    }


    /*
     * =========================================================
     * NEXT LEVEL
     * =========================================================
     */

    function nextLevel() {

        try {

            return LEVELS.find(
                level =>
                    level.level >
                    currentLevel().level
            ) || null;

        } catch (error) {

            console.error(
                'Next level error:',
                error
            );

            return null;
        }
    }


    /*
     * =========================================================
     * DIFFICULTY
     *
     * العمر + المستوى
     * =========================================================
     */

    function difficulty() {

        try {

            const age =
                Number(
                    state.player.age
                ) || 18;

            const level =
                currentLevel().level;


            if (age <= 9) {

                return 'easy';
            }


            if (age <= 13) {

                return level >= 3
                    ? 'medium'
                    : 'easy';
            }


            if (age <= 17) {

                return level >= 4
                    ? 'hard'
                    : 'medium';
            }


            if (level >= 7) {

                return 'expert';
            }


            if (level >= 4) {

                return 'hard';
            }


            return 'medium';

        } catch (error) {

            console.error(
                'Difficulty error:',
                error
            );

            return 'easy';
        }
    }


    /*
     * =========================================================
     * XP
     * =========================================================
     */

    function addXP(amount) {

        try {

            const safeAmount =
                Math.max(
                    0,
                    Number(amount) || 0
                );

            const before =
                currentLevel().level;


            state.player.xp +=
                safeAmount;


            const after =
                currentLevel().level;


            if (
                after >
                before
            ) {

                notify(
                    `${t('levelUp')} ${after}`,
                    'success'
                );
            }


            savePlayer();

            renderPlayer();

        } catch (error) {

            console.error(
                'XP error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * ZIVO
     * =========================================================
     */

    function addZivo(amount) {

        try {

            const safeAmount =
                Math.max(
                    0,
                    Number(amount) || 0
                );


            state.player.zivo =
                Number(
                    (
                        state.player.zivo +
                        safeAmount
                    ).toFixed(4)
                );


            savePlayer();

            renderPlayer();

        } catch (error) {

            console.error(
                'ZIVO error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * NOTIFICATIONS
     * =========================================================
     */

    function notify(
        message,
        type = 'info'
    ) {

        try {

            const box =
                $('#zivoNotifications');

            if (!box) {

                return;
            }


            const item =
                document.createElement(
                    'div'
                );


            item.className =
                `zivo-toast ${type}`;


            /*
             * textContent مهم جداً هنا
             * لأنه يمنع إدخال HTML من المستخدم.
             */

            item.textContent =
                String(message);


            box.appendChild(
                item
            );


            setTimeout(
                () => {

                    item.remove();

                },
                3500
            );

        } catch (error) {

            console.error(
                'Notification error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * MODALS
     * =========================================================
     */

    function openModal(id) {

        try {

            const modal =
                document.getElementById(
                    id
                );

            if (modal) {

                modal.classList.add(
                    'active'
                );
            }

        } catch (error) {

            console.error(
                'Open modal error:',
                error
            );
        }
    }


    function closeModal(id) {

        try {

            const modal =
                document.getElementById(
                    id
                );

            if (modal) {

                modal.classList.remove(
                    'active'
                );
            }

        } catch (error) {

            console.error(
                'Close modal error:',
                error
            );
        }
    }


    /*
     * index.html يستخدم closeModal()
     * من زر إغلاق تسجيل الدخول.
     */

    window.closeModal =
        closeModal;

    window.openModal =
        openModal;


    /*
     * =========================================================
     * NAVIGATION
     * =========================================================
     */

    function navigate(
        section,
        updateHash = true
    ) {

        try {

            const target =
                document.getElementById(
                    section
                )
                    ? section
                    : 'home';


            $$(
                '[data-page-section]'
            ).forEach(
                sectionElement => {

                    sectionElement.classList.toggle(
                        'active',
                        sectionElement.id === target
                    );

                }
            );


            $$(
                '[data-section]'
            ).forEach(
                element => {

                    element.classList.toggle(
                        'active',
                        element.dataset.section ===
                        target
                    );

                }
            );


            if (updateHash) {

                history.replaceState(
                    null,
                    '',
                    `#${target}`
                );
            }


            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });


            if (
                target ===
                'personality'
            ) {

                renderPersonalityStart();
            }


            if (
                target ===
                'sports'
            ) {

                renderSports();
            }


            if (
                target ===
                'profile'
            ) {

                renderPlayer();
            }

        } catch (error) {

            console.error(
                'Navigation error:',
                error
            );

            notify(
                'تعذر فتح الصفحة.',
                'error'
            );
        }
    }


    /*
     * =========================================================
     * NAVIGATION EVENTS
     * =========================================================
     */

    function bindNavigation() {

        try {

            $$(
                '[data-section]'
            ).forEach(
                element => {

                    element.addEventListener(
                        'click',
                        event => {

                            const section =
                                element.dataset.section;


                            if (!section) {

                                return;
                            }


                            event.preventDefault();


                            navigate(
                                section
                            );
                        }
                    );
                }
            );


            window.addEventListener(
                'hashchange',
                () => {

                    const section =
                        location.hash
                            .replace(
                                '#',
                                ''
                            ) ||
                        'home';


                    navigate(
                        section,
                        false
                    );
                }
            );

        } catch (error) {

            console.error(
                'Navigation binding error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * RENDER PLAYER
     * =========================================================
     */

    function renderPlayer() {

        try {

            const player =
                state.player;

            const level =
                currentLevel();

            const next =
                nextLevel();


            $$(
                '[data-user-name]'
            ).forEach(
                element => {

                    element.textContent =
                        player.name ||
                        'ZIVO Player';
                }
            );


            $$(
                '[data-user-email]'
            ).forEach(
                element => {

                    element.textContent =
                        player.email ||
                        '';
                }
            );


            $$(
                '[data-level]'
            ).forEach(
                element => {

                    element.textContent =
                        String(
                            level.level
                        );
                }
            );


            $$(
                '[data-level-name]'
            ).forEach(
                element => {

                    element.textContent =
                        level.name[
                            state.lang
                        ] ||
                        level.name.en;
                }
            );


            $$(
                '[data-xp]'
            ).forEach(
                element => {

                    element.textContent =
                        String(
                            Math.floor(
                                player.xp
                            )
                        );
                }
            );


            $$(
                '[data-next-level]'
            ).forEach(
                element => {

                    element.textContent =
                        next
                            ? String(
                                next.minXP
                            )
                            : 'MAX';
                }
            );


            $$(
                '[data-xp-progress]'
            ).forEach(
                element => {

                    let percentage =
                        100;


                    if (next) {

                        percentage =
                            (
                                (
                                    player.xp -
                                    level.minXP
                                ) /
                                (
                                    next.minXP -
                                    level.minXP
                                )
                            ) * 100;


                        percentage =
                            clamp(
                                percentage,
                                0,
                                100
                            );
                    }


                    element.style.width =
                        `${percentage}%`;
                }
            );


            const login =
                $(
                    '[data-action="login"]'
                );


            const logout =
                $(
                    '[data-action="logout"]'
                );


            if (login) {

                login.style.display =
                    player.loggedIn
                        ? 'none'
                        : '';
            }


            if (logout) {

                logout.style.display =
                    player.loggedIn
                        ? ''
                        : 'none';
            }

        } catch (error) {

            console.error(
                'Render player error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * LANGUAGE
     * =========================================================
     */

    function applyLanguage(
        language
    ) {

        try {

            if (
                !I18N[
                    language
                ]
            ) {

                language =
                    'ar';
            }


            state.lang =
                language;


            localStorage.setItem(
                CONFIG.languageKey,
                language
            );


            document.documentElement.lang =
                language;


            document.documentElement.dir =
                I18N[
                    language
                ].dir;


            const selector =
                $(
                    '#languageSelector'
                );


            if (selector) {

                selector.value =
                    language;
            }


            $$(
                '[data-i18n]'
            ).forEach(
                element => {

                    const key =
                        element.dataset.i18n;


                    if (
                        I18N[
                            language
                        ][key]
                    ) {

                        element.textContent =
                            I18N[
                                language
                            ][key];
                    }
                }
            );


            $$(
                '[data-i18n-placeholder]'
            ).forEach(
                element => {

                    const key =
                        element.dataset
                            .i18nPlaceholder;


                    if (
                        I18N[
                            language
                        ][key]
                    ) {

                        element.placeholder =
                            I18N[
                                language
                            ][key];
                    }
                }
            );


            renderPlayer();


            if (
                $('#personality')
                    ?.classList
                    .contains(
                        'active'
                    )
            ) {

                renderPersonalityStart();
            }


            renderSports();

        } catch (error) {

            console.error(
                'Language error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * LANGUAGE EVENT
     * =========================================================
     */

    function bindLanguage() {

        try {

            const selector =
                $(
                    '#languageSelector'
                );


            if (!selector) {

                return;
            }


            selector.addEventListener(
                'change',
                event => {

                    applyLanguage(
                        event.target.value
                    );
                }
            );

        } catch (error) {

            console.error(
                'Language binding error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */

    function login() {

        try {

            openModal(
                'loginModal'
            );


            setTimeout(
                () => {

                    $('#userName')
                        ?.focus();

                },
                50
            );

        } catch (error) {

            console.error(
                'Login open error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * AUTH
     * =========================================================
     */

    function bindAuth() {

        try {

            $(
                '[data-action="login"]'
            )?.addEventListener(
                'click',
                login
            );


            $(
                '[data-action="logout"]'
            )?.addEventListener(
                'click',
                () => {

                    state.player.loggedIn =
                        false;


                    savePlayer();


                    renderPlayer();


                    notify(
                        t('loggedOut'),
                        'success'
                    );
                }
            );


            $(
                '#loginForm'
            )?.addEventListener(
                'submit',
                event => {

                    event.preventDefault();


                    try {

                        const name =
                            $(
                                '#userName'
                            )
                                ?.value
                                .trim()
                                .replace(
                                    /[<>]/g,
                                    ''
                                )
                                .slice(
                                    0,
                                    CONFIG.maxName
                                );


                        const email =
                            $(
                                '#userEmail'
                            )
                                ?.value
                                .trim()
                                .slice(
                                    0,
                                    CONFIG.maxEmail
                                );


                        if (
                            !name ||
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                                .test(
                                    email
                                )
                        ) {

                            notify(
                                'يرجى إدخال اسم وبريد إلكتروني صحيح.',
                                'error'
                            );

                            return;
                        }


                        state.player.name =
                            name;


                        state.player.email =
                            email;


                        state.player.loggedIn =
                            true;


                        savePlayer();


                        renderPlayer();


                        closeModal(
                            'loginModal'
                        );


                        notify(
                            t('saved'),
                            'success'
                        );


                        /*
                         * بعد التسجيل نفتح الملف الشخصي
                         * عندما يكون موجوداً.
                         */

                        if (
                            document.getElementById(
                                'profile'
                            )
                        ) {

                            navigate(
                                'profile'
                            );
                        }

                    } catch (error) {

                        console.error(
                            'Login form error:',
                            error
                        );


                        notify(
                            'تعذر حفظ الحساب.',
                            'error'
                        );
                    }
                }
            );

        } catch (error) {

            console.error(
                'Authentication binding error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * QUESTION BANK
     * =========================================================
     */

    function questionsFor(
        type
    ) {

        try {

            const source =
                QUESTIONS[
                    type
                ] ||
                QUESTIONS.brain;


            const copy =
                source.map(
                    question => ({
                        ...question,
                        a: [
                            ...question.a
                        ]
                    })
                );


            copy.sort(
                () =>
                    Math.random() -
                    0.5
            );


            return copy.slice(
                0,
                3
            );

        } catch (error) {

            console.error(
                'Question generation error:',
                error
            );

            return [];
        }
    }


    /*
     * =========================================================
     * START GAME
     * =========================================================
     */

    function startGame(
        type,
        options = {}
    ) {

        try {

            if (
                !state.player.loggedIn
            ) {

                notify(
                    t('noProfile'),
                    'info'
                );


                login();


                return;
            }


            state.game =
                type;


            state.daily =
                Boolean(
                    options.daily
                );


            state.questions =
                questionsFor(
                    type
                );


            state.index =
                0;


            state.score =
                0;


            state.startedAt =
                Date.now();


            state.busy =
                false;


            state.player.games +=
                1;


            savePlayer();


            navigate(
                'game'
            );


            renderQuestion();

        } catch (error) {

            console.error(
                'Start game error:',
                error
            );


            notify(
                'تعذر تشغيل اللعبة.',
                'error'
            );
        }
    }


    /*
     * =========================================================
     * RENDER QUESTION
     * =========================================================
     */

    function renderQuestion() {

        try {

            const container =
                $(
                    '#gameContainer'
                );


            if (!container) {

                return;
            }


            const question =
                state.questions[
                    state.index
                ];


            if (!question) {

                finishGame();


                return;
            }


            while (
                container.firstChild
            ) {

                container.removeChild(
                    container.firstChild
                );
            }


            const wrapper =
                document.createElement(
                    'div'
                );


            const title =
                document.createElement(
                    'h2'
                );


            title.textContent =
                state.game === 'science'
                    ? '🔬 تحدي العلوم'
                    : '🧠 تحدي الذكاء';


            const meta =
                document.createElement(
                    'p'
                );


            meta.textContent =
                `السؤال ${
                    state.index + 1
                } / ${
                    state.questions.length
                } · Level ${
                    currentLevel().level
                }`;


            const questionElement =
                document.createElement(
                    'div'
                );


            questionElement.className =
                'game-question';


            questionElement.textContent =
                question.q;


            const answers =
                document.createElement(
                    'div'
                );


            answers.className =
                'game-answers';


            question.a.forEach(
                (
                    answer,
                    index
                ) => {

                    const button =
                        document.createElement(
                            'button'
                        );


                    button.type =
                        'button';


                    button.className =
                        'primary-button';


                    button.textContent =
                        answer;


                    button.addEventListener(
                        'click',
                        () =>
                            answerQuestion(
                                index
                            )
                    );


                    answers.appendChild(
                        button
                    );
                }
            );


            wrapper.append(
                title,
                meta,
                questionElement,
                answers
            );


            container.appendChild(
                wrapper
            );

        } catch (error) {

            console.error(
                'Render question error:',
                error
            );


            notify(
                'تعذر عرض السؤال.',
                'error'
            );
        }
    }


    /*
     * =========================================================
     * ANSWER
     * =========================================================
     */

    function answerQuestion(
        index
    ) {

        if (state.busy) {

            return;
        }


        state.busy =
            true;


        try {

            const question =
                state.questions[
                    state.index
                ];


            if (!question) {

                state.busy =
                    false;

                return;
            }


            const correct =
                index ===
                question.c;


            if (correct) {

                state.score +=
                    1;


                state.player.correct +=
                    1;


                state.player.wins +=
                    1;


                state.player.streak +=
                    1;


                state.player.bestStreak =
                    Math.max(
                        state.player.bestStreak,
                        state.player.streak
                    );


                addXP(
                    25
                );


                addZivo(
                    CONFIG.zivoPerCorrect
                );


                notify(
                    t('correct'),
                    'success'
                );

            } else {

                state.player.wrong +=
                    1;


                state.player.losses +=
                    1;


                state.player.streak =
                    0;


                notify(
                    `${t('wrong')}: ${
                        question.a[
                            question.c
                        ]
                    }`,
                    'error'
                );
            }


            savePlayer();


            setTimeout(
                () => {

                    state.index +=
                        1;


                    state.busy =
                        false;


                    renderQuestion();

                },
                700
            );

        } catch (error) {

            state.busy =
                false;


            console.error(
                'Answer error:',
                error
            );


            notify(
                'حدث خطأ في معالجة الإجابة.',
                'error'
            );
        }
    }


    /*
     * =========================================================
     * FINISH GAME
     * =========================================================
     */

    function finishGame() {

        try {

            const total =
                state.questions.length;


            const percentage =
                total
                    ? Math.round(
                        (
                            state.score /
                            total
                        ) * 100
                    )
                    : 0;


            let dailyBonusXP =
                0;


            let dailyBonusZivo =
                0;


            if (
                state.daily &&
                !dailyCompleted()
            ) {

                dailyBonusXP =
                    50;


                dailyBonusZivo =
                    CONFIG.dailyBonusZivo;


                addXP(
                    dailyBonusXP
                );


                addZivo(
                    dailyBonusZivo
                );


                markDaily();
            }


            const container =
                $(
                    '#gameContainer'
                );


            if (!container) {

                return;
            }


            while (
                container.firstChild
            ) {

                container.removeChild(
                    container.firstChild
                );
            }


            const title =
                document.createElement(
                    'h2'
                );


            title.textContent =
                '🏆 انتهت الجولة';


            const result =
                document.createElement(
                    'p'
                );


            result.textContent =
                `النتيجة: ${
                    state.score
                }/${
                    total
                } (${
                    percentage
                }%)`;


            const xp =
                document.createElement(
                    'p'
                );


            xp.textContent =
                `XP: +${
                    state.score * 25 +
                    dailyBonusXP
                }`;


            const zivo =
                document.createElement(
                    'p'
                );


            zivo.textContent =
                `ZIVO: +${
                    (
                        state.score *
                        CONFIG.zivoPerCorrect +
                        dailyBonusZivo
                    ).toFixed(2)
                }`;


            const retry =
                document.createElement(
                    'button'
                );


            retry.type =
                'button';


            retry.className =
                'primary-button';


            retry.textContent =
                t('retry');


            retry.addEventListener(
                'click',
                () =>
                    startGame(
                        state.game,
                        {
                            daily:
                                state.daily
                        }
                    )
            );


            const back =
                document.createElement(
                    'button'
                );


            back.type =
                'button';


            back.className =
                'secondary-button';


            back.textContent =
                t('backGames');


            back.style.marginInlineStart =
                '8px';


            back.addEventListener(
                'click',
                () =>
                    navigate(
                        'games'
                    )
            );


            container.append(
                title,
                result,
                xp,
                zivo,
                retry,
                back
            );


            renderPlayer();

        } catch (error) {

            console.error(
                'Finish game error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * DAILY CHALLENGE
     * =========================================================
     */

    function dailyCompleted() {

        try {

            const data =
                safeJSONParse(
                    localStorage.getItem(
                        CONFIG.dailyKey
                    ),
                    null
                );


            return Boolean(
                data &&
                data.date === today() &&
                data.completed
            );

        } catch (error) {

            console.error(
                'Daily state error:',
                error
            );

            return false;
        }
    }


    function markDaily() {

        try {

            localStorage.setItem(
                CONFIG.dailyKey,
                JSON.stringify({
                    date:
                        today(),

                    completed:
                        true
                })
            );

        } catch (error) {

            console.error(
                'Daily save error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * HORROR GAME
     * =========================================================
     */

    function startHorror() {

        try {

            if (
                !state.player.loggedIn
            ) {

                notify(
                    t('noProfile'),
                    'info'
                );


                login();


                return;
            }


            state.game =
                'horror';


            state.horrorIndex =
                0;


            state.daily =
                false;


            state.busy =
                false;


            navigate(
                'game'
            );


            renderHorror();

        } catch (error) {

            console.error(
                'Horror start error:',
                error
            );


            notify(
                'تعذر تشغيل لعبة الرعب.',
                'error'
            );
        }
    }


    /*
     * =========================================================
     * HORROR RENDER
     * =========================================================
     */

    function renderHorror() {

        try {

            const container =
                $(
                    '#gameContainer'
                );


            if (!container) {

                return;
            }


            while (
                container.firstChild
            ) {

                container.removeChild(
                    container.firstChild
                );
            }


            if (
                state.horrorIndex >=
                HORROR.length
            ) {

                addXP(
                    75
                );


                addZivo(
                    0.05
                );


                savePlayer();


                const title =
                    document.createElement(
                        'h2'
                    );


                title.textContent =
                    '👻 نجوت من الغرفة المظلمة';


                const paragraph =
                    document.createElement(
                        'p'
                    );


                paragraph.textContent =
                    'أكملت القصة التفاعلية وحصلت على مكافأتك.';


                const retry =
                    document.createElement(
                        'button'
                    );


                retry.type =
                    'button';


                retry.className =
                    'primary-button';


                retry.textContent =
                    t('retry');


                retry.addEventListener(
                    'click',
                    startHorror
                );


                container.append(
                    title,
                    paragraph,
                    retry
                );


                return;
            }


            const scene =
                HORROR[
                    state.horrorIndex
                ];


            const title =
                document.createElement(
                    'h2'
                );


            title.textContent =
                '👻 الغرفة المظلمة';


            const paragraph =
                document.createElement(
                    'p'
                );


            paragraph.textContent =
                scene.text;


            const choices =
                document.createElement(
                    'div'
                );


            choices.className =
                'game-answers';


            scene.choices.forEach(
                (
                    choice
                ) => {

                    const button =
                        document.createElement(
                            'button'
                        );


                    button.type =
                        'button';


                    button.className =
                        'primary-button';


                    button.textContent =
                        choice[0];


                    button.addEventListener(
                        'click',
                        () => {

                            state.horrorIndex +=
                                1;


                            state.player.correct +=
                                1;


                            addXP(
                                15
                            );


                            addZivo(
                                0.01
                            );


                            notify(
                                `اختيارك: ${choice[1]}`,
                                'success'
                            );


                            renderHorror();
                        }
                    );


                    choices.appendChild(
                        button
                    );
                }
            );


            container.append(
                title,
                paragraph,
                choices
            );

        } catch (error) {

            console.error(
                'Horror render error:',
                error
            );


            notify(
                'حدث خطأ داخل لعبة الرعب.',
                'error'
            );
        }
    }


    /*
     * =========================================================
     * PERSONALITY START
     * =========================================================
     */

    function renderPersonalityStart() {

        try {

            const container =
                $(
                    '#personalityContainer'
                );


            if (!container) {

                return;
            }


            while (
                container.firstChild
            ) {

                container.removeChild(
                    container.firstChild
                );
            }


            if (
                state.player.personality
            ) {

                renderPersonalityResult();


                return;
            }


            const title =
                document.createElement(
                    'h2'
                );


            title.textContent =
                'ابدأ تحليل من أنا؟';


            const paragraph =
                document.createElement(
                    'p'
                );


            paragraph.textContent =
                'اختبار ترفيهي أولي يساعدك على فهم نمط تفكيرك، وليس تشخيصاً نفسياً.';


            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';


            button.className =
                'primary-button';


            button.textContent =
                t('start');


            button.addEventListener(
                'click',
                startPersonality
            );


            container.append(
                title,
                paragraph,
                button
            );

        } catch (error) {

            console.error(
                'Personality start render error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * PERSONALITY START
     * =========================================================
     */

    function startPersonality() {

        try {

            if (
                !state.player.loggedIn
            ) {

                notify(
                    t('noProfile'),
                    'info'
                );


                login();


                return;
            }


            state.personalityIndex =
                0;


            state.personalityScores =
                {};


            renderPersonalityQuestion();

        } catch (error) {

            console.error(
                'Personality start error:',
                error
            );


            notify(
                'تعذر بدء الاختبار.',
                'error'
            );
        }
    }


    /*
     * =========================================================
     * PERSONALITY QUESTION
     * =========================================================
     */

    function renderPersonalityQuestion() {

        try {

            const container =
                $(
                    '#personalityContainer'
                );


            if (!container) {

                return;
            }


            while (
                container.firstChild
            ) {

                container.removeChild(
                    container.firstChild
                );
            }


            const question =
                PERSONALITY[
                    state.personalityIndex
                ];


            if (!question) {

                renderPersonalityResult();


                return;
            }


            const title =
                document.createElement(
                    'h2'
                );


            title.textContent =
                `${state.personalityIndex + 1} / ${PERSONALITY.length}`;


            const questionElement =
                document.createElement(
                    'div'
                );


            questionElement.className =
                'game-question';


            questionElement.textContent =
                question.q;


            const answers =
                document.createElement(
                    'div'
                );


            answers.className =
                'game-answers';


            question.options.forEach(
                option => {

                    const button =
                        document.createElement(
                            'button'
                        );


                    button.type =
                        'button';


                    button.className =
                        'primary-button';


                    button.textContent =
                        option[0];


                    button.addEventListener(
                        'click',
                        () => {

                            const key =
                                option[1];


                            state.personalityScores[
                                key
                            ] =
                                (
                                    state.personalityScores[
                                        key
                                    ] ||
                                    0
                                ) + 1;


                            state.personalityIndex +=
                                1;


                            renderPersonalityQuestion();
                        }
                    );


                    answers.appendChild(
                        button
                    );
                }
            );


            container.append(
                title,
                questionElement,
                answers
            );

        } catch (error) {

            console.error(
                'Personality question error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * PERSONALITY RESULT
     * =========================================================
     */

    function renderPersonalityResult() {

        try {

            const container =
                $(
                    '#personalityContainer'
                );


            if (!container) {

                return;
            }


            while (
                container.firstChild
            ) {

                container.removeChild(
                    container.firstChild
                );
            }


            const entries =
                Object.entries(
                    state.personalityScores
                ).sort(
                    (
                        a,
                        b
                    ) =>
                        b[1] -
                        a[1]
                );


            const type =
                entries[0]?.[0] ||
                'reflective';


            const names = {

                analytical:
                    'المحلل',

                adventurous:
                    'المغامر',

                social:
                    'الاجتماعي',

                reflective:
                    'المتأمل',

                competitive:
                    'التنافسي',

                growth:
                    'المتطور',

                intuitive:
                    'الحدسي'
            };


            const descriptions = {

                analytical:
                    'تميل إلى الأدلة والتفكير المنظم وحل المشكلات.',

                adventurous:
                    'تميل إلى التجربة والمبادرة والمخاطرة المحسوبة.',

                social:
                    'تستفيد من التواصل والتعاون وتبادل الأفكار.',

                reflective:
                    'تمنح نفسك وقتاً للتفكير وتفضل القرارات الهادئة.',

                competitive:
                    'تحب المنافسة ورفع سقف التحدي.',

                growth:
                    'تركز على التعلم والتطور المستمر.',

                intuitive:
                    'تعتمد بدرجة جيدة على إحساسك الداخلي عند اتخاذ القرار.'
            };


            state.player.personality =
                type;


            addXP(
                100
            );


            addZivo(
                0.10
            );


            savePlayer();


            const title =
                document.createElement(
                    'h2'
                );


            title.textContent =
                `نتيجتك: ${
                    names[type] ||
                    type
                }`;


            const paragraph =
                document.createElement(
                    'p'
                );


            paragraph.textContent =
                descriptions[type] ||
                'لديك نمط شخصي متنوع يجمع أكثر من أسلوب.';


            const note =
                document.createElement(
                    'p'
                );


            note.textContent =
                'هذا تحليل ترفيهي وليس تشخيصاً نفسياً أو طبياً.';


            const retry =
                document.createElement(
                    'button'
                );


            retry.type =
                'button';


            retry.className =
                'secondary-button';


            retry.textContent =
                'إعادة الاختبار';


            retry.addEventListener(
                'click',
                () => {

                    state.player.personality =
                        null;


                    savePlayer();


                    startPersonality();
                }
            );


            container.append(
                title,
                paragraph,
                note,
                retry
            );

        } catch (error) {

            console.error(
                'Personality result error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * ZIVO AI DEMO
     * =========================================================
     *
     * لا يوجد API key هنا.
     *
     * لاحقاً سنربطه بـBackend آمن.
     * =========================================================
     */

    function aiReply(
        message
    ) {

        try {

            const text =
                message.toLowerCase();


            if (
                text.includes('لعب') ||
                text.includes('game')
            ) {

                return 'يمكنك البدء من قسم الألعاب. لديك حالياً تحديات الذكاء والعلوم والرعب.';
            }


            if (
                text.includes('zivo')
            ) {

                return 'ZIVO هي عملة داخلية تجريبية في هذه المرحلة. يحصل اللاعب على كميات صغيرة عند الفوز، وسنضيف Backend قبل أي نظام تداول حقيقي.';
            }


            if (
                text.includes('شخص') ||
                text.includes('نفس')
            ) {

                return 'جرّب قسم «من أنا؟» للحصول على تحليل ترفيهي أولي لنمط تفكيرك.';
            }


            if (
                text.includes('مستوى') ||
                text.includes('xp')
            ) {

                return `مستواك الحالي ${
                    currentLevel().level
                } وXP الخاص بك ${
                    Math.floor(
                        state.player.xp
                    )
                }.`;
            }


            if (
                text.includes('عمر')
            ) {

                return `العمر المسجل في ملفك هو ${
                    state.player.age
                } سنة.`;
            }


            return t(
                'aiLocal'
            );

        } catch (error) {

            console.error(
                'AI reply error:',
                error
            );


            return t(
                'aiLocal'
            );
        }
    }


    /*
     * =========================================================
     * AI FORM
     * =========================================================
     */

    function bindAI() {

        try {

            const form =
                $(
                    '#aiForm'
                );


            if (!form) {

                return;
            }


            form.addEventListener(
                'submit',
                event => {

                    event.preventDefault();


                    try {

                        const input =
                            $(
                                '#aiInput'
                            );


                        const message =
                            input
                                ?.value
                                .trim()
                                .slice(
                                    0,
                                    1000
                                );


                        if (!message) {

                            return;
                        }


                        const box =
                            $(
                                '#aiMessages'
                            );


                        if (!box) {

                            return;
                        }


                        const userMessage =
                            document.createElement(
                                'div'
                            );


                        userMessage.className =
                            'ai-message user';


                        userMessage.textContent =
                            message;


                        const assistantMessage =
                            document.createElement(
                                'div'
                            );


                        assistantMessage.className =
                            'ai-message assistant';


                        assistantMessage.textContent =
                            aiReply(
                                message
                            );


                        box.append(
                            userMessage,
                            assistantMessage
                        );


                        input.value =
                            '';


                        box.scrollTop =
                            box.scrollHeight;

                    } catch (error) {

                        console.error(
                            'AI submit error:',
                            error
                        );


                        notify(
                            'تعذر إرسال الرسالة.',
                            'error'
                        );
                    }
                }
            );

        } catch (error) {

            console.error(
                'AI binding error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * SPORTS
     * =========================================================
     */

    function renderSports() {

        try {

            const container =
                $(
                    '#sportsNews'
                );


            if (!container) {

                return;
            }


            while (
                container.firstChild
            ) {

                container.removeChild(
                    container.firstChild
                );
            }


            SPORTS.forEach(
                article => {

                    const card =
                        document.createElement(
                            'article'
                        );


                    card.className =
                        'news-card';


                    const tag =
                        document.createElement(
                            'span'
                        );


                    tag.textContent =
                        article[0];


                    const title =
                        document.createElement(
                            'h3'
                        );


                    title.textContent =
                        article[1];


                    card.append(
                        tag,
                        title
                    );


                    container.appendChild(
                        card
                    );
                }
            );

        } catch (error) {

            console.error(
                'Sports render error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * BUTTON ACTIONS
     * =========================================================
     */

    function bindActions() {

        try {

            /*
             * تحديث الرياضة
             */

            $$(
                '[data-action="refresh-sports"]'
            ).forEach(
                button => {

                    button.addEventListener(
                        'click',
                        () => {

                            renderSports();


                            notify(
                                t('news'),
                                'success'
                            );
                        }
                    );
                }
            );


            /*
             * الإعلان
             */

            const adButton =
                $(
                    '.ad-button'
                );


            if (adButton) {

                adButton.addEventListener(
                    'click',
                    () => {

                        notify(
                            t('ad'),
                            'info'
                        );
                    }
                );
            }


            /*
             * روابط الفوتر التي لم يتم بناء صفحاتها بعد.
             * بدلاً من فتح # وعدم حدوث شيء،
             * نعطي المستخدم استجابة واضحة.
             */

            $$(
                'footer a[href="#"]'
            ).forEach(
                link => {

                    link.addEventListener(
                        'click',
                        event => {

                            event.preventDefault();


                            notify(
                                'هذه الصفحة سيتم تفعيلها في المرحلة التالية.',
                                'info'
                            );
                        }
                    );
                }
            );


            /*
             * جميع أزرار الألعاب الحالية.
             */

            $$(
                '[data-game]'
            ).forEach(
                button => {

                    button.addEventListener(
                        'click',
                        () => {

                            const game =
                                button.dataset.game;


                            if (
                                game ===
                                'brain'
                            ) {

                                startGame(
                                    'brain',
                                    {
                                        daily:
                                            Boolean(
                                                button.closest(
                                                    '#dailyChallenge'
                                                )
                                            )
                                    }
                                );


                                return;
                            }


                            if (
                                game ===
                                'science'
                            ) {

                                startGame(
                                    'science'
                                );


                                return;
                            }


                            if (
                                game ===
                                'horror'
                            ) {

                                startHorror();
                            }
                        }
                    );
                }
            );

        } catch (error) {

            console.error(
                'Action binding error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * GLOBAL MODAL EVENTS
     * =========================================================
     */

    function bindGlobalModalEvents() {

        try {

            document.addEventListener(
                'click',
                event => {

                    if (
                        event.target.classList
                            .contains(
                                'modal-overlay'
                            )
                    ) {

                        const modal =
                            event.target.closest(
                                '.modal'
                            );


                        if (modal) {

                            modal.classList.remove(
                                'active'
                            );
                        }
                    }
                }
            );


            document.addEventListener(
                'keydown',
                event => {

                    if (
                        event.key !==
                        'Escape'
                    ) {

                        return;
                    }


                    $$(
                        '.modal.active'
                    ).forEach(
                        modal => {

                            modal.classList.remove(
                                'active'
                            );
                        }
                    );
                }
            );

        } catch (error) {

            console.error(
                'Modal events error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * LOADING SCREEN
     * =========================================================
     */

    function hideLoading() {

        try {

            setTimeout(
                () => {

                    const loading =
                        $(
                            '#loadingScreen'
                        );


                    if (!loading) {

                        return;
                    }


                    loading.classList.add(
                        'hidden'
                    );


                    setTimeout(
                        () => {

                            loading.style.display =
                                'none';

                        },
                        500
                    );

                },
                500
            );

        } catch (error) {

            console.error(
                'Loading screen error:',
                error
            );
        }
    }


    /*
     * =========================================================
     * INITIALIZATION
     * =========================================================
     */

    function init() {

        try {

            loadPlayer();


            bindNavigation();


            bindLanguage();


            bindAuth();


            bindAI();


            bindActions();


            bindGlobalModalEvents();


            const year =
                $(
                    '#currentYear'
                );


            if (year) {

                year.textContent =
                    new Date()
                        .getFullYear();
            }


            applyLanguage(
                state.lang
            );


            renderPlayer();


            renderSports();


            const initial =
                (
                    location.hash ||
                    '#home'
                ).slice(1);


            navigate(
                document.getElementById(
                    initial
                )
                    ? initial
                    : 'home',
                false
            );


            hideLoading();


            console.info(
                `ZIVOZONE ${CONFIG.version} initialized successfully.`
            );

        } catch (error) {

            console.error(
                'CRITICAL ZIVOZONE INITIALIZATION ERROR:',
                error
            );


            hideLoading();


            notify(
                'حدث خطأ أثناء تشغيل الموقع.',
                'error'
            );
        }
    }


    /*
     * =========================================================
     * PUBLIC ZIVOZONE API
     * =========================================================
     */

    window.ZIVOZONE = {

        version:
            CONFIG.version,


        getPlayer:
            () => ({
                ...state.player,

                level:
                    currentLevel().level,

                levelName:
                    currentLevel().name[
                        state.lang
                    ] ||
                    currentLevel().name.en,

                difficulty:
                    difficulty()
            }),


        navigate,


        startGame,


        startHorror,


        startPersonality,


        addXP,


        addZivo,


        notify,


        reset:
            () => {

                try {

                    localStorage.removeItem(
                        CONFIG.storageKey
                    );


                    localStorage.removeItem(
                        CONFIG.dailyKey
                    );


                    location.reload();

                } catch (error) {

                    console.error(
                        'Reset error:',
                        error
                    );
                }
            }
    };


    /*
     * =========================================================
     * START
     * =========================================================
     */

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

})();
