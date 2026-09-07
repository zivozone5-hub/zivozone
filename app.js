(() => {
    "use strict";

    /*
     * =========================================================
     * ZIVOZONE CORE ENGINE
     * Challenges + Player + Games + UI
     * =========================================================
     */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];

    const state = {
        user: null,

        player: {
            level: 1,
            xp: 0,
            coins: 0,
            wins: 0,
            streak: 0,
            challenges: 0
        },

        challenge: {
            active: false,
            index: 0,
            score: 0,
            timer: null,
            seconds: 20,
            selected: null
        },

        game: {
            type: null,
            index: 0,
            score: 0
        }
    };


    /*
     * =========================================================
     * CHALLENGE BANK
     * =========================================================
     */

    const challengeBank = [

        // =========================
        // IQ
        // =========================

        {
            id: "iq-001",
            category: "ذكاء",
            icon: "🧠",
            difficulty: "سهل",
            title: "سلسلة الأرقام",
            question: "ما الرقم التالي؟ 2 - 4 - 8 - 16 - ؟",
            answers: ["18", "24", "32", "30"],
            correct: 2,
            xp: 30,
            time: 20
        },

        {
            id: "iq-002",
            category: "ذكاء",
            icon: "🧩",
            difficulty: "متوسط",
            title: "لغز منطقي",
            question: "إذا كان لديك 3 تفاحات وأخذت 2، كم تفاحة أصبحت معك؟",
            answers: ["1", "2", "3", "5"],
            correct: 1,
            xp: 30,
            time: 18
        },

        {
            id: "iq-003",
            category: "ذكاء",
            icon: "🔢",
            difficulty: "متوسط",
            title: "تحدي النمط",
            question: "1 - 1 - 2 - 3 - 5 - 8 - ؟",
            answers: ["11", "12", "13", "15"],
            correct: 2,
            xp: 35,
            time: 15
        },

        {
            id: "iq-004",
            category: "ذكاء",
            icon: "🧠",
            difficulty: "صعب",
            title: "الاختيار المستحيل",
            question: "ما الشيء الذي كلما أخذت منه زاد؟",
            answers: [
                "المال",
                "العمر",
                "الحفرة",
                "الوقت"
            ],
            correct: 2,
            xp: 45,
            time: 15
        },


        // =========================
        // SPEED
        // =========================

        {
            id: "speed-001",
            category: "سرعة",
            icon: "⚡",
            difficulty: "سهل",
            title: "رد الفعل",
            question: "أي رقم أكبر؟",
            answers: ["37", "73", "57", "67"],
            correct: 1,
            xp: 25,
            time: 8
        },

        {
            id: "speed-002",
            category: "سرعة",
            icon: "⚡",
            difficulty: "متوسط",
            title: "لا تفكر كثيرًا",
            question: "كم ثانية في الدقيقة؟",
            answers: ["30", "50", "60", "100"],
            correct: 2,
            xp: 25,
            time: 8
        },

        {
            id: "speed-003",
            category: "سرعة",
            icon: "🔥",
            difficulty: "صعب",
            title: "القرار السريع",
            question: "أي رقم ليس من مضاعفات 5؟",
            answers: ["25", "40", "63", "75"],
            correct: 2,
            xp: 35,
            time: 7
        },


        // =========================
        // SPORTS
        // =========================

        {
            id: "sport-001",
            category: "رياضة",
            icon: "⚽",
            difficulty: "سهل",
            title: "كرة القدم",
            question: "كم لاعبًا يبدأ به فريق كرة القدم داخل الملعب؟",
            answers: ["9", "10", "11", "12"],
            correct: 2,
            xp: 30,
            time: 15
        },

        {
            id: "sport-002",
            category: "رياضة",
            icon: "🏆",
            difficulty: "متوسط",
            title: "التكتيك",
            question: "أي تشكيل يحتوي على أربعة مدافعين وثلاثة لاعبي وسط وثلاثة مهاجمين؟",
            answers: [
                "4-4-2",
                "4-3-3",
                "3-5-2",
                "4-2-3-1"
            ],
            correct: 1,
            xp: 35,
            time: 15
        },

        {
            id: "sport-003",
            category: "رياضة",
            icon: "🥅",
            difficulty: "متوسط",
            title: "الهدف",
            question: "منطقة الجزاء في كرة القدم ترتبط مباشرة بحارس المرمى.",
            answers: [
                "صحيح",
                "خطأ"
            ],
            correct: 0,
            xp: 25,
            time: 10
        },


        // =========================
        // HORROR
        // =========================

        {
            id: "horror-001",
            category: "رعب",
            icon: "👁️",
            difficulty: "متوسط",
            title: "لا تنظر خلفك",
            question: "أنت وحدك في غرفة مظلمة وسمعت صوتًا خلفك. ماذا تفعل؟",
            answers: [
                "أركض",
                "ألتفت فورًا",
                "أبحث عن مصدر الضوء",
                "أغلق عيني"
            ],
            correct: 2,
            xp: 40,
            time: 15
        },

        {
            id: "horror-002",
            category: "رعب",
            icon: "🌑",
            difficulty: "صعب",
            title: "الممر",
            question: "لديك بابان. أحدهما مفتوح والآخر مغلق. أيهما أكثر إثارة للريبة؟",
            answers: [
                "المفتوح",
                "المغلق",
                "كلاهما",
                "لا شيء"
            ],
            correct: 1,
            xp: 45,
            time: 12
        },

        {
            id: "horror-003",
            category: "رعب",
            icon: "👻",
            difficulty: "صعب",
            title: "الصوت",
            question: "إذا سمعت اسمك يُنادى من غرفة فارغة، هل تدخل؟",
            answers: [
                "نعم",
                "لا",
                "أركض",
                "أنادي مرة أخرى"
            ],
            correct: 1,
            xp: 50,
            time: 10
        },


        // =========================
        // MEMORY
        // =========================

        {
            id: "memory-001",
            category: "ذاكرة",
            icon: "🧠",
            difficulty: "متوسط",
            title: "تذكر",
            question: "ما اللون الذي لا ينتمي للمجموعة؟",
            answers: [
                "أحمر",
                "أزرق",
                "تفاحة",
                "أخضر"
            ],
            correct: 2,
            xp: 35,
            time: 12
        },

        {
            id: "memory-002",
            category: "ملاحظة",
            icon: "👀",
            difficulty: "صعب",
            title: "عين الصقر",
            question: "أي كلمة مختلفة؟",
            answers: [
                "ZIVO",
                "ZIVO",
                "ZIVO",
                "ZlVO"
            ],
            correct: 3,
            xp: 50,
            time: 10
        },


        // =========================
        // SCIENCE
        // =========================

        {
            id: "science-001",
            category: "علوم",
            icon: "🔬",
            difficulty: "سهل",
            title: "الفضاء",
            question: "ما الكوكب المعروف بالكوكب الأحمر؟",
            answers: [
                "الأرض",
                "المريخ",
                "الزهرة",
                "المشتري"
            ],
            correct: 1,
            xp: 30,
            time: 15
        },

        {
            id: "science-002",
            category: "علوم",
            icon: "🌍",
            difficulty: "متوسط",
            title: "كوكبنا",
            question: "ما الكوكب الذي نعيش عليه؟",
            answers: [
                "المريخ",
                "الأرض",
                "زحل",
                "نبتون"
            ],
            correct: 1,
            xp: 20,
            time: 10
        },

        {
            id: "science-003",
            category: "علوم",
            icon: "💡",
            difficulty: "متوسط",
            title: "الطاقة",
            question: "أي من التالي مصدر للطاقة؟",
            answers: [
                "الشمس",
                "الظل",
                "الهواء الساكن",
                "الصمت"
            ],
            correct: 0,
            xp: 30,
            time: 12
        }

    ];


    /*
     * =========================================================
     * INITIALIZATION
     * =========================================================
     */

    document.addEventListener(
        "DOMContentLoaded",
        init
    );


    function init() {

        bindEvents();

        renderChallenges();

        renderSports();

        setupAuth();

        updatePlayerUI();

        setupLogoAnimation();

        hideLoader();

        restoreLanguage();

    }


    /*
     * =========================================================
     * AUTH
     * =========================================================
     */

    function setupAuth() {

        window.addEventListener(
            "zivozone-auth-state",
            async event => {

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

                                state.player = {

                                    ...state.player,

                                    ...player

                                };

                            }

                        }

                    } catch (error) {

                        console.error(
                            "Player load error:",
                            error
                        );

                    }

                } else {

                    state.player = {

                        level: 1,
                        xp: 0,
                        coins: 0,
                        wins: 0,
                        streak: 0,
                        challenges: 0

                    };

                }


                updatePlayerUI();

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


    /*
     * =========================================================
     * EVENTS
     * =========================================================
     */

    function bindEvents() {

        document.addEventListener(
            "click",
            handleClick
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    closeModal();

                }

            }
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


    function handleClick(event) {

        const button =
            event.target.closest("button");


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        const game =
            button.dataset.game;


        const challenge =
            button.dataset.challenge;


        if (
            action === "login"
        ) {

            openAuthModal();

            return;

        }


        if (
            action === "logout"
        ) {

            logout();

            return;

        }


        if (
            action === "scroll-games"
        ) {

            $("#games")?.scrollIntoView({

                behavior: "smooth"

            });

            return;

        }


        if (
            action === "open-identity"
        ) {

            openIdentity();

            return;

        }


        if (
            action === "open-profile"
        ) {

            openPlayerProfile();

            return;

        }


        if (
            action === "refresh-sports"
        ) {

            renderSports();

            showToast(
                "تم تحديث عالم الرياضة ⚽"
            );

            return;

        }


        if (game) {

            startGame(
                game
            );

            return;

        }


        if (challenge) {

            startChallenge(
                challenge
            );

            return;

        }


        if (
            button.dataset.answer
        ) {

            answerChallenge(
                Number(
                    button.dataset.answer
                )
            );

        }

    }


    /*
     * =========================================================
     * CHALLENGE CENTER
     * =========================================================
     */

    function renderChallenges() {

        const container =
            $("#challenge-list");


        if (!container) {
            return;
        }


        const shuffled =
            [...challengeBank]
                .sort(
                    () =>
                        Math.random() - 0.5
                )
                .slice(
                    0,
                    9
                );


        container.innerHTML = `

            <div class="challenge-intro">

                <div>

                    <span class="eyebrow">
                        ZIVO CHALLENGE ENGINE
                    </span>

                    <h3>
                        هل تستطيع الوصول إلى القمة؟
                    </h3>

                    <p>
                        كل تحدٍ أصعب من السابق.
                        الوقت ضدك.
                        والنتيجة تُسجل على حسابك.
                    </p>

                </div>

                <div class="challenge-live">

                    <span class="pulse-dot"></span>

                    LIVE

                </div>

            </div>


            <div class="challenge-grid">

                ${shuffled.map(
                    challenge => `

                    <article
                        class="challenge-card challenge-${challenge.category}"
                    >

                        <div class="challenge-card-top">

                            <span class="challenge-icon">
                                ${challenge.icon}
                            </span>

                            <span class="challenge-category">
                                ${escapeHTML(challenge.category)}
                            </span>

                        </div>


                        <span class="challenge-difficulty">
                            ${escapeHTML(challenge.difficulty)}
                        </span>


                        <h3>
                            ${escapeHTML(challenge.title)}
                        </h3>


                        <p>
                            ${escapeHTML(challenge.question)}
                        </p>


                        <div class="challenge-footer">

                            <span>
                                +${challenge.xp} XP
                            </span>

                            <span>
                                ⏱ ${challenge.time}s
                            </span>

                        </div>


                        <button
                            class="btn btn-primary full"
                            type="button"
                            data-challenge="${challenge.id}"
                        >
                            واجه التحدي
                        </button>

                    </article>

                    `
                ).join("")}

            </div>


            <div class="challenge-teaser">

                <span>
                    🔥 تحديات جديدة باستمرار
                </span>

                <strong>
                    لا تخرج قبل أن تعرف مستواك الحقيقي.
                </strong>

            </div>

        `;

    }


    /*
     * =========================================================
     * START CHALLENGE
     * =========================================================
     */

    function startChallenge(
        id
    ) {

        if (!state.user) {

            openAuthModal();

            showToast(
                "سجل حسابك مجانًا حتى نحفظ نتيجتك."
            );

            return;

        }


        const challenge =
            challengeBank.find(
                item =>
                    item.id === id
            );


        if (!challenge) {

            showToast(
                "التحدي غير متوفر."
            );

            return;

        }


        state.challenge = {

            active: true,

            index: 0,

            score: 0,

            timer: null,

            seconds:
                challenge.time,

            selected: null,

            current:
                challenge

        };


        openChallengeModal(
            challenge
        );

    }


    function openChallengeModal(
        challenge
    ) {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.innerHTML = `

            <div class="modal-overlay challenge-modal-overlay">

                <div
                    class="modal-card challenge-modal"
                    role="dialog"
                    aria-modal="true"
                >

                    <button
                        class="modal-close"
                        type="button"
                        data-modal-close
                    >
                        ×
                    </button>


                    <div class="challenge-modal-header">

                        <div>

                            <span class="eyebrow">
                                ${escapeHTML(challenge.category)}
                            </span>

                            <h2>
                                ${escapeHTML(challenge.title)}
                            </h2>

                        </div>


                        <div class="challenge-timer">

                            <span>
                                الوقت
                            </span>

                            <strong id="challenge-timer">
                                ${challenge.time}
                            </strong>

                        </div>

                    </div>


                    <div class="challenge-progress">

                        <span id="challenge-progress-bar"></span>

                    </div>


                    <div class="challenge-question">

                        <div class="challenge-big-icon">
                            ${challenge.icon}
                        </div>

                        <h3>
                            ${escapeHTML(challenge.question)}
                        </h3>

                    </div>


                    <div
                        id="challenge-answers"
                        class="challenge-answers"
                    >

                        ${challenge.answers.map(
                            (answer, index) => `

                                <button
                                    class="challenge-answer"
                                    type="button"
                                    data-answer="${index}"
                                >

                                    <span>
                                        ${String.fromCharCode(
                                            65 + index
                                        )}
                                    </span>

                                    ${escapeHTML(answer)}

                                </button>

                            `
                        ).join("")}

                    </div>


                    <div
                        id="challenge-feedback"
                        class="challenge-feedback"
                    ></div>

                </div>

            </div>

        `;


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


        $$(".challenge-answer", root)
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            answerChallenge(
                                Number(
                                    button.dataset.answer
                                )
                            );

                        }
                    );

                }
            );


        startChallengeTimer(
            challenge.time
        );

    }


    /*
     * =========================================================
     * CHALLENGE TIMER
     * =========================================================
     */

    function startChallengeTimer(
        seconds
    ) {

        clearInterval(
            state.challenge.timer
        );


        state.challenge.seconds =
            seconds;


        const timer =
            $("#challenge-timer");


        state.challenge.timer =
            setInterval(
                () => {

                    state.challenge.seconds--;

                    if (timer) {

                        timer.textContent =
                            state.challenge.seconds;

                    }


                    if (
                        state.challenge.seconds <= 5 &&
                        timer
                    ) {

                        timer.classList.add(
                            "danger"
                        );

                    }


                    if (
                        state.challenge.seconds <= 0
                    ) {

                        clearInterval(
                            state.challenge.timer
                        );


                        answerChallenge(
                            -1
                        );

                    }

                },
                1000
            );

    }


    /*
     * =========================================================
     * ANSWER
     * =========================================================
     */

    async function answerChallenge(
        answerIndex
    ) {

        if (
            !state.challenge.active
        ) {

            return;

        }


        state.challenge.active =
            false;


        clearInterval(
            state.challenge.timer
        );


        const challenge =
            state.challenge.current;


        const buttons =
            $$(".challenge-answer");


        buttons.forEach(
            button => {

                button.disabled =
                    true;

            }
        );


        const correct =
            answerIndex ===
            challenge.correct;


        const selected =
            buttons[answerIndex];


        const correctButton =
            buttons[challenge.correct];


        if (selected) {

            selected.classList.add(
                correct
                    ? "correct"
                    : "wrong"
            );

        }


        if (
            correctButton &&
            !correct
        ) {

            correctButton.classList.add(
                "correct"
            );

        }


        const feedback =
            $("#challenge-feedback");


        if (correct) {

            state.challenge.score = 1;

            state.player.xp +=
                challenge.xp;

            state.player.coins +=
                Math.max(
                    2,
                    Math.floor(
                        challenge.xp / 10
                    )
                );

            state.player.wins++;

            state.player.challenges++;

            if (feedback) {

                feedback.className =
                    "challenge-feedback success";

                feedback.textContent =
                    `🔥 ممتاز! +${challenge.xp} XP`;

            }


            checkLevelUp();

        } else {

            state.player.challenges++;

            if (feedback) {

                feedback.className =
                    "challenge-feedback fail";

                feedback.textContent =
                    answerIndex === -1
                        ? "⏰ انتهى الوقت!"
                        : "❌ ليست الإجابة الصحيحة.";

            }

        }


        updatePlayerUI();


        await savePlayer();


        setTimeout(
            () => {

                closeModal();

                showChallengeResult(
                    challenge,
                    correct
                );

            },
            900
        );

    }


    /*
     * =========================================================
     * RESULT
     * =========================================================
     */

    function showChallengeResult(
        challenge,
        correct
    ) {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.innerHTML = `

            <div class="modal-overlay">

                <div class="modal-card result-card">

                    <div class="result-symbol">
                        ${correct ? "🏆" : "🧠"}
                    </div>


                    <span class="eyebrow">
                        ZIVO RESULT
                    </span>


                    <h2>
                        ${
                            correct
                                ? "أثبتَّ نفسك!"
                                : "المرة القادمة أقوى!"
                        }
                    </h2>


                    <p>
                        ${
                            correct
                                ? `لقد ربحت ${challenge.xp} XP`
                                : "تعلم من الخطأ وحاول مرة أخرى."
                        }
                    </p>


                    <div class="result-stats">

                        <div>
                            <strong>
                                ${state.player.level}
                            </strong>

                            <span>
                                المستوى
                            </span>
                        </div>


                        <div>
                            <strong>
                                ${state.player.xp}
                            </strong>

                            <span>
                                XP
                            </span>
                        </div>


                        <div>
                            <strong>
                                ${state.player.coins}
                            </strong>

                            <span>
                                ZIVO
                            </span>
                        </div>

                    </div>


                    <button
                        class="btn btn-primary full"
                        type="button"
                        data-modal-close
                    >
                        أكمل رحلتك
                    </button>

                </div>

            </div>

        `;


        $(
            "[data-modal-close]",
            root
        )?.addEventListener(
            "click",
            closeModal
        );

    }


    /*
     * =========================================================
     * LEVEL SYSTEM
     * =========================================================
     */

    function checkLevelUp() {

        const required =
            state.player.level * 100;


        if (
            state.player.xp >= required
        ) {

            state.player.xp -=
                required;

            state.player.level++;


            showToast(
                `🚀 ارتقيت إلى المستوى ${state.player.level}!`
            );

        }

    }


    /*
     * =========================================================
     * PLAYER PROFILE
     * =========================================================
     */

    function openPlayerProfile() {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        const name =
            state.user?.displayName ||
            "لاعب ZIVOZONE";


        const email =
            state.user?.email ||
            "زائر";


        root.innerHTML = `

            <div class="modal-overlay">

                <div class="modal-card player-profile-modal">

                    <button
                        class="modal-close"
                        type="button"
                        data-modal-close
                    >
                        ×
                    </button>


                    <div class="profile-hero">

                        <div class="profile-avatar">
                            Z
                        </div>


                        <div>

                            <span class="eyebrow">
                                ZIVO PLAYER
                            </span>

                            <h2>
                                ${escapeHTML(name)}
                            </h2>

                            <p>
                                ${escapeHTML(email)}
                            </p>

                        </div>

                    </div>


                    <div class="level-display">

                        <div>

                            <span>
                                LEVEL
                            </span>

                            <strong>
                                ${state.player.level}
                            </strong>

                        </div>


                        <div class="level-bar">

                            <span
                                style="width:${Math.min(
                                    100,
                                    state.player.xp
                                )}%"
                            ></span>

                        </div>


                        <small>
                            ${state.player.xp}
                            /
                            ${state.player.level * 100}
                            XP
                        </small>

                    </div>


                    <div class="player-stat-grid">

                        <div class="player-stat">

                            <span>
                                🪙
                            </span>

                            <strong>
                                ${state.player.coins}
                            </strong>

                            <small>
                                ZIVO
                            </small>

                        </div>


                        <div class="player-stat">

                            <span>
                                🏆
                            </span>

                            <strong>
                                ${state.player.wins}
                            </strong>

                            <small>
                                انتصارات
                            </small>

                        </div>


                        <div class="player-stat">

                            <span>
                                🎯
                            </span>

                            <strong>
                                ${state.player.challenges}
                            </strong>

                            <small>
                                تحديات
                            </small>

                        </div>


                        <div class="player-stat">

                            <span>
                                🔥
                            </span>

                            <strong>
                                ${state.player.streak}
                            </strong>

                            <small>
                                Streak
                            </small>

                        </div>

                    </div>


                    <div class="profile-mission">

                        <span>
                            🎯 المهمة التالية
                        </span>

                        <strong>
                            أكمل تحديين وارفع مستواك.
                        </strong>

                    </div>


                    <button
                        class="btn btn-primary full"
                        type="button"
                        data-modal-close
                    >
                        العودة إلى العالم
                    </button>

                </div>

            </div>

        `;


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


    /*
     * =========================================================
     * GAMES
     * =========================================================
     */

    function startGame(
        type
    ) {

        if (!state.user) {

            openAuthModal();

            showToast(
                "أنشئ حسابك أولًا لحفظ تقدمك."
            );

            return;

        }


        state.game = {

            type,

            index: 0,

            score: 0

        };


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
                "🧠 اختبار سرعة الذكاء",

            horror:
                "👻 الغرفة المظلمة",

            science:
                "🔬 مختبر العلوم",

            daily:
                "⚡ تحدي ZIVO اليومي"

        };


        const gameQuestions = {

            quiz: [

                {
                    q:
                        "ما العدد التالي؟ 3 - 6 - 12 - 24 - ؟",

                    a:
                        ["30", "36", "48", "42"],

                    c:
                        2

                },

                {
                    q:
                        "أي كلمة مختلفة؟",

                    a:
                        [
                            "أسد",
                            "نمر",
                            "ذئب",
                            "سيارة"
                        ],

                    c:
                        3

                }

            ],

            science: [

                {
                    q:
                        "ما الكوكب الأقرب إلى الشمس؟",

                    a:
                        [
                            "الأرض",
                            "عطارد",
                            "المريخ",
                            "زحل"
                        ],

                    c:
                        1

                }

            ],

            horror: [

                {
                    q:
                        "وجدت بابًا يفتح وحده. ماذا تفعل؟",

                    a:
                        [
                            "أدخل",
                            "أهرب",
                            "أبحث عن سبب",
                            "أغلق الباب"
                        ],

                    c:
                        2

                }

            ],

            daily: [

                {
                    q:
                        "كم يومًا في الأسبوع؟",

                    a:
                        [
                            "5",
                            "6",
                            "7",
                            "8"
                        ],

                    c:
                        2

                }

            ]

        };


        const questions =
            gameQuestions[type] ||
            gameQuestions.quiz;


        root.innerHTML = `

            <div class="modal-overlay">

                <div class="modal-card game-modal">

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
                        ${titles[type]}
                    </h2>


                    <div
                        id="game-content"
                        class="game-content"
                    ></div>

                </div>

            </div>

        `;


        $(
            "[data-modal-close]",
            root
        )?.addEventListener(
            "click",
            closeModal
        );


        renderGameQuestion(
            questions
        );

    }


    function renderGameQuestion(
        questions
    ) {

        const content =
            $("#game-content");


        if (!content) {
            return;
        }


        const question =
            questions[
                state.game.index %
                questions.length
            ];


        content.innerHTML = `

            <div class="game-question">

                <span>
                    السؤال
                    ${state.game.index + 1}
                </span>

                <h3>
                    ${escapeHTML(question.q)}
                </h3>

            </div>


            <div class="game-answers">

                ${question.a.map(
                    (answer, index) => `

                        <button
                            class="btn btn-ghost full game-answer"
                            type="button"
                            data-index="${index}"
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
                        async () => {

                            const selected =
                                Number(
                                    button.dataset.index
                                );


                            if (
                                selected ===
                                question.c
                            ) {

                                state.game.score++;

                                showToast(
                                    "✅ إجابة صحيحة!"
                                );

                            } else {

                                showToast(
                                    "❌ حاول مرة أخرى."
                                );

                            }


                            state.game.index++;


                            if (
                                state.game.index >=
                                questions.length
                            ) {

                                await finishGame();

                            } else {

                                renderGameQuestion(
                                    questions
                                );

                            }

                        }
                    );

                }
            );

    }


    async function finishGame() {

        const reward =
            state.game.score * 25;


        state.player.xp +=
            reward;


        state.player.coins +=
            state.game.score * 2;


        checkLevelUp();


        updatePlayerUI();

        await savePlayer();


        const content =
            $("#game-content");


        if (content) {

            content.innerHTML = `

                <div class="game-result">

                    <div class="result-symbol">
                        🏆
                    </div>

                    <h3>
                        انتهى التحدي
                    </h3>

                    <p>
                        حصلت على
                        <strong>
                            +${reward} XP
                        </strong>
                    </p>

                    <button
                        class="btn btn-primary full"
                        type="button"
                        data-modal-close
                    >
                        متابعة
                    </button>

                </div>

            `;


            $(
                "[data-modal-close]",
                content
            )?.addEventListener(
                "click",
                closeModal
            );

        }

    }


    /*
     * =========================================================
     * IDENTITY
     * =========================================================
     */

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
                        أي نوع من اللاعبين أنت؟
                    </h2>


                    <p>
                        اختر الخيار الأقرب إليك.
                    </p>


                    <div class="identity-options">

                        <button
                            class="btn btn-ghost full"
                            type="button"
                            data-personality="thinker"
                        >
                            🧠 المفكر
                        </button>


                        <button
                            class="btn btn-ghost full"
                            type="button"
                            data-personality="leader"
                        >
                            👑 القائد
                        </button>


                        <button
                            class="btn btn-ghost full"
                            type="button"
                            data-personality="creator"
                        >
                            🎨 المبدع
                        </button>


                        <button
                            class="btn btn-ghost full"
                            type="button"
                            data-personality="hunter"
                        >
                            👁️ الباحث عن الإثارة
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

                        const result =
                            getPersonality(
                                button.dataset.personality
                            );


                        root.innerHTML = `

                            <div class="modal-overlay">

                                <div class="modal-card result-card">

                                    <div class="result-symbol">
                                        ${result.icon}
                                    </div>

                                    <span class="eyebrow">
                                        YOUR ZIVO TYPE
                                    </span>

                                    <h2>
                                        ${result.title}
                                    </h2>

                                    <p>
                                        ${result.text}
                                    </p>

                                    <button
                                        class="btn btn-primary full"
                                        type="button"
                                        data-modal-close
                                    >
                                        استمر في الاستكشاف
                                    </button>

                                </div>

                            </div>

                        `;


                        $(
                            "[data-modal-close]",
                            root
                        )?.addEventListener(
                            "click",
                            closeModal
                        );

                    }
                );

            }
        );

    }


    function getPersonality(
        type
    ) {

        const types = {

            thinker: {

                icon: "🧠",

                title:
                    "المفكر",

                text:
                    "أنت تميل للتحليل قبل اتخاذ القرار. ZIVOZONE سيضع عقلك تحت الاختبار."

            },

            leader: {

                icon: "👑",

                title:
                    "القائد",

                text:
                    "أنت تحب المنافسة والصدارة. هدفك ليس اللعب فقط... بل الفوز."

            },

            creator: {

                icon: "🎨",

                title:
                    "المبدع",

                text:
                    "تبحث عن الحلول غير التقليدية ولا تحب السير في الطريق المعتاد."

            },

            hunter: {

                icon: "👁️",

                title:
                    "صياد الإثارة",

                text:
                    "أنت لا تهرب عندما تصبح الأمور غريبة... أنت تقترب أكثر."

            }

        };


        return (
            types[type] ||
            types.thinker
        );

    }


    /*
     * =========================================================
     * SPORTS
     * =========================================================
     */

    function renderSports() {

        const container =
            $("#sports-list");


        if (!container) {
            return;
        }


        const items = [

            {
                icon: "⚽",
                title: "ZIVO FOOTBALL",
                text:
                    "تحليل، تحديات، مهارات، تكتيك ومنافسة."
            },

            {
                icon: "🏆",
                title: "CHAMPION MODE",
                text:
                    "ارفع مستواك ونافس للوصول إلى القمة."
            },

            {
                icon: "🔥",
                title: "SPORT CHALLENGE",
                text:
                    "اختبر معرفتك الرياضية تحت ضغط الوقت."
            }

        ];


        container.innerHTML =
            items.map(
                item => `

                    <article class="sports-card">

                        <div class="sports-icon">
                            ${item.icon}
                        </div>

                        <span class="eyebrow">
                            ZIVO SPORT
                        </span>

                        <h3>
                            ${escapeHTML(item.title)}
                        </h3>

                        <p>
                            ${escapeHTML(item.text)}
                        </p>

                        <button
                            class="btn btn-ghost"
                            type="button"
                            data-challenge="sport-001"
                        >
                            تحداني
                        </button>

                    </article>

                `
            ).join("");

    }


    /*
     * =========================================================
     * PLAYER UI
     * =========================================================
     */

    function updatePlayerUI() {

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


        if (name) {

            name.textContent =
                state.user?.displayName ||
                "زائر";

        }


        if (email) {

            email.textContent =
                state.user?.email ||
                "سجل حسابك لحفظ تقدمك.";

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
                `LEVEL ${state.player.level}`;

        }


        if (logoutButton) {

            logoutButton.hidden =
                !state.user;

        }


        const progress =
            $("#xp-progress");


        if (progress) {

            progress.style.width =
                `${Math.min(
                    100,
                    state.player.xp
                )}%`;

        }


        const profile =
            $("#profile");


        if (profile) {

            profile.style.cursor =
                "pointer";

            profile.onclick =
                event => {

                    if (
                        event.target.closest("button")
                    ) {
                        return;
                    }

                    openPlayerProfile();

                };

        }

    }


    /*
     * =========================================================
     * SAVE PLAYER
     * =========================================================
     */

    async function savePlayer() {

        if (
            !state.user ||
            !window.ZIVOZONE_AUTH ||
            typeof window.ZIVOZONE_AUTH.update !== "function"
        ) {

            return;

        }


        try {

            await window.ZIVOZONE_AUTH.update({

                level:
                    state.player.level,

                xp:
                    state.player.xp,

                coins:
                    state.player.coins,

                wins:
                    state.player.wins

            });

        } catch (error) {

            console.error(
                "ZIVOZONE player save error:",
                error
            );

        }

    }


    /*
     * =========================================================
     * AUTH MODAL
     * =========================================================
     */

    function openAuthModal() {

        const root =
            $("#modal-root");


        if (!root) {
            return;
        }


        root.innerHTML = `

            <div class="modal-overlay">

                <div class="modal-card auth-card">

                    <button
                        class="modal-close"
                        type="button"
                        data-modal-close
                    >
                        ×
                    </button>


                    <div class="auth-header">

                        <div class="auth-logo">
                            Z
                        </div>

                        <span class="eyebrow">
                            JOIN ZIVOZONE
                        </span>

                        <h2>
                            لا تكتفِ بالمشاهدة.
                            ادخل اللعبة.
                        </h2>

                        <p>
                            حساب مجاني لحفظ مستواك وتحدياتك.
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
                            placeholder="اسم اللاعب"
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
                            minlength="6"
                            autocomplete="new-password"
                            required
                        >


                        <button
                            class="btn btn-primary full"
                            type="submit"
                        >
                            إنشاء حساب مجانًا
                        </button>

                    </form>


                    <button
                        id="show-login"
                        class="btn btn-ghost full"
                        type="button"
                    >
                        لدي حساب بالفعل
                    </button>

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


        $("#register-form")
            ?.addEventListener(
                "submit",
                registerUser
            );


        $("#show-login")
            ?.addEventListener(
                "click",
                openLoginForm
            );

    }


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


        form.onsubmit =
            loginUser;


        const switchButton =
            $("#show-login");


        if (switchButton) {

            switchButton.textContent =
                "إنشاء حساب جديد";


            switchButton.onclick =
                openAuthModal;

        }

    }


    async function registerUser(
        event
    ) {

        event.preventDefault();


        const api =
            window.ZIVOZONE_AUTH;


        if (
            !api ||
            typeof api.register !== "function"
        ) {

            showAuthError(
                "نظام الحسابات غير جاهز."
            );

            return;

        }


        try {

            setAuthLoading(
                true
            );


            await api.register(

                $("#auth-name")?.value.trim(),

                $("#auth-email")?.value.trim(),

                $("#auth-password")?.value

            );


            closeModal();


            showToast(
                "🎉 أهلاً بك في ZIVOZONE!"
            );


        } catch (error) {

            showAuthError(
                error.message
            );

        } finally {

            setAuthLoading(
                false
            );

        }

    }


    async function loginUser(
        event
    ) {

        event.preventDefault();


        const api =
            window.ZIVOZONE_AUTH;


        if (
            !api ||
            typeof api.login !== "function"
        ) {

            showAuthError(
                "نظام الحسابات غير جاهز."
            );

            return;

        }


        try {

            setAuthLoading(
                true
            );


            await api.login(

                $("#auth-email")?.value.trim(),

                $("#auth-password")?.value

            );


            closeModal();


            showToast(
                "👋 مرحبًا بعودتك!"
            );


        } catch (error) {

            showAuthError(
                error.message
            );

        } finally {

            setAuthLoading(
                false
            );

        }

    }


    async function logout() {

        try {

            await window.ZIVOZONE_AUTH.logout();

            showToast(
                "تم تسجيل الخروج."
            );

        } catch (error) {

            showToast(
                error.message
            );

        }

    }


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
                ? "جاري الاتصال..."
                : "متابعة";

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
            message ||
            "حدث خطأ.";

    }


    /*
     * =========================================================
     * AI
     * =========================================================
     */

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


        messages.insertAdjacentHTML(
            "beforeend",
            `

                <div class="ai-message user">
                    ${escapeHTML(text)}
                </div>

                <div class="ai-message bot">
                    🤖 ZIVO AI يراقب عالمك.
                    اسألني عن الألعاب أو التحديات
                    أو الرياضة.
                </div>

            `
        );


        input.value =
            "";


        messages.scrollTop =
            messages.scrollHeight;

    }


    /*
     * =========================================================
     * LOGO ANIMATION
     * =========================================================
     */

    function setupLogoAnimation() {

        const logo =
            $(".brand-mark");


        if (!logo) {
            return;
        }


        logo.addEventListener(
            "mouseenter",
            () => {

                logo.classList.add(
                    "logo-hunting"
                );

            }
        );


        logo.addEventListener(
            "mouseleave",
            () => {

                logo.classList.remove(
                    "logo-hunting"
                );

            }
        );


        logo.addEventListener(
            "click",
            event => {

                event.preventDefault();


                logo.classList.remove(
                    "logo-glitch"
                );


                void logo.offsetWidth;


                logo.classList.add(
                    "logo-glitch"
                );


                showToast(
                    "👁️ ...هل لاحظت؟"
                );

            }
        );

    }


    /*
     * =========================================================
     * LANGUAGE
     * =========================================================
     */

    function handleLanguage(
        event
    ) {

        localStorage.setItem(
            "zivozone-language",
            event.target.value
        );


        if (
            event.target.value !== "ar"
        ) {

            showToast(
                "الترجمة الكاملة قيد التطوير."
            );

        }

    }


    function restoreLanguage() {

        const language =
            localStorage.getItem(
                "zivozone-language"
            );


        const select =
            $("#language-select");


        if (
            language &&
            select
        ) {

            select.value =
                language;

        }

    }


    /*
     * =========================================================
     * MODAL
     * =========================================================
     */

    function closeModal() {

        clearInterval(
            state.challenge.timer
        );


        state.challenge.active =
            false;


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


    /*
     * =========================================================
     * TOAST
     * =========================================================
     */

    function showToast(
        message
    ) {

        const container =
            $("#toast-container");


        if (!container) {

            console.log(
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


        requestAnimationFrame(
            () => {

                toast.classList.add(
                    "show"
                );

            }
        );


        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );


                setTimeout(
                    () => toast.remove(),
                    300
                );

            },
            3000
        );

    }


    /*
     * =========================================================
     * LOADER
     * =========================================================
     */

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
            700
        );

    }


    /*
     * =========================================================
     * SECURITY
     * =========================================================
     */

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
