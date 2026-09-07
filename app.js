"use strict";

/*
=========================================================
ZIVOZONE APP ENGINE
=========================================================

الوظائف:
- تشغيل جميع أزرار الموقع
- نظام الألعاب
- أسئلة حسب مستوى اللاعب وعمره
- XP
- ZIVO Coins
- Wins
- التحديات اليومية
- الملف الشخصي
- من أنا؟
- ZIVO AI التجريبي
- الرياضة
- حفظ تقدم اللاعب

يعمل مع:
index.html
styles.css
auth.js

=========================================================
*/

(function () {

    const PLAYER_KEY = "zivozone_player";

    let player = null;


    /* =====================================================
       BASIC HELPERS
    ===================================================== */

    const $ = (id) =>
        document.getElementById(id);


    function toast(message, type = "success") {

        const container =
            $("toast-container");

        if (!container) {
            return;
        }

        const element =
            document.createElement("div");

        element.className =
            `toast ${type}`;

        element.textContent =
            message;

        container.appendChild(element);

        setTimeout(() => {

            element.remove();

        }, 3200);
    }


    window.zivoToast = toast;


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       DEFAULT PLAYER
    ===================================================== */

    function defaultPlayer() {

        return {

            uid: "",

            name: "زائر",

            email: "",

            age: 18,

            level: 1,

            xp: 0,

            coins: 0,

            wins: 0,

            gamesPlayed: 0,

            quizWins: 0,

            scienceWins: 0,

            horrorWins: 0,

            dailyWins: 0,

            identityCompleted: false,

            lastDaily: null,

            createdAt:
                new Date().toISOString()

        };

    }


    /* =====================================================
       PLAYER LOAD
    ===================================================== */

    function loadPlayer() {

        try {

            const saved =
                localStorage.getItem(
                    PLAYER_KEY
                );

            if (saved) {

                player = {
                    ...defaultPlayer(),
                    ...JSON.parse(saved)
                };

            } else {

                player =
                    defaultPlayer();

            }

        } catch (error) {

            console.error(
                "Player load error:",
                error
            );

            player =
                defaultPlayer();

        }


        syncAuthPlayer();

        renderPlayer();

    }


    function syncAuthPlayer() {

        if (
            !window.ZivoAuth ||
            !window.ZivoAuth.getCurrentUser
        ) {
            return;
        }


        const user =
            window.ZivoAuth.getCurrentUser();


        if (!user) {
            return;
        }


        player.uid =
            user.uid ||
            player.uid;


        player.name =
            user.displayName ||
            user.name ||
            player.name;


        player.email =
            user.email ||
            player.email;


        /*
         * إذا كانت هذه أول مرة نسجل اللاعب،
         * نحتفظ ببياناته الحالية.
         */

        savePlayer();

    }


    window.zivoLoadPlayer =
        function (user) {

            if (!player) {

                player =
                    defaultPlayer();

            }


            if (user) {

                player.uid =
                    user.uid ||
                    player.uid;

                player.name =
                    user.displayName ||
                    user.name ||
                    player.name;

                player.email =
                    user.email ||
                    player.email;

                if (user.age) {
                    player.age =
                        Number(user.age);
                }

            }


            savePlayer();

            renderPlayer();

        };


    function savePlayer() {

        try {

            localStorage.setItem(
                PLAYER_KEY,
                JSON.stringify(player)
            );

        } catch (error) {

            console.error(
                "Player save error:",
                error
            );

        }

    }


    /* =====================================================
       AUTH REQUIREMENT
    ===================================================== */

    function requireLogin(callback) {

        if (
            window.ZivoAuth &&
            window.ZivoAuth.isLoggedIn &&
            window.ZivoAuth.isLoggedIn()
        ) {

            callback();

            return true;
        }


        openLoginRequired();

        return false;

    }


    function openLoginRequired() {

        if (
            window.ZivoAuth &&
            window.ZivoAuth.open
        ) {

            window.ZivoAuth.open();

            setTimeout(() => {

                toast(
                    "أنشئ حسابك أولًا حتى تحفظ تقدمك 🎮",
                    "error"
                );

            }, 100);

            return;
        }


        toast(
            "يجب إنشاء حساب أولًا.",
            "error"
        );

    }


    /* =====================================================
       LEVEL SYSTEM
    ===================================================== */

    function xpForNextLevel() {

        return (
            100 +
            ((player.level - 1) * 50)
        );

    }


    function addXP(amount) {

        amount =
            Math.max(
                0,
                Number(amount) || 0
            );


        player.xp += amount;


        let leveledUp = false;


        while (
            player.xp >=
            xpForNextLevel()
        ) {

            player.xp -=
                xpForNextLevel();

            player.level += 1;

            leveledUp = true;

        }


        if (leveledUp) {

            toast(
                `🔥 مبروك! وصلت إلى Level ${player.level}`,
                "success"
            );

        }


        savePlayer();

        renderPlayer();

    }


    function addCoins(amount) {

        amount =
            Math.max(
                0,
                Number(amount) || 0
            );


        player.coins += amount;


        savePlayer();

        renderPlayer();

    }


    function recordWin() {

        player.wins += 1;

        player.gamesPlayed += 1;

        savePlayer();

        renderPlayer();

    }


    function recordGame() {

        player.gamesPlayed += 1;

        savePlayer();

        renderPlayer();

    }


    /* =====================================================
       PLAYER UI
    ===================================================== */

    function renderPlayer() {

        if (!player) {
            return;
        }


        const name =
            $("profile-name");

        const email =
            $("profile-email");

        const level =
            $("profile-level");

        const xp =
            $("profile-xp");

        const coins =
            $("profile-coins");

        const wins =
            $("profile-wins");

        const chip =
            $("player-level-chip");

        const progress =
            $("xp-progress");


        if (name) {

            name.textContent =
                player.name ||
                "زائر";

        }


        if (email) {

            email.textContent =
                player.email ||
                "سجل حسابك لحفظ تقدمك.";

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


        if (chip) {

            chip.textContent =
                `Level ${player.level}`;

        }


        if (progress) {

            const required =
                xpForNextLevel();

            const percent =
                Math.min(
                    100,
                    (player.xp / required) * 100
                );


            progress.style.width =
                `${percent}%`;

        }

    }


    /* =====================================================
       QUESTION DATABASE
    ===================================================== */

    const QUESTIONS = {

        easy: [

            {
                q: "كم عدد أيام الأسبوع؟",
                a: [
                    "5",
                    "6",
                    "7",
                    "8"
                ],
                correct: 2
            },

            {
                q: "ما الكوكب المعروف بالكوكب الأحمر؟",
                a: [
                    "المريخ",
                    "الأرض",
                    "المشتري",
                    "الزهرة"
                ],
                correct: 0
            },

            {
                q: "كم يساوي 5 + 7؟",
                a: [
                    "10",
                    "11",
                    "12",
                    "13"
                ],
                correct: 2
            },

            {
                q: "ما لون السماء في يوم صافٍ؟",
                a: [
                    "أخضر",
                    "أزرق",
                    "أسود",
                    "أحمر"
                ],
                correct: 1
            },

            {
                q: "كم عدد أصابع اليد الواحدة؟",
                a: [
                    "4",
                    "5",
                    "6",
                    "10"
                ],
                correct: 1
            }

        ],


        medium: [

            {
                q: "إذا كان 3 × 8 = ؟",
                a: [
                    "18",
                    "21",
                    "24",
                    "27"
                ],
                correct: 2
            },

            {
                q: "ما الغاز الذي يحتاجه الإنسان للتنفس؟",
                a: [
                    "الهيدروجين",
                    "الأكسجين",
                    "الهيليوم",
                    "النيتروجين"
                ],
                correct: 1
            },

            {
                q: "أي محيط هو الأكبر؟",
                a: [
                    "الأطلسي",
                    "الهندي",
                    "الهادئ",
                    "المتجمد"
                ],
                correct: 2
            },

            {
                q: "كم ضلعًا للمثلث؟",
                a: [
                    "2",
                    "3",
                    "4",
                    "5"
                ],
                correct: 1
            },

            {
                q: "ما عاصمة الأردن؟",
                a: [
                    "إربد",
                    "الزرقاء",
                    "العقبة",
                    "عمّان"
                ],
                correct: 3
            }

        ],


        hard: [

            {
                q: "ما العدد الأولي من التالي؟",
                a: [
                    "21",
                    "27",
                    "29",
                    "33"
                ],
                correct: 2
            },

            {
                q: "ما وحدة قياس القوة في النظام الدولي؟",
                a: [
                    "جول",
                    "واط",
                    "نيوتن",
                    "باسكال"
                ],
                correct: 2
            },

            {
                q: "كم عدد الكواكب في النظام الشمسي؟",
                a: [
                    "7",
                    "8",
                    "9",
                    "10"
                ],
                correct: 1
            },

            {
                q: "ما العملية التي تصنع بها النباتات غذاءها؟",
                a: [
                    "التنفس",
                    "التبخر",
                    "البناء الضوئي",
                    "الهضم"
                ],
                correct: 2
            },

            {
                q: "إذا كان 12² يساوي؟",
                a: [
                    "124",
                    "134",
                    "144",
                    "154"
                ],
                correct: 2
            }

        ]

    };


    const SCIENCE_QUESTIONS = [

        {
            q: "ما العضو الذي يضخ الدم في جسم الإنسان؟",
            a: [
                "الرئة",
                "القلب",
                "الكبد",
                "المعدة"
            ],
            correct: 1
        },

        {
            q: "ما أقرب كوكب إلى الشمس؟",
            a: [
                "الأرض",
                "المريخ",
                "عطارد",
                "المشتري"
            ],
            correct: 2
        },

        {
            q: "ما الحالة التي يكون فيها الماء عند 0°C تقريبًا؟",
            a: [
                "غازية",
                "صلبة",
                "بلازما",
                "لا شيء"
            ],
            correct: 1
        },

        {
            q: "ما الذي تستخدمه النباتات لامتصاص الضوء؟",
            a: [
                "الكلوروفيل",
                "الكالسيوم",
                "الهيموغلوبين",
                "الكولاجين"
            ],
            correct: 0
        },

        {
            q: "أي قوة تجذب الأجسام نحو الأرض؟",
            a: [
                "المغناطيسية",
                "الاحتكاك",
                "الجاذبية",
                "الكهربائية"
            ],
            correct: 2
        }

    ];


    /* =====================================================
       QUESTION LEVEL
    ===================================================== */

    function getDifficulty() {

        const age =
            Number(player.age) || 18;


        const level =
            Number(player.level) || 1;


        if (
            age <= 10 &&
            level <= 3
        ) {

            return "easy";

        }


        if (
            level <= 5
        ) {

            return "medium";

        }


        return "hard";

    }


    function shuffle(array) {

        return [...array]
            .sort(
                () =>
                    Math.random() - 0.5
            );

    }


    /* =====================================================
       QUIZ GAME
    ===================================================== */

    function startQuiz() {

        requireLogin(() => {

            const difficulty =
                getDifficulty();


            const questions =
                shuffle(
                    QUESTIONS[difficulty]
                ).slice(0, 5);


            startQuestionGame(
                "اختبار سرعة الذكاء 🧠",
                questions,
                "quiz"
            );

        });

    }


    function startScience() {

        requireLogin(() => {

            const questions =
                shuffle(
                    SCIENCE_QUESTIONS
                ).slice(0, 5);


            startQuestionGame(
                "تحدي العلوم 🔬",
                questions,
                "science"
            );

        });

    }


    function startQuestionGame(
        title,
        questions,
        type
    ) {

        let index = 0;

        let score = 0;


        openGameModal(
            title,
            renderQuestion
        );


        function renderQuestion() {

            const root =
                $("modal-root");


            if (!root) {
                return;
            }


            const question =
                questions[index];


            root.querySelector(
                ".game-question"
            ).textContent =
                question.q;


            const answers =
                root.querySelector(
                    ".answers"
                );


            answers.innerHTML = "";


            question.a.forEach(
                (answer, answerIndex) => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.className =
                        "btn btn-ghost";


                    button.textContent =
                        answer;


                    button.addEventListener(
                        "click",
                        () => {

                            if (
                                answerIndex ===
                                question.correct
                            ) {

                                score += 1;

                                toast(
                                    "إجابة صحيحة! 🎯",
                                    "success"
                                );

                            } else {

                                toast(
                                    `إجابة غير صحيحة. الصحيح: ${question.a[question.correct]}`,
                                    "error"
                                );

                            }


                            index += 1;


                            if (
                                index >=
                                questions.length
                            ) {

                                finish();

                            } else {

                                updateCounter();

                                renderQuestion();

                            }

                        }
                    );


                    answers.appendChild(
                        button
                    );

                }
            );


            updateCounter();

        }


        function updateCounter() {

            const counter =
                $("game-counter");

            if (counter) {

                counter.textContent =
                    `السؤال ${index + 1} من ${questions.length}`;

            }

        }


        function finish() {

            recordGame();


            const perfect =
                score ===
                questions.length;


            let xpReward =
                15 * score;


            let coinReward =
                score;


            if (perfect) {

                xpReward += 25;

                coinReward += 3;

            }


            addXP(
                xpReward
            );


            addCoins(
                coinReward
            );


            if (perfect) {

                recordWin();

            }


            const root =
                $("modal-root");


            root.querySelector(
                ".modal-card"
            ).innerHTML = `

                <button
                    class="modal-close"
                    type="button"
                    data-game-close
                >
                    ×
                </button>

                <span class="eyebrow">
                    RESULT
                </span>

                <h2>
                    ${perfect ? "🏆 أداء مذهل!" : "🎮 انتهت الجولة"}
                </h2>

                <p>
                    نتيجتك:
                    <strong>
                        ${score}/${questions.length}
                    </strong>
                </p>

                <p>
                    حصلت على
                    <strong>
                        +${xpReward} XP
                    </strong>
                    و
                    <strong>
                        +${coinReward} 🪙 ZIVO
                    </strong>
                </p>

                <button
                    class="btn btn-primary full"
                    data-game-close
                >
                    العودة
                </button>

            `;


            root.querySelectorAll(
                "[data-game-close]"
            ).forEach(
                button => {

                    button.addEventListener(
                        "click",
                        closeModal
                    );

                }
            );

        }

    }


    /* =====================================================
       GAME MODAL
    ===================================================== */

    function openGameModal(
        title,
        renderer
    ) {

        const root =
            $("modal-root");


        if (!root) {
            return;
        }


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        root.innerHTML = `

            <div class="modal-backdrop">

                <div
                    class="modal-card"
                    role="dialog"
                    aria-modal="true"
                >

                    <button
                        class="modal-close"
                        type="button"
                        data-game-close
                    >
                        ×
                    </button>

                    <span class="eyebrow">
                        ZIVO GAME
                    </span>

                    <h2>
                        ${escapeHTML(title)}
                    </h2>

                    <div
                        id="game-counter"
                        class="muted"
                    ></div>

                    <h3
                        class="game-question"
                        style="
                            margin-top:20px;
                            font-size:20px;
                        "
                    ></h3>

                    <div
                        class="answers"
                    ></div>

                </div>

            </div>

        `;


        root.querySelector(
            "[data-game-close]"
        ).addEventListener(
            "click",
            closeModal
        );


        renderer();

    }


    function closeModal() {

        const root =
            $("modal-root");


        if (!root) {
            return;
        }


        root.setAttribute(
            "aria-hidden",
            "true"
        );


        root.innerHTML = "";

    }


    /* =====================================================
       HORROR GAME
    ===================================================== */

    function startHorror() {

        requireLogin(() => {

            openStoryModal();

        });

    }


    function openStoryModal() {

        const root =
            $("modal-root");


        root.setAttribute(
            "aria-hidden",
            "false"
        );


        root.innerHTML = `

            <div class="modal-backdrop">

                <div class="modal-card">

                    <button
                        class="modal-close"
                        id="horror-close"
                    >
                        ×
                    </button>

                    <span class="eyebrow">
                        HORROR EXPERIENCE
                    </span>

                    <h2>
                        الغرفة المظلمة 👻
                    </h2>

                    <p id="horror-text">
                        تستيقظ في غرفة مظلمة.
                        أمامك باب، وبجانبك مصباح صغير.
                        ماذا ستفعل؟
                    </p>

                    <div
                        class="answers"
                        id="horror-actions"
                    >

                        <button
                            class="btn btn-ghost"
                            data-horror="door"
                        >
                            🚪 أفتح الباب
                        </button>

                        <button
                            class="btn btn-ghost"
                            data-horror="lamp"
                        >
                            🔦 أشغل المصباح
                        </button>

                        <button
                            class="btn btn-ghost"
                            data-horror="wait"
                        >
                            🤫 أنتظر
                        </button>

                    </div>

                </div>

            </div>

        `;


        $("horror-close")
            .addEventListener(
                "click",
                closeModal
            );


        $("horror-actions")
            .addEventListener(
                "click",
                handleHorrorChoice
            );

    }


    function handleHorrorChoice(event) {

        const button =
            event.target.closest(
                "[data-horror]"
            );


        if (!button) {
            return;
        }


        const choice =
            button.dataset.horror;


        const text =
            $("horror-text");


        const actions =
            $("horror-actions");


        if (
            choice === "door"
        ) {

            text.textContent =
                "الباب يفتح ببطء... تجد ممرًا مضاءً في نهايته. نجحت في الهروب! 🏃";

            finishHorror();

            return;

        }


        if (
            choice === "lamp"
        ) {

            text.textContent =
                "المصباح يضيء فجأة وتظهر أمامك رسالة: لا تنظر خلفك... 😨";

            actions.innerHTML = `

                <button
                    class="btn btn-primary"
                    data-horror="escape"
                >
                    🏃 أهرب
                </button>

            `;

            return;

        }


        text.textContent =
            "الصمت يزداد... ثم تسمع طرقًا خلفك. عليك اتخاذ قرار بسرعة!";

        actions.innerHTML = `

            <button
                class="btn btn-primary"
                data-horror="escape"
            >
                🏃 أهرب
            </button>

            <button
                class="btn btn-ghost"
                data-horror="stay"
            >
                👀 أنظر خلفي
            </button>

        `;

    }


    function finishHorror() {

        recordGame();

        recordWin();

        addXP(75);

        addCoins(5);


        setTimeout(
            () => {

                closeModal();

                toast(
                    "🏆 أنهيت الغرفة المظلمة! +75 XP +5 ZIVO",
                    "success"
                );

            },
            700
        );

    }


    /* =====================================================
       DAILY CHALLENGE
    ===================================================== */

    function todayKey() {

        const date =
            new Date();

        return [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        ].join("-");

    }


    function dailyAvailable() {

        return (
            player.lastDaily !==
            todayKey()
        );

    }


    function startDaily() {

        requireLogin(() => {

            if (
                !dailyAvailable()
            ) {

                toast(
                    "أنجزت تحدي اليوم بالفعل. عد غدًا 🔥",
                    "error"
                );

                return;

            }


            const question =
                shuffle(
                    QUESTIONS.medium
                )[0];


            openGameModal(
                "تحدي ZIVO اليومي ⚡",
                () => {

                    const root =
                        $("modal-root");


                    root.querySelector(
                        ".game-question"
                    ).textContent =
                        question.q;


                    const counter =
                        $("game-counter");


                    counter.textContent =
                        "مكافأة اليوم: +30 XP و +3 ZIVO";


                    const answers =
                        root.querySelector(
                            ".answers"
                        );


                    answers.innerHTML = "";


                    question.a.forEach(
                        (answer, i) => {

                            const button =
                                document.createElement(
                                    "button"
                                );


                            button.className =
                                "btn btn-ghost";


                            button.textContent =
                                answer;


                            button.addEventListener(
                                "click",
                                () => {

                                    if (
                                        i ===
                                        question.correct
                                    ) {

                                        player.lastDaily =
                                            todayKey();

                                        player.dailyWins +=
                                            1;

                                        recordWin();

                                        addXP(30);

                                        addCoins(3);

                                        savePlayer();

                                        toast(
                                            "🎉 أنجزت التحدي اليومي!",
                                            "success"
                                        );

                                        closeModal();

                                        renderChallenges();

                                    } else {

                                        toast(
                                            "ليست الإجابة الصحيحة، حاول مرة أخرى.",
                                            "error"
                                        );

                                    }

                                }
                            );


                            answers.appendChild(
                                button
                            );

                        }
                    );

                }
            );

        });

    }


    /* =====================================================
       CHALLENGES
    ===================================================== */

    function renderChallenges() {

        const container =
            $("challenge-list");


        if (!container) {
            return;
        }


        const completedDaily =
            !dailyAvailable();


        const challenges = [

            {

                icon: "⚡",

                title:
                    "تحدي اليوم",

                description:
                    completedDaily
                        ? "تم إنجاز تحدي اليوم. عد غدًا."
                        : "أجب عن السؤال اليومي واحصل على مكافأة.",

                action:
                    completedDaily
                        ? null
                        : startDaily,

                button:
                    completedDaily
                        ? "مكتمل ✓"
                        : "ابدأ"

            },


            {

                icon: "🧠",

                title:
                    "10 انتصارات",

                description:
                    `حقق 10 انتصارات. تقدمك ${Math.min(player.wins, 10)}/10.`,

                action:
                    startQuiz,

                button:
                    "العب الآن"

            },


            {

                icon: "🪙",

                title:
                    "اجمع 25 ZIVO",

                description:
                    `رصيدك الحالي ${player.coins} ZIVO.`,

                action:
                    startQuiz,

                button:
                    "اجمع المزيد"

            }

        ];


        container.innerHTML = "";


        challenges.forEach(
            challenge => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "challenge-card";


                card.innerHTML = `

                    <div
                        class="challenge-icon"
                    >
                        ${challenge.icon}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(
                                challenge.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                challenge.description
                            )}
                        </p>

                    </div>

                    <button
                        class="btn btn-primary"
                    >
                        ${escapeHTML(
                            challenge.button
                        )}
                    </button>

                `;


                const button =
                    card.querySelector(
                        "button"
                    );


                if (challenge.action) {

                    button.addEventListener(
                        "click",
                        challenge.action
                    );

                } else {

                    button.disabled =
                        true;

                }


                container.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       WHO AM I
    ===================================================== */

    function startIdentity() {

        requireLogin(() => {

            const questions = [

                {
                    q:
                        "عندما تواجه مشكلة صعبة، ماذا تفعل؟",

                    a: [
                        "أحللها بهدوء",
                        "أجرب بسرعة",
                        "أطلب المساعدة",
                        "أبحث عن طريقة جديدة"
                    ]

                },

                {
                    q:
                        "أي نشاط تفضله؟",

                    a: [
                        "الألعاب الذهنية",
                        "الرياضة",
                        "التعلم",
                        "المغامرة"
                    ]

                },

                {
                    q:
                        "كيف تتعامل مع المنافسة؟",

                    a: [
                        "أحب الفوز",
                        "أحب التطور",
                        "أحب التعاون",
                        "أحب التحدي"
                    ]

                }

            ];


            let index = 0;

            const answers = [];


            openIdentityQuestion();


            function openIdentityQuestion() {

                const root =
                    $("modal-root");


                root.setAttribute(
                    "aria-hidden",
                    "false"
                );


                root.innerHTML = `

                    <div class="modal-backdrop">

                        <div class="modal-card">

                            <button
                                class="modal-close"
                                id="identity-close"
                            >
                                ×
                            </button>

                            <span class="eyebrow">
                                WHO AM I?
                            </span>

                            <h2>
                                اكتشف شخصيتك
                            </h2>

                            <p>
                                السؤال
                                ${index + 1}
                                من
                                ${questions.length}
                            </p>

                            <h3
                                class="game-question"
                            >
                                ${escapeHTML(
                                    questions[index].q
                                )}
                            </h3>

                            <div
                                class="answers"
                                id="identity-answers"
                            ></div>

                        </div>

                    </div>

                `;


                $("identity-close")
                    .addEventListener(
                        "click",
                        closeModal
                    );


                const box =
                    $("identity-answers");


                questions[index].a.forEach(
                    (answer, answerIndex) => {

                        const button =
                            document.createElement(
                                "button"
                            );


                        button.className =
                            "btn btn-ghost";


                        button.textContent =
                            answer;


                        button.addEventListener(
                            "click",
                            () => {

                                answers.push(
                                    answerIndex
                                );

                                index += 1;


                                if (
                                    index >=
                                    questions.length
                                ) {

                                    finishIdentity();

                                } else {

                                    openIdentityQuestion();

                                }

                            }
                        );


                        box.appendChild(
                            button
                        );

                    }
                );

            }


            function finishIdentity() {

                player.identityCompleted =
                    true;


                addXP(40);

                addCoins(4);


                const average =
                    answers.reduce(
                        (sum, value) =>
                            sum + value,
                        0
                    ) /
                    answers.length;


                let type =
                    "المستكشف";


                if (
                    average < 1
                ) {

                    type =
                        "المحلل 🧠";

                } else if (
                    average < 2
                ) {

                    type =
                        "المنافس 🏆";

                } else {

                    type =
                        "المستكشف 🚀";

                }


                savePlayer();


                const root =
                    $("modal-root");


                root.innerHTML = `

                    <div class="modal-backdrop">

                        <div class="modal-card">

                            <span class="eyebrow">
                                YOUR RESULT
                            </span>

                            <h2>
                                شخصيتك:
                                ${type}
                            </h2>

                            <p>
                                حصلت على +40 XP
                                و +4 ZIVO.
                            </p>

                            <button
                                class="btn btn-primary full"
                                id="identity-done"
                            >
                                رائع!
                            </button>

                        </div>

                    </div>

                `;


                $("identity-done")
                    .addEventListener(
                        "click",
                        closeModal
                    );

            }

        });

    }


    /* =====================================================
       ZIVO AI
    ===================================================== */

    function handleAI() {

        const form =
            $("ai-form");


        const input =
            $("ai-input");


        const messages =
            $("ai-messages");


        if (
            !form ||
            !input ||
            !messages
        ) {
            return;
        }


        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const text =
                    input.value.trim();


                if (!text) {
                    return;
                }


                addAIMessage(
                    text,
                    "user"
                );


                input.value = "";


                setTimeout(
                    () => {

                        const response =
                            generateAIResponse(
                                text
                            );


                        addAIMessage(
                            response,
                            "bot"
                        );

                    },
                    450
                );

            }
        );

    }


    function addAIMessage(
        message,
        type
    ) {

        const messages =
            $("ai-messages");


        if (!messages) {
            return;
        }


        const element =
            document.createElement(
                "div"
            );


        element.className =
            `ai-message ${type}`;


        element.textContent =
            message;


        messages.appendChild(
            element
        );


        messages.scrollTop =
            messages.scrollHeight;

    }


    function generateAIResponse(
        question
    ) {

        const q =
            question.toLowerCase();


        if (
            q.includes("مستوا") ||
            q.includes("level")
        ) {

            return `مستواك الحالي Level ${player.level} ولديك ${player.xp} XP. استمر باللعب لرفع مستواك. 🔥`;

        }


        if (
            q.includes("zivo") ||
            q.includes("عملة")
        ) {

            return `رصيدك الحالي ${player.coins} ZIVO 🪙. يمكنك جمع المزيد من الألعاب والتحديات.`;

        }


        if (
            q.includes("xp") ||
            q.includes("خبر")
        ) {

            return `لديك حاليًا ${player.xp} XP. الفوز الكامل في الألعاب يعطيك مكافآت إضافية.`;

        }


        if (
            q.includes("رياض") ||
            q.includes("sport")
        ) {

            return "قسم الرياضة موجود في ZIVOZONE، ويمكننا تطويره لاحقًا ليشمل نتائج ومباريات ومحتوى رياضي مباشر.";

        }


        return "سؤال ممتاز! 🤖 في هذه النسخة التجريبية أستطيع مساعدتك في مستوى اللاعب وXP وZIVO والألعاب والتحديات.";

    }


    /* =====================================================
       SPORTS
    ===================================================== */

    function renderSports() {

        const container =
            $("sports-list");


        if (!container) {
            return;
        }


        const sports = [

            {
                icon: "⚽",
                title: "كرة القدم",
                text: "تحديات وتحليلات ومحتوى كرة القدم."
            },

            {
                icon: "🏀",
                title: "كرة السلة",
                text: "اكتشف معلومات وتحديات كرة السلة."
            },

            {
                icon: "🎾",
                title: "التنس",
                text: "اختبر معلوماتك الرياضية."
            },

            {
                icon: "🏃",
                title: "اللياقة",
                text: "تحديات الحركة واللياقة البدنية."
            }

        ];


        container.innerHTML = "";


        sports.forEach(
            sport => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "sports-card";


                card.innerHTML = `

                    <div class="icon">
                        ${sport.icon}
                    </div>

                    <h3>
                        ${escapeHTML(
                            sport.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            sport.text
                        )}
                    </p>

                    <button
                        class="btn btn-ghost full"
                    >
                        استكشف
                    </button>

                `;


                card.querySelector(
                    "button"
                ).addEventListener(
                    "click",
                    () => {

                        toast(
                            `قسم ${sport.title} قيد التطوير 🚀`,
                            "success"
                        );

                    }
                );


                container.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       NAVIGATION ACTIONS
    ===================================================== */

    function bindNavigation() {

        document
            .querySelectorAll(
                ".main-nav a"
            )
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        event => {

                            const href =
                                link.getAttribute(
                                    "href"
                                );


                            if (
                                !href ||
                                !href.startsWith("#")
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
                                            "smooth"
                                    }
                                );

                            }

                        }
                    );

                }
            );

    }


    /* =====================================================
       DATA ACTIONS
    ===================================================== */

    function bindActions() {

        document.addEventListener(
            "click",
            function (event) {

                const element =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!element) {
                    return;
                }


                const action =
                    element.dataset.action;


                switch (action) {

                    case "scroll-games":

                        document
                            .querySelector(
                                "#games"
                            )
                            ?.scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                        break;


                    case "open-identity":

                        startIdentity();

                        break;


                    case "login":

                        if (
                            window.ZivoAuth &&
                            window.ZivoAuth.open
                        ) {

                            window.ZivoAuth.open();

                        }

                        break;


                    case "logout":

                        if (
                            window.ZivoAuth &&
                            window.ZivoAuth.logout
                        ) {

                            window.ZivoAuth.logout();

                        }

                        break;


                    case "ad-info":

                        toast(
                            "هذه المساحة مخصصة للإعلانات والرعاة.",
                            "success"
                        );

                        break;


                    case "refresh-sports":

                        renderSports();

                        toast(
                            "تم تحديث قسم الرياضة.",
                            "success"
                        );

                        break;

                }

            }
        );


        document.addEventListener(
            "click",
            function (event) {

                const gameButton =
                    event.target.closest(
                        "[data-game]"
                    );


                if (!gameButton) {
                    return;
                }


                const game =
                    gameButton.dataset.game;


                switch (game) {

                    case "quiz":

                        startQuiz();

                        break;


                    case "science":

                        startScience();

                        break;


                    case "horror":

                        startHorror();

                        break;


                    case "daily":

                        startDaily();

                        break;

                }

            }
        );

    }


    /* =====================================================
       LANGUAGE
    ===================================================== */

    function bindLanguage() {

        const select =
            $("language-select");


        if (!select) {
            return;
        }


        select.addEventListener(
            "change",
            () => {

                const language =
                    select.value;


                if (
                    language !== "ar"
                ) {

                    toast(
                        `تم اختيار ${select.options[select.selectedIndex].text}. الترجمة الكاملة ستكون في مرحلة تطوير اللغات.`,
                        "success"
                    );

                }

            }
        );

    }


    /* =====================================================
       GLOBAL ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                const root =
                    $("modal-root");


                if (
                    root &&
                    root.getAttribute(
                        "aria-hidden"
                    ) === "false"
                ) {

                    closeModal();

                }

            }

        }
    );


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            loadPlayer();

            renderChallenges();

            renderSports();

            handleAI();

            bindNavigation();

            bindActions();

            bindLanguage();

        }
    );


    /* =====================================================
       AUTH CHANGE SUPPORT
    ===================================================== */

    window.addEventListener(
        "zivo-auth-changed",
        function (event) {

            if (
                event.detail &&
                event.detail.user
            ) {

                window.zivoLoadPlayer(
                    event.detail.user
                );

            } else {

                loadPlayer();

            }

        }
    );


})();
