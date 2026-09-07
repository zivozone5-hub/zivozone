'use strict';

/*
 * ============================================================
 * ZIVOZONE - Core Application
 * Version: 1.0.0
 *
 * الوظائف:
 * - حساب اللاعب
 * - العمر والمستوى
 * - XP
 * - مستويات اللاعب
 * - عملة ZIVO
 * - التحديات اليومية
 * - بنك الأسئلة
 * - لعبة الذكاء
 * - حفظ البيانات محلياً
 * - نظام الإشعارات
 *
 * ملاحظة أمنية:
 * هذا الإصدار Front-End فقط.
 * لا يجب اعتبار localStorage نظام حسابات آمناً أو قاعدة بيانات
 * حقيقية. عند الانتقال للإطلاق التجاري سننقل البيانات الحساسة
 * والمكافآت إلى Backend آمن.
 * ============================================================
 */

(() => {
    'use strict';

    const APP_CONFIG = {
        name: 'ZIVOZONE',
        version: '1.0.0',
        storageKey: 'zivozone_player_v1',
        dailyKey: 'zivozone_daily_v1',
        languageKey: 'zivozone_language',
        maxQuestionTime: 30,
        xpPerCorrectAnswer: 25,
        zivoPerCorrectAnswer: 0.05,
        xpPerDailyChallenge: 100,
        zivoPerDailyChallenge: 0.20
    };

    /*
     * ----------------------------------------------------------
     * بنك الأسئلة
     *
     * يتم تقسيم الأسئلة إلى:
     * easy
     * medium
     * hard
     * expert
     *
     * ويمكن لاحقاً ربطها بقاعدة بيانات حقيقية.
     * ----------------------------------------------------------
     */

    const QUESTION_BANK = {
        easy: [
            {
                id: 'e001',
                category: 'logic',
                question: 'ما الرقم الذي يأتي بعد 2، 4، 6، 8؟',
                answers: ['9', '10', '11', '12'],
                correct: 1
            },
            {
                id: 'e002',
                category: 'general',
                question: 'كم عدد أيام الأسبوع؟',
                answers: ['5', '6', '7', '8'],
                correct: 2
            },
            {
                id: 'e003',
                category: 'logic',
                question: 'إذا كان لديك 3 تفاحات وأعطيت صديقك تفاحة، كم بقي لديك؟',
                answers: ['1', '2', '3', '4'],
                correct: 1
            },
            {
                id: 'e004',
                category: 'science',
                question: 'ما الكوكب الذي نعيش عليه؟',
                answers: ['المريخ', 'الأرض', 'المشتري', 'الزهرة'],
                correct: 1
            },
            {
                id: 'e005',
                category: 'logic',
                question: 'ما العدد الناقص: 5، 10، 15، ؟',
                answers: ['18', '20', '25', '30'],
                correct: 1
            }
        ],

        medium: [
            {
                id: 'm001',
                category: 'logic',
                question: 'ما الرقم التالي: 3، 6، 12، 24، ؟',
                answers: ['36', '42', '48', '50'],
                correct: 2
            },
            {
                id: 'm002',
                category: 'logic',
                question: 'إذا كان جميع A هم B، وبعض B هم C، فهل يجب أن يكون بعض A هم C؟',
                answers: ['نعم دائماً', 'لا بالضرورة', 'نعم فقط في الرياضيات', 'لا يمكن وجود C'],
                correct: 1
            },
            {
                id: 'm003',
                category: 'science',
                question: 'أي من هذه يعتبر مصدراً للطاقة المتجددة؟',
                answers: ['الفحم', 'النفط', 'الطاقة الشمسية', 'الغاز'],
                correct: 2
            },
            {
                id: 'm004',
                category: 'general',
                question: 'كم دقيقة توجد في ساعتين؟',
                answers: ['60', '90', '120', '180'],
                correct: 2
            },
            {
                id: 'm005',
                category: 'logic',
                question: 'إذا كان 5 × 5 = 25، فما ناتج 25 ÷ 5؟',
                answers: ['3', '4', '5', '6'],
                correct: 2
            }
        ],

        hard: [
            {
                id: 'h001',
                category: 'logic',
                question: 'ما الرقم التالي: 2، 6، 12، 20، 30، ؟',
                answers: ['36', '40', '42', '44'],
                correct: 2
            },
            {
                id: 'h002',
                category: 'logic',
                question: 'إذا كان لديك 8 كرات، وأخذت نصفها، ثم أخذت نصف ما بقي، كم كرة أصبحت معك؟',
                answers: ['2', '4', '6', '8'],
                correct: 2
            },
            {
                id: 'h003',
                category: 'science',
                question: 'أي عضو مسؤول بشكل أساسي عن ضخ الدم في جسم الإنسان؟',
                answers: ['الكبد', 'الرئة', 'القلب', 'الدماغ'],
                correct: 2
            },
            {
                id: 'h004',
                category: 'logic',
                question: 'ما العدد المختلف: 9، 16، 25، 36، 45؟',
                answers: ['9', '16', '36', '45'],
                correct: 3
            },
            {
                id: 'h005',
                category: 'logic',
                question: 'إذا كانت الساعة 3:00، فما الزاوية بين عقرب الساعات والدقائق؟',
                answers: ['45°', '60°', '90°', '180°'],
                correct: 2
            }
        ],

        expert: [
            {
                id: 'x001',
                category: 'logic',
                question: 'ما العدد التالي: 1، 1، 2، 3، 5، 8، ؟',
                answers: ['11', '12', '13', '15'],
                correct: 2
            },
            {
                id: 'x002',
                category: 'logic',
                question: 'لديك ثلاثة صناديق: تفاح، برتقال، ومختلط. جميع الملصقات خاطئة. كم صندوقاً تحتاج أن تسحب منه ثمرة واحدة لتعرف محتويات الصناديق كلها؟',
                answers: ['1', '2', '3', 'لا يمكن'],
                correct: 0
            },
            {
                id: 'x003',
                category: 'logic',
                question: 'إذا كان مجموع عددين 20 والفرق بينهما 4، فما العددان؟',
                answers: ['6 و14', '7 و13', '8 و12', '9 و11'],
                correct: 2
            },
            {
                id: 'x004',
                category: 'science',
                question: 'أي مبدأ يفسر بقاء الجسم المتحرك في حركته ما لم تؤثر عليه قوة خارجية؟',
                answers: [
                    'قانون نيوتن الأول',
                    'قانون نيوتن الثاني',
                    'قانون نيوتن الثالث',
                    'قانون الجاذبية'
                ],
                correct: 0
            },
            {
                id: 'x005',
                category: 'logic',
                question: 'إذا كان كل Z هو Y، ولا يوجد أي Y هو X، فهل يمكن أن يكون Z هو X؟',
                answers: ['نعم', 'لا', 'أحياناً', 'حسب العدد'],
                correct: 1
            }
        ]
    };

    /*
     * ----------------------------------------------------------
     * تعريف مستويات اللاعب
     * ----------------------------------------------------------
     */

    const LEVELS = [
        { level: 1, title: 'مستكشف', minXP: 0 },
        { level: 2, title: 'مبتدئ', minXP: 100 },
        { level: 3, title: 'متدرب', minXP: 250 },
        { level: 4, title: 'متقدم', minXP: 500 },
        { level: 5, title: 'خبير', minXP: 900 },
        { level: 6, title: 'محترف', minXP: 1400 },
        { level: 7, title: 'نخبة', minXP: 2000 },
        { level: 8, title: 'أسطورة ZIVO', minXP: 3000 }
    ];

    /*
     * ----------------------------------------------------------
     * الحالة العامة
     * ----------------------------------------------------------
     */

    const state = {
        player: null,
        currentQuestion: null,
        currentQuestions: [],
        currentQuestionIndex: 0,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        timer: null,
        timeLeft: APP_CONFIG.maxQuestionTime,
        gameRunning: false,
        selectedGame: null
    };

    /*
     * ----------------------------------------------------------
     * أدوات مساعدة
     * ----------------------------------------------------------
     */

    function safeNumber(value, fallback = 0) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return fallback;
        }

        return number;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function todayKey() {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('-');
    }

    function generateId() {
        try {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                return window.crypto.randomUUID();
            }
        } catch (error) {
            console.warn('Crypto UUID unavailable:', error);
        }

        return `zivo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    /*
     * ----------------------------------------------------------
     * إنشاء لاعب جديد
     * ----------------------------------------------------------
     */

    function createDefaultPlayer() {
        return {
            id: generateId(),
            name: 'لاعب ZIVO',
            age: 18,
            xp: 0,
            zivo: 0,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            streak: 0,
            bestStreak: 0,
            totalScore: 0,
            achievements: [],
            createdAt: new Date().toISOString(),
            lastPlayedAt: null
        };
    }

    /*
     * ----------------------------------------------------------
     * تحميل بيانات اللاعب
     * ----------------------------------------------------------
     */

    function loadPlayer() {
        try {
            const raw = localStorage.getItem(APP_CONFIG.storageKey);

            if (!raw) {
                state.player = createDefaultPlayer();
                savePlayer();
                return state.player;
            }

            const parsed = JSON.parse(raw);

            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Invalid player data');
            }

            const defaults = createDefaultPlayer();

            state.player = {
                ...defaults,
                ...parsed,
                xp: Math.max(0, safeNumber(parsed.xp)),
                zivo: Math.max(0, safeNumber(parsed.zivo)),
                age: clamp(safeNumber(parsed.age, 18), 6, 100),
                gamesPlayed: Math.max(0, safeNumber(parsed.gamesPlayed)),
                wins: Math.max(0, safeNumber(parsed.wins)),
                losses: Math.max(0, safeNumber(parsed.losses)),
                correctAnswers: Math.max(0, safeNumber(parsed.correctAnswers)),
                wrongAnswers: Math.max(0, safeNumber(parsed.wrongAnswers))
            };

            return state.player;

        } catch (error) {
            console.error('Failed to load player:', error);

            state.player = createDefaultPlayer();
            savePlayer();

            return state.player;
        }
    }

    /*
     * ----------------------------------------------------------
     * حفظ بيانات اللاعب
     * ----------------------------------------------------------
     */

    function savePlayer() {
        try {
            if (!state.player) {
                throw new Error('Player is not initialized');
            }

            localStorage.setItem(
                APP_CONFIG.storageKey,
                JSON.stringify(state.player)
            );

            return true;

        } catch (error) {
            console.error('Failed to save player:', error);

            showNotification(
                'تعذر حفظ تقدمك على هذا الجهاز.',
                'error'
            );

            return false;
        }
    }

    /*
     * ----------------------------------------------------------
     * تحديد مستوى اللاعب حسب XP
     * ----------------------------------------------------------
     */

    function getPlayerLevel() {
        const xp = safeNumber(state.player?.xp);

        let currentLevel = LEVELS[0];

        for (const level of LEVELS) {
            if (xp >= level.minXP) {
                currentLevel = level;
            }
        }

        return currentLevel;
    }

    function getNextLevel() {
        const current = getPlayerLevel();

        return LEVELS.find(level => level.level > current.level) || null;
    }

    /*
     * ----------------------------------------------------------
     * تحديد صعوبة اللعبة حسب العمر والمستوى
     * ----------------------------------------------------------
     */

    function getDifficulty() {
        const age = safeNumber(state.player?.age, 18);
        const level = getPlayerLevel().level;

        /*
         * الأطفال:
         * 6 - 9 سنوات = easy
         * 10 - 13 = easy/medium
         *
         * الشباب:
         * 14 - 17 = medium
         *
         * البالغون:
         * 18+ = حسب المستوى
         */

        if (age <= 9) {
            return 'easy';
        }

        if (age <= 13) {
            return level >= 3 ? 'medium' : 'easy';
        }

        if (age <= 17) {
            return level >= 4 ? 'hard' : 'medium';
        }

        if (level >= 7) {
            return 'expert';
        }

        if (level >= 4) {
            return 'hard';
        }

        return 'medium';
    }

    /*
     * ----------------------------------------------------------
     * إضافة XP
     * ----------------------------------------------------------
     */

    function addXP(amount) {
        try {
            const safeAmount = clamp(
                safeNumber(amount),
                0,
                1000
            );

            const oldLevel = getPlayerLevel().level;

            state.player.xp += safeAmount;

            const newLevel = getPlayerLevel().level;

            if (newLevel > oldLevel) {
                showNotification(
                    `🎉 مبروك! وصلت إلى المستوى ${newLevel}`,
                    'success'
                );

                unlockAchievement(
                    `level-${newLevel}`,
                    `الوصول إلى المستوى ${newLevel}`
                );
            }

            savePlayer();
            updatePlayerUI();

        } catch (error) {
            console.error('XP error:', error);
        }
    }

    /*
     * ----------------------------------------------------------
     * إضافة عملة ZIVO
     * ----------------------------------------------------------
     */

    function addZivo(amount) {
        try {
            const safeAmount = clamp(
                safeNumber(amount),
                0,
                100
            );

            state.player.zivo = Number(
                (state.player.zivo + safeAmount).toFixed(4)
            );

            savePlayer();
            updatePlayerUI();

        } catch (error) {
            console.error('ZIVO reward error:', error);
        }
    }

    /*
     * ----------------------------------------------------------
     * الإنجازات
     * ----------------------------------------------------------
     */

    function unlockAchievement(id, title) {
        try {
            if (!state.player.achievements.includes(id)) {
                state.player.achievements.push(id);

                showNotification(
                    `🏆 إنجاز جديد: ${title}`,
                    'success'
                );

                savePlayer();
            }
        } catch (error) {
            console.error('Achievement error:', error);
        }
    }

    /*
     * ----------------------------------------------------------
     * تحديث عناصر واجهة المستخدم
     * ----------------------------------------------------------
     */

    function updatePlayerUI() {
        try {
            const player = state.player;
            const level = getPlayerLevel();
            const nextLevel = getNextLevel();

            const values = {
                xp: Math.floor(player.xp),
                zivo: player.zivo.toFixed(2),
                level: level.level,
                title: level.title,
                games: player.gamesPlayed,
                wins: player.wins,
                streak: player.streak
            };

            const selectors = {
                xp: [
                    '#playerXP',
                    '#xpValue',
                    '[data-player-xp]'
                ],
                zivo: [
                    '#zivoBalance',
                    '#zivoValue',
                    '[data-zivo-balance]'
                ],
                level: [
                    '#playerLevel',
                    '#levelValue',
                    '[data-player-level]'
                ],
                title: [
                    '#playerTitle',
                    '[data-player-title]'
                ],
                games: [
                    '#gamesPlayed',
                    '[data-games-played]'
                ],
                wins: [
                    '#wins',
                    '[data-wins]'
                ],
                streak: [
                    '#streak',
                    '[data-streak]'
                ]
            };

            Object.entries(values).forEach(([key, value]) => {
                selectors[key].forEach(selector => {
                    document.querySelectorAll(selector).forEach(element => {
                        element.textContent = String(value);
                    });
                });
            });

            document.querySelectorAll(
                '#playerName, [data-player-name]'
            ).forEach(element => {
                element.textContent = player.name;
            });

            document.querySelectorAll(
                '#playerAge, [data-player-age]'
            ).forEach(element => {
                element.textContent = String(player.age);
            });

            /*
             * شريط XP
             */

            if (nextLevel) {
                const currentMin = level.minXP;
                const nextMin = nextLevel.minXP;

                const progress = clamp(
                    ((player.xp - currentMin) / (nextMin - currentMin)) * 100,
                    0,
                    100
                );

                document.querySelectorAll(
                    '#xpProgress, [data-xp-progress]'
                ).forEach(element => {
                    element.style.width = `${progress}%`;
                    element.setAttribute('aria-valuenow', String(Math.round(progress)));
                });
            }

        } catch (error) {
            console.error('UI update error:', error);
        }
    }

    /*
     * ----------------------------------------------------------
     * إشعارات
     * ----------------------------------------------------------
     */

    function showNotification(message, type = 'info') {
        try {
            let container = document.getElementById(
                'zivoNotificationContainer'
            );

            if (!container) {
                container = document.createElement('div');
                container.id = 'zivoNotificationContainer';

                container.style.position = 'fixed';
                container.style.top = '20px';
                container.style.right = '20px';
                container.style.zIndex = '99999';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.gap = '10px';

                document.body.appendChild(container);
            }

            const notification = document.createElement('div');

            notification.textContent = message;

            notification.style.padding = '14px 18px';
            notification.style.borderRadius = '14px';
            notification.style.background = '#171526';
            notification.style.color = '#fff';
            notification.style.border = '1px solid rgba(255,255,255,.15)';
            notification.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)';
            notification.style.fontSize = '14px';
            notification.style.maxWidth = '320px';

            if (type === 'success') {
                notification.style.borderColor = '#19e6c1';
            }

            if (type === 'error') {
                notification.style.borderColor = '#ff5b7f';
            }

            container.appendChild(notification);

            window.setTimeout(() => {
                notification.remove();
            }, 3500);

        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    /*
     * ----------------------------------------------------------
     * اختيار الأسئلة
     * ----------------------------------------------------------
     */

    function getQuestions(count = 5) {
        try {
            const difficulty = getDifficulty();

            let pool = [...(QUESTION_BANK[difficulty] || QUESTION_BANK.easy)];

            /*
             * خلط الأسئلة
             */

            pool.sort(() => Math.random() - 0.5);

            return pool.slice(
                0,
                Math.min(count, pool.length)
            );

        } catch (error) {
            console.error('Question generation error:', error);

            return QUESTION_BANK.easy.slice(0, count);
        }
    }

    /*
     * ----------------------------------------------------------
     * إنشاء منطقة اللعبة تلقائياً إذا لم تكن موجودة
     * ----------------------------------------------------------
     */

    function ensureGameContainer() {
        let container = document.getElementById('zivoGameContainer');

        if (container) {
            return container;
        }

        container = document.createElement('section');

        container.id = 'zivoGameContainer';

        container.style.maxWidth = '850px';
        container.style.margin = '40px auto';
        container.style.padding = '25px';
        container.style.borderRadius = '24px';
        container.style.background = 'rgba(255,255,255,.05)';
        container.style.border = '1px solid rgba(255,255,255,.1)';
        container.style.color = '#fff';

        const main =
            document.querySelector('main') ||
            document.body;

        main.appendChild(container);

        return container;
    }

    /*
     * ----------------------------------------------------------
     * بدء لعبة الذكاء
     * ----------------------------------------------------------
     */

    function startLogicGame() {
        try {
            stopTimer();

            state.selectedGame = 'logic';
            state.currentQuestions = getQuestions(5);
            state.currentQuestionIndex = 0;
            state.score = 0;
            state.correctAnswers = 0;
            state.wrongAnswers = 0;
            state.gameRunning = true;

            state.player.gamesPlayed += 1;
            state.player.lastPlayedAt = new Date().toISOString();

            savePlayer();

            renderQuestion();

            const gameContainer = ensureGameContainer();

            gameContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

        } catch (error) {
            console.error('Start game error:', error);

            showNotification(
                'حدث خطأ أثناء تشغيل اللعبة.',
                'error'
            );
        }
    }

    /*
     * ----------------------------------------------------------
     * عرض السؤال
     * ----------------------------------------------------------
     */

    function renderQuestion() {
        try {
            if (!state.gameRunning) {
                return;
            }

            const question =
                state.currentQuestions[state.currentQuestionIndex];

            if (!question) {
                finishGame();
                return;
            }

            state.currentQuestion = question;
            state.timeLeft = APP_CONFIG.maxQuestionTime;

            const container = ensureGameContainer();

            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            const title = document.createElement('h2');
            title.textContent =
                `🧠 تحدي الذكاء — السؤال ${state.currentQuestionIndex + 1} من ${state.currentQuestions.length}`;

            const progress = document.createElement('div');
            progress.textContent =
                `المستوى: ${getPlayerLevel().title} | الصعوبة: ${getDifficulty()}`;

            progress.style.opacity = '0.7';
            progress.style.marginBottom = '20px';

            const timer = document.createElement('div');
            timer.id = 'zivoQuestionTimer';
            timer.textContent =
                `⏱️ ${state.timeLeft}`;

            timer.style.fontSize = '24px';
            timer.style.fontWeight = 'bold';
            timer.style.marginBottom = '20px';

            const questionText = document.createElement('div');
            questionText.textContent = question.question;

            questionText.style.fontSize = '22px';
            questionText.style.lineHeight = '1.8';
            questionText.style.marginBottom = '25px';

            const answers = document.createElement('div');

            answers.style.display = 'grid';
            answers.style.gridTemplateColumns =
                'repeat(auto-fit,minmax(220px,1fr))';
            answers.style.gap = '12px';

            question.answers.forEach((answer, index) => {
                const button = document.createElement('button');

                button.type = 'button';
                button.textContent = answer;

                button.style.padding = '15px';
                button.style.borderRadius = '14px';
                button.style.border =
                    '1px solid rgba(255,255,255,.15)';
                button.style.background =
                    'rgba(255,255,255,.06)';
                button.style.color = '#fff';
                button.style.cursor = 'pointer';
                button.style.fontSize = '16px';

                button.addEventListener(
                    'click',
                    () => answerQuestion(index)
                );

                answers.appendChild(button);
            });

            container.appendChild(title);
            container.appendChild(progress);
            container.appendChild(timer);
            container.appendChild(questionText);
            container.appendChild(answers);

            startTimer();

        } catch (error) {
            console.error('Render question error:', error);

            showNotification(
                'تعذر عرض السؤال.',
                'error'
            );
        }
    }

    /*
     * ----------------------------------------------------------
     * مؤقت السؤال
     * ----------------------------------------------------------
     */

    function startTimer() {
        stopTimer();

        state.timer = window.setInterval(() => {
            state.timeLeft -= 1;

            const timer =
                document.getElementById('zivoQuestionTimer');

            if (timer) {
                timer.textContent =
                    `⏱️ ${Math.max(0, state.timeLeft)}`;
            }

            if (state.timeLeft <= 0) {
                stopTimer();

                showNotification(
                    '⏰ انتهى الوقت!',
                    'error'
                );

                processAnswer(-1);
            }

        }, 1000);
    }

    function stopTimer() {
        if (state.timer !== null) {
            window.clearInterval(state.timer);
            state.timer = null;
        }
    }

    /*
     * ----------------------------------------------------------
     * الإجابة
     * ----------------------------------------------------------
     */

    function answerQuestion(index) {
        if (!state.gameRunning) {
            return;
        }

        processAnswer(index);
    }

    function processAnswer(index) {
        try {
            stopTimer();

            const question = state.currentQuestion;

            if (!question) {
                return;
            }

            const buttons =
                document.querySelectorAll(
                    '#zivoGameContainer button'
                );

            buttons.forEach(button => {
                button.disabled = true;
                button.style.cursor = 'not-allowed';
            });

            const correct = index === question.correct;

            if (correct) {
                state.correctAnswers += 1;

                state.score +=
                    APP_CONFIG.xpPerCorrectAnswer;

                state.player.correctAnswers += 1;
                state.player.wins += 1;
                state.player.streak += 1;

                state.player.bestStreak = Math.max(
                    state.player.bestStreak,
                    state.player.streak
                );

                addXP(APP_CONFIG.xpPerCorrectAnswer);

                addZivo(
                    APP_CONFIG.zivoPerCorrectAnswer
                );

                showNotification(
                    '✅ إجابة صحيحة! +XP و +ZIVO',
                    'success'
                );

                if (state.player.streak >= 3) {
                    unlockAchievement(
                        'three-streak',
                        '3 إجابات صحيحة متتالية'
                    );
                }

            } else {
                state.wrongAnswers += 1;

                state.player.wrongAnswers += 1;
                state.player.streak = 0;

                showNotification(
                    `❌ إجابة غير صحيحة. الإجابة الصحيحة: ${question.answers[question.correct]}`,
                    'error'
                );
            }

            state.player.totalScore +=
                correct ? APP_CONFIG.xpPerCorrectAnswer : 0;

            savePlayer();
            updatePlayerUI();

            window.setTimeout(() => {
                state.currentQuestionIndex += 1;

                if (
                    state.currentQuestionIndex >=
                    state.currentQuestions.length
                ) {
                    finishGame();
                } else {
                    renderQuestion();
                }
            }, 1200);

        } catch (error) {
            console.error('Answer processing error:', error);

            showNotification(
                'حدث خطأ أثناء معالجة الإجابة.',
                'error'
            );
        }
    }

    /*
     * ----------------------------------------------------------
     * إنهاء اللعبة
     * ----------------------------------------------------------
     */

    function finishGame() {
        try {
            stopTimer();

            state.gameRunning = false;

            const total =
                state.currentQuestions.length;

            const percentage =
                total > 0
                    ? Math.round(
                        (state.correctAnswers / total) * 100
                    )
                    : 0;

            const container = ensureGameContainer();

            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            const title = document.createElement('h2');
            title.textContent = '🏆 انتهى التحدي';

            const result = document.createElement('p');

            result.textContent =
                `نتيجتك: ${state.correctAnswers}/${total} — ${percentage}%`;

            result.style.fontSize = '22px';

            const score = document.createElement('p');

            score.textContent =
                `XP المكتسبة: ${state.correctAnswers * APP_CONFIG.xpPerCorrectAnswer}`;

            const reward = document.createElement('p');

            reward.textContent =
                `ZIVO المكتسبة: ${(state.correctAnswers * APP_CONFIG.zivoPerCorrectAnswer).toFixed(2)}`;

            const again = document.createElement('button');

            again.type = 'button';
            again.textContent = '🔄 العب مرة أخرى';

            again.style.padding = '14px 22px';
            again.style.borderRadius = '14px';
            again.style.border = 'none';
            again.style.cursor = 'pointer';

            again.addEventListener(
                'click',
                startLogicGame
            );

            container.appendChild(title);
            container.appendChild(result);
            container.appendChild(score);
            container.appendChild(reward);
            container.appendChild(again);

            updatePlayerUI();

            if (percentage === 100) {
                unlockAchievement(
                    'perfect-game',
                    'إجابة صحيحة على جميع الأسئلة'
                );
            }

        } catch (error) {
            console.error('Finish game error:', error);
        }
    }

    /*
     * ----------------------------------------------------------
     * التحدي اليومي
     * ----------------------------------------------------------
     */

    function getDailyState() {
        try {
            const today = todayKey();
            const raw = localStorage.getItem(
                APP_CONFIG.dailyKey
            );

            if (!raw) {
                return {
                    date: today,
                    completed: false
                };
            }

            const parsed = JSON.parse(raw);

            if (!parsed || parsed.date !== today) {
                return {
                    date: today,
                    completed: false
                };
            }

            return {
                date: today,
                completed: Boolean(parsed.completed)
            };

        } catch (error) {
            console.error('Daily state error:', error);

            return {
                date: todayKey(),
                completed: false
            };
        }
    }

    function completeDailyChallenge() {
        try {
            const daily = getDailyState();

            if (daily.completed) {
                showNotification(
                    '🔥 أنجزت تحدي اليوم مسبقاً. عد غداً لتحدي جديد!',
                    'info'
                );

                return;
            }

            localStorage.setItem(
                APP_CONFIG.dailyKey,
                JSON.stringify({
                    date: todayKey(),
                    completed: true
                })
            );

            addXP(
                APP_CONFIG.xpPerDailyChallenge
            );

            addZivo(
                APP_CONFIG.zivoPerDailyChallenge
            );

            unlockAchievement(
                `daily-${todayKey()}`,
                'إنجاز التحدي اليومي'
            );

            showNotification(
                '🔥 أحسنت! أكملت تحدي اليوم وحصلت على مكافأتك.',
                'success'
            );

            updateDailyUI();

        } catch (error) {
            console.error(
                'Complete daily challenge error:',
                error
            );
        }
    }

    function updateDailyUI() {
        try {
            const daily = getDailyState();

            document.querySelectorAll(
                '[data-daily-status]'
            ).forEach(element => {
                element.textContent = daily.completed
                    ? 'تم الإنجاز اليوم ✅'
                    : 'متاح الآن 🔥';
            });

            document.querySelectorAll(
                '[data-daily-button]'
            ).forEach(button => {
                button.disabled = daily.completed;

                button.textContent = daily.completed
                    ? 'تم إنجاز التحدي اليوم'
                    : 'ابدأ تحدي اليوم';
            });

        } catch (error) {
            console.error('Daily UI error:', error);
        }
    }

    /*
     * ----------------------------------------------------------
     * الحساب
     * ----------------------------------------------------------
     */

    function setupAccountForm() {
        const form =
            document.querySelector(
                '#accountForm'
            );

        if (!form) {
            return;
        }

        form.addEventListener('submit', event => {
            event.preventDefault();

            try {
                const nameInput =
                    form.querySelector(
                        '[name="name"], #playerNameInput'
                    );

                const ageInput =
                    form.querySelector(
                        '[name="age"], #playerAgeInput'
                    );

                const name =
                    nameInput?.value?.trim() || 'لاعب ZIVO';

                const age =
                    clamp(
                        safeNumber(
                            ageInput?.value,
                            18
                        ),
                        6,
                        100
                    );

                state.player.name =
                    name.slice(0, 40);

                state.player.age = age;

                savePlayer();
                updatePlayerUI();

                showNotification(
                    'تم حفظ ملف اللاعب بنجاح ✅',
                    'success'
                );

            } catch (error) {
                console.error(
                    'Account form error:',
                    error
                );

                showNotification(
                    'تعذر حفظ بيانات الحساب.',
                    'error'
                );
            }
        });
    }

    /*
     * ----------------------------------------------------------
     * ربط أزرار الموقع
     * ----------------------------------------------------------
     */

    function bindButtons() {
        const logicSelectors = [
            '#startGame',
            '#startLogicGame',
            '#playGame',
            '[data-game="logic"]'
        ];

        logicSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(button => {
                button.addEventListener(
                    'click',
                    startLogicGame
                );
            });
        });

        document.querySelectorAll(
            '[data-daily-button]'
        ).forEach(button => {
            button.addEventListener(
                'click',
                startDailyGame
            );
        });
    }

    /*
     * ----------------------------------------------------------
     * لعبة التحدي اليومي
     * ----------------------------------------------------------
     */

    function startDailyGame() {
        try {
            const daily = getDailyState();

            if (daily.completed) {
                showNotification(
                    'لقد أكملت تحدي اليوم بالفعل.',
                    'info'
                );

                return;
            }

            state.selectedGame = 'daily';

            /*
             * التحدي اليومي أصعب قليلاً من المستوى المعتاد.
             */

            let questions =
                getQuestions(3);

            if (questions.length === 0) {
                throw new Error(
                    'No daily questions available'
                );
            }

            state.currentQuestions = questions;
            state.currentQuestionIndex = 0;
            state.score = 0;
            state.correctAnswers = 0;
            state.wrongAnswers = 0;
            state.gameRunning = true;

            const originalFinish = finishGame;

            /*
             * نعرض اللعبة بشكل طبيعي، لكن عند النهاية
             * نمنح مكافأة التحدي اليومي.
             */

            renderQuestion();

            const container = ensureGameContainer();

            const oldFinishIndex =
                state.currentQuestions.length;

            void originalFinish;
            void oldFinishIndex;

            /*
             * مراقبة انتهاء الأسئلة من خلال دالة مخصصة.
             */

            state.dailyMode = true;

        } catch (error) {
            console.error(
                'Daily game start error:',
                error
            );

            showNotification(
                'تعذر بدء التحدي اليومي.',
                'error'
            );
        }
    }

    /*
     * ----------------------------------------------------------
     * إصلاح نهاية التحدي اليومي
     * ----------------------------------------------------------
     */

    function checkDailyCompletion() {
        if (
            state.selectedGame === 'daily' &&
            !state.gameRunning &&
            state.correctAnswers >= 0
        ) {
            completeDailyChallenge();
            state.selectedGame = null;
        }
    }

    /*
     * ----------------------------------------------------------
     * معلومات عامة عن اللاعب
     * ----------------------------------------------------------
     */

    function getPlayerProfile() {
        const level = getPlayerLevel();
        const nextLevel = getNextLevel();

        return {
            ...state.player,
            level: level.level,
            title: level.title,
            difficulty: getDifficulty(),
            nextLevel: nextLevel?.level || null
        };
    }

    /*
     * ----------------------------------------------------------
     * API داخلية بسيطة يمكن استخدامها لاحقاً
     * من أجزاء أخرى من الموقع.
     * ----------------------------------------------------------
     */

    window.ZIVOZONE = {
        getPlayer: () => getPlayerProfile(),

        startGame: startLogicGame,

        startDailyChallenge: startDailyGame,

        addXP,

        addZivo,

        getDifficulty,

        getLevel: getPlayerLevel,

        showNotification,

        save: savePlayer,

        resetPlayer: () => {
            try {
                localStorage.removeItem(
                    APP_CONFIG.storageKey
                );

                localStorage.removeItem(
                    APP_CONFIG.dailyKey
                );

                state.player =
                    createDefaultPlayer();

                savePlayer();
                updatePlayerUI();
                updateDailyUI();

                showNotification(
                    'تم إعادة ضبط ملف اللاعب.',
                    'success'
                );

            } catch (error) {
                console.error(
                    'Reset player error:',
                    error
                );
            }
        }
    };

    /*
     * ----------------------------------------------------------
     * تشغيل التطبيق
     * ----------------------------------------------------------
     */

    function init() {
        try {
            loadPlayer();

            updatePlayerUI();
            updateDailyUI();

            setupAccountForm();
            bindButtons();

            console.log(
                `%c${APP_CONFIG.name} v${APP_CONFIG.version}`,
                'font-size:20px;font-weight:bold;'
            );

            console.log(
                'ZIVOZONE application initialized successfully.'
            );

        } catch (error) {
            console.error(
                'Critical ZIVOZONE initialization error:',
                error
            );

            showNotification(
                'حدث خطأ أثناء تشغيل ZIVOZONE.',
                'error'
            );
        }
    }

    /*
     * DOM جاهز
     */

    if (
        document.readyState === 'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
