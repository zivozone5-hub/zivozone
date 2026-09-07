/**
 * ============================================================
 * ZIVOZONE - Main Application
 * ============================================================
 *
 * المسؤوليات:
 * - تشغيل واجهة الموقع
 * - نظام الألعاب
 * - الأسئلة حسب المستوى
 * - XP / Level
 * - ZIVO Coins
 * - التحديات اليومية
 * - اختبار "من أنا؟"
 * - ZIVO AI التجريبي
 * - اللغات
 * - ربط واجهة اللاعب مع auth.js
 *
 * يعتمد على:
 *   index.html
 *   styles.css
 *   auth.js
 * ============================================================
 */

"use strict";


/* ============================================================
   APPLICATION STATE
============================================================ */

const ZIVO = {

    version: "1.0.0",

    language: "ar",

    player: {
        uid: null,
        name: "Guest",
        email: "",
        age: null,
        level: 1,
        xp: 0,
        coins: 0,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
        streak: 0
    },

    isLoggedIn: false,

    currentGame: null,

    currentQuestionIndex: 0,

    currentQuestions: [],

    gameScore: 0,

    gameAnswered: false,

    identityAnswers: [],

    identityIndex: 0,

    initialized: false
};


/* ============================================================
   CONSTANTS
============================================================ */

const STORAGE_KEYS = {

    language: "zivozone_language",

    guestProgress: "zivozone_guest_progress",

    dailyChallenge: "zivozone_daily_challenge",

    identityResult: "zivozone_identity_result"

};


const LEVEL_XP = 100;


/* ============================================================
   TRANSLATIONS
============================================================ */

const TRANSLATIONS = {

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
        logout: "تسجيل الخروج",

        heroTitle: "عالمك يبدأ من هنا",
        heroText:
            "ألعاب وتحديات وذكاء ورعب وعلوم ورياضة واكتشاف للشخصية في عالم رقمي واحد.",

        startPlaying: "ابدأ اللعب",
        discoverMe: "اكتشف نفسك",

        languages: "لغات",
        gameModes: "أنماط ألعاب",

        ad: "إعلان",
        adTitle: "مساحتك الإعلانية هنا",
        adText:
            "مكان جاهز للإعلانات والرعاة عند إطلاق المنصة.",
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
            "بيانات اللاعب المسجل يتم حفظها في حساب ZIVOZONE وقاعدة البيانات السحابية.",

        guest: "زائر",

        loginRequired:
            "يجب تسجيل الدخول حتى تتمكن من حفظ تقدمك على حسابك.",

        guestMode:
            "أنت تلعب الآن بوضع الزائر. سجّل الدخول لحفظ تقدمك.",

        correct: "إجابة صحيحة!",
        wrong: "إجابة غير صحيحة",

        next: "التالي",
        finish: "إنهاء",

        score: "النقاط",
        question: "السؤال",
        xp: "XP",
        coins: "ZIVO",

        gameComplete: "انتهت اللعبة!",
        challengeComplete: "أكملت التحدي!",

        dailyComplete:
            "لقد أكملت تحدي اليوم بالفعل. عد غدًا لتحدٍ جديد.",

        identityResult: "نتيجة تحليل شخصيتك",

        identityIntro:
            "اختر الإجابة الأقرب إليك. هذا الاختبار ترفيهي وليس تشخيصًا نفسيًا.",

        close: "إغلاق",

        adInfo:
            "هذه مساحة مخصصة للإعلانات والرعاة. سيتم ربطها لاحقًا بنظام إعلاني حقيقي.",

        noSports:
            "لا توجد أخبار رياضية محملة حاليًا. سيتم ربط مصدر أخبار مباشر لاحقًا.",

        aiThinking: "ZIVO AI يفكر...",

        loginTitle: "تسجيل الدخول",

        registerTitle: "إنشاء حساب لاعب",

        name: "اسم اللاعب",

        age: "العمر",

        email: "البريد الإلكتروني",

        password: "كلمة المرور",

        loginAction: "دخول",

        registerAction: "إنشاء الحساب",

        switchRegister: "ليس لديك حساب؟ إنشاء حساب",

        switchLogin: "لديك حساب؟ تسجيل الدخول",

        cancel: "إلغاء",

        welcome: "مرحبًا",

        logoutSuccess: "تم تسجيل الخروج بنجاح.",

        loginSuccess: "تم تسجيل الدخول بنجاح.",

        registerSuccess: "تم إنشاء حسابك بنجاح.",

        invalidForm: "يرجى تعبئة جميع البيانات بشكل صحيح.",

        ageQuestion: "اختر عمرك الحقيقي للحصول على تجربة مناسبة لمستواك.",

        level: "المستوى",

        wins: "الفوز",

        gamesPlayed: "الألعاب",

        streak: "سلسلة",

        daily: "يومي",

        reward: "المكافأة",

        today: "اليوم",

        playAgain: "العب مرة أخرى",

        identityRestart: "إعادة الاختبار",

        identityProfiles: {

            explorer: {
                title: "المستكشف",
                text:
                    "تحب التجربة واكتشاف الأشياء الجديدة، وتميل إلى خوض التحديات بدل الابتعاد عنها."
            },

            thinker: {
                title: "المفكر",
                text:
                    "تميل إلى تحليل المعلومات والتفكير قبل اتخاذ القرار، وتحب الأسئلة التي تحتاج تركيزًا."
            },

            competitor: {
                title: "المنافس",
                text:
                    "تحب التحدي والنتائج والمنافسة، وتستمتع برفع مستواك وتحقيق أرقام أفضل."
            },

            creative: {
                title: "المبدع",
                text:
                    "تميل إلى الأفكار الجديدة والحلول غير التقليدية، وتحب التجارب التي تمنحك حرية الاختيار."
            }
        }
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
        logout: "Logout",

        heroTitle: "Your World Starts Here",
        heroText:
            "Games, challenges, intelligence, horror, science, sports and self-discovery in one digital world.",

        startPlaying: "Start Playing",
        discoverMe: "Discover Yourself",

        languages: "Languages",
        gameModes: "Game Modes",

        ad: "AD",
        adTitle: "Your Advertising Space",
        adText:
            "A ready space for advertisers and sponsors.",
        details: "Details",

        gamesTitle: "Play & Level Up",

        speedTitle: "IQ Speed Test",
        speedDesc: "Questions adapt to the player's age and level.",

        horrorTitle: "The Dark Room",
        horrorDesc: "An interactive story where your choices change the ending.",

        scienceTitle: "Science Challenge",
        scienceDesc: "Fun science questions that grow with your level.",

        dailyTitle: "ZIVO Daily Challenge",
        dailyDesc: "One daily mission with a special reward.",

        playNow: "Play Now",
        start: "Start",

        challengeTitle: "Challenge Center",

        identityTitle: "Discover Your ZIVOZONE Personality",
        identityText:
            "A fun experience based on your choices. It provides a general description of your playing and thinking style. It is not a psychological or medical diagnosis.",
        takeTest: "Start Test",

        aiTitle: "ZIVO AI Assistant",
        aiWelcome:
            "Welcome to ZIVO AI 🤖 Ask me about games, your level or challenge ideas.",
        aiPlaceholder: "Write your question...",
        send: "Send",
        aiNote:
            "The current ZIVO AI version is experimental. A secure backend AI model will be connected later.",

        sportsTitle: "Global Sports News",
        refresh: "Refresh",

        editProfile: "Create/Edit Profile",

        profileNote:
            "Registered player data is saved to the ZIVOZONE account and cloud database.",

        guest: "Guest",

        loginRequired:
            "Please log in to save your progress to your account.",

        guestMode:
            "You are playing as a guest. Log in to save your progress.",

        correct: "Correct!",
        wrong: "Incorrect",

        next: "Next",
        finish: "Finish",

        score: "Score",
        question: "Question",
        xp: "XP",
        coins: "ZIVO",

        gameComplete: "Game Complete!",
        challengeComplete: "Challenge Complete!",

        dailyComplete:
            "You already completed today's challenge. Come back tomorrow.",

        identityResult: "Your Personality Result",

        identityIntro:
            "Choose the answer closest to you. This is entertainment, not psychological diagnosis.",

        close: "Close",

        adInfo:
            "This space is reserved for advertisers and sponsors.",

        noSports:
            "No sports news is currently loaded. A live source will be connected later.",

        aiThinking: "ZIVO AI is thinking...",

        loginTitle: "Login",
        registerTitle: "Create Player Account",

        name: "Player Name",
        age: "Age",
        email: "Email",
        password: "Password",

        loginAction: "Login",
        registerAction: "Create Account",

        switchRegister: "Don't have an account? Create one",
        switchLogin: "Already have an account? Login",

        cancel: "Cancel",

        welcome: "Welcome",

        logoutSuccess: "Successfully logged out.",
        loginSuccess: "Successfully logged in.",
        registerSuccess: "Your account has been created successfully.",

        invalidForm: "Please complete all fields correctly.",

        ageQuestion:
            "Enter your real age to receive an experience suitable for your level.",

        level: "Level",
        wins: "Wins",
        gamesPlayed: "Games",
        streak: "Streak",

        daily: "Daily",
        reward: "Reward",
        today: "Today",

        playAgain: "Play Again",

        identityRestart: "Restart Test",

        identityProfiles: {

            explorer: {
                title: "The Explorer",
                text:
                    "You enjoy discovering new things and taking on challenges."
            },

            thinker: {
                title: "The Thinker",
                text:
                    "You tend to analyze information and think before making decisions."
            },

            competitor: {
                title: "The Competitor",
                text:
                    "You enjoy challenges, results and improving your performance."
            },

            creative: {
                title: "The Creative",
                text:
                    "You enjoy new ideas and unconventional solutions."
            }
        }
    }

};


/* ============================================================
   GAME DATABASE
============================================================ */

const GAME_DATABASE = {

    quiz: {

        title: {
            ar: "اختبار سرعة الذكاء",
            en: "IQ Speed Test"
        },

        rewardXP: 50,

        rewardCoins: 5,

        questions: [

            {
                level: 1,

                question: {
                    ar: "ما العدد التالي؟ 2، 4، 6، 8، ؟",
                    en: "What comes next? 2, 4, 6, 8, ?"
                },

                answers: [
                    {
                        ar: "9",
                        en: "9",
                        correct: false
                    },
                    {
                        ar: "10",
                        en: "10",
                        correct: true
                    },
                    {
                        ar: "11",
                        en: "11",
                        correct: false
                    },
                    {
                        ar: "12",
                        en: "12",
                        correct: false
                    }
                ]
            },


            {
                level: 1,

                question: {
                    ar: "أي كلمة مختلفة عن البقية؟",
                    en: "Which word is different?"
                },

                answers: [
                    {
                        ar: "تفاحة",
                        en: "Apple",
                        correct: false
                    },
                    {
                        ar: "موز",
                        en: "Banana",
                        correct: false
                    },
                    {
                        ar: "برتقال",
                        en: "Orange",
                        correct: false
                    },
                    {
                        ar: "سيارة",
                        en: "Car",
                        correct: true
                    }
                ]
            },


            {
                level: 2,

                question: {
                    ar: "إذا كان لديك 3 صناديق وفي كل صندوق 4 كرات، كم كرة لديك؟",
                    en: "If you have 3 boxes with 4 balls each, how many balls do you have?"
                },

                answers: [
                    {
                        ar: "7",
                        en: "7",
                        correct: false
                    },
                    {
                        ar: "10",
                        en: "10",
                        correct: false
                    },
                    {
                        ar: "12",
                        en: "12",
                        correct: true
                    },
                    {
                        ar: "14",
                        en: "14",
                        correct: false
                    }
                ]
            },


            {
                level: 2,

                question: {
                    ar: "ما العدد المفقود؟ 5، 10، 15، 20، ؟",
                    en: "What number is missing? 5, 10, 15, 20, ?"
                },

                answers: [
                    {
                        ar: "22",
                        en: "22",
                        correct: false
                    },
                    {
                        ar: "24",
                        en: "24",
                        correct: false
                    },
                    {
                        ar: "25",
                        en: "25",
                        correct: true
                    },
                    {
                        ar: "30",
                        en: "30",
                        correct: false
                    }
                ]
            },


            {
                level: 3,

                question: {
                    ar: "إذا تجاوزت الشخص صاحب المركز الثاني في سباق، ما مركزك؟",
                    en: "If you pass the person in second place, what position are you in?"
                },

                answers: [
                    {
                        ar: "الأول",
                        en: "First",
                        correct: false
                    },
                    {
                        ar: "الثاني",
                        en: "Second",
                        correct: true
                    },
                    {
                        ar: "الثالث",
                        en: "Third",
                        correct: false
                    },
                    {
                        ar: "الرابع",
                        en: "Fourth",
                        correct: false
                    }
                ]
            },


            {
                level: 4,

                question: {
                    ar: "إذا كانت جميع الزهور نباتات وبعض النباتات أشجار، فهل جميع الزهور أشجار؟",
                    en: "If all flowers are plants and some plants are trees, are all flowers trees?"
                },

                answers: [
                    {
                        ar: "نعم",
                        en: "Yes",
                        correct: false
                    },
                    {
                        ar: "لا يمكن الاستنتاج",
                        en: "Cannot be concluded",
                        correct: true
                    },
                    {
                        ar: "دائمًا",
                        en: "Always",
                        correct: false
                    },
                    {
                        ar: "فقط أحيانًا",
                        en: "Only sometimes",
                        correct: false
                    }
                ]
            }

        ]
    },


    science: {

        title: {
            ar: "تحدي العلوم",
            en: "Science Challenge"
        },

        rewardXP: 60,

        rewardCoins: 6,

        questions: [

            {
                level: 1,

                question: {
                    ar: "ما الكوكب المعروف بالكوكب الأحمر؟",
                    en: "Which planet is known as the Red Planet?"
                },

                answers: [
                    {
                        ar: "المريخ",
                        en: "Mars",
                        correct: true
                    },
                    {
                        ar: "الزهرة",
                        en: "Venus",
                        correct: false
                    },
                    {
                        ar: "المشتري",
                        en: "Jupiter",
                        correct: false
                    },
                    {
                        ar: "عطارد",
                        en: "Mercury",
                        correct: false
                    }
                ]
            },


            {
                level: 1,

                question: {
                    ar: "ما الغاز الذي يحتاجه الإنسان للتنفس؟",
                    en: "Which gas do humans need to breathe?"
                },

                answers: [
                    {
                        ar: "الأكسجين",
                        en: "Oxygen",
                        correct: true
                    },
                    {
                        ar: "الهيدروجين",
                        en: "Hydrogen",
                        correct: false
                    },
                    {
                        ar: "الهيليوم",
                        en: "Helium",
                        correct: false
                    },
                    {
                        ar: "النيون",
                        en: "Neon",
                        correct: false
                    }
                ]
            },


            {
                level: 2,

                question: {
                    ar: "ما العضو الذي يضخ الدم في الجسم؟",
                    en: "Which organ pumps blood through the body?"
                },

                answers: [
                    {
                        ar: "الرئة",
                        en: "Lung",
                        correct: false
                    },
                    {
                        ar: "القلب",
                        en: "Heart",
                        correct: true
                    },
                    {
                        ar: "الكبد",
                        en: "Liver",
                        correct: false
                    },
                    {
                        ar: "المعدة",
                        en: "Stomach",
                        correct: false
                    }
                ]
            },


            {
                level: 3,

                question: {
                    ar: "ما القوة التي تجعل الأجسام تسقط نحو الأرض؟",
                    en: "What force makes objects fall toward Earth?"
                },

                answers: [
                    {
                        ar: "المغناطيسية",
                        en: "Magnetism",
                        correct: false
                    },
                    {
                        ar: "الجاذبية",
                        en: "Gravity",
                        correct: true
                    },
                    {
                        ar: "الاحتكاك",
                        en: "Friction",
                        correct: false
                    },
                    {
                        ar: "الضغط",
                        en: "Pressure",
                        correct: false
                    }
                ]
            }

        ]
    },


    daily: {

        title: {
            ar: "تحدي ZIVO اليومي",
            en: "ZIVO Daily Challenge"
        },

        rewardXP: 30,

        rewardCoins: 3,

        questions: [

            {
                level: 1,

                question: {
                    ar: "ما العدد الذي يأتي بعد 99؟",
                    en: "What number comes after 99?"
                },

                answers: [
                    {
                        ar: "100",
                        en: "100",
                        correct: true
                    },
                    {
                        ar: "101",
                        en: "101",
                        correct: false
                    },
                    {
                        ar: "98",
                        en: "98",
                        correct: false
                    },
                    {
                        ar: "90",
                        en: "90",
                        correct: false
                    }
                ]
            },


            {
                level: 2,

                question: {
                    ar: "أي حيوان يُعرف بأنه الأسرع على اليابسة؟",
                    en: "Which animal is known as the fastest land animal?"
                },

                answers: [
                    {
                        ar: "الفهد",
                        en: "Cheetah",
                        correct: true
                    },
                    {
                        ar: "الأسد",
                        en: "Lion",
                        correct: false
                    },
                    {
                        ar: "حصان",
                        en: "Horse",
                        correct: false
                    },
                    {
                        ar: "ذئب",
                        en: "Wolf",
                        correct: false
                    }
                ]
            },


            {
                level: 3,

                question: {
                    ar: "كم عدد القارات على كوكب الأرض؟",
                    en: "How many continents are there on Earth?"
                },

                answers: [
                    {
                        ar: "5",
                        en: "5",
                        correct: false
                    },
                    {
                        ar: "6",
                        en: "6",
                        correct: false
                    },
                    {
                        ar: "7",
                        en: "7",
                        correct: true
                    },
                    {
                        ar: "8",
                        en: "8",
                        correct: false
                    }
                ]
            }

        ]
    }

};


/* ============================================================
   IDENTITY TEST
============================================================ */

const IDENTITY_QUESTIONS = [

    {

        question: {
            ar: "عندما تواجه لغزًا صعبًا، ماذا تفعل؟",
            en: "When you face a difficult puzzle, what do you do?"
        },

        answers: [

            {
                text: {
                    ar: "أبحث عن طريقة جديدة",
                    en: "I look for a new way"
                },
                type: "creative"
            },

            {
                text: {
                    ar: "أحلله خطوة بخطوة",
                    en: "I analyze it step by step"
                },
                type: "thinker"
            },

            {
                text: {
                    ar: "أتحدى نفسي حتى أحله",
                    en: "I challenge myself until I solve it"
                },
                type: "competitor"
            },

            {
                text: {
                    ar: "أجرب أكثر من احتمال",
                    en: "I try different possibilities"
                },
                type: "explorer"
            }

        ]

    },


    {

        question: {
            ar: "ما الذي يجذبك أكثر في ZIVOZONE؟",
            en: "What attracts you most in ZIVOZONE?"
        },

        answers: [

            {
                text: {
                    ar: "الأفكار والتجارب الجديدة",
                    en: "New ideas and experiences"
                },
                type: "explorer"
            },

            {
                text: {
                    ar: "الألغاز والأسئلة",
                    en: "Puzzles and questions"
                },
                type: "thinker"
            },

            {
                text: {
                    ar: "المنافسة والنتائج",
                    en: "Competition and results"
                },
                type: "competitor"
            },

            {
                text: {
                    ar: "صناعة أفكار مختلفة",
                    en: "Creating different ideas"
                },
                type: "creative"
            }

        ]

    },


    {

        question: {
            ar: "إذا أعطاك الموقع تحديًا جديدًا لم تجربه من قبل؟",
            en: "If the site gives you a challenge you have never tried before?"
        },

        answers: [

            {
                text: {
                    ar: "أجربه فورًا",
                    en: "I try it immediately"
                },
                type: "explorer"
            },

            {
                text: {
                    ar: "أفهم القواعد أولًا",
                    en: "I understand the rules first"
                },
                type: "thinker"
            },

            {
                text: {
                    ar: "أريد أن أكون الأفضل",
                    en: "I want to be the best"
                },
                type: "competitor"
            },

            {
                text: {
                    ar: "أحاول إيجاد أسلوب خاص",
                    en: "I try to find my own style"
                },
                type: "creative"
            }

        ]

    },


    {

        question: {
            ar: "أي نوع من الإنجازات يشعرك بالرضا؟",
            en: "Which achievement feels best to you?"
        },

        answers: [

            {
                text: {
                    ar: "اكتشاف شيء جديد",
                    en: "Discovering something new"
                },
                type: "explorer"
            },

            {
                text: {
                    ar: "الوصول إلى الإجابة الصحيحة",
                    en: "Finding the correct answer"
                },
                type: "thinker"
            },

            {
                text: {
                    ar: "تحطيم رقمي السابق",
                    en: "Beating my previous score"
                },
                type: "competitor"
            },

            {
                text: {
                    ar: "ابتكار حل غير متوقع",
                    en: "Creating an unexpected solution"
                },
                type: "creative"
            }

        ]

    }

];


/* ============================================================
   DOM HELPERS
============================================================ */

function $(selector, parent = document) {

    try {

        return parent.querySelector(selector);

    } catch (error) {

        console.error(
            "ZIVOZONE DOM selector error:",
            selector,
            error
        );

        return null;
    }
}


function $all(selector, parent = document) {

    try {

        return Array.from(
            parent.querySelectorAll(selector)
        );

    } catch (error) {

        console.error(
            "ZIVOZONE DOM selectors error:",
            selector,
            error
        );

        return [];
    }
}


/* ============================================================
   SAFE TEXT
============================================================ */

function escapeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value);
}


/* ============================================================
   TRANSLATION
============================================================ */

function t(key) {

    const dictionary =
        TRANSLATIONS[ZIVO.language] ||
        TRANSLATIONS.ar;


    const keys =
        String(key).split(".");


    let result = dictionary;


    for (const part of keys) {

        if (
            result &&
            Object.prototype.hasOwnProperty.call(
                result,
                part
            )
        ) {

            result = result[part];

        } else {

            return key;
        }
    }


    return result;
}


/* ============================================================
   APPLY LANGUAGE
============================================================ */

function applyLanguage(language) {

    try {

        const validLanguages =
            Object.keys(TRANSLATIONS);


        if (
            !validLanguages.includes(language)
        ) {

            language = "ar";
        }


        ZIVO.language =
            language;


        document.documentElement.lang =
            language;


        document.documentElement.dir =
            language === "ar"
                ? "rtl"
                : "ltr";


        const select =
            $("#language-select");


        if (select) {
            select.value = language;
        }


        $all("[data-i18n]")
            .forEach(element => {

                const key =
                    element.dataset.i18n;


                const value =
                    t(key);


                if (
                    typeof value === "string"
                ) {

                    element.textContent =
                        value;
                }
            });


        $all("[data-i18n-placeholder]")
            .forEach(element => {

                const key =
                    element.dataset.i18nPlaceholder;


                const value =
                    t(key);


                if (
                    typeof value === "string"
                ) {

                    element.placeholder =
                        value;
                }
            });


        localStorage.setItem(
            STORAGE_KEYS.language,
            language
        );


        renderChallenges();

        renderSports();

        updatePlayerUI();


    } catch (error) {

        console.error(
            "ZIVOZONE language error:",
            error
        );
    }
}


/* ============================================================
   LOAD GUEST PROGRESS
============================================================ */

function loadGuestProgress() {

    try {

        const raw =
            localStorage.getItem(
                STORAGE_KEYS.guestProgress
            );


        if (!raw) {
            return;
        }


        const data =
            JSON.parse(raw);


        if (
            !data ||
            typeof data !== "object"
        ) {
            return;
        }


        ZIVO.player = {

            ...ZIVO.player,

            level:
                Number(data.level) || 1,

            xp:
                Number(data.xp) || 0,

            coins:
                Number(data.coins) || 0,

            wins:
                Number(data.wins) || 0,

            losses:
                Number(data.losses) || 0,

            gamesPlayed:
                Number(data.gamesPlayed) || 0,

            streak:
                Number(data.streak) || 0

        };


    } catch (error) {

        console.error(
            "ZIVOZONE guest progress error:",
            error
        );
    }
}


/* ============================================================
   SAVE GUEST PROGRESS
============================================================ */

function saveGuestProgress() {

    try {

        if (ZIVO.isLoggedIn) {
            return;
        }


        const data = {

            level:
                ZIVO.player.level,

            xp:
                ZIVO.player.xp,

            coins:
                ZIVO.player.coins,

            wins:
                ZIVO.player.wins,

            losses:
                ZIVO.player.losses,

            gamesPlayed:
                ZIVO.player.gamesPlayed,

            streak:
                ZIVO.player.streak

        };


        localStorage.setItem(
            STORAGE_KEYS.guestProgress,
            JSON.stringify(data)
        );


    } catch (error) {

        console.error(
            "ZIVOZONE save progress error:",
            error
        );
    }
}


/* ============================================================
   CALCULATE LEVEL
============================================================ */

function calculateLevel(xp) {

    const safeXP =
        Math.max(
            0,
            Number(xp) || 0
        );


    return Math.max(
        1,
        Math.floor(
            safeXP / LEVEL_XP
        ) + 1
    );
}


/* ============================================================
   ADD XP
============================================================ */

function addXP(amount) {

    try {

        const safeAmount =
            Math.max(
                0,
                Math.floor(
                    Number(amount) || 0
                )
            );


        const previousLevel =
            ZIVO.player.level;


        ZIVO.player.xp +=
            safeAmount;


        ZIVO.player.level =
            calculateLevel(
                ZIVO.player.xp
            );


        saveGuestProgress();

        updatePlayerUI();


        if (
            ZIVO.player.level >
            previousLevel
        ) {

            showNotification(
                `🎉 ${t("level")} ${ZIVO.player.level}!`,
                "success"
            );
        }


    } catch (error) {

        console.error(
            "ZIVOZONE XP error:",
            error
        );
    }
}


/* ============================================================
   ADD ZIVO COINS
============================================================ */

function addCoins(amount) {

    try {

        const safeAmount =
            Math.max(
                0,
                Math.floor(
                    Number(amount) || 0
                )
            );


        ZIVO.player.coins +=
            safeAmount;


        saveGuestProgress();

        updatePlayerUI();


    } catch (error) {

        console.error(
            "ZIVOZONE coins error:",
            error
        );
    }
}


/* ============================================================
   UPDATE PLAYER UI
============================================================ */

function updatePlayerUI() {

    try {

        const player =
            ZIVO.player;


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


        if (name) {

            name.textContent =
                player.name ||
                t("guest");
        }


        if (email) {

            email.textContent =
                player.email ||
                t("guestMode");
        }


        if (level) {

            level.textContent =
                player.level;
        }


        if (xp) {

            xp.textContent =
                player.xp;
        }


        if (coins) {

            coins.textContent =
                player.coins;
        }


        if (wins) {

            wins.textContent =
                player.wins;
        }


        if (levelChip) {

            levelChip.textContent =
                `${t("level")} ${player.level}`;
        }


        const progress =
            $("#xp-progress");


        if (progress) {

            const currentLevelXP =
                player.xp %
                LEVEL_XP;


            const percentage =
                Math.min(
                    100,
                    Math.max(
                        0,
                        currentLevelXP
                    )
                );


            progress.style.width =
                `${percentage}%`;
        }


        updateAuthButtons();


    } catch (error) {

        console.error(
            "ZIVOZONE player UI error:",
            error
        );
    }
}


/* ============================================================
   AUTH BUTTONS
============================================================ */

function updateAuthButtons() {

    try {

        const login =
            $("#login-btn");


        const logout =
            $("#logout-btn");


        if (login) {

            login.hidden =
                ZIVO.isLoggedIn;
        }


        if (logout) {

            logout.hidden =
                !ZIVO.isLoggedIn;
        }


    } catch (error) {

        console.error(
            "ZIVOZONE auth UI error:",
            error
        );
    }
}


/* ============================================================
   AUTH EVENT HANDLER
============================================================ */

function setupAuthListener() {

    window.addEventListener(
        "zivozone-auth",
        async event => {

            try {

                const detail =
                    event.detail || {};


                ZIVO.isLoggedIn =
                    Boolean(
                        detail.loggedIn
                    );


                if (
                    detail.loggedIn &&
                    detail.user
                ) {

                    const user =
                        detail.user;


                    const player =
                        detail.player ||
                        {};


                    ZIVO.player = {

                        ...ZIVO.player,

                        ...player,

                        uid:
                            user.uid,

                        name:
                            player.name ||
                            user.displayName ||
                            "ZIVO Player",

                        email:
                            user.email ||
                            ""

                    };


                } else {

                    ZIVO.isLoggedIn =
                        false;


                    loadGuestProgress();


                    ZIVO.player.name =
                        "Guest";

                    ZIVO.player.email =
                        "";
                }


                updatePlayerUI();


            } catch (error) {

                console.error(
                    "ZIVOZONE auth event error:",
                    error
                );
            }
        }
    );
}


/* ============================================================
   AUTH MODAL
============================================================ */

function openAuthModal(mode = "login") {

    try {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        root.innerHTML = "";


        const modal =
            document.createElement("div");


        modal.className =
            "zivo-modal";


        modal.innerHTML = `

            <div
                class="zivo-modal-backdrop"
                data-close-modal
            ></div>

            <div
                class="zivo-modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
            >

                <button
                    type="button"
                    class="zivo-modal-close"
                    data-close-modal
                    aria-label="${t("close")}"
                >
                    ×
                </button>

                <h2 id="auth-modal-title"></h2>

                <form
                    id="auth-form"
                    novalidate
                >

                    <div
                        id="auth-name-group"
                        class="form-group"
                    >

                        <label for="auth-name">
                            ${t("name")}
                        </label>

                        <input
                            id="auth-name"
                            name="name"
                            type="text"
                            minlength="2"
                            maxlength="50"
                            autocomplete="name"
                        >

                    </div>


                    <div
                        id="auth-age-group"
                        class="form-group"
                    >

                        <label for="auth-age">
                            ${t("age")}
                        </label>

                        <input
                            id="auth-age"
                            name="age"
                            type="number"
                            min="5"
                            max="100"
                            inputmode="numeric"
                        >

                    </div>


                    <div class="form-group">

                        <label for="auth-email">
                            ${t("email")}
                        </label>

                        <input
                            id="auth-email"
                            name="email"
                            type="email"
                            maxlength="254"
                            autocomplete="email"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label for="auth-password">
                            ${t("password")}
                        </label>

                        <input
                            id="auth-password"
                            name="password"
                            type="password"
                            minlength="6"
                            maxlength="128"
                            autocomplete="current-password"
                            required
                        >

                    </div>


                    <p
                        id="auth-error"
                        class="form-error"
                        role="alert"
                    ></p>


                    <button
                        id="auth-submit"
                        class="btn btn-primary full"
                        type="submit"
                    ></button>


                </form>


                <button
                    id="auth-switch"
                    class="btn btn-ghost full"
                    type="button"
                ></button>


                <button
                    id="auth-cancel"
                    class="btn btn-ghost full"
                    type="button"
                    data-close-modal
                >
                    ${t("cancel")}
                </button>

            </div>
        `;


        root.appendChild(
            modal
        );


        const title =
            $("#auth-modal-title");


        const nameGroup =
            $("#auth-name-group");


        const ageGroup =
            $("#auth-age-group");


        const password =
            $("#auth-password");


        const submit =
            $("#auth-submit");


        const switchButton =
            $("#auth-switch");


        if (mode === "login") {

            if (title) {
                title.textContent =
                    t("loginTitle");
            }


            if (nameGroup) {
                nameGroup.hidden =
                    true;
            }


            if (ageGroup) {
                ageGroup.hidden =
                    true;
            }


            if (password) {
                password.autocomplete =
                    "current-password";
            }


            if (submit) {
                submit.textContent =
                    t("loginAction");
            }


            if (switchButton) {
                switchButton.textContent =
                    t("switchRegister");
            }


        } else {

            if (title) {
                title.textContent =
                    t("registerTitle");
            }


            if (nameGroup) {
                nameGroup.hidden =
                    false;
            }


            if (ageGroup) {
                ageGroup.hidden =
                    false;
            }


            if (password) {
                password.autocomplete =
                    "new-password";
            }


            if (submit) {
                submit.textContent =
                    t("registerAction");
            }


            if (switchButton) {
                switchButton.textContent =
                    t("switchLogin");
            }
        }


        root.dataset.authMode =
            mode;


        setupAuthModalEvents();


        const emailInput =
            $("#auth-email");


        if (emailInput) {
            emailInput.focus();
        }


    } catch (error) {

        console.error(
            "ZIVOZONE auth modal error:",
            error
        );
    }
}


/* ============================================================
   AUTH MODAL EVENTS
============================================================ */

function setupAuthModalEvents() {

    const root =
        $("#modal-root");


    if (!root) {
        return;
    }


    $all(
        "[data-close-modal]",
        root
    ).forEach(button => {

        button.addEventListener(
            "click",
            closeModal
        );
    });


    const switchButton =
        $("#auth-switch");


    if (switchButton) {

        switchButton.addEventListener(
            "click",
            () => {

                const currentMode =
                    root.dataset.authMode;


                openAuthModal(
                    currentMode === "login"
                        ? "register"
                        : "login"
                );
            }
        );
    }


    const form =
        $("#auth-form");


    if (form) {

        form.addEventListener(
            "submit",
            handleAuthSubmit
        );
    }
}


/* ============================================================
   AUTH SUBMIT
============================================================ */

async function handleAuthSubmit(event) {

    event.preventDefault();


    try {

        const form =
            event.currentTarget;


        const root =
            $("#modal-root");


        const mode =
            root?.dataset.authMode ||
            "login";


        const errorElement =
            $("#auth-error");


        const submit =
            $("#auth-submit");


        if (errorElement) {
            errorElement.textContent = "";
        }


        const formData =
            new FormData(form);


        const email =
            String(
                formData.get("email") ||
                ""
            ).trim();


        const password =
            String(
                formData.get("password") ||
                ""
            );


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {

            throw new Error(
                "البريد الإلكتروني غير صحيح."
            );
        }


        if (
            password.length < 6
        ) {

            throw new Error(
                "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل."
            );
        }


        if (submit) {
            submit.disabled =
                true;

            submit.textContent =
                "..."
        }


        if (mode === "login") {

            if (
                !window.ZIVOZONE_AUTH ||
                typeof window.ZIVOZONE_AUTH.loginPlayer !== "function"
            ) {

                throw new Error(
                    "نظام تسجيل الدخول غير جاهز."
                );
            }


            await window.ZIVOZONE_AUTH.loginPlayer(
                email,
                password
            );


            showNotification(
                t("loginSuccess"),
                "success"
            );


        } else {

            const name =
                String(
                    formData.get("name") ||
                    ""
                ).trim();


            const age =
                Number(
                    formData.get("age")
                );


            if (
                name.length < 2 ||
                name.length > 50
            ) {

                throw new Error(
                    "اسم اللاعب يجب أن يكون بين حرفين و50 حرفًا."
                );
            }


            if (
                !Number.isInteger(age) ||
                age < 5 ||
                age > 100
            ) {

                throw new Error(
                    "يرجى إدخال عمر صحيح بين 5 و100 سنة."
                );
            }


            if (
                !window.ZIVOZONE_AUTH ||
                typeof window.ZIVOZONE_AUTH.registerPlayer !== "function"
            ) {

                throw new Error(
                    "نظام التسجيل غير جاهز."
                );
            }


            await window.ZIVOZONE_AUTH.registerPlayer({

                name,

                email,

                password,

                age,

                language:
                    ZIVO.language

            });


            showNotification(
                t("registerSuccess"),
                "success"
            );
        }


        closeModal();


    } catch (error) {

        console.error(
            "ZIVOZONE authentication submit error:",
            error
        );


        const errorElement =
            $("#auth-error");


        if (errorElement) {

            errorElement.textContent =
                error.message ||
                t("invalidForm");
        }


    } finally {

        const submit =
            $("#auth-submit");


        if (submit) {

            submit.disabled =
                false;


            const root =
                $("#modal-root");


            const mode =
                root?.dataset.authMode ||
                "login";


            submit.textContent =
                mode === "login"
                    ? t("loginAction")
                    : t("registerAction");
        }
    }
}


/* ============================================================
   CLOSE MODAL
============================================================ */

function closeModal() {

    try {

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


        delete root.dataset.authMode;


    } catch (error) {

        console.error(
            "ZIVOZONE close modal error:",
            error
        );
    }
}


/* ============================================================
   GAME QUESTION SELECTION
============================================================ */

function getQuestionsForPlayer(gameType) {

    try {

        const game =
            GAME_DATABASE[gameType];


        if (
            !game ||
            !Array.isArray(game.questions)
        ) {

            return [];
        }


        const playerLevel =
            Number(
                ZIVO.player.level
            ) || 1;


        /*
         * نسمح للاعب برؤية أسئلة مستواه ومستوى
         * قريب منه حتى لا يصبح المحتوى ثابتًا.
         */

        const eligible =
            game.questions.filter(
                question => {

                    return (
                        question.level <=
                        Math.max(
                            1,
                            playerLevel + 1
                        )
                    );
                }
            );


        const pool =
            eligible.length
                ? eligible
                : game.questions;


        return shuffle(
            [...pool]
        ).slice(
            0,
            Math.min(
                5,
                pool.length
            )
        );


    } catch (error) {

        console.error(
            "ZIVOZONE question selection error:",
            error
        );

        return [];
    }
}


/* ============================================================
   SHUFFLE
============================================================ */

function shuffle(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }


    return result;
}


/* ============================================================
   START GAME
============================================================ */

function startGame(gameType) {

    try {

        if (
            !GAME_DATABASE[gameType]
        ) {

            throw new Error(
                "اللعبة غير موجودة."
            );
        }


        if (
            gameType === "daily" &&
            isDailyCompleted()
        ) {

            showNotification(
                t("dailyComplete"),
                "warning"
            );


            return;
        }


        ZIVO.currentGame =
            gameType;


        ZIVO.currentQuestionIndex =
            0;


        ZIVO.gameScore =
            0;


        ZIVO.gameAnswered =
            false;


        ZIVO.currentQuestions =
            getQuestionsForPlayer(
                gameType
            );


        if (
            !ZIVO.currentQuestions.length
        ) {

            throw new Error(
                "لا توجد أسئلة متاحة حاليًا."
            );
        }


        renderGameModal();


    } catch (error) {

        console.error(
            "ZIVOZONE start game error:",
            error
        );


        showNotification(
            error.message ||
            "تعذر تشغيل اللعبة.",
            "error"
        );
    }
}


/* ============================================================
   RENDER GAME MODAL
============================================================ */

function renderGameModal() {

    try {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        const game =
            GAME_DATABASE[
                ZIVO.currentGame
            ];


        const question =
            ZIVO.currentQuestions[
                ZIVO.currentQuestionIndex
            ];


        if (!game || !question) {

            finishGame();

            return;
        }


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        root.innerHTML =
            "";


        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "zivo-modal";


        const backdrop =
            document.createElement(
                "div"
            );


        backdrop.className =
            "zivo-modal-backdrop";


        backdrop.addEventListener(
            "click",
            closeModal
        );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "zivo-modal-card game-modal";


        card.setAttribute(
            "role",
            "dialog"
        );


        card.setAttribute(
            "aria-modal",
            "true"
        );


        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            game.title[
                ZIVO.language
            ] ||
            game.title.ar;


        const progress =
            document.createElement(
                "div"
            );


        progress.className =
            "game-progress";


        progress.textContent =
            `${t("question")} ${
                ZIVO.currentQuestionIndex + 1
            } / ${
                ZIVO.currentQuestions.length
            }`;


        const questionText =
            document.createElement(
                "h3"
            );


        questionText.className =
            "game-question";


        questionText.textContent =
            question.question[
                ZIVO.language
            ] ||
            question.question.ar;


        const answers =
            document.createElement(
                "div"
            );


        answers.className =
            "game-answers";


        const shuffledAnswers =
            shuffle(
                question.answers
            );


        shuffledAnswers.forEach(
            answer => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "game-answer";


                button.textContent =
                    answer[
                        ZIVO.language
                    ] ||
                    answer.ar;


                button.addEventListener(
                    "click",
                    () => {

                        handleAnswer(
                            answer,
                            button,
                            answers
                        );
                    }
                );


                answers.appendChild(
                    button
                );
            }
        );


        const score =
            document.createElement(
                "div"
            );


        score.className =
            "game-score";


        score.textContent =
            `${t("score")}: ${ZIVO.gameScore}`;


        card.appendChild(
            title
        );

        card.appendChild(
            progress
        );

        card.appendChild(
            questionText
        );

        card.appendChild(
            answers
        );

        card.appendChild(
            score
        );


        modal.appendChild(
            backdrop
        );

        modal.appendChild(
            card
        );


        root.appendChild(
            modal
        );


    } catch (error) {

        console.error(
            "ZIVOZONE render game error:",
            error
        );
    }
}


/* ============================================================
   HANDLE ANSWER
============================================================ */

function handleAnswer(
    answer,
    button,
    answersContainer
) {

    try {

        if (
            ZIVO.gameAnswered
        ) {
            return;
        }


        ZIVO.gameAnswered =
            true;


        const buttons =
            $all(
                "button",
                answersContainer
            );


        buttons.forEach(
            currentButton => {

                currentButton.disabled =
                    true;
            }
        );


        if (
            answer.correct
        ) {

            ZIVO.gameScore +=
                1;


            button.classList.add(
                "correct"
            );


            showNotification(
                `✅ ${t("correct")}`,
                "success"
            );


        } else {

            button.classList.add(
                "wrong"
            );


            showNotification(
                `❌ ${t("wrong")}`,
                "error"
            );


            /*
             * إظهار الإجابة الصحيحة للمستخدم
             * بدون innerHTML من بيانات المستخدم.
             */

            buttons.forEach(
                currentButton => {

                    const answerText =
                        currentButton.textContent;


                    const original =
                        answersContainer.querySelector(
                            "button.correct"
                        );


                    if (original) {
                        return;
                    }


                    /*
                     * لا نعتمد على النص فقط هنا لأن
                     * النص قد يكون متشابهًا بين اللغات.
                     */
                }
            );


            /*
             * نبحث عن الزر الذي يمثل الإجابة الصحيحة
             * عبر إعادة بناء النص.
             */

            const correctText =
                getAnswerText(
                    ZIVO.currentQuestions[
                        ZIVO.currentQuestionIndex
                    ].answers.find(
                        item =>
                            item.correct
                    )
                );


            buttons.forEach(
                currentButton => {

                    if (
                        currentButton.textContent ===
                        correctText
                    ) {

                        currentButton.classList.add(
                            "correct"
                        );
                    }
                }
            );
        }


        const nextButton =
            document.createElement(
                "button"
            );


        nextButton.type =
            "button";


        nextButton.className =
            "btn btn-primary full";


        nextButton.textContent =
            ZIVO.currentQuestionIndex <
            ZIVO.currentQuestions.length - 1
                ? t("next")
                : t("finish");


        nextButton.addEventListener(
            "click",
            () => {

                if (
                    ZIVO.currentQuestionIndex <
                    ZIVO.currentQuestions.length - 1
                ) {

                    ZIVO.currentQuestionIndex +=
                        1;


                    ZIVO.gameAnswered =
                        false;


                    renderGameModal();


                } else {

                    finishGame();
                }
            }
        );


        const card =
            $(".game-modal");


        if (card) {

            card.appendChild(
                nextButton
            );
        }


    } catch (error) {

        console.error(
            "ZIVOZONE answer error:",
            error
        );
    }
}


/* ============================================================
   GET ANSWER TEXT
============================================================ */

function getAnswerText(answer) {

    if (!answer) {
        return "";
    }


    return (
        answer[
            ZIVO.language
        ] ||
        answer.ar ||
        ""
    );
}


/* ============================================================
   FINISH GAME
============================================================ */

function finishGame() {

    try {

        const game =
            GAME_DATABASE[
                ZIVO.currentGame
            ];


        if (!game) {
            return;
        }


        const total =
            ZIVO.currentQuestions.length;


        const score =
            ZIVO.gameScore;


        const passed =
            total > 0 &&
            score / total >= 0.5;


        ZIVO.player.gamesPlayed +=
            1;


        if (passed) {

            ZIVO.player.wins +=
                1;


            ZIVO.player.streak +=
                1;


            const xpReward =
                Math.round(
                    game.rewardXP *
                    (
                        score /
                        total
                    )
                );


            const coinReward =
                Math.max(
                    1,
                    Math.round(
                        game.rewardCoins *
                        (
                            score /
                            total
                        )
                    )
                );


            addXP(
                xpReward
            );


            addCoins(
                coinReward
            );


            if (
                ZIVO.currentGame === "daily"
            ) {

                markDailyCompleted();
            }


            showGameResult(
                true,
                score,
                total,
                xpReward,
                coinReward
            );


        } else {

            ZIVO.player.losses +=
                1;


            ZIVO.player.streak =
                0;


            saveGuestProgress();


            showGameResult(
                false,
                score,
                total,
                0,
                0
            );
        }


    } catch (error) {

        console.error(
            "ZIVOZONE finish game error:",
            error
        );


        closeModal();
    }
}


/* ============================================================
   GAME RESULT
============================================================ */

function showGameResult(
    passed,
    score,
    total,
    xpReward,
    coinReward
) {

    try {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.innerHTML =
            "";


        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "zivo-modal";


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "zivo-modal-card game-result"
        ;


        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            passed
                ? `🎉 ${t("gameComplete")}`
                : `💪 ${t("wrong")}`;


        const result =
            document.createElement(
                "p"
            );


        result.textContent =
            `${t("score")}: ${score} / ${total}`;


        const reward =
            document.createElement(
                "p"
            );


        reward.textContent =
            `+${xpReward} XP  •  +${coinReward} 🪙 ZIVO`;


        const playAgain =
            document.createElement(
                "button"
            );


        playAgain.type =
            "button";


        playAgain.className =
            "btn btn-primary full";


        playAgain.textContent =
            t("playAgain");


        playAgain.addEventListener(
            "click",
            () => {

                startGame(
                    ZIVO.currentGame
                );
            }
        );


        const close =
            document.createElement(
                "button"
            );


        close.type =
            "button";


        close.className =
            "btn btn-ghost full";


        close.textContent =
            t("close");


        close.addEventListener(
            "click",
            closeModal
        );


        card.appendChild(
            title
        );

        card.appendChild(
            result
        );

        card.appendChild(
            reward
        );

        card.appendChild(
            playAgain
        );

        card.appendChild(
            close
        );


        modal.appendChild(
            card
        );


        root.appendChild(
            modal
        );


        updatePlayerUI();


    } catch (error) {

        console.error(
            "ZIVOZONE game result error:",
            error
        );
    }
}


/* ============================================================
   DAILY CHALLENGE
============================================================ */

function getTodayKey() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


function isDailyCompleted() {

    try {

        const key =
            localStorage.getItem(
                STORAGE_KEYS.dailyChallenge
            );


        return (
            key ===
            getTodayKey()
        );


    } catch (error) {

        console.error(
            "ZIVOZONE daily check error:",
            error
        );


        return false;
    }
}


function markDailyCompleted() {

    try {

        localStorage.setItem(
            STORAGE_KEYS.dailyChallenge,
            getTodayKey()
        );


        renderChallenges();


    } catch (error) {

        console.error(
            "ZIVOZONE daily save error:",
            error
        );
    }
}


/* ============================================================
   RENDER CHALLENGES
============================================================ */

function renderChallenges() {

    try {

        const container =
            $("#challenge-list");


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        const completed =
            isDailyCompleted();


        const challenge =
            document.createElement(
                "article"
            );


        challenge.className =
            "challenge-card";


        const icon =
            document.createElement(
                "div"
            );


        icon.className =
            "icon";


        icon.textContent =
            completed
                ? "✅"
                : "⚡";


        const content =
            document.createElement(
                "div"
            );


        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            t("dailyTitle");


        const description =
            document.createElement(
                "p"
            );


        description.textContent =
            completed
                ? t("dailyComplete")
                : t("dailyDesc");


        const reward =
            document.createElement(
                "span"
            );


        reward.textContent =
            "+30 XP • +3 🪙 ZIVO";


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "btn btn-primary";


        button.textContent =
            completed
                ? t("today")
                : t("playNow");


        button.disabled =
            completed;


        if (!completed) {

            button.addEventListener(
                "click",
                () => {

                    startGame(
                        "daily"
                    );
                }
            );
        }


        content.appendChild(
            title
        );

        content.appendChild(
            description
        );

        content.appendChild(
            reward
        );


        challenge.appendChild(
            icon
        );

        challenge.appendChild(
            content
        );

        challenge.appendChild(
            button
        );


        container.appendChild(
            challenge
        );


    } catch (error) {

        console.error(
            "ZIVOZONE challenge render error:",
            error
        );
    }
}


/* ============================================================
   IDENTITY TEST
============================================================ */

function startIdentityTest() {

    try {

        ZIVO.identityAnswers =
            [];


        ZIVO.identityIndex =
            0;


        renderIdentityQuestion();


    } catch (error) {

        console.error(
            "ZIVOZONE identity start error:",
            error
        );
    }
}


/* ============================================================
   RENDER IDENTITY QUESTION
============================================================ */

function renderIdentityQuestion() {

    try {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        const question =
            IDENTITY_QUESTIONS[
                ZIVO.identityIndex
            ];


        if (!question) {

            calculateIdentityResult();

            return;
        }


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        root.innerHTML =
            "";


        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "zivo-modal";


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "zivo-modal-card identity-modal";


        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            t("identityTitle");


        const intro =
            document.createElement(
                "p"
            );


        intro.textContent =
            t("identityIntro");


        const questionText =
            document.createElement(
                "h3"
            );


        questionText.textContent =
            question.question[
                ZIVO.language
            ] ||
            question.question.ar;


        const answers =
            document.createElement(
                "div"
            );


        answers.className =
            "identity-answers";


        question.answers.forEach(
            answer => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "btn btn-ghost full";


                button.textContent =
                    answer.text[
                        ZIVO.language
                    ] ||
                    answer.text.ar;


                button.addEventListener(
                    "click",
                    () => {

                        ZIVO.identityAnswers.push(
                            answer.type
                        );


                        ZIVO.identityIndex +=
                            1;


                        renderIdentityQuestion();
                    }
                );


                answers.appendChild(
                    button
                );
            }
        );


        card.appendChild(
            title
        );

        card.appendChild(
            intro
        );

        card.appendChild(
            questionText
        );

        card.appendChild(
            answers
        );


        modal.appendChild(
            card
        );


        root.appendChild(
            modal
        );


    } catch (error) {

        console.error(
            "ZIVOZONE identity render error:",
            error
        );
    }
}


/* ============================================================
   IDENTITY RESULT
============================================================ */

function calculateIdentityResult() {

    try {

        const counts = {

            explorer: 0,
            thinker: 0,
            competitor: 0,
            creative: 0

        };


        ZIVO.identityAnswers.forEach(
            type => {

                if (
                    Object.prototype.hasOwnProperty.call(
                        counts,
                        type
                    )
                ) {

                    counts[type] +=
                        1;
                }
            }
        );


        let winner =
            "explorer";


        Object.keys(
            counts
        ).forEach(
            type => {

                if (
                    counts[type] >
                    counts[winner]
                ) {

                    winner =
                        type;
                }
            }
        );


        const profile =
            t(
                `identityProfiles.${winner}`
            );


        localStorage.setItem(
            STORAGE_KEYS.identityResult,
            JSON.stringify({
                type: winner,
                date: new Date().toISOString()
            })
        );


        showIdentityResult(
            profile
        );


    } catch (error) {

        console.error(
            "ZIVOZONE identity result error:",
            error
        );
    }
}


/* ============================================================
   SHOW IDENTITY RESULT
============================================================ */

function showIdentityResult(profile) {

    try {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.innerHTML =
            "";


        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "zivo-modal";


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "zivo-modal-card identity-result";


        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            `🧠 ${t("identityResult")}`;


        const profileTitle =
            document.createElement(
                "h3"
            );


        profileTitle.textContent =
            profile.title;


        const text =
            document.createElement(
                "p"
            );


        text.textContent =
            profile.text;


        const restart =
            document.createElement(
                "button"
            );


        restart.type =
            "button";


        restart.className =
            "btn btn-primary full";


        restart.textContent =
            t("identityRestart");


        restart.addEventListener(
            "click",
            startIdentityTest
        );


        const close =
            document.createElement(
                "button"
            );


        close.type =
            "button";


        close.className =
            "btn btn-ghost full";


        close.textContent =
            t("close");


        close.addEventListener(
            "click",
            closeModal
        );


        card.appendChild(
            title
        );

        card.appendChild(
            profileTitle
        );

        card.appendChild(
            text
        );

        card.appendChild(
            restart
        );

        card.appendChild(
            close
        );


        modal.appendChild(
            card
        );


        root.appendChild(
            modal
        );


    } catch (error) {

        console.error(
            "ZIVOZONE identity result display error:",
            error
        );
    }
}


/* ============================================================
   ZIVO AI
============================================================ */

function setupAI() {

    const form =
        $("#ai-form");


    const input =
        $("#ai-input");


    const messages =
        $("#ai-messages");


    if (
        !form ||
        !input ||
        !messages
    ) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            try {

                const text =
                    input.value.trim();


                if (!text) {
                    return;
                }


                if (
                    text.length >
                    500
                ) {

                    throw new Error(
                        "الرسالة طويلة جدًا."
                    );
                }


                appendAIMessage(
                    text,
                    "user"
                );


                input.value =
                    "";


                const thinking =
                    appendAIMessage(
                        t("aiThinking"),
                        "bot"
                    );


                setTimeout(
                    () => {

                        try {

                            if (thinking) {
                                thinking.remove();
                            }


                            appendAIMessage(
                                generateAIResponse(
                                    text
                                ),
                                "bot"
                            );


                        } catch (error) {

                            console.error(
                                "ZIVOZONE AI response error:",
                                error
                            );
                        }

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "ZIVOZONE AI input error:",
                    error
                );


                showNotification(
                    error.message ||
                    "تعذر إرسال الرسالة.",
                    "error"
                );
            }
        }
    );
}


/* ============================================================
   APPEND AI MESSAGE
============================================================ */

function appendAIMessage(
    text,
    type
) {

    const messages =
        $("#ai-messages");


    if (!messages) {
        return null;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `ai-message ${type}`;


    /*
     * textContent بدل innerHTML لمنع XSS.
     */

    message.textContent =
        escapeText(text);


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;


    return message;
}


/* ============================================================
   AI RESPONSE
============================================================ */

function generateAIResponse(text) {

    const lower =
        text.toLowerCase();


    if (
        lower.includes("مستوى") ||
        lower.includes("level")
    ) {

        return `${t("level")}: ${ZIVO.player.level} • ${t("xp")}: ${ZIVO.player.xp} • ${t("coins")}: ${ZIVO.player.coins}`;
    }


    if (
        lower.includes("لعبة") ||
        lower.includes("game")
    ) {

        return ZIVO.language === "ar"
            ? "أنصحك بتجربة اختبار الذكاء أولًا، ثم تحدي العلوم، وبعدها تحدي ZIVO اليومي. كلما تطورت سيصبح المحتوى أكثر تحديًا."
            : "Try the IQ test first, then Science Challenge and the ZIVO Daily Challenge. The content becomes harder as you level up.";
    }


    if (
        lower.includes("عمل") ||
        lower.includes("وظيف") ||
        lower.includes("money") ||
        lower.includes("coin")
    ) {

        return ZIVO.language === "ar"
            ? "عملة ZIVO موجودة حاليًا كنظام مكافآت تجريبي داخل المنصة. عند إطلاق النظام الاقتصادي الحقيقي سنحتاج Backend وSecurity Rules وSmart Contract منفصل قبل أي تداول."
            : "ZIVO is currently a prototype reward system. A real economy will require a secure backend, security rules and a separate smart contract before trading.";
    }


    if (
        lower.includes("من أنا") ||
        lower.includes("personality")
    ) {

        return ZIVO.language === "ar"
            ? "جرّب اختبار «من أنا؟» في ZIVOZONE، وسأستخدم اختياراتك داخل الاختبار لإعطائك نمطًا ترفيهيًا عامًا."
            : "Try the Who Am I test to get an entertainment-focused personality style based on your choices.";
    }


    return ZIVO.language === "ar"
        ? "فكرة جميلة! أنا ZIVO AI التجريبي. اسألني عن مستواك أو الألعاب أو التحديات أو عملة ZIVO."
        : "Great idea! I am the experimental ZIVO AI. Ask me about your level, games, challenges or ZIVO.";
}


/* ============================================================
   SPORTS
============================================================ */

function renderSports() {

    try {

        const container =
            $("#sports-list");


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        const items = [

            {
                icon: "⚽",
                title:
                    ZIVO.language === "ar"
                        ? "أخبار كرة القدم العالمية"
                        : "Global Football News"
            },

            {
                icon: "🏆",
                title:
                    ZIVO.language === "ar"
                        ? "أبرز البطولات والنتائج"
                        : "Top Competitions & Results"
            },

            {
                icon: "🔥",
                title:
                    ZIVO.language === "ar"
                        ? "آخر المستجدات الرياضية"
                        : "Latest Sports Updates"
            }

        ];


        items.forEach(
            item => {

                const article =
                    document.createElement(
                        "article"
                    );


                article.className =
                    "sports-card";


                const icon =
                    document.createElement(
                        "div"
                    );


                icon.className =
                    "icon";


                icon.textContent =
                    item.icon;


                const title =
                    document.createElement(
                        "h3"
                    );


                title.textContent =
                    item.title;


                const text =
                    document.createElement(
                        "p"
                    );


                text.textContent =
                    t("noSports");


                article.appendChild(
                    icon
                );

                article.appendChild(
                    title
                );

                article.appendChild(
                    text
                );


                container.appendChild(
                    article
                );
            }
        );


    } catch (error) {

        console.error(
            "ZIVOZONE sports render error:",
            error
        );
    }
}


/* ============================================================
   NOTIFICATION
============================================================ */

function showNotification(
    message,
    type = "info"
) {

    try {

        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            `zivo-notification ${type}`;


        notification.textContent =
            escapeText(message);


        document.body.appendChild(
            notification
        );


        requestAnimationFrame(
            () => {

                notification.classList.add(
                    "show"
                );
            }
        );


        setTimeout(
            () => {

                notification.classList.remove(
                    "show"
                );


                setTimeout(
                    () => {

                        notification.remove();

                    },
                    300
                );

            },
            3000
        );


    } catch (error) {

        console.error(
            "ZIVOZONE notification error:",
            error
        );
    }
}


/* ============================================================
   ACTION HANDLER
============================================================ */

function setupActions() {

    document.addEventListener(
        "click",
        event => {

            try {

                const gameButton =
                    event.target.closest(
                        "[data-game]"
                    );


                if (
                    gameButton &&
                    gameButton.dataset.game
                ) {

                    startGame(
                        gameButton.dataset.game
                    );


                    return;
                }


                const actionElement =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!actionElement) {
                    return;
                }


                const action =
                    actionElement.dataset.action;


                switch (action) {

                    case "login":

                        openAuthModal(
                            "login"
                        );

                        break;


                    case "open-identity":

                        startIdentityTest();

                        break;


                    case "scroll-games":

                        $("#games")?.scrollIntoView(
                            {
                                behavior: "smooth"
                            }
                        );

                        break;


                    case "refresh-sports":

                        renderSports();

                        showNotification(
                            t("refresh"),
                            "success"
                        );

                        break;


                    case "ad-info":

                        showNotification(
                            t("adInfo"),
                            "info"
                        );

                        break;


                    default:

                        break;
                }


            } catch (error) {

                console.error(
                    "ZIVOZONE action error:",
                    error
                );
            }
        }
    );


    document.addEventListener(
        "click",
        async event => {

            const logout =
                event.target.closest(
                    "[data-auth-logout]"
                );


            if (!logout) {
                return;
            }


            try {

                if (
                    !window.ZIVOZONE_AUTH ||
                    typeof window.ZIVOZONE_AUTH.logoutPlayer !== "function"
                ) {

                    throw new Error(
                        "نظام تسجيل الخروج غير جاهز."
                    );
                }


                await window.ZIVOZONE_AUTH.logoutPlayer();


                showNotification(
                    t("logoutSuccess"),
                    "success"
                );


            } catch (error) {

                console.error(
                    "ZIVOZONE logout error:",
                    error
                );


                showNotification(
                    error.message ||
                    "تعذر تسجيل الخروج.",
                    "error"
                );
            }
        }
    );
}


/* ============================================================
   LANGUAGE SELECT
============================================================ */

function setupLanguageSelector() {

    const select =
        $("#language-select");


    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        event => {

            try {

                applyLanguage(
                    event.target.value
                );


            } catch (error) {

                console.error(
                    "ZIVOZONE language change error:",
                    error
                );
            }
        }
    );
}


/* ============================================================
   LOADER
============================================================ */

function hideLoader() {

    try {

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


                setTimeout(
                    () => {

                        loader.remove();

                    },
                    500
                );

            },
            400
        );


    } catch (error) {

        console.error(
            "ZIVOZONE loader error:",
            error
        );
    }
}


/* ============================================================
   INITIALIZATION
============================================================ */

function initializeZIVOZONE() {

    try {

        if (
            ZIVO.initialized
        ) {
            return;
        }


        ZIVO.initialized =
            true;


        const savedLanguage =
            localStorage.getItem(
                STORAGE_KEYS.language
            );


        applyLanguage(
            savedLanguage &&
            TRANSLATIONS[
                savedLanguage
            ]
                ? savedLanguage
                : "ar"
        );


        loadGuestProgress();


        setupActions();

        setupLanguageSelector();

        setupAI();

        setupAuthListener();

        renderChallenges();

        renderSports();

        updatePlayerUI();

        hideLoader();


        console.log(
            "🚀 ZIVOZONE initialized successfully."
        );


    } catch (error) {

        console.error(
            "ZIVOZONE initialization error:",
            error
        );


        hideLoader();


        showNotification(
            "حدث خطأ أثناء تشغيل الموقع.",
            "error"
        );
    }
}


/* ============================================================
   DOM READY
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeZIVOZONE
    );

} else {

    initializeZIVOZONE();
}


/* ============================================================
   PUBLIC API
============================================================ */

window.ZIVOZONE = {

    startGame,

    startIdentityTest,

    addXP,

    addCoins,

    applyLanguage,

    getState: () => ({
        ...ZIVO,
        player: {
            ...ZIVO.player
        }
    })

};
